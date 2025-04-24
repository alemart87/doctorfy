import os
from dotenv import load_dotenv
from flask import Flask
from models import db, User
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

def check_users():
    with app.app_context():
        # Listar todos los usuarios
        users = User.query.all()
        
        print("Usuarios en la base de datos:")
        print("-" * 50)
        
        if not users:
            print("No hay usuarios en la base de datos.")
        else:
            for user in users:
                print(f"ID: {user.id}, Email: {user.email}, Es doctor: {user.is_doctor}, Rol: {user.role}")
        
        print("-" * 50)
        
        # Verificar si existe el usuario con ID 2
        user_id_2 = User.query.get(2)
        
        if not user_id_2:
            print("El usuario con ID 2 no existe. ¿Desea crearlo? (s/n)")
            choice = input().lower()
            
            if choice == 's':
                email = input("Ingrese el email para el nuevo usuario: ")
                password = input("Ingrese la contraseña para el nuevo usuario: ")
                is_doctor = input("¿Es doctor? (s/n): ").lower() == 's'
                
                # Crear el usuario
                new_user = User(
                    email=email,
                    password_hash=generate_password_hash(password),
                    is_doctor=is_doctor,
                    role='USER' if not is_doctor else 'DOCTOR'
                )
                
                db.session.add(new_user)
                db.session.commit()
                
                print(f"Usuario creado con ID: {new_user.id}, Email: {new_user.email}")
            else:
                print("No se creó ningún usuario.")
        else:
            print(f"El usuario con ID 2 existe: {user_id_2.email}")

if __name__ == "__main__":
    check_users() 