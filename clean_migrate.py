import os
import psycopg2
from dotenv import load_dotenv
import subprocess

def clean_migrations():
    print("🧹 Iniciando limpieza del sistema de migraciones (los datos permanecerán intactos)...")
    
    # Cargar variables de entorno
    load_dotenv()
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Primero actualizar los valores NULL a 15.0
        print("📊 Actualizando registros existentes...")
        cur.execute("UPDATE users SET credits = 15.0 WHERE credits IS NULL")
        conn.commit()
        print("✓ Registros actualizados")

        # Verificar si la tabla alembic_version existe
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alembic_version')")
        if cur.fetchone()[0]:
            print("📊 Limpiando tabla de control de migraciones...")
            cur.execute("DROP TABLE IF EXISTS alembic_version;")
            conn.commit()
            print("✓ Tabla de control de migraciones eliminada")
        
        # Eliminar directorio de migraciones
        migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
        if os.path.exists(migrations_dir):
            print("📁 Eliminando archivos de migración...")
            for root, dirs, files in os.walk(migrations_dir, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))
            os.rmdir(migrations_dir)
            print("✓ Archivos de migración eliminados")
        
        # Inicializar nuevas migraciones
        print("\n🚀 Reinicializando sistema de migraciones...")
        subprocess.run(["flask", "db", "init"], check=True)
        print("✓ Sistema de migraciones inicializado")
        
        print("\n📝 Generando migración inicial...")
        subprocess.run(["flask", "db", "migrate"], check=True)
        print("✓ Migración inicial generada")
        
        print("\n⬆️ Aplicando migración...")
        subprocess.run(["flask", "db", "upgrade"], check=True)
        print("✓ Migración aplicada")
        
        print("\n✅ Proceso completado exitosamente!")
        print("💡 Todos los datos de la base de datos permanecen intactos")
        
    except psycopg2.Error as e:
        print(f"❌ Error de base de datos: {e}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en comando Flask: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    response = input("⚠️ Este proceso reiniciará el sistema de migraciones. Los datos permanecerán intactos. ¿Continuar? (s/N): ")
    if response.lower() == 's':
        clean_migrations()
    else:
        print("Operación cancelada") 