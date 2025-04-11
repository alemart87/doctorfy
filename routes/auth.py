from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, UserRole, Doctor
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime

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
        
        # Crear nuevo usuario
        user = User(
            email=data['email'],
            is_doctor=data.get('is_doctor', False),
            role='DOCTOR' if data.get('is_doctor', False) else 'USER',
            specialty=data.get('specialty'),
            license_number=data.get('license_number')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
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
    try:
        data = request.get_json()
        print("Datos recibidos en login (original):", data)
        
        # Corregir el formato de los datos si es necesario
        if 'email' in data and isinstance(data['email'], dict):
            # Si email es un objeto que contiene email y password
            if 'email' in data['email'] and 'password' in data['email']:
                email = data['email']['email']
                password = data['email']['password']
            else:
                return jsonify({'error': 'Formato de datos incorrecto'}), 400
        elif 'email' in data and 'password' in data:
            # Formato correcto
            email = data['email']
            password = data['password']
        else:
            return jsonify({'error': 'Se requiere email y contraseña'}), 400
        
        print(f"Email extraído: {email}, Password: {'*' * len(password) if password else None}")
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Email o contraseña incorrectos'}), 401
        
        # Crear token de acceso con identidad del usuario
        access_token = create_access_token(identity=str(user.id))
        
        # Imprimir la respuesta para depuración
        response_data = {
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'is_doctor': user.is_doctor,
                'role': user.role
            }
        }
        print("Respuesta del login:", response_data)
        
        return jsonify(response_data), 200
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return jsonify({'error': str(e)}), 500

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