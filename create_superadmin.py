import os
import sys
from flask import Flask
from models import db, User, UserRole
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    return app

def create_superadmin(email, password):
    app = create_app()
    
    with app.app_context():
        # Verificar si ya existe un superadmin
        existing_admin = User.query.filter_by(role=UserRole.SUPERADMIN).first()
        if existing_admin:
            print(f"Ya existe un SuperAdministrador: {existing_admin.email}")
            return
        
        # Verificar si el email ya está en uso
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"El email {email} ya está en uso.")
            return
        
        # Crear el superadmin
        superadmin = User(
            email=email,
            role=UserRole.SUPERADMIN,
            is_doctor=True,  # Los superadmins tienen todos los privilegios
            subscription_active=True
        )
        superadmin.set_password(password)
        
        db.session.add(superadmin)
        db.session.commit()
        
        print(f"SuperAdministrador creado con éxito: {email}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python create_superadmin.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    create_superadmin(email, password) 