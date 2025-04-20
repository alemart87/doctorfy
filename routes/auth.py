from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, UserRole, Doctor, PasswordReset
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime
import secrets
from flask import current_app, url_for
from utils.email_utils import send_password_reset_email, send_registration_notification, send_welcome_email
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import jwt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Datos recibidos en registro:", data)
        
        # Validar datos
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Se requieren email y contraseña'}), 400
        
        # Verificar si el usuario ya existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        # Configurar el período de prueba (2 días)
        now = datetime.utcnow()
        trial_end = now + timedelta(days=2)
        
        # Crear nuevo usuario
        user = User(
            email=data['email'],
            is_doctor=data.get('is_doctor', False),
            role='DOCTOR' if data.get('is_doctor', False) else 'USER',
            specialty=data.get('specialty'),
            license_number=data.get('license_number'),
            trial_start=now,
            trial_end=trial_end,
            trial_used=False,
            subscription_active=False  # Asegurarse de que este campo esté en False
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Imprimir información de depuración
        print(f"Usuario creado: ID={user.id}, Email={user.email}")
        print(f"Período de prueba: Inicio={user.trial_start}, Fin={user.trial_end}, Usado={user.trial_used}")
        
        # Enviar notificación por correo con información sobre el período de prueba
        user_data = {
            'email': user.email,
            'created_at': now.strftime('%Y-%m-%d %H:%M:%S'),
            'is_doctor': user.is_doctor,
            'id': user.id,
            'trial_end': trial_end.strftime('%Y-%m-%d %H:%M:%S')
        }
        send_registration_notification(user_data)
        send_welcome_email(user)  # Nueva función para enviar email de bienvenida
        
        # Si es doctor, crear entrada en la tabla de doctores
        if data.get('is_doctor', False):
            doctor = Doctor(
                user_id=user.id,
                specialty=data.get('specialty'),
                license_number=data.get('license_number')
            )
            db.session.add(doctor)
            db.session.commit()
        
        # Generar token
        access_token = create_access_token(identity=str(user.id))
        print(f"Token generado para usuario {user.id}: {access_token}")
        
        response_data = {
            'message': 'Usuario registrado con éxito',
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'is_doctor': user.is_doctor,
                'role': user.role
            }
        }
        print("Respuesta del registro:", response_data)
        
        return jsonify(response_data), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error en registro: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Verificar client_id y client_secret
    if data.get('client_id') != os.getenv('CLIENT_ID') or \
       data.get('client_secret') != os.getenv('CLIENT_SECRET'):
        return jsonify({'error': 'Cliente inválido'}), 401

    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, os.getenv('SECRET_KEY'))
        
        return jsonify({
            'token': token,
            'user_id': user.id,
            'email': user.email
        })
    
    return jsonify({'error': 'Credenciales inválidas'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/doctor', methods=['GET'])
@jwt_required()
def get_doctor_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_doctor:
        return jsonify({'error': 'Usuario no es doctor'}), 403
    
    doctor = Doctor.query.filter_by(user_id=user.id).first()
    if not doctor:
        return jsonify({'error': 'Doctor no encontrado'}), 404
    
    return jsonify(doctor.to_dict()), 200

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        current_user_id = get_jwt_identity()
        return jsonify({
            'valid': True,
            'user_id': current_user_id
        }), 200
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 401

@auth_bp.route('/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'API funcionando correctamente',
        'timestamp': datetime.now().isoformat()
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Se requiere un email'}), 400
        
        # Buscar el usuario por email
        user = User.query.filter_by(email=email).first()
        
        # Aunque el usuario no exista, no revelamos esa información por seguridad
        if not user:
            return jsonify({'message': 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'}), 200
        
        # Generar un token único
        token = secrets.token_urlsafe(32)
        
        # Establecer la expiración (24 horas)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Guardar el token en la base de datos
        reset_request = PasswordReset(
            email=email,
            token=token,
            expires_at=expires_at
        )
        
        # Invalidar tokens anteriores para este email
        PasswordReset.query.filter_by(email=email, used=False).update({'used': True})
        
        db.session.add(reset_request)
        db.session.commit()
        
        # Construir la URL de restablecimiento
        reset_url = f"{request.host_url.rstrip('/')}/reset-password/{token}"
        
        # Enviar el correo electrónico
        send_password_reset_email(email, reset_url)
        
        return jsonify({
            'message': 'Se han enviado instrucciones para restablecer tu contraseña'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en forgot_password: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password/<token>/verify', methods=['GET'])
def verify_reset_token(token):
    try:
        # Buscar el token en la base de datos
        reset_request = PasswordReset.query.filter_by(token=token, used=False).first()
        
        if not reset_request or not reset_request.is_valid():
            return jsonify({'error': 'Token inválido o expirado'}), 400
        
        return jsonify({'valid': True}), 200
        
    except Exception as e:
        print(f"Error en verify_reset_token: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        data = request.get_json()
        password = data.get('password')
        
        if not password:
            return jsonify({'error': 'Se requiere una nueva contraseña'}), 400
        
        # Buscar el token en la base de datos
        reset_request = PasswordReset.query.filter_by(token=token, used=False).first()
        
        if not reset_request or not reset_request.is_valid():
            return jsonify({'error': 'Token inválido o expirado'}), 400
        
        # Buscar el usuario por email
        user = User.query.filter_by(email=reset_request.email).first()
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Actualizar la contraseña
        user.set_password(password)
        
        # Marcar el token como usado
        reset_request.used = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Contraseña restablecida con éxito'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en reset_password: {str(e)}")
        return jsonify({'error': str(e)}), 500 

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    try:
        # Verificar el token de Google
        token = request.json['credential']
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            os.getenv('GOOGLE_CLIENT_ID')
        )

        # Obtener datos del usuario
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')

        # Buscar o crear usuario
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                email=email,
                first_name=name,
                profile_picture=picture,
                is_verified=True,  # Los usuarios de Google ya están verificados
                credits=15  # Créditos de bienvenida
            )
            db.session.add(user)
            db.session.commit()

        # Generar token JWT
        token = create_access_token(identity=user.id)
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        })

    except ValueError:
        return jsonify({'error': 'Token de Google inválido'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500