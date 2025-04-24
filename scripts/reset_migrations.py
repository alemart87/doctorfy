from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from sqlalchemy import text

# Cargar variables de entorno
load_dotenv()

# Crear una mini aplicación Flask
app = Flask(__name__)

# Configurar la base de datos
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar SQLAlchemy
db = SQLAlchemy(app)

def reset_migrations():
    print("Iniciando reset de migraciones...")
    try:
        with app.app_context():
            # Intentar eliminar la tabla alembic_version
            with db.engine.connect() as conn:
                conn.execute(text('DROP TABLE IF EXISTS alembic_version'))
                conn.commit()
                print("✅ Tabla alembic_version eliminada correctamente")
                
                # Verificar que la tabla fue eliminada
                result = conn.execute(
                    text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alembic_version')")
                )
                exists = result.scalar()
                
                if not exists:
                    print("✅ Verificación completada: tabla alembic_version no existe")
                else:
                    print("❌ Error: La tabla alembic_version aún existe")
                
    except Exception as e:
        print(f"❌ Error durante el reset: {str(e)}")
        return False
    
    print("🎉 Reset de migraciones completado")
    print("\nAhora puedes ejecutar:")
    print("1. flask db init")
    print("2. flask db migrate -m 'initial migration'")
    print("3. flask db upgrade")
    return True

if __name__ == '__main__':
    reset_migrations() 