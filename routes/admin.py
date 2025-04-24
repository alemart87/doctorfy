from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, UserRole, Subscription
from datetime import datetime
import logging
from utils.email_templates import EMAIL_TEMPLATES
from utils.email_utils import send_email

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
    admin = User.query.get(current_user_id)
    
    if not admin or admin.email != 'alemart87@gmail.com':
        return jsonify({'error': 'No autorizado'}), 403
    
    users = User.query.all()
    users_list = [{
        'id': user.id,
        'email': user.email,
        'is_doctor': user.is_doctor,
        'credits': float(user.credits or 0)
    } for user in users]
    
    return jsonify(users_list)

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

@admin_bp.route('/send-mass-email', methods=['POST'])
@jwt_required()
def send_mass_email():
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or admin.email != 'alemart87@gmail.com':
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    template_key = data.get('template')
    
    if not template_key:
        return jsonify({'error': 'Plantilla no especificada'}), 400
    
    # Obtener TODOS los usuarios, no solo los activos
    users = User.query.all()
    sent_count = 0
    failed_count = 0
    failed_emails = []
    
    try:
        if template_key == 'custom':
            subject = data.get('customSubject')
            body = data.get('customBody')
            if not subject or not body:
                return jsonify({'error': 'Asunto y cuerpo son requeridos para plantillas personalizadas'}), 400
                
            for user in users:
                try:
                    formatted_body = body.format(name=user.first_name or user.email.split('@')[0])
                    if send_email(subject, formatted_body, user.email, html=True):
                        sent_count += 1
                        logger.info(f"Correo enviado exitosamente a {user.email}")
                    else:
                        failed_count += 1
                        failed_emails.append(user.email)
                        logger.error(f"Fallo al enviar correo a {user.email}")
                except Exception as e:
                    logger.error(f"Error enviando correo a {user.email}: {str(e)}")
                    failed_count += 1
                    failed_emails.append(user.email)
        else:
            template = EMAIL_TEMPLATES.get(template_key)
            if not template:
                return jsonify({'error': 'Plantilla no encontrada'}), 404
                
            for user in users:
                try:
                    formatted_body = template['template'].format(
                        name=user.first_name or user.email.split('@')[0]
                    )
                    if send_email(template['subject'], formatted_body, user.email, html=True):
                        sent_count += 1
                        logger.info(f"Correo enviado exitosamente a {user.email}")
                    else:
                        failed_count += 1
                        failed_emails.append(user.email)
                        logger.error(f"Fallo al enviar correo a {user.email}")
                except Exception as e:
                    logger.error(f"Error enviando correo a {user.email}: {str(e)}")
                    failed_count += 1
                    failed_emails.append(user.email)
        
        return jsonify({
            'success': True,
            'total_users': len(users),
            'sent': sent_count,
            'failed': failed_count,
            'failed_emails': failed_emails,
            'message': f'Correos enviados exitosamente a {sent_count} usuarios. Fallaron {failed_count} envíos.'
        })
        
    except Exception as e:
        logger.error(f"Error enviando correos masivos: {str(e)}")
        return jsonify({'error': 'Error al enviar correos'}), 500

@admin_bp.route('/preview-email', methods=['POST'])
@jwt_required()
def preview_email():
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or admin.email != 'alemart87@gmail.com':
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    template_key = data.get('template')
    
    try:
        if template_key == 'custom':
            preview_data = {
                'subject': data.get('customSubject', ''),
                'body': data.get('customBody', '').format(name='Usuario Ejemplo')
            }
        else:
            template = EMAIL_TEMPLATES.get(template_key)
            if not template:
                return jsonify({'error': 'Plantilla no encontrada'}), 404
            
            preview_data = {
                'subject': template['subject'],
                'body': template['template'].format(name='Usuario Ejemplo')
            }
        
        return jsonify(preview_data)
        
    except Exception as e:
        current_app.logger.error(f"Error generando vista previa: {str(e)}")
        return jsonify({'error': 'Error al generar vista previa'}), 500 