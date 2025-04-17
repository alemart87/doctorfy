from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, UserRole, Subscription
from datetime import datetime
import logging

# Crear un logger específico para este módulo
logger = logging.getLogger(__name__)

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
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Solo permitir acceso a alemart87@gmail.com o administradores
    if user.email != 'alemart87@gmail.com' and not user.is_admin():
        return jsonify({'error': 'No autorizado'}), 403
    
    # Obtener parámetros de paginación
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Obtener parámetros de filtrado
    email_filter = request.args.get('email', '')
    status_filter = request.args.get('status', '')
    
    # Construir la consulta base
    query = User.query
    
    # Aplicar filtros si se proporcionan
    if email_filter:
        query = query.filter(User.email.ilike(f'%{email_filter}%'))
    
    if status_filter:
        if status_filter == 'active':
            query = query.filter(User.subscription_active == True)
        elif status_filter == 'inactive':
            query = query.filter(User.subscription_active == False)
    
    # Ejecutar la consulta paginada
    users_pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page)
    
    # Preparar la respuesta
    users_data = []
    for user in users_pagination.items:
        # Obtener información de suscripción
        subscription = Subscription.query.filter_by(user_id=user.id).first()
        
        users_data.append({
            'id': user.id,
            'email': user.email,
            'is_doctor': user.is_doctor,
            'role': user.role,
            'subscription_active': user.subscription_active,
            'created_at': user.created_at.isoformat(),
            'subscription': {
                'status': subscription.status if subscription else 'none',
                'stripe_customer_id': subscription.stripe_customer_id if subscription else None,
                'updated_at': subscription.updated_at.isoformat() if subscription else None
            } if subscription else None
        })
    
    return jsonify({
        'users': users_data,
        'pagination': {
            'total': users_pagination.total,
            'pages': users_pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': users_pagination.has_next,
            'has_prev': users_pagination.has_prev
        }
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

@admin_bp.route('/users/<int:user_id>/subscription', methods=['PUT'])
@jwt_required()
def update_user_subscription(user_id):
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    
    # Solo permitir acceso a alemart87@gmail.com o administradores
    if admin_user.email != 'alemart87@gmail.com' and not admin_user.is_admin():
        return jsonify({'error': 'No autorizado'}), 403
    
    # Obtener el usuario a actualizar
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Obtener datos de la solicitud
    data = request.get_json()
    active = data.get('active', False)
    
    try:
        # Actualizar el estado de suscripción del usuario
        user.subscription_active = active
        
        # Actualizar o crear el registro de suscripción
        subscription = Subscription.query.filter_by(user_id=user.id).first()
        if not subscription:
            subscription = Subscription(
                user_id=user.id,
                status='active' if active else 'inactive'
            )
            db.session.add(subscription)
        else:
            subscription.status = 'active' if active else 'inactive'
            subscription.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Registrar la acción usando el logger en lugar de app.logger
        logger.info(f"Suscripción de usuario {user.email} (ID: {user.id}) actualizada manualmente por {admin_user.email} (ID: {admin_user.id}). Nuevo estado: {'activa' if active else 'inactiva'}")
        
        # Enviar notificación por correo al administrador
        try:
            from utils.email_utils import send_email
            
            subject = f"Suscripción actualizada manualmente: {user.email}"
            body = f"""
            <html>
            <body>
                <h1>Actualización manual de suscripción</h1>
                <p>Se ha {active and 'activado' or 'desactivado'} manualmente la suscripción de un usuario:</p>
                <ul>
                    <li><strong>Email:</strong> {user.email}</li>
                    <li><strong>ID:</strong> {user.id}</li>
                    <li><strong>Tipo:</strong> {"Médico" if user.is_doctor else "Paciente"}</li>
                    <li><strong>Fecha:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</li>
                    <li><strong>Actualizado por:</strong> {admin_user.email}</li>
                </ul>
            </body>
            </html>
            """
            
            send_email(subject, body, to_email="info@marketeapy.com", html=True)
        except Exception as email_error:
            logger.error(f"Error al enviar correo de notificación: {str(email_error)}")
        
        return jsonify({
            'success': True,
            'message': f"Suscripción de usuario {user.email} actualizada a {'activa' if active else 'inactiva'}",
            'user': {
                'id': user.id,
                'email': user.email,
                'subscription_active': user.subscription_active
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al actualizar suscripción: {str(e)}")
        return jsonify({'error': str(e)}), 500 

@admin_bp.route('/verify-subscriptions', methods=['POST'])
@jwt_required()
def verify_subscriptions():
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    
    # Solo permitir acceso a alemart87@gmail.com o administradores
    if admin_user.email != 'alemart87@gmail.com' and not admin_user.is_admin():
        return jsonify({'error': 'No autorizado'}), 403
    
    try:
        import stripe
        from flask import current_app
        
        # Obtener todas las suscripciones con customer_id de Stripe
        subscriptions = Subscription.query.filter(Subscription.stripe_customer_id.isnot(None)).all()
        
        updated_count = 0
        
        for subscription in subscriptions:
            try:
                # Verificar el estado en Stripe
                stripe_customer = stripe.Customer.retrieve(subscription.stripe_customer_id)
                
                # Obtener suscripciones activas del cliente
                stripe_subscriptions = stripe.Subscription.list(
                    customer=subscription.stripe_customer_id,
                    status='active',
                    limit=1
                )
                
                # Verificar si tiene suscripciones activas
                has_active_subscription = len(stripe_subscriptions.data) > 0
                
                # Actualizar el estado en la base de datos
                user = User.query.get(subscription.user_id)
                
                if user:
                    if has_active_subscription and (not user.subscription_active or subscription.status != 'active'):
                        user.subscription_active = True
                        subscription.status = 'active'
                        updated_count += 1
                        logger.info(f"Suscripción activada para {user.email} (ID: {user.id}) tras verificación en Stripe")
                    elif not has_active_subscription and (user.subscription_active or subscription.status == 'active'):
                        user.subscription_active = False
                        subscription.status = 'inactive'
                        updated_count += 1
                        logger.info(f"Suscripción desactivada para {user.email} (ID: {user.id}) tras verificación en Stripe")
            
            except stripe.error.StripeError as e:
                logger.error(f"Error al verificar suscripción en Stripe: {str(e)}")
                continue
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'updated': updated_count,
            'message': f"Se han verificado {len(subscriptions)} suscripciones y actualizado {updated_count}"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al verificar suscripciones: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500 