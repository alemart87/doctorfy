from sqlalchemy import create_engine, text
from config import Config

def clean_database():
    # Crear un motor de SQLAlchemy directamente
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
    
    # Crear una conexión
    with engine.connect() as connection:
        # Eliminar tabla alembic_version si existe
        connection.execute(text('DROP TABLE IF EXISTS alembic_version;'))
        
        # Eliminar todas las tablas existentes
        connection.execute(text('DROP TABLE IF EXISTS payment CASCADE;'))
        connection.execute(text('DROP TABLE IF EXISTS consultation CASCADE;'))
        connection.execute(text('DROP TABLE IF EXISTS medical_study CASCADE;'))
        connection.execute(text('DROP TABLE IF EXISTS doctor CASCADE;'))
        connection.execute(text('DROP TABLE IF EXISTS user CASCADE;'))
        connection.execute(text('DROP TABLE IF EXISTS users CASCADE;'))
        
        connection.commit()
        print("Base de datos limpiada con éxito.")

if __name__ == "__main__":
    clean_database() 