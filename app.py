from flask import Flask, send_from_directory, jsonify, request, render_template, redirect, Response, abort
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
from routes.credits import credits_bp
from routes.payments import payments_bp
from routes.notifications import notifications_bp
from routes.calories import calories_bp
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
from sqlalchemy import func
import logging

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

# Al inicio del archivo, después de las importaciones
logger = logging.getLogger('doctorfy')

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
             r"/api/webhook/stripe/accept": {"origins": "*"}
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
    app.register_blueprint(credits_bp)
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(calories_bp, url_prefix='/api/calories')

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

    # --- Ruta para Subir Foto de Perfil ---
    @app.route('/api/profile/upload-profile-picture', methods=['POST'])
    @jwt_required()
    def upload_profile_picture():
        user_id = get_jwt_identity()
        # --- IMPORTANTE: Asegúrate que User y db estén disponibles aquí ---
        # from models import User, db # Podrías necesitar importar aquí si no están globales
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        if 'file' not in request.files:
            return jsonify({"error": "No se encontró el archivo"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No se seleccionó ningún archivo"}), 400

        if file:
            # --- IMPORTANTE: Asegúrate que secure_filename esté importado ---
            # from werkzeug.utils import secure_filename
            filename = secure_filename(f"user_{user_id}_{os.path.splitext(file.filename)[1]}") # Nombre único con extensión original
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            try:
                file.save(save_path)
                print(f"Archivo guardado en: {save_path}") # Log para confirmar la ruta

                # Actualizar base de datos
                user.profile_picture = filename
                db.session.commit()

                return jsonify({
                    "message": "Foto de perfil actualizada con éxito",
                    "profile_picture": filename
                }), 200
            except Exception as e:
                db.session.rollback()
                print(f"Error al guardar archivo o actualizar DB: {e}")
                return jsonify({"error": "Error interno al guardar la foto"}), 500
        else:
            # Esta condición 'else' probablemente nunca se alcance si file.filename != ''
            return jsonify({"error": "Archivo inválido"}), 400


    # --- Ruta para Servir Archivos de la Carpeta de Subidas ---
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        print(f"Intentando servir archivo: {filename} desde {app.config['UPLOAD_FOLDER']}") # Log para depurar
        try:
            # --- SERVIR DESDE LA RUTA CORRECTA ---
            # --- IMPORTANTE: Asegúrate que send_from_directory esté importado ---
            # from flask import send_from_directory
            return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        except FileNotFoundError:
            print(f"Archivo no encontrado: {filename} en {app.config['UPLOAD_FOLDER']}")
            # Considera devolver una imagen por defecto o un 404
            # return send_from_directory('static', 'default_avatar.png'), 404 # Si tienes una carpeta static
            abort(404)

    return app

# Configurar logging
logger = setup_logging()

app = create_app()

if __name__ == '__main__':
    app.run(debug=True) 

def send_welcome_email(user):
    subject = "¡Bienvenido a Doctorfy!"
    body = f"""
    <html>
    <body>
        <h1>¡Bienvenido a Doctorfy!</h1>
        <p>Hola {user.first_name or user.email},</p>
        <p>¡Gracias por registrarte! Te hemos otorgado <strong>15 créditos</strong> para que pruebes nuestro sistema:</p>
        <ul>
            <li>Análisis Médico: 5 créditos por análisis</li>
            <li>Análisis Nutricional: 1 crédito por análisis</li>
        </ul>
        <p>Puedes ver tu balance de créditos en cualquier momento en la barra superior de la aplicación.</p>
        <p><a href="https://doctorfy.onrender.com/credits-info">Más información sobre los créditos</a></p>
    </body>
    </html>
    """
    
    send_email(subject, body, to_email=user.email, html=True) 

def init_admin_credits():
    with app.app_context():
        admin = User.query.filter_by(email='alemart87@gmail.com').first()
        if admin and admin.credits < 10000000:
            admin.credits = 10000000
            db.session.commit() 