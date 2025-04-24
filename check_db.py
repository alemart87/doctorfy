import os
from dotenv import load_dotenv
from flask import Flask
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Cargar variables de entorno
load_dotenv()

def check_database():
    # Obtener la URL de la base de datos
    db_url = os.environ.get('DATABASE_URL')
    print("\nConfiguración actual de la base de datos:")
    print("-" * 50)
    print(f"URL de conexión: {db_url}")
    
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(db_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Obtener información del servidor
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print(f"\nVersión de PostgreSQL: {version}")
        
        # Obtener el tamaño de la base de datos
        cur.execute("""
            SELECT pg_size_pretty(pg_database_size(current_database()))
            AS size FROM (SELECT current_database()) AS tmp;
        """)
        size = cur.fetchone()[0]
        print(f"Tamaño de la base de datos: {size}")
        
        # Listar todas las tablas
        cur.execute("""
            SELECT table_name, 
                   (SELECT count(*) FROM information_schema.columns 
                    WHERE table_name=tables.table_name) as columns
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cur.fetchall()
        
        print("\nTablas en la base de datos:")
        print("-" * 50)
        for table, columns in tables:
            # Contar registros en cada tabla
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]
            print(f"- {table}: {count} registros ({columns} columnas)")
        
        # Verificar el usuario actual
        cur.execute("SELECT current_user, current_database();")
        user, db = cur.fetchone()
        print(f"\nUsuario actual: {user}")
        print(f"Base de datos actual: {db}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\nError al conectar a la base de datos: {str(e)}")

if __name__ == "__main__":
    check_database() 