import os
import sys
import sqlite3

# Agregar el directorio raíz al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_migration():
    print("Iniciando migración para agregar columna 'name' a la tabla 'medical_studies'...")
    
    try:
        # Obtener la ruta de la base de datos desde la variable de entorno o usar la ruta por defecto
        db_path = os.environ.get('DATABASE_URL', 'sqlite:///doctorfy.db').replace('sqlite:///', '')
        
        if not db_path:
            db_path = 'doctorfy.db'
        
        print(f"Usando base de datos: {db_path}")
        
        # Conectar a la base de datos SQLite
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar si la columna ya existe
        cursor.execute("PRAGMA table_info(medical_studies)")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        
        if 'name' not in column_names:
            print("Agregando columna 'name' a la tabla 'medical_studies'...")
            cursor.execute("ALTER TABLE medical_studies ADD COLUMN name TEXT")
            conn.commit()
            print("Columna 'name' agregada con éxito.")
        else:
            print("La columna 'name' ya existe en la tabla 'medical_studies'.")
        
        conn.close()
        print("Migración completada con éxito.")
        
    except Exception as e:
        print(f"Error durante la migración: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    run_migration() 