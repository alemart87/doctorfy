import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from models import User, Doctor

app = create_app()

with app.app_context():
    # Obtener todos los usuarios que son médicos
    doctor_users = User.query.filter_by(is_doctor=True).all()
    
    for user in doctor_users:
        # Verificar si ya tiene un registro en la tabla doctors
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        
        if not doctor:
            # Crear un nuevo registro en la tabla doctors
            doctor = Doctor(
                user_id=user.id,
                specialty=user.specialty or 'Medicina General',
                license_number=user.license_number or 'Pendiente',
                description='',
                education='',
                experience_years=0,
                consultation_fee=0,
                available_online=False,
                languages=['Español'],
                office_address='',
                office_phone=''
            )
            db.session.add(doctor)
            print(f"Creado nuevo registro de doctor para el usuario {user.email}")
        else:
            # Actualizar campos que podrían ser nulos
            if doctor.specialty is None:
                doctor.specialty = 'Medicina General'
            if doctor.license_number is None:
                doctor.license_number = 'Pendiente'
            if doctor.languages is None:
                doctor.languages = ['Español']
            print(f"Actualizado registro de doctor para el usuario {user.email}")
    
    db.session.commit()
    print("Actualización completada") 