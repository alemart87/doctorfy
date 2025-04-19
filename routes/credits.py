from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User

credits_bp = Blueprint('credits', __name__)

@credits_bp.route('/api/credits/balance', methods=['GET'])
@jwt_required()
def get_credit_balance():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({
        'credits': user.credits,
        'can_analyze_medical': user.has_enough_credits('medical'),
        'can_analyze_nutrition': user.has_enough_credits('nutrition')
    })

@credits_bp.route('/api/credits/assign', methods=['POST'])
@jwt_required()
def assign_credits():
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)
    
    if not admin or admin.email != 'alemart87@gmail.com':
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    user_id = data.get('user_id')
    credits = float(data.get('credits', 0))
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    current_credits = float(user.credits or 0)
    user.credits = current_credits + credits
    db.session.commit()
    
    return jsonify({
        'success': True,
        'new_balance': user.credits
    }) 