import os
import psycopg2
from dotenv import load_dotenv

def add_name_column():
    try:
        # Cargar variables de entorno
        load_dotenv()
        
        # Obtener la URL de la base de datos
        db_url = os.environ.get('DATABASE_URL', 'postgresql://doctorfy_user:KoOOObgcovCYGkJbuYX8BsxrSHOoQQdZ@dpg-cvs5cdq4d50c73886f8g-a.oregon-postgres.render.com/doctorfy')
        
        print(f"Conectando a la base de datos PostgreSQL...")
        
        # Conectar a la base de datos PostgreSQL
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Verificar si la tabla existe
        cursor.execute("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_studies')")
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("Error: La tabla 'medical_studies' no existe en la base de datos.")
            
            # Mostrar las tablas disponibles
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = cursor.fetchall()
            if tables:
                print("\nTablas disponibles en la base de datos:")
                for table in tables:
                    print(f"  - {table[0]}")
            else:
                print("No hay tablas en el esquema público de la base de datos.")
            
            conn.close()
            return
        
        # Verificar si la columna ya existe
        cursor.execute("SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_studies' AND column_name = 'name')")
        column_exists = cursor.fetchone()[0]
        
        if not column_exists:
            print("Agregando columna 'name' a la tabla 'medical_studies'...")
            cursor.execute("ALTER TABLE medical_studies ADD COLUMN name TEXT")
            conn.commit()
            print("Columna 'name' agregada con éxito.")
        else:
            print("La columna 'name' ya existe en la tabla 'medical_studies'.")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    add_name_column() 