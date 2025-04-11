import os
from dotenv import load_dotenv
from flask import Flask
from models import db, User, MedicalStudy, NutritionAnalysis, Doctor, Payment, Consultation
from werkzeug.security import generate_password_hash

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')

# Si la URL comienza con postgres://, cambiarla a postgresql://
if app.config['SQLALCHEMY_DATABASE_URI'] and app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar la base de datos
db.init_app(app)

def init_db():
    with app.app_context():
        # Crear todas las tablas
        db.create_all()
        
        # Verificar si ya existe un usuario administrador
        admin = User.query.filter_by(email='admin@example.com').first()
        if not admin:
            # Crear un usuario administrador
            admin = User(
                email='admin@example.com',
                password_hash=generate_password_hash('admin123'),
                is_doctor=True,
                role='ADMIN'
            )
            db.session.add(admin)
            db.session.commit()
            print("Usuario administrador creado con éxito.")
        else:
            print("El usuario administrador ya existe.")
        
        print("Base de datos inicializada con éxito.")

if __name__ == '__main__':
    init_db() 