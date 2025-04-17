from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.openai_utils import chat_with_medical_ai
from models import User, ChatSession, ChatMessage, UserChatUsage, UserSubscription, db
import datetime

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat/message', methods=['POST'])
@jwt_required()
def send_message():
    """Envía un mensaje al asistente médico IA y obtiene una respuesta"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"success": False, "error": "Usuario no encontrado"}), 404
    
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({"success": False, "error": "Mensaje requerido"}), 400
    
    message_text = data['message']
    session_id = data.get('session_id')
    specialty = data.get('specialty', 'general')
    
    # Obtener o crear una sesión de chat
    if session_id:
        chat_session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
        if not chat_session:
            return jsonify({"success": False, "error": "Sesión de chat no encontrada"}), 404
    else:
        # Crear una nueva sesión
        chat_session = ChatSession(
            user_id=current_user_id,
            specialty=specialty,
            title=f"Consulta de {specialty} - {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}"
        )
        db.session.add(chat_session)
        db.session.commit()
    
    # Verificar límites de uso (para monetización)
    current_month = datetime.datetime.now().strftime('%Y-%m')
    user_usage = UserChatUsage.query.filter_by(
        user_id=current_user_id, 
        year_month=current_month
    ).first()
    
    # Si no existe registro de uso para este mes, crearlo
    if not user_usage:
        # Obtener la suscripción activa del usuario
        subscription = UserSubscription.query.filter_by(
            user_id=current_user_id,
            is_active=True
        ).order_by(UserSubscription.start_date.desc()).first()
        
        # Establecer límites según el plan de suscripción
        message_limit = 0
        tokens_limit = 0
        if subscription and subscription.is_valid():
            message_limit = subscription.plan.message_limit
            tokens_limit = subscription.plan.tokens_limit
        
        user_usage = UserChatUsage(
            user_id=current_user_id,
            year_month=current_month,
            message_count=0,
            tokens_used=0,
            message_limit=message_limit,
            tokens_limit=tokens_limit
        )
        db.session.add(user_usage)
    
    # Verificar si el usuario ha alcanzado su límite
    if not user_usage.is_within_limits():
        return jsonify({
            "success": False, 
            "error": "Has alcanzado el límite de mensajes de tu plan. Actualiza tu suscripción para continuar."
        }), 403
    
    # Estimar tokens (implementación básica, se puede mejorar)
    estimated_tokens = len(message_text.split()) * 1.3  # Aproximación simple
    
    # Guardar el mensaje del usuario
    user_message = ChatMessage(
        session_id=chat_session.id,
        role="user",
        content=message_text,
        tokens=estimated_tokens,
        date_day=datetime.datetime.now().date(),
        date_month=current_month
    )
    db.session.add(user_message)
    
    # Actualizar contadores de la sesión
    chat_session.increment_message_count()
    chat_session.add_tokens(estimated_tokens)
    
    # Actualizar uso mensual del usuario
    user_usage.increment_usage(messages=1, tokens=estimated_tokens)
    
    db.session.commit()
    
    # Obtener historial de mensajes para contexto
    messages = ChatMessage.query.filter_by(session_id=chat_session.id).order_by(ChatMessage.timestamp).all()
    message_history = [{"role": msg.role, "content": msg.content} for msg in messages]
    
    # Obtener perfil del usuario para personalización
    user_profile = {
        "age": user.age,
        "gender": user.gender,
        "height": user.height,
        "weight": user.weight,
        "medical_conditions": user.medical_conditions,
        "allergies": user.allergies
    }
    
    # Llamar a la IA
    ai_response = chat_with_medical_ai(message_history, user_profile, specialty)
    
    if not ai_response.get("success", False):
        return jsonify({"success": False, "error": ai_response.get("error", "Error al procesar el mensaje")}), 500
    
    # Estimar tokens de la respuesta
    response_text = ai_response["response"]
    response_tokens = len(response_text.split()) * 1.3  # Aproximación simple
    
    # Guardar la respuesta de la IA
    assistant_message = ChatMessage(
        session_id=chat_session.id,
        role="assistant",
        content=response_text,
        tokens=response_tokens,
        date_day=datetime.datetime.now().date(),
        date_month=current_month
    )
    db.session.add(assistant_message)
    
    # Actualizar contadores nuevamente
    chat_session.increment_message_count()
    chat_session.add_tokens(response_tokens)
    user_usage.increment_usage(messages=1, tokens=response_tokens)
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "session_id": chat_session.id,
        "response": ai_response["response"],
        "specialty": chat_session.specialty,
        "usage": {
            "session_messages": chat_session.message_count,
            "session_tokens": chat_session.tokens_used,
            "monthly_messages": user_usage.message_count,
            "monthly_tokens": user_usage.tokens_used,
            "message_limit": user_usage.message_limit,
            "tokens_limit": user_usage.tokens_limit
        }
    })

@chat_bp.route('/api/chat/sessions', methods=['GET'])
@jwt_required()
def get_chat_sessions():
    """Obtiene todas las sesiones de chat del usuario"""
    current_user_id = get_jwt_identity()
    
    sessions = ChatSession.query.filter_by(user_id=current_user_id).order_by(ChatSession.created_at.desc()).all()
    
    sessions_data = [{
        "id": session.id,
        "title": session.title,
        "specialty": session.specialty,
        "created_at": session.created_at.isoformat(),
        "updated_at": session.updated_at.isoformat() if session.updated_at else None
    } for session in sessions]
    
    return jsonify({
        "success": True,
        "sessions": sessions_data
    })

@chat_bp.route('/api/chat/sessions/<int:session_id>', methods=['GET'])
@jwt_required()
def get_chat_session(session_id):
    """Obtiene una sesión de chat específica con todos sus mensajes"""
    current_user_id = get_jwt_identity()
    
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    
    if not session:
        return jsonify({"success": False, "error": "Sesión no encontrada"}), 404
    
    messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp).all()
    
    messages_data = [{
        "id": message.id,
        "role": message.role,
        "content": message.content,
        "timestamp": message.timestamp.isoformat()
    } for message in messages]
    
    return jsonify({
        "success": True,
        "session": {
            "id": session.id,
            "title": session.title,
            "specialty": session.specialty,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat() if session.updated_at else None,
            "messages": messages_data
        }
    })

@chat_bp.route('/api/chat/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_chat_session(session_id):
    """Elimina una sesión de chat"""
    current_user_id = get_jwt_identity()
    
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    
    if not session:
        return jsonify({"success": False, "error": "Sesión no encontrada"}), 404
    
    # Eliminar todos los mensajes asociados
    ChatMessage.query.filter_by(session_id=session_id).delete()
    
    # Eliminar la sesión
    db.session.delete(session)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Sesión eliminada correctamente"
    }) 