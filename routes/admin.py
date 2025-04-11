from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, UserRole

admin_bp = Blueprint('admin', __name__)

def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.is_admin()

def is_superadmin(user_id):
    user = User.query.get(user_id)
    return user and user.is_superadmin()

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Acceso denegado'}), 403
    
    users = User.query.all()
    return jsonify({
        'users': [user.to_dict() for user in users]
    }), 200

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    current_user_id = get_jwt_identity()
    
    if not is_admin(current_user_id):
        return jsonify({'error': 'Acceso denegado'}), 403
    
    data = request.get_json()
    new_role = data.get('role')
    
    if not new_role:
        return jsonify({'error': 'Se requiere el rol'}), 400
    
    # Verificar si el rol es válido
    try:
        role = UserRole(new_role)
    except ValueError:
        return jsonify({'error': 'Rol inválido'}), 400
    
    # Solo un superadmin puede crear otro superadmin
    if role == UserRole.SUPERADMIN and not is_superadmin(current_user_id):
        return jsonify({'error': 'Solo un SuperAdmin puede crear otro SuperAdmin'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Un admin no puede cambiar el rol de un superadmin
    if user.is_superadmin() and not is_superadmin(current_user_id):
        return jsonify({'error': 'No puedes cambiar el rol de un SuperAdmin'}), 403
    
    user.role = role
    
    # Si el rol es doctor o admin, asegurarse de que tenga los privilegios necesarios
    if role in [UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPERADMIN]:
        user.is_doctor = True
        user.subscription_active = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Rol actualizado con éxito',
        'user': user.to_dict()
    }), 200 