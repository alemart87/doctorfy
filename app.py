from flask import Flask, send_from_directory, jsonify, request, render_template, redirect, Response
from flask_migrate import Migrate
from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt_identity
)
from config import Config
from flask_cors import CORS
from models import db, MedicalStudy, User, Subscription
from routes.auth import auth_bp
from routes.medical_studies import medical_studies_bp
from routes.nutrition import nutrition_bp, init_app as init_nutrition
from routes.doctors import doctors_bp, init_app as init_doctors
from routes.admin import admin_bp
from routes.profile import profile_bp
from routes.doctor_profile import doctor_profile_bp
from routes.chat_routes import chat_bp
from routes.blog import blog_bp
import os
from datetime import timedelta, datetime, timezone, date
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import uuid
from werkzeug.security import generate_password_hash
from utils.logging_config import setup_logging
import stripe
from utils.email_utils import send_email
import json
from xml.etree.ElementTree import Element, SubElement, tostring

migrate = Migrate()
jwt = JWTManager()

# Cargar variables de entorno
load_dotenv()

# Verificar si debemos servir el frontend
serve_frontend = os.environ.get('SERVE_FRONTEND', 'true').lower() != 'false'

# Obtener orígenes permitidos de las variables de entorno
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000,https://doctorfy-frontend.onrender.com').split(',')

# Definir las rutas de almacenamiento (solo definir las variables, no configurar app todavía)
UPLOAD_FOLDER = '/persistent/uploads' if os.path.exists('/persistent') else 'uploads'
MEDICAL_STUDIES_FOLDER = os.path.join(UPLOAD_FOLDER, 'medical_studies')
NUTRITION_IMAGES_FOLDER = os.path.join(UPLOAD_FOLDER, 'nutrition')

# Crear directorios si no existen
os.makedirs(MEDICAL_STUDIES_FOLDER, exist_ok=True)
os.makedirs(NUTRITION_IMAGES_FOLDER, exist_ok=True)

# Al inicio de tu archivo app.py, después de importar stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
stripe_webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', 'whsec_nhLYQiMMbtBVZhc3miya0R2s2vTbLEy')

def ensure_upload_dirs(app):
    """
    Asegura que existan todos los directorios necesarios para uploads
    """
    upload_dirs = [
        'uploads',
        'uploads/medical_studies',
        'uploads/nutrition',
        'uploads/profile_pics',
        'uploads/doctor_credentials',
        'uploads/temp'
    ]
    
    for dir_path in upload_dirs:
        os.makedirs(os.path.join(app.root_path, dir_path), exist_ok=True)

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='frontend/build', static_url_path='/')
    app.config.from_object(config_class)
    
    # Configuración de la base de datos
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    
    # Si la URL comienza con postgres://, cambiarla a postgresql://
    # (Esto es necesario para versiones más recientes de SQLAlchemy)
    if app.config['SQLALCHEMY_DATABASE_URI'] and app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
        app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace('postgres://', 'postgresql://', 1)
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default-secret-key')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-secret-key')
    
    # Configuración para subida de archivos
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit
    
    # MOVER ESTA CONFIGURACIÓN AQUÍ
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MEDICAL_STUDIES_FOLDER'] = MEDICAL_STUDIES_FOLDER
    app.config['NUTRITION_IMAGES_FOLDER'] = NUTRITION_IMAGES_FOLDER
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, 
         resources={
             r"/api/*": {"origins": allowed_origins}, 
             r"/api/webhook/stripe": {"origins": "*"},
             r"/api/webhook/stripe/debug": {"origins": "*"},
             r"/api/webhook/stripe/accept": {"origins": "*"},
             r"/api/subscription/status": {"origins": allowed_origins},
             r"/api/debug/subscription-check": {"origins": allowed_origins},
             r"/api/debug/force-trial/*": {"origins": allowed_origins}
         }, 
         supports_credentials=True, 
         expose_headers=['Authorization'],
         allow_headers=["Content-Type", "Authorization", "Accept", "Stripe-Signature"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Asegurar que existan los directorios necesarios
    with app.app_context():
        ensure_upload_dirs(app)
        from routes.medical_studies import init_app as init_medical_studies
        init_medical_studies(app)
        init_nutrition(app)
        init_doctors(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(medical_studies_bp, url_prefix='/api/medical-studies')
    app.register_blueprint(nutrition_bp, url_prefix='/api/nutrition')
    app.register_blueprint(doctors_bp, url_prefix='/api/doctors')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(doctor_profile_bp, url_prefix='/api/doctor-profile')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(blog_bp)

    # Manejador de errores JWT
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        print(f"Token inválido: {error_string}")
        return jsonify({
            'error': 'Token inválido',
            'message': error_string
        }), 422
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"Token expirado: {jwt_payload}")
        return jsonify({
            'error': 'Token expirado',
            'message': 'El token ha expirado'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        print(f"Token faltante: {error_string}")
        return jsonify({
            'error': 'Token faltante',
            'message': 'No se proporcionó token de acceso'
        }), 401

    # Ruta para verificar el estado de la suscripción
    @app.route('/api/subscription/status', methods=['GET'])
    @jwt_required()
    def check_subscription_status():
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Si el usuario es alemart87@gmail.com, siempre devolver activo
        if user.email == 'alemart87@gmail.com':
            return jsonify({
                'active': True,
                'subscription': True,
                'trial': False,
                'is_admin': True
            })
        
        # Verificar período de prueba
        now_naive = datetime.utcnow()                    # ← sin tz
        in_trial = False
        trial_remaining = None
        
        if user.trial_start and user.trial_end and not user.trial_used:
            start = user.trial_start.replace(tzinfo=None)
            end   = user.trial_end.replace(tzinfo=None)
            if start <= now_naive <= end:
                in_trial = True
                delta = end - now_naive
                trial_remaining = int(delta.total_seconds() / 3600)
        
        # Verificar suscripción
        subscription = Subscription.query.filter_by(user_id=user.id).first()
        has_subscription = subscription and subscription.status == 'active'
        
        # Determinar si tiene acceso activo
        has_access = has_subscription or in_trial
        
        # Registrar información para depuración
        app.logger.info(f"Verificación de acceso para usuario {user.email} (ID: {user.id}):")
        app.logger.info(f"- Suscripción activa: {has_subscription}")
        app.logger.info(f"- En período de prueba: {in_trial}")
        app.logger.info(f"- Tiempo restante de prueba: {trial_remaining} horas")
        app.logger.info(f"- Tiene acceso activo: {has_access}")
        
        return jsonify({
            'active': has_access,
            'subscription': has_subscription,
            'trial': in_trial,
            'trial_remaining': trial_remaining,
            'trial_end': user.trial_end.isoformat() if user.trial_end else None,
            'trial_start': user.trial_start.isoformat() if user.trial_start else None,
            'trial_used': user.trial_used,
            'current_time': now_naive.isoformat()
        }), 200

    # Ruta para iniciar el proceso de suscripción
    @app.route('/api/subscription/create', methods=['POST'])
    @jwt_required()
    def create_subscription():
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        # Si el usuario es alemart87@gmail.com, darle acceso automáticamente
        if user.email == 'alemart87@gmail.com':
            # Verificar si ya tiene una suscripción
            subscription = Subscription.query.filter_by(user_id=user.id).first()
            if not subscription:
                subscription = Subscription(user_id=user.id, status='active')
                db.session.add(subscription)
            else:
                subscription.status = 'active'
            
            db.session.commit()
            return jsonify({'success': True, 'message': 'Acceso concedido automáticamente', 'redirect': None})
        
        # Para otros usuarios, redirigir a Stripe
        try:
            # Verificar si el usuario ya tiene un customer_id en Stripe
            subscription = Subscription.query.filter_by(user_id=user.id).first()
            
            if not subscription:
                # Crear un nuevo cliente en Stripe
                customer = stripe.Customer.create(
                    email=user.email,
                    name=f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.email
                )
                
                # Crear registro de suscripción
                subscription = Subscription(
                    user_id=user.id,
                    stripe_customer_id=customer.id,
                    status='inactive'
                )
                db.session.add(subscription)
                db.session.commit()
            
            # Redirigir al usuario al link de pago de Stripe
            return jsonify({
                'success': True, 
                'redirect': 'https://buy.stripe.com/8wM14lh1j3Jo7L23cI'
            })
            
        except Exception as e:
            print(f"Error al crear suscripción: {str(e)}")
            return jsonify({'success': False, 'message': 'Error al procesar la solicitud'}), 500

    # Ruta para el portal de clientes de Stripe
    @app.route('/api/subscription/portal', methods=['GET'])
    @jwt_required()
    def customer_portal():
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        # Redirigir al portal de clientes de Stripe
        return jsonify({
            'success': True,
            'redirect': 'https://billing.stripe.com/p/login/bIYg2u2eNbOl7mgdQQ'
        })

    # Webhook para recibir eventos de Stripe
    @app.route('/api/webhook/stripe', methods=['POST'])
    def stripe_webhook():
        try:
            payload     = request.data
            sig_header  = request.headers.get('Stripe-Signature')
            event       = None

            # Verificar la firma
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, stripe_webhook_secret
                )
            except ValueError as e:
                # Payload inválido
                app.logger.error(f"Payload inválido: {str(e)}")
                return jsonify({'error': 'Payload inválido'}), 400
            except stripe.error.SignatureVerificationError as e:
                # Firma inválida
                app.logger.error(f"Firma inválida: {str(e)}")
                return jsonify({'error': 'Firma inválida'}), 400
            
            # Procesar el evento
            event_type = event['type']
            app.logger.info(f"Evento Stripe recibido: {event_type}")
            
            if event_type == 'customer.subscription.created' or event_type == 'customer.subscription.updated':
                subscription_object = event['data']['object']
                customer_id = subscription_object['customer']
                subscription_id = subscription_object['id']
                status = subscription_object['status']
                
                # Buscar el usuario por customer_id
                subscription = Subscription.query.filter_by(stripe_customer_id=customer_id).first()
                
                if subscription:
                    # Actualizar el estado de la suscripción
                    if status == 'active':
                        subscription.status = 'active'
                        
                        # Actualizar también el campo subscription_active del usuario
                        user = db.session.get(User, subscription.user_id)
                        if user:
                            user.subscription_active = True
                            app.logger.info(f"Usuario {user.email} (ID: {user.id}) marcado como suscripción activa")
                    else:
                        subscription.status = 'inactive'
                        
                        # Actualizar también el campo subscription_active del usuario
                        user = db.session.get(User, subscription.user_id)
                        if user:
                            user.subscription_active = False
                            app.logger.info(f"Usuario {user.email} (ID: {user.id}) marcado como suscripción inactiva")
                    
                    subscription.stripe_subscription_id = subscription_id
                    subscription.updated_at = datetime.now(timezone.utc)
                    db.session.commit()
                    app.logger.info(f"Estado de suscripción actualizado a {status} para customer_id: {customer_id}")
            
            elif event_type == 'customer.subscription.deleted':
                subscription_object = event['data']['object']
                customer_id = subscription_object['customer']
                
                # Buscar el usuario por customer_id
                subscription = Subscription.query.filter_by(stripe_customer_id=customer_id).first()
                
                if subscription:
                    # Marcar la suscripción como cancelada
                    subscription.status = 'canceled'
                    
                    # Actualizar también el campo subscription_active del usuario
                    user = db.session.get(User, subscription.user_id)
                    if user:
                        user.subscription_active = False
                        app.logger.info(f"Usuario {user.email} (ID: {user.id}) marcado como suscripción cancelada")
                    
                    subscription.updated_at = datetime.now(timezone.utc)
                    db.session.commit()
                    app.logger.info(f"Suscripción cancelada para customer_id: {customer_id}")
            
            # Siempre devolver éxito
            return jsonify({'success': True}), 200
        
        except Exception as e:
            app.logger.error(f"Error al procesar webhook: {str(e)}")
            # Devolver 200 para que Stripe no reintente
            return jsonify({'error': str(e)}), 200

    # Webhook alternativo para Stripe
    @app.route('/api/webhook/stripe/accept', methods=['POST'])
    def stripe_webhook_accept():
        try:
            # Obtener el payload y la firma
            payload = request.data
            sig_header = request.headers.get('Stripe-Signature')
            
            # Verificar la firma
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, stripe_webhook_secret
                )
            except ValueError as e:
                # Payload inválido
                app.logger.error(f"Payload inválido: {str(e)}")
                return jsonify({'error': 'Payload inválido'}), 400
            except stripe.error.SignatureVerificationError as e:
                # Firma inválida
                app.logger.error(f"Firma inválida: {str(e)}")
                return jsonify({'error': 'Firma inválida'}), 400
            
            # Procesar el evento
            event_type = event['type']
            app.logger.info(f"Evento Stripe recibido: {event_type}")
            
            if event_type == 'checkout.session.completed':
                session = event['data']['object']
                customer_id = session.get('customer')
                subscription_id = session.get('subscription')
                
                if customer_id and subscription_id:
                    # Buscar el usuario por customer_id
                    subscription = Subscription.query.filter_by(stripe_customer_id=customer_id).first()
                    
                    if subscription:
                        # Actualizar la suscripción existente
                        subscription.stripe_subscription_id = subscription_id
                        subscription.status = 'active'
                        subscription.updated_at = datetime.now(timezone.utc)
                        
                        # Actualizar también el campo subscription_active del usuario
                        user = db.session.get(User, subscription.user_id)
                        if user:
                            user.subscription_active = True
                            app.logger.info(f"Usuario {user.email} (ID: {user.id}) marcado como suscripción activa")
                        
                        db.session.commit()
                        app.logger.info(f"Suscripción actualizada para customer_id: {customer_id}")
                    else:
                        # Buscar el usuario por email
                        customer = stripe.Customer.retrieve(customer_id)
                        email = customer.get('email')
                        
                        if email:
                            user = User.query.filter_by(email=email).first()
                            
                            if user:
                                # Crear una nueva suscripción
                                subscription = Subscription(
                                    user_id=user.id,
                                    stripe_customer_id=customer_id,
                                    stripe_subscription_id=subscription_id,
                                    status='active',
                                    created_at=datetime.now(timezone.utc),
                                    updated_at=datetime.now(timezone.utc)
                                )
                                
                                # Actualizar el campo subscription_active del usuario
                                user.subscription_active = True
                                app.logger.info(f"Usuario {user.email} (ID: {user.id}) marcado como suscripción activa")
                                
                                db.session.add(subscription)
                                db.session.commit()
                                app.logger.info(f"Nueva suscripción creada para customer_id: {customer_id}")
                                
                                # Enviar correo de notificación
                                try:
                                    subject = "Nueva suscripción activada en Doctorfy"
                                    body = f"""
                                    <html>
                                    <head>
                                        <style>
                                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                                            h1 {{ color: #7c4dff; }}
                                            .info {{ background-color: #f9f9f9; padding: 15px; border-radius: 5px; }}
                                            .footer {{ margin-top: 20px; font-size: 12px; color: #777; }}
                                            .button {{ display: inline-block; background-color: #7c4dff; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-top: 15px; }}
                                        </style>
                                    </head>
                                    <body>
                                        <div class="container">
                                            <h1>Nueva suscripción activada</h1>
                                            <p>Un usuario ha activado su suscripción a través de Stripe:</p>
                                            
                                            <div class="info">
                                                <p><strong>Email:</strong> {user.email}</p>
                                                <p><strong>ID:</strong> {user.id}</p>
                                                <p><strong>Tipo:</strong> {"Médico" if user.is_doctor else "Paciente"}</p>
                                                <p><strong>Fecha:</strong> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}</p>
                                                <p><strong>Customer ID de Stripe:</strong> {customer_id}</p>
                                            </div>
                                            
                                            <p>Si necesitas verificar o modificar esta suscripción, puedes hacerlo desde el panel de administración:</p>
                                            
                                            <a href="https://doctorfy.onrender.com/admin/users" class="button">Ir al Panel de Administración</a>
                                            
                                            <div class="footer">
                                                <p>Este es un mensaje automático del sistema Doctorfy.</p>
                                            </div>
                                        </div>
                                    </body>
                                    </html>
                                    """
                                    
                                    send_email(subject, body, to_email="info@marketeapy.com", html=True)
                                    app.logger.info(f"Correo de notificación enviado para la nueva suscripción")
                                except Exception as e:
                                    app.logger.error(f"Error al enviar correo de notificación: {str(e)}")
            
            elif event_type == 'customer.subscription.updated':
                subscription_object = event['data']['object']
                customer_id = subscription_object.get('customer')
                status = subscription_object.get('status')
                
                if customer_id and status:
                    subscription = Subscription.query.filter_by(stripe_customer_id=customer_id).first()
                    
                    if subscription:
                        subscription.status = status
                        
                        # Actualizar también el campo subscription_active del usuario
                        user = db.session.get(User, subscription.user_id)
                        if user:
                            if status == 'active':
                                user.subscription_active = True
                                app.logger.info(f"Usuario {user.email} (ID: {user.id}) marcado como suscripción activa")
                            else:
                                user.subscription_active = False
                                app.logger.info(f"Usuario {user.email} (ID: {user.id}) marcado como suscripción inactiva")
                        
                        subscription.updated_at = datetime.now(timezone.utc)
                        db.session.commit()
                        app.logger.info(f"Estado de suscripción actualizado a {status} para customer_id: {customer_id}")
            
            elif event_type == 'customer.subscription.deleted':
                subscription_object = event['data']['object']
                customer_id = subscription_object.get('customer')
                
                if customer_id:
                    subscription = Subscription.query.filter_by(stripe_customer_id=customer_id).first()
                    
                    if subscription:
                        subscription.status = 'canceled'
                        
                        # Actualizar también el campo subscription_active del usuario
                        user = db.session.get(User, subscription.user_id)
                        if user:
                            user.subscription_active = False
                            app.logger.info(f"Usuario {user.email} (ID: {user.id}) marcado como suscripción cancelada")
                        
                        subscription.updated_at = datetime.now(timezone.utc)
                        db.session.commit()
                        app.logger.info(f"Suscripción cancelada para customer_id: {customer_id}")
            
            # Siempre devolver éxito
            return jsonify({'success': True}), 200
        
        except Exception as e:
            app.logger.error(f"Error al procesar webhook: {str(e)}")
            # Devolver 200 para que Stripe no reintente
            return jsonify({'error': str(e)}), 200

    @app.route('/api/debug/trial-status', methods=['GET'])
    @jwt_required()
    def debug_trial_status():
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        now_naive = datetime.utcnow()                    # ← sin tz
        
        return jsonify({
            'user_id': user.id,
            'email': user.email,
            'trial_start': user.trial_start.isoformat() if user.trial_start else None,
            'trial_end': user.trial_end.isoformat() if user.trial_end else None,
            'trial_used': user.trial_used,
            'current_time': now_naive.isoformat(),
            'is_in_trial_period': user.is_in_trial_period(),
            'subscription_active': user.subscription_active,
            'has_active_access': user.has_active_access()
        }), 200

    @app.route('/api/debug/force-trial/<int:user_id>', methods=['POST'])
    @jwt_required()
    def force_trial_access(user_id):
        current_user_id = get_jwt_identity()
        admin_user = db.session.get(User, current_user_id)
        
        # Solo permitir a alemart87@gmail.com
        if not admin_user or admin_user.email != 'alemart87@gmail.com':
            return jsonify({'error': 'No autorizado'}), 403
        
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Configurar período de prueba de 2 días desde ahora
        now_naive = datetime.utcnow()                    # ← sin tz
        user.trial_start = now_naive
        user.trial_end = now_naive + timedelta(days=2)
        user.trial_used = False
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Período de prueba forzado para usuario {user.email}',
            'trial_start': user.trial_start.isoformat(),
            'trial_end': user.trial_end.isoformat(),
            'trial_used': user.trial_used
        }), 200

    @app.route('/api/debug/subscription-check', methods=['GET'])
    @jwt_required()
    def debug_subscription_check():
        """Endpoint para depurar la verificación de suscripción"""
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar período de prueba
        now_naive = datetime.utcnow()                    # ← sin tz
        in_trial = False
        trial_remaining = None
        
        if user.trial_start and user.trial_end and not user.trial_used:
            start = user.trial_start.replace(tzinfo=None)
            end   = user.trial_end.replace(tzinfo=None)
            if start <= now_naive <= end:
                in_trial = True
                delta = end - now_naive
                trial_remaining = int(delta.total_seconds() / 3600)
        
        # Verificar suscripción
        subscription = Subscription.query.filter_by(user_id=user.id).first()
        has_subscription = subscription and subscription.status == 'active'
        
        # Verificar acceso
        has_access = user.email == 'alemart87@gmail.com' or has_subscription or in_trial
        
        # Información detallada para depuración
        return jsonify({
            'user_id': user.id,
            'email': user.email,
            'is_admin': user.email == 'alemart87@gmail.com',
            'subscription_active_field': user.subscription_active,
            'has_subscription': has_subscription,
            'subscription_details': {
                'exists': subscription is not None,
                'status': subscription.status if subscription else None,
                'customer_id': subscription.stripe_customer_id if subscription else None
            } if subscription else None,
            'trial_details': {
                'trial_start': user.trial_start.isoformat() if user.trial_start else None,
                'trial_end': user.trial_end.isoformat() if user.trial_end else None,
                'trial_used': user.trial_used,
                'current_time': now_naive.isoformat(),
                'in_trial': in_trial,
                'trial_remaining_hours': trial_remaining
            },
            'has_access': has_access,
            'is_in_trial_period_method': user.is_in_trial_period(),
            'has_active_access_method': user.has_active_access()
        }), 200

    # === SITEMAP.XML =================================================
    @app.route('/sitemap.xml', methods=['GET'])
    def sitemap():
        """Devuelve sitemap conforme al protocolo XML de sitemaps.org"""
        static_urls = [
            ('landing',        '/'),                   # página principal
            ('login',          '/login'),
            ('register',       '/register'),
            ('forgot',         '/forgot-password'),
            ('docs',           '/guide'),
            ('directory',      '/doctors'),
            ('nutrition',      '/nutrition'),
            ('pricing',        '/subscription'),
        ]

        urlset = Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
        today  = date.today().isoformat()

        # 1️⃣  URLs estáticas
        for name, path in static_urls:
            url = SubElement(urlset, 'url')
            loc = SubElement(url, 'loc');  loc.text = request.url_root.rstrip('/') + path
            lastmod = SubElement(url, 'lastmod'); lastmod.text = today
            change = SubElement(url, 'changefreq'); change.text = 'monthly'
            prio   = SubElement(url, 'priority');   prio.text = '0.8'

        # 2️⃣  URLs dinámicas (ej: perfiles de doctor)
        #    – Sólo añadimos los primeros 200 por simplicidad
        for doc in User.query.filter_by(is_doctor=True).limit(200):
            url = SubElement(urlset, 'url')
            loc = SubElement(url, 'loc')
            loc.text = f"{request.url_root.rstrip('/')}/doctors/{doc.id}"
            lastmod = SubElement(url, 'lastmod'); lastmod.text = today
            change = SubElement(url, 'changefreq'); change.text = 'weekly'
            prio   = SubElement(url, 'priority');   prio.text = '0.6'

        xml = tostring(urlset, encoding='utf-8', method='xml')
        return Response(xml, mimetype='application/xml')

    # === ROBOTS.TXT ==================================================
    @app.route('/robots.txt')
    def robots():
        lines = [
            "User-agent: *",
            "Disallow:",
            f"Sitemap: {request.url_root.rstrip('/')}/sitemap.xml"
        ]
        return Response("\n".join(lines), mimetype='text/plain')

    # ──────────────────────────────────────────────────────────────
    #  SERVIR ARCHIVOS SUBIDOS  (fotos de perfil, estudios, etc.)
    #  Ej.:  /uploads/profile_pics/1234.jpg
    # ──────────────────────────────────────────────────────────────
    @app.route('/uploads/<path:filename>')
    def uploaded_files(filename):
        """Devuelve cualquier archivo dentro de la carpeta uploads/"""
        uploads_dir = os.path.join(app.root_path, 'uploads')
        return send_from_directory(uploads_dir, filename, as_attachment=False)

    # ──  IGNORAR JWT SÓLO EN PRE‑FLIGHT (OPTIONS) ────────────────
    @app.before_request
    def skip_jwt_on_options():
        if request.method == "OPTIONS":
            # simplemente devolvemos 200; CORS se maneja por Flask‑CORS
            return Response(status=200)
        # el resto de métodos continúan normalmente;
        # la verificación se hará únicamente en las rutas con @jwt_required

    return app

# Configurar logging
logger = setup_logging()

app = create_app()

if __name__ == '__main__':
    app.run(debug=True) 