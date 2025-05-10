import os
import time
import psycopg2
import logging
from dotenv import load_dotenv
from datetime import datetime
import statistics

# --- Configuración de Logging ---
# Eliminar handlers existentes para evitar duplicados si se ejecuta varias veces en la misma sesión
root_logger = logging.getLogger()
for handler in root_logger.handlers[:]:
    root_logger.removeHandler(handler)

# Configurar logging básico para mostrar en consola
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
# ------------------------------

# Cargar variables de entorno desde .env si existe
load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

# --- Funciones de Prueba ---

def execute_query(conn, query_name, sql, params=None, fetch_one=False, fetch_all=False, is_write=False, suppress_logging=False):
    """Ejecuta una consulta y mide su tiempo, registrando la información."""
    cur = None
    start_time = time.perf_counter()
    try:
        cur = conn.cursor()
        cur.execute(sql, params or ())
        
        result = None
        if fetch_one:
            result = cur.fetchone()
        elif fetch_all:
            result = cur.fetchall()
        
        if is_write:
            conn.commit()
            if not suppress_logging:
                logging.info(f"Consulta de ESCRITURA '{query_name}' ejecutada. Filas afectadas: {cur.rowcount if cur.rowcount != -1 else 'N/A'}")
        else:
            if not suppress_logging:
                logging.info(f"Consulta de LECTURA '{query_name}' ejecutada.")
        
        return result
    except psycopg2.Error as e:
        if not suppress_logging:
            logging.error(f"Error en consulta '{query_name}': {e}")
        if conn and not conn.closed:
             try:
                conn.rollback()
             except psycopg2.Error as rb_error:
                if not suppress_logging:
                    logging.error(f"Error durante el rollback para '{query_name}': {rb_error}")
        return None
    finally:
        end_time = time.perf_counter()
        duration_ms = (end_time - start_time) * 1000
        if not suppress_logging:
            logging.info(f"Tiempo para '{query_name}': {duration_ms:.2f} ms")
        if cur:
            cur.close()
        return duration_ms, result # Devolver duración y resultado

def run_test_iteration(conn, iteration_num):
    """Ejecuta una iteración completa de pruebas y devuelve los tiempos."""
    logging.info(f"--- INICIANDO ITERACIÓN DE PRUEBA #{iteration_num} ---")
    times = {}

    # --- Pruebas de LECTURA ---
    logging.info(f"[Iteración {iteration_num}] --- Pruebas de LECTURA ---")

    duration, user_count = execute_query(conn, f"Contar Usuarios (Iter {iteration_num})", "SELECT COUNT(*) FROM users;", fetch_one=True)
    times['count_users'] = duration
    if user_count:
        logging.info(f"[Iteración {iteration_num}] Diagnóstico: Total de usuarios: {user_count[0]}")

    test_user_id = 2 # Ajusta si es necesario
    duration, user_data = execute_query(conn, f"Obtener Usuario ID {test_user_id} (Iter {iteration_num})", "SELECT id, email FROM users WHERE id = %s;", params=(test_user_id,), fetch_one=True)
    times['get_user_by_id'] = duration
    if user_data:
        logging.info(f"[Iteración {iteration_num}] Diagnóstico: Usuario {test_user_id}: ID={user_data[0]}, Email={user_data[1]}")

    duration, study_count = execute_query(conn, f"Contar Estudios Médicos (Iter {iteration_num})", "SELECT COUNT(*) FROM medical_studies;", fetch_one=True)
    times['count_medical_studies'] = duration
    if study_count:
        logging.info(f"[Iteración {iteration_num}] Diagnóstico: Total estudios médicos: {study_count[0]}")

    # Leer más estudios
    limit_studies = 100
    duration, recent_studies = execute_query(
        conn,
        f"Obtener {limit_studies} Estudios Recientes con JOIN (Iter {iteration_num})",
        f"""
        SELECT ms.id, ms.study_type, u.email as patient_email
        FROM medical_studies ms
        LEFT OUTER JOIN users u ON ms.patient_id = u.id
        ORDER BY ms.created_at DESC NULLS LAST
        LIMIT {limit_studies};
        """,
        fetch_all=True
    )
    times[f'get_{limit_studies}_studies_join'] = duration
    if recent_studies is not None:
        logging.info(f"[Iteración {iteration_num}] Diagnóstico: Se obtuvieron {len(recent_studies)} de {limit_studies} estudios recientes.")

    # Leer TODOS los estudios (cuidado si la tabla es masiva, pero con ~100 es manejable)
    duration, all_studies = execute_query(
        conn,
        f"Obtener TODOS los Estudios con JOIN (Iter {iteration_num})",
        """
        SELECT ms.id
        FROM medical_studies ms
        LEFT OUTER JOIN users u ON ms.patient_id = u.id
        ORDER BY ms.created_at DESC NULLS LAST;
        """,
        fetch_all=True
    )
    times['get_all_studies_join'] = duration
    if all_studies is not None:
        logging.info(f"[Iteración {iteration_num}] Diagnóstico: Se obtuvieron TODOS ({len(all_studies)}) los estudios.")


    # --- Pruebas de ESCRITURA (usando una tabla temporal para seguridad) ---
    logging.info(f"[Iteración {iteration_num}] --- Pruebas de ESCRITURA (en tabla temporal) ---")

    duration, _ = execute_query(conn, f"Crear Tabla Temporal 'speed_test_log_iter{iteration_num}'", f"CREATE TEMP TABLE speed_test_log_iter{iteration_num} (id SERIAL PRIMARY KEY, message TEXT, logged_at TIMESTAMP DEFAULT NOW());", is_write=True)
    times['create_temp_table'] = duration

    log_message_single = f"Log único iter {iteration_num} - {datetime.now()}"
    duration, _ = execute_query(conn, f"Insertar Registro Único (Temporal Iter {iteration_num})", f"INSERT INTO speed_test_log_iter{iteration_num} (message) VALUES (%s);", params=(log_message_single,), is_write=True)
    times['insert_single_temp'] = duration

    num_batch_inserts = 250 # Aumentado de 50
    logging.info(f"[Iteración {iteration_num}] Iniciando inserción de {num_batch_inserts} registros individuales en tabla temporal...")
    
    batch_insert_times = []
    overall_batch_start_time = time.perf_counter()
    cur_batch_loop = conn.cursor()
    for i in range(num_batch_inserts):
        loop_insert_start = time.perf_counter()
        log_message_batch = f"Log batch {i+1}/{num_batch_inserts} iter {iteration_num} - {datetime.now()}"
        cur_batch_loop.execute(f"INSERT INTO speed_test_log_iter{iteration_num} (message) VALUES (%s);", (log_message_batch,))
        loop_insert_end = time.perf_counter()
        batch_insert_times.append((loop_insert_end - loop_insert_start) * 1000)
    conn.commit()
    cur_batch_loop.close()
    overall_batch_end_time = time.perf_counter()
    
    total_batch_duration_ms = (overall_batch_end_time - overall_batch_start_time) * 1000
    times[f'insert_{num_batch_inserts}_individual_temp'] = total_batch_duration_ms
    
    if batch_insert_times:
        avg_insert_time = statistics.mean(batch_insert_times)
        median_insert_time = statistics.median(batch_insert_times)
        min_insert_time = min(batch_insert_times)
        max_insert_time = max(batch_insert_times)
        logging.info(f"[Iteración {iteration_num}] Tiempo TOTAL para {num_batch_inserts} Inserciones Individuales (Temp): {total_batch_duration_ms:.2f} ms")
        logging.info(f"[Iteración {iteration_num}] Diagnóstico (Inserciones Individuales): Promedio={avg_insert_time:.2f}ms, Mediana={median_insert_time:.2f}ms, Min={min_insert_time:.2f}ms, Max={max_insert_time:.2f}ms")
    else:
        logging.warning(f"[Iteración {iteration_num}] No se registraron tiempos de inserción individual.")


    duration, temp_log_count = execute_query(conn, f"Contar Registros (Temporal Iter {iteration_num})", f"SELECT COUNT(*) FROM speed_test_log_iter{iteration_num};", fetch_one=True)
    times['count_temp_table'] = duration
    if temp_log_count:
        logging.info(f"[Iteración {iteration_num}] Diagnóstico: Total registros en speed_test_log_iter{iteration_num}: {temp_log_count[0]}")
    
    rows_to_update = num_batch_inserts // 2
    update_message = f"MENSAJE ACTUALIZADO Iter {iteration_num}"
    duration, _ = execute_query(conn, f"Actualizar {rows_to_update} Registros (Temporal Iter {iteration_num})", f"UPDATE speed_test_log_iter{iteration_num} SET message = %s WHERE id <= %s;", params=(update_message, rows_to_update), is_write=True)
    times[f'update_{rows_to_update}_temp'] = duration

    rows_to_delete = rows_to_update
    duration, _ = execute_query(conn, f"Borrar {rows_to_delete} Registros (Temporal Iter {iteration_num})", f"DELETE FROM speed_test_log_iter{iteration_num} WHERE message = %s;", params=(update_message,), is_write=True)
    times[f'delete_{rows_to_delete}_temp'] = duration
    
    logging.info(f"--- FIN DE ITERACIÓN DE PRUEBA #{iteration_num} ---")
    return times

def test_database_speed():
    """Función principal para probar la velocidad de la base de datos."""
    if not DATABASE_URL:
        logging.error("DATABASE_URL no está configurada. Asegúrate de que esté en tu archivo .env o como variable de entorno.")
        return

    logging.info(f"Iniciando prueba de velocidad de base de datos MÁS PESADA...")
    try:
        db_host_info = DATABASE_URL.split('@')[-1]
        logging.info(f"Conectando a: {db_host_info}")
    except Exception:
        logging.info("Conectando a la base de datos configurada en DATABASE_URL.")

    conn = None
    all_iterations_times = []
    num_iterations = 2 # Puedes aumentar a 3 o más para pruebas más largas

    try:
        conn = psycopg2.connect(DATABASE_URL)
        logging.info("Conexión a la base de datos establecida exitosamente.")

        for i in range(1, num_iterations + 1):
            iteration_times = run_test_iteration(conn, i)
            all_iterations_times.append(iteration_times)
            if i < num_iterations:
                logging.info(f"Esperando 5 segundos antes de la siguiente iteración...")
                time.sleep(5) # Pequeña pausa entre iteraciones

        logging.info("--- Pruebas de velocidad de base de datos MÁS PESADAS completadas ---")
        
        # --- Resumen de Tiempos ---
        logging.info("--- RESUMEN DE TIEMPOS PROMEDIO (ms) ---")
        if not all_iterations_times:
            logging.warning("No se recolectaron datos de tiempo.")
            return

        summary = {}
        for key in all_iterations_times[0].keys():
            values = [iter_data.get(key, 0) for iter_data in all_iterations_times if iter_data.get(key) is not None]
            if values:
                summary[key] = {
                    'avg': statistics.mean(values),
                    'min': min(values),
                    'max': max(values),
                    'median': statistics.median(values),
                    'stdev': statistics.stdev(values) if len(values) > 1 else 0
                }
        
        for test_name, data in summary.items():
            logging.info(
                f"{test_name:<40} | "
                f"Avg: {data['avg']:.2f}ms, "
                f"Min: {data['min']:.2f}ms, "
                f"Max: {data['max']:.2f}ms, "
                f"Median: {data['median']:.2f}ms, "
                f"StDev: {data['stdev']:.2f}ms"
            )

    except psycopg2.OperationalError as e:
        logging.error(f"Error de conexión a la base de datos: {e}")
        logging.error("Por favor, verifica tu DATABASE_URL y que la base de datos sea accesible.")
    except Exception as e:
        logging.error(f"Ocurrió un error inesperado durante las pruebas: {e}", exc_info=True)
    finally:
        if conn:
            conn.close()
            logging.info("Conexión a la base de datos cerrada.")

if __name__ == "__main__":
    test_database_speed() 