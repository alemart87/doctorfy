from sqlalchemy import create_engine, text
from config import Config

def clean_migrations():
    # Crear un motor de SQLAlchemy directamente
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
    
    # Crear una conexión
    with engine.connect() as connection:
        # Eliminar tabla alembic_version si existe
        connection.execute(text('DROP TABLE IF EXISTS alembic_version;'))
        connection.commit()
        print("Tabla alembic_version eliminada.")

if __name__ == "__main__":
    clean_migrations() 