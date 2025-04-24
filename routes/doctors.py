from flask import Blueprint, request, jsonify, redirect, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Doctor, User, Payment, NutritionLog, NutritionAnalysis, DoctorCredential, DoctorReview
from utils.auth import doctor_required
from utils.stripe_utils import create_checkout_session_for_doctor
import stripe
from datetime import datetime, timedelta, date
from flask import current_app
from sqlalchemy import func, extract
import os

doctors_bp = Blueprint('doctors', __name__)

# Middleware para verificar que el usuario es un médico
def doctor_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_doctor:
            return jsonify({'error': 'Acceso denegado. Se requiere ser médico.'}), 403
        
        return fn(*args, **kwargs)
    
    wrapper.__name__ = fn.__name__
    return wrapper

@doctors_bp.route('/directory', methods=['GET'])
def get_directory():
    try:
        # Modificamos la consulta para no filtrar por subscription_active
        doctors = Doctor.query.all()
        
        result = []
        for doc in doctors:
            user = User.query.get(doc.user_id)
            if user:
                result.append({
                    'id': doc.id,
                    'name': f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.email.split('@')[0],
                    'specialty': doc.specialty,
                    'license_number': doc.license_number,
                    # Otros campos que quieras mostrar
                })
        
        return jsonify({
            'doctors': result
        }), 200
    except Exception as e:
        print(f"Error al obtener directorio de médicos: {str(e)}")
        return jsonify({'error': 'Error al obtener el directorio de médicos'}), 500

@doctors_bp.route('/subscribe', methods=['POST'])
@jwt_required()
@doctor_required
def subscribe():
    user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=user_id).first()
    
    if not doctor:
        return jsonify({'error': 'No se encontró el perfil de doctor'}), 404
    
    try:
        checkout_session = create_checkout_session_for_doctor(doctor.id)
        
        return jsonify({
            'checkout_url': checkout_session.url
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doctors_bp.route('/subscription/success', methods=['GET'])
def subscription_success():
    payment_id = request.args.get('payment_id')
    
    if not payment_id:
        return redirect(url_for('frontend.doctor_dashboard', status='error'))
    
    payment = Payment.query.get(payment_id)
    if not payment or payment.status != 'completed':
        # Verificar el estado del pago en Stripe
        try:
            stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
            session = stripe.checkout.Session.retrieve(payment.stripe_payment_id)
            
            if session.payment_status == 'paid':
                payment.status = 'completed'
                doctor = Doctor.query.filter_by(user_id=payment.user_id).first()
                if doctor:
                    doctor.subscription_active = True
                    doctor.subscription_end = datetime.utcnow() + timedelta(days=30)
                db.session.commit()
        except:
            pass
    
    return redirect(url_for('frontend.doctor_dashboard', status='success'))

@doctors_bp.route('/subscription/cancel', methods=['GET'])
def subscription_cancel():
    payment_id = request.args.get('payment_id')
    
    if payment_id:
        payment = Payment.query.get(payment_id)
        if payment:
            payment.status = 'cancelled'
            db.session.commit()
    
    return redirect(url_for('frontend.doctor_dashboard', status='cancelled'))

# Obtener todos los pacientes de un médico
@doctors_bp.route('/patients', methods=['GET'])
@doctor_required
def get_patients():
    user_id = get_jwt_identity()
    
    try:
        # Obtener el doctor
        doctor = Doctor.query.filter_by(user_id=user_id).first()
        
        if not doctor:
            return jsonify({'error': 'Información de médico no encontrada'}), 404
        
        # Obtener pacientes asociados al médico
        # Nota: Esto depende de cómo esté modelada la relación médico-paciente en tu base de datos
        # Aquí asumimos que hay una tabla de relación o un campo en el usuario
        
        # Ejemplo si hay una tabla de relación doctor_patients:
        # patients = User.query.join(DoctorPatient).filter(DoctorPatient.doctor_id == doctor.id).all()
        
        # Ejemplo si los pacientes tienen un campo doctor_id:
        # patients = User.query.filter_by(doctor_id=doctor.id).all()
        
        # Para propósitos de demostración, devolvemos todos los usuarios que no son médicos
        # Reemplaza esto con la lógica real según tu modelo de datos
        patients = User.query.filter_by(is_doctor=False).all()
        
        patients_data = [
            {
                'id': patient.id,
                'email': patient.email,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'age': patient.calculate_age(),
                'gender': patient.gender,
                'height': patient.height
            }
            for patient in patients
        ]
        
        return jsonify(patients_data), 200
        
    except Exception as e:
        print(f"Error al obtener pacientes: {str(e)}")
        return jsonify({'error': 'Error al obtener la lista de pacientes'}), 500

# Obtener información de un paciente específico
@doctors_bp.route('/patients/<int:patient_id>', methods=['GET'])
@doctor_required
def get_patient(patient_id):
    try:
        # Verificar que el paciente existe
        patient = User.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Paciente no encontrado'}), 404
        
        # Verificar que el paciente está asociado al médico
        # Aquí deberías implementar la lógica para verificar esta relación
        # Por ahora, permitimos acceso a cualquier paciente para demostración
        
        patient_data = {
            'id': patient.id,
            'email': patient.email,
            'first_name': patient.first_name,
            'last_name': patient.last_name,
            'age': patient.calculate_age(),
            'gender': patient.gender,
            'height': patient.height,
            'date_of_birth': patient.date_of_birth.isoformat() if patient.date_of_birth else None,
            'daily_calorie_goal': patient.daily_calorie_goal or 2000
        }
        
        return jsonify(patient_data), 200
        
    except Exception as e:
        print(f"Error al obtener información del paciente: {str(e)}")
        return jsonify({'error': 'Error al obtener información del paciente'}), 500

# Obtener estudios médicos de un paciente
@doctors_bp.route('/patients/<int:patient_id>/studies', methods=['GET'])
@doctor_required
def get_patient_studies(patient_id):
    try:
        # Verificar que el paciente existe
        patient = User.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Paciente no encontrado'}), 404
        
        # Obtener estudios médicos del paciente
        # Esto depende de tu modelo de datos
        # Ejemplo:
        # studies = MedicalStudy.query.filter_by(patient_id=patient_id).all()
        
        # Para demostración, devolvemos datos de ejemplo
        studies = [
            {
                'id': 1,
                'type': 'Análisis de Sangre',
                'created_at': '2023-01-15T10:30:00',
                'status': 'completed',
                'results': 'Resultados normales'
            },
            {
                'id': 2,
                'type': 'Radiografía',
                'created_at': '2023-02-20T14:45:00',
                'status': 'pending',
                'results': None
            }
        ]
        
        return jsonify(studies), 200
        
    except Exception as e:
        print(f"Error al obtener estudios del paciente: {str(e)}")
        return jsonify({'error': 'Error al obtener estudios médicos del paciente'}), 500

# Obtener resumen nutricional diario de un paciente
@doctors_bp.route('/patients/<int:patient_id>/nutrition/summary/<string:log_date_str>', methods=['GET'])
@doctor_required
def get_patient_nutrition_summary(patient_id, log_date_str):
    try:
        # Convertir string YYYY-MM-DD a objeto date
        try:
            log_date = datetime.strptime(log_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido. Usar YYYY-MM-DD'}), 400
        
        # Verificar que el paciente existe
        patient = User.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Paciente no encontrado'}), 404
        
        # Consultar y agregar datos para el paciente y la fecha
        summary = db.session.query(
            func.sum(NutritionLog.calories).label('total_calories'),
            func.sum(NutritionLog.proteins).label('total_proteins'),
            func.sum(NutritionLog.carbs).label('total_carbs'),
            func.sum(NutritionLog.fats).label('total_fats')
        ).filter(
            NutritionLog.user_id == patient_id,
            NutritionLog.log_date == log_date
        ).group_by(NutritionLog.user_id).first()
        
        daily_goal = patient.daily_calorie_goal if patient else 2000
        
        if summary:
            result = {
                'date': log_date.isoformat(),
                'calories': summary.total_calories or 0,
                'proteins': summary.total_proteins or 0.0,
                'carbs': summary.total_carbs or 0.0,
                'fats': summary.total_fats or 0.0,
                'daily_calorie_goal': daily_goal
            }
        else:
            # Si no hay entradas para ese día
            result = {
                'date': log_date.isoformat(),
                'calories': 0,
                'proteins': 0.0,
                'carbs': 0.0,
                'fats': 0.0,
                'daily_calorie_goal': daily_goal
            }
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error al obtener resumen nutricional: {str(e)}")
        return jsonify({'error': 'Error al obtener el resumen nutricional diario'}), 500

# Obtener registros nutricionales de un paciente en un rango de fechas
@doctors_bp.route('/patients/<int:patient_id>/nutrition/logs', methods=['GET'])
@doctor_required
def get_patient_nutrition_logs(patient_id):
    try:
        # Obtener parámetros de fecha
        start_date_str = request.args.get('startDate')
        end_date_str = request.args.get('endDate')
        
        # Convertir strings a objetos date
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido. Usar YYYY-MM-DD'}), 400
        
        # Verificar que el paciente existe
        patient = User.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Paciente no encontrado'}), 404
        
        # Construir la consulta
        query = NutritionLog.query.filter_by(user_id=patient_id)
        
        if start_date:
            query = query.filter(NutritionLog.log_date >= start_date)
        
        if end_date:
            query = query.filter(NutritionLog.log_date <= end_date)
        
        # Ordenar por fecha (más reciente primero)
        query = query.order_by(NutritionLog.log_date.desc())
        
        # Ejecutar la consulta
        logs = query.all()
        
        # Formatear resultados
        logs_data = [log.to_dict() for log in logs]
        
        return jsonify(logs_data), 200
        
    except Exception as e:
        print(f"Error al obtener registros nutricionales: {str(e)}")
        return jsonify({'error': 'Error al obtener los registros nutricionales'}), 500

# Actualizar objetivo calórico de un paciente
@doctors_bp.route('/patients/<int:patient_id>/nutrition/goal', methods=['PUT'])
@doctor_required
def update_patient_calorie_goal(patient_id):
    try:
        data = request.get_json()
        new_goal = data.get('daily_calorie_goal')
        
        if new_goal is None or not isinstance(new_goal, int) or new_goal <= 0:
            return jsonify({'error': 'Objetivo calórico inválido'}), 400
        
        # Verificar que el paciente existe
        patient = User.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Paciente no encontrado'}), 404
        
        # Actualizar el objetivo calórico
        patient.daily_calorie_goal = new_goal
        db.session.commit()
        
        return jsonify({
            'message': 'Objetivo calórico actualizado',
            'daily_calorie_goal': patient.daily_calorie_goal
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error al actualizar objetivo calórico: {str(e)}")
        return jsonify({'error': 'Error al actualizar el objetivo calórico'}), 500

# Registrar un nuevo paciente para el médico
@doctors_bp.route('/patients/register', methods=['POST'])
@doctor_required
def register_patient():
    user_id = get_jwt_identity()
    
    try:
        data = request.get_json()
        
        # Verificar si el paciente ya existe
        existing_user = User.query.filter_by(email=data.get('email')).first()
        
        if existing_user:
            # Asociar paciente existente al médico
            # Implementar según tu modelo de datos
            return jsonify({
                'message': 'Paciente existente asociado al médico',
                'patient_id': existing_user.id
            }), 200
        
        # Crear nuevo usuario/paciente
        new_patient = User(
            email=data.get('email'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            date_of_birth=datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d').date() if data.get('date_of_birth') else None,
            gender=data.get('gender'),
            height=data.get('height'),
            is_doctor=False
        )
        
        # Generar contraseña temporal
        import secrets
        import string
        temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
        new_patient.set_password(temp_password)
        
        # Guardar en la base de datos
        db.session.add(new_patient)
        db.session.commit()
        
        # Asociar paciente al médico
        # Implementar según tu modelo de datos
        
        # Enviar email con credenciales (implementar según necesidades)
        
        return jsonify({
            'message': 'Paciente registrado exitosamente',
            'patient_id': new_patient.id,
            'temp_password': temp_password  # En producción, no devolver esto, solo enviar por email
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error al registrar paciente: {str(e)}")
        return jsonify({'error': 'Error al registrar al paciente'}), 500

@doctors_bp.route('/<int:doctor_id>', methods=['GET'])
def get_doctor_profile(doctor_id):
    try:
        # Obtener el doctor
        doctor = Doctor.query.get(doctor_id)
        
        if not doctor:
            return jsonify({'error': 'Médico no encontrado'}), 404
        
        # Obtener el usuario asociado
        user = User.query.get(doctor.user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Obtener credenciales
        credentials = DoctorCredential.query.filter_by(doctor_id=doctor.id).all()
        credentials_data = [credential.to_dict() for credential in credentials]
        
        # Obtener reseñas
        reviews = DoctorReview.query.filter_by(doctor_id=doctor.id).all()
        reviews_data = [review.to_dict() for review in reviews]
        
        # Construir respuesta
        doctor_data = {
            'id': doctor.id,
            'name': f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.email.split('@')[0],
            'email': user.email,
            'specialty': doctor.specialty,
            'license_number': doctor.license_number,
            'description': doctor.description,
            'education': doctor.education,
            'experience_years': doctor.experience_years,
            'consultation_fee': doctor.consultation_fee,
            'available_online': doctor.available_online,
            'languages': doctor.languages,
            'office_address': doctor.office_address,
            'office_phone': doctor.office_phone,
            'profile_picture': user.profile_picture,
            'credentials': credentials_data,
            'reviews': reviews_data,
            'average_rating': doctor.get_average_rating()
        }
        
        return jsonify(doctor_data), 200
        
    except Exception as e:
        print(f"Error al obtener perfil del médico: {str(e)}")
        return jsonify({'error': 'Error al obtener información del médico'}), 500

@doctors_bp.route('/<int:doctor_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(doctor_id):
    user_id = get_jwt_identity()
    
    try:
        # Verificar que el doctor existe
        doctor = Doctor.query.get(doctor_id)
        
        if not doctor:
            return jsonify({'error': 'Médico no encontrado'}), 404
        
        # Verificar que el usuario existe
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar que el usuario no es el mismo doctor
        if user.id == doctor.user_id:
            return jsonify({'error': 'No puedes dejar una reseña para ti mismo'}), 400
        
        # Verificar si el usuario ya ha dejado una reseña para este doctor
        existing_review = DoctorReview.query.filter_by(
            doctor_id=doctor_id,
            user_id=user_id
        ).first()
        
        data = request.get_json()
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        if not rating or not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            return jsonify({'error': 'Calificación inválida. Debe ser un número entre 1 y 5'}), 400
        
        if existing_review:
            # Actualizar reseña existente
            existing_review.rating = rating
            existing_review.comment = comment
            existing_review.created_at = datetime.utcnow()  # Actualizar timestamp
        else:
            # Crear nueva reseña
            new_review = DoctorReview(
                doctor_id=doctor_id,
                user_id=user_id,
                rating=rating,
                comment=comment
            )
            db.session.add(new_review)
        
        db.session.commit()
        
        return jsonify({'message': 'Reseña guardada correctamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error al guardar reseña: {str(e)}")
        return jsonify({'error': 'Error al guardar la reseña'}), 500

def init_app(app):
    # Asegurarse de que los directorios necesarios existen
    pass 