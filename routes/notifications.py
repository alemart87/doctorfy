from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import credentials, messaging
from models import db, User, NotificationToken
from flask_jwt_extended import jwt_required, get_jwt_identity
import os

notifications_bp = Blueprint('notifications', __name__)

# Ruta al archivo de credenciales
FIREBASE_CREDS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), 
    'config', 'firebase', 
    'doctorfy-c133e-firebase-adminsdk.json'
)

# Inicializar Firebase Admin con las credenciales
cred = credentials.Certificate(FIREBASE_CREDS_PATH)
firebase_admin.initialize_app(cred)

@notifications_bp.route('/subscribe', methods=['POST'])
@jwt_required()
def subscribe():
    user_id = get_jwt_identity()
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Token no proporcionado'}), 400
        
    # Guardar token en la base de datos
    notification_token = NotificationToken(
        user_id=user_id,
        token=token
    )
    db.session.add(notification_token)
    db.session.commit()
    
    return jsonify({'message': 'Suscripción exitosa'})

@notifications_bp.route('/send', methods=['POST'])
@jwt_required()
def send_notification():
    # Verificar si es el admin
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.email != 'alemart87@gmail.com':
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    title = data.get('title')
    body = data.get('body')
    user_ids = data.get('user_ids', [])  # Lista de IDs de usuario o vacía para todos
    
    if not title or not body:
        return jsonify({'error': 'Título y cuerpo son requeridos'}), 400
    
    # Obtener tokens
    query = NotificationToken.query
    if user_ids:
        query = query.filter(NotificationToken.user_id.in_(user_ids))
    tokens = [token.token for token in query.all()]
    
    if not tokens:
        return jsonify({'error': 'No hay tokens de notificación registrados'}), 404
    
    # Enviar notificación
    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        tokens=tokens
    )
    
    response = messaging.send_multicast(message)
    
    return jsonify({
        'success': True,
        'sent': response.success_count,
        'failed': response.failure_count
    })

@notifications_bp.route('/check-tokens', methods=['GET'])
@jwt_required()
def check_tokens():
    """Verifica si hay tokens de notificación registrados"""
    tokens_count = NotificationToken.query.count()
    return jsonify({
        'hasTokens': tokens_count > 0,
        'count': tokens_count
    }) 