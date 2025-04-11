from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User, Doctor

def doctor_required(fn):
    """
    Decorador para rutas que requieren que el usuario sea un doctor.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_doctor:
            return jsonify({'error': 'Se requiere ser doctor para acceder a esta funcionalidad'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

def admin_required(fn):
    """
    Decorador para rutas que requieren que el usuario sea un administrador.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin():
            return jsonify({'error': 'Se requiere ser administrador para acceder a esta funcionalidad'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

def superadmin_required(fn):
    """
    Decorador para rutas que requieren que el usuario sea un superadministrador.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_superadmin():
            return jsonify({'error': 'Se requiere ser superadministrador para acceder a esta funcionalidad'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper 