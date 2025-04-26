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
    
    # --- ESTABLECER RUTAS DE UPLOAD DIRECTAMENTE AQUÍ ---
    # Asume que siempre se ejecuta donde /persistent existe y es la ruta correcta
    persistent_upload_folder = '/persistent/uploads'
    app.config['UPLOAD_FOLDER'] = persistent_upload_folder
    app.config['MEDICAL_STUDIES_FOLDER'] = os.path.join(persistent_upload_folder, 'medical_studies')
    app.config['NUTRITION_IMAGES_FOLDER'] = os.path.join(persistent_upload_folder, 'nutrition')
    print(f"***** app.config['UPLOAD_FOLDER'] FORZADO a: {app.config['UPLOAD_FOLDER']} *****", flush=True) # LOG 2 (Modificado)

    # --- Crear directorios necesarios usando las rutas de config ---
    # (Es mejor hacerlo después de configurar app.config)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True) # Asegura que /persistent/uploads exista
    os.makedirs(app.config['MEDICAL_STUDIES_FOLDER'], exist_ok=True)
    os.makedirs(app.config['NUTRITION_IMAGES_FOLDER'], exist_ok=True)
    # Nota: profile_pics se crea dentro de la ruta de subida
    # --- FIN DE LA CONFIGURACIÓN DIRECTA ---

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, 
         resources={
             r"/api/*": {"origins": allowed_origins},
             r"/uploads/*": {"origins": allowed_origins},
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
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        if 'file' not in request.files:
            return jsonify({"error": "No se encontró el archivo"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No se seleccionó ningún archivo"}), 400

        if file:
            # --- MEJOR MANEJO DEL NOMBRE DE ARCHIVO ---
            name, ext = os.path.splitext(file.filename)
            filename = secure_filename(f"user_{user_id}_{name}{ext}")

            # --- CONSTRUIR Y VERIFICAR RUTAS ---
            save_dir = app.config['UPLOAD_FOLDER']  # Debe ser /persistent/uploads
            profile_pics_dir = os.path.join(save_dir, 'profile_pics')
            os.makedirs(profile_pics_dir, exist_ok=True)

            # --- RUTA COMPLETA PARA GUARDAR ---
            save_path = os.path.join(profile_pics_dir, filename)
            print(f"💾 Intentando guardar archivo en: {save_path}", flush=True)

            try:
                # Guardar el archivo
                file.save(save_path)

                # Verificación inmediata
                if os.path.exists(save_path):
                    print(f"✅ ÉXITO: Archivo guardado en {save_path}", flush=True)
                    # Actualizar DB solo si el archivo existe
                    db_path = os.path.join('profile_pics', filename).replace('\\', '/')
                    user.profile_picture = db_path
                    db.session.commit()
                    print(f"✅ DB actualizada con ruta: {db_path}", flush=True)

                    return jsonify({
                        "message": "Foto de perfil actualizada con éxito",
                        "profile_picture": db_path
                    }), 200
                else:
                    print(f"❌ ERROR: Archivo no encontrado después de guardar en {save_path}", flush=True)
                    return jsonify({"error": "Error al guardar el archivo"}), 500

            except Exception as e:
                db.session.rollback()
                print(f"❌ ERROR al guardar archivo: {str(e)}", flush=True)
                import traceback
                traceback.print_exc()
                return jsonify({"error": "Error interno al guardar la foto"}), 500

        return jsonify({"error": "Archivo inválido"}), 400

    # --- Ruta para Servir Archivos de la Carpeta de Subidas ---
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        # --- LOG AL INICIO DE LA RUTA ---
        print(f"***** RUTA /uploads/ LLAMADA con filename: {filename} *****", flush=True) # <-- NUEVO LOG INICIAL

        directory = app.config['UPLOAD_FOLDER']
        full_path = os.path.join(directory, filename)
        print(f"***** Intentando servir archivo: {filename} *****", flush=True) # LOG 7
        print(f"***** Buscando en directorio: {directory} *****", flush=True) # LOG 8
        print(f"***** Ruta absoluta calculada: {full_path} *****", flush=True) # LOG 9
        exists = os.path.exists(full_path)
        print(f"***** ¿Existe el archivo en la ruta absoluta?: {exists} *****", flush=True) # LOG 10
        if not exists:
             try:
                 print(f"***** Contenido de {directory}: {os.listdir(directory)} *****", flush=True)
                 if '/' in filename:
                     subdir = os.path.join(directory, os.path.dirname(filename))
                     if os.path.exists(subdir):
                          print(f"***** Contenido de {subdir}: {os.listdir(subdir)} *****", flush=True)
             except Exception as e:
                 print(f"***** Error al listar directorio: {e} *****", flush=True)
             abort(404)
        try:
            # Intenta servir directamente sin chequeos extra por ahora
            return send_from_directory(directory, filename)
        except Exception as e: # Captura cualquier error al servir
            print(f"***** ERROR DENTRO de send_from_directory: {e} *****", flush=True)
            import traceback
            traceback.print_exc()
            abort(500) # Devuelve 500 si send_from_directory falla

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