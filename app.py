from flask import Flask, send_from_directory, jsonify, request, render_template, redirect
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from config import Config
from flask_cors import CORS
from models import db, MedicalStudy, User
from routes.auth import auth_bp
from routes.medical_studies import medical_studies_bp
from routes.nutrition import nutrition_bp, init_app as init_nutrition
from routes.doctors import doctors_bp, init_app as init_doctors
from routes.admin import admin_bp
from routes.profile import profile_bp
from routes.doctor_profile import doctor_profile_bp
import os
from datetime import timedelta
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import uuid
from werkzeug.security import generate_password_hash

migrate = Migrate()
jwt = JWTManager()

# Cargar variables de entorno
load_dotenv()

# Verificar si debemos servir el frontend
serve_frontend = os.environ.get('SERVE_FRONTEND', 'true').lower() != 'false'

# Obtener orígenes permitidos de las variables de entorno
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000,https://doctorfy-frontend.onrender.com').split(',')

# Usar el disco persistente de Render si está disponible
UPLOAD_FOLDER = '/persistent/uploads' if os.path.exists('/persistent') else 'uploads'
MEDICAL_STUDIES_FOLDER = os.path.join(UPLOAD_FOLDER, 'medical_studies')
NUTRITION_IMAGES_FOLDER = os.path.join(UPLOAD_FOLDER, 'nutrition')

# Crear directorios si no existen
os.makedirs(MEDICAL_STUDIES_FOLDER, exist_ok=True)
os.makedirs(NUTRITION_IMAGES_FOLDER, exist_ok=True)

# Configurar la aplicación para usar estas rutas
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MEDICAL_STUDIES_FOLDER'] = MEDICAL_STUDIES_FOLDER
app.config['NUTRITION_IMAGES_FOLDER'] = NUTRITION_IMAGES_FOLDER

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
        full_path = os.path.join(app.root_path, dir_path)
        if not os.path.exists(full_path):
            os.makedirs(full_path)
            print(f"Directorio creado: {full_path}")

def create_app():
    app = Flask(__name__, static_folder='frontend/build', static_url_path='/')
    
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
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, 
         resources={r"/api/*": {"origins": allowed_origins}}, 
         supports_credentials=True, 
         expose_headers=['Authorization'],
         allow_headers=["Content-Type", "Authorization", "Accept"],
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

    # Ruta para servir archivos estáticos desde cualquier subdirectorio de uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Solo registrar las rutas del frontend si serve_frontend es True
    if serve_frontend:
        @app.route('/')
        def index():
            return render_template('index.html')
    else:
        @app.route('/')
        def api_info():
            return jsonify({
                "name": "Doctorfy API",
                "version": "1.0.0",
                "status": "running",
                "message": "El frontend se encuentra en https://doctorfy-frontend.onrender.com",
                "documentation": "https://github.com/alemart87/doctorfy",
                "endpoints": [
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/medical-studies/upload",
                    "/api/nutrition/analyze-food",
                    "/api/doctors/directory"
                ]
            })

    # Ruta directa para subir estudios médicos
    @app.route('/api/medical-studies/upload', methods=['POST'])
    @jwt_required()
    def upload_study():
        try:
            print("Recibida solicitud para subir estudio médico")
            user_id = get_jwt_identity()
            print(f"ID de usuario: {user_id}")
            
            user = User.query.get(user_id)
            
            # Si el usuario no existe, crearlo automáticamente
            if not user:
                print(f"Usuario no encontrado con ID: {user_id}. Creando usuario automáticamente.")
                user = User(
                    id=user_id,
                    email=f"user{user_id}@example.com",
                    password_hash=generate_password_hash("password123"),
                    is_doctor=False,
                    role='USER'
                )
                db.session.add(user)
                db.session.commit()
                print(f"Usuario creado automáticamente con ID: {user.id}, Email: {user.email}")
            
            # Verificar si se envió un archivo
            if 'file' not in request.files:
                print("No se envió ningún archivo")
                return jsonify({'error': 'No se envió ningún archivo'}), 400
            
            file = request.files['file']
            study_type = request.form.get('study_type', 'general')
            
            print(f"Archivo recibido: {file.filename}, tipo: {study_type}")
            
            # Verificar si el archivo tiene un nombre
            if file.filename == '':
                print("No se seleccionó ningún archivo")
                return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
            
            # Verificar si el archivo tiene una extensión permitida
            if not allowed_file(file.filename):
                print(f"Tipo de archivo no permitido: {file.filename}")
                return jsonify({'error': 'Tipo de archivo no permitido'}), 400
            
            # Crear un nombre de archivo seguro y único
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            
            # Guardar el archivo en el subdirectorio correcto
            file_path = os.path.join(app.root_path, 'uploads', 'medical_studies', unique_filename)
            print(f"Guardando archivo en: {file_path}")
            file.save(file_path)
            
            # La ruta que se guarda en la base de datos incluye el subdirectorio
            db_file_path = f"medical_studies/{unique_filename}"
            
            # Crear el registro en la base de datos
            study = MedicalStudy(
                patient_id=user_id,
                study_type=study_type,
                file_path=db_file_path
            )
            
            db.session.add(study)
            db.session.commit()
            
            print(f"Estudio médico guardado con ID: {study.id}")
            
            return jsonify({
                'message': 'Estudio médico subido con éxito',
                'study': {
                    'id': study.id,
                    'patient_id': study.patient_id,
                    'study_type': study.study_type,
                    'file_path': study.file_path,
                    'created_at': study.created_at.isoformat() if study.created_at else None
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            print(f"Error al subir estudio médico: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500

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

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True) 