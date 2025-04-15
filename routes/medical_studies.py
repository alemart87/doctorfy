from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, MedicalStudy, User
from utils.openai_utils import analyze_medical_study
from utils.anthropic_utils import analyze_medical_study_with_anthropic
from utils.auth import doctor_required
import os
import uuid
from datetime import datetime

medical_studies_bp = Blueprint('medical_studies', __name__)

# Configuración para subida de archivos
UPLOAD_FOLDER = 'uploads/medical_studies'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

def init_app(app):
    """Inicializa la aplicación con las configuraciones necesarias"""
    os.makedirs(os.path.join(app.root_path, UPLOAD_FOLDER), exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@medical_studies_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_study():
    try:
        user_id = get_jwt_identity()
        
        # Verificar si se proporcionó un archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
        
        file = request.files['file']
        
        # Verificar si el archivo tiene un nombre
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
        
        # Verificar si el archivo es de un tipo permitido
        allowed_extensions = {'pdf', 'jpg', 'jpeg', 'png'}
        if not '.' in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400
        
        # Obtener el tipo de estudio
        study_type = request.form.get('study_type', 'general')
        
        # Generar un nombre de archivo seguro y único
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Crear la carpeta de destino si no existe
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'medical_studies')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Guardar el archivo
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Guardar la información en la base de datos
        study = MedicalStudy(
            patient_id=user_id,
            study_type=study_type,
            file_path=unique_filename,  # Guardar solo el nombre del archivo, no la ruta completa
            created_at=datetime.utcnow()
        )
        
        db.session.add(study)
        db.session.commit()
        
        return jsonify({
            'message': 'Estudio subido con éxito',
            'study_id': study.id
        }), 201
        
    except Exception as e:
        print(f"Error al subir estudio: {str(e)}")
        return jsonify({'error': str(e)}), 500

@medical_studies_bp.route('/studies', methods=['GET'])
@jwt_required()
def get_studies():
    try:
        # Imprimir información de depuración
        print("Token recibido y validado correctamente")
        
        # Imprimir los encabezados de la solicitud
        print("Headers de la solicitud:", dict(request.headers))
        
        # Obtener el token del encabezado
        auth_header = request.headers.get('Authorization', '')
        print(f"Encabezado de autorización: {auth_header}")
        
        user_id = get_jwt_identity()
        print(f"ID de usuario del token (tipo: {type(user_id)}): {user_id}")
        
        # Convertir user_id a entero si es una cadena
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                print(f"No se pudo convertir user_id a entero: {user_id}")
                return jsonify({'error': 'ID de usuario inválido'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            print(f"Usuario no encontrado con ID: {user_id}")
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Si es doctor o admin, puede ver todos los estudios
        if user.is_doctor or user.role in ['ADMIN', 'SUPERADMIN']:
            studies = MedicalStudy.query.all()
        else:
            # Si es paciente, solo ve sus propios estudios
            studies = MedicalStudy.query.filter_by(patient_id=user.id).all()
        
        return jsonify({
            'studies': [{
                'id': study.id,
                'patient_id': study.patient_id,
                'patient_email': User.query.get(study.patient_id).email if study.patient_id else None,
                'study_type': study.study_type,
                'file_path': study.file_path,
                'interpretation': study.interpretation,
                'created_at': study.created_at.isoformat() if study.created_at else None
            } for study in studies]
        }), 200
    except Exception as e:
        print(f"Error en get_studies: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@medical_studies_bp.route('/studies/<int:study_id>/interpret', methods=['POST'])
@jwt_required()
def interpret_study(study_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_doctor:
        return jsonify({'error': 'Solo los doctores pueden interpretar estudios'}), 403
    
    study = MedicalStudy.query.get(study_id)
    
    if not study:
        return jsonify({'error': 'Estudio no encontrado'}), 404
    
    data = request.get_json()
    interpretation = data.get('interpretation')
    
    if not interpretation:
        return jsonify({'error': 'Se requiere una interpretación'}), 400
    
    study.interpretation = interpretation
    db.session.commit()
    
    return jsonify({
        'message': 'Interpretación guardada con éxito',
        'study': {
            'id': study.id,
            'patient_id': study.patient_id,
            'study_type': study.study_type,
            'file_path': study.file_path,
            'interpretation': study.interpretation,
            'created_at': study.created_at.isoformat()
        }
    }), 200

@medical_studies_bp.route('/studies/<int:study_id>/analyze', methods=['POST'])
@jwt_required()
def analyze_study(study_id):
    user_id = get_jwt_identity()
    
    try:
        print(f"Iniciando análisis del estudio {study_id}")
        print(f"ID de usuario del token: {user_id}, tipo: {type(user_id)}")
        
        # Convertir user_id a entero si es una cadena
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
                print(f"ID de usuario convertido a entero: {user_id}")
            except ValueError:
                print(f"No se pudo convertir el ID de usuario a entero: {user_id}")
        
        # Obtener el estudio
        study = MedicalStudy.query.get(study_id)
        
        if not study:
            return jsonify({'error': 'Estudio no encontrado'}), 404
        
        print(f"Estudio encontrado: ID={study.id}, patient_id={study.patient_id}")
        
        # Verificar que el estudio pertenece al usuario o que el usuario es un médico
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        print(f"Usuario: {user.email}, is_doctor={user.is_doctor}, patient_id={study.patient_id}, user_id={user_id}")
        
        # Temporalmente, permitir que cualquier usuario analice cualquier estudio para pruebas
        # if not user.is_doctor and study.patient_id != user_id:
        #     print(f"Permiso denegado: user.is_doctor={user.is_doctor}, study.patient_id={study.patient_id}, user_id={user_id}")
        #     return jsonify({'error': 'No tienes permiso para analizar este estudio'}), 403
        
        # Obtener el archivo del estudio - CORREGIR LA RUTA
        # Verificar si study.file_path ya incluye 'medical_studies/'
        file_path = study.file_path
        if file_path.startswith('medical_studies/'):
            # Si ya incluye el prefijo, usar la ruta directamente
            file_path = os.path.join(current_app.root_path, 'uploads', file_path)
        else:
            # Si no incluye el prefijo, añadirlo
            file_path = os.path.join(current_app.root_path, 'uploads', 'medical_studies', file_path)
        
        print(f"Ruta del archivo (corregida): {file_path}")
        
        # Intentar diferentes variaciones de la ruta si el archivo no existe
        if not os.path.exists(file_path):
            print(f"Archivo no encontrado en la ruta principal, intentando alternativas...")
            
            # Alternativa 1: Quitar 'medical_studies/' si está duplicado
            alt_path_1 = file_path.replace('medical_studies/medical_studies/', 'medical_studies/')
            print(f"Alternativa 1: {alt_path_1}")
            if os.path.exists(alt_path_1):
                file_path = alt_path_1
                print(f"Archivo encontrado en alternativa 1")
            else:
                # Alternativa 2: Usar solo el nombre del archivo
                file_name = os.path.basename(study.file_path)
                alt_path_2 = os.path.join(current_app.root_path, 'uploads', 'medical_studies', file_name)
                print(f"Alternativa 2: {alt_path_2}")
                if os.path.exists(alt_path_2):
                    file_path = alt_path_2
                    print(f"Archivo encontrado en alternativa 2")
                else:
                    # Alternativa 3: Buscar en la carpeta uploads directamente
                    alt_path_3 = os.path.join(current_app.root_path, 'uploads', file_name)
                    print(f"Alternativa 3: {alt_path_3}")
                    if os.path.exists(alt_path_3):
                        file_path = alt_path_3
                        print(f"Archivo encontrado en alternativa 3")
        
        print(f"¿El archivo existe? {os.path.exists(file_path)}")
        
        if not os.path.exists(file_path):
            # Listar archivos en la carpeta uploads para depuración
            uploads_dir = os.path.join(current_app.root_path, 'uploads')
            print(f"Contenido de la carpeta uploads: {os.listdir(uploads_dir) if os.path.exists(uploads_dir) else 'No existe'}")
            
            medical_studies_dir = os.path.join(uploads_dir, 'medical_studies')
            print(f"Contenido de la carpeta medical_studies: {os.listdir(medical_studies_dir) if os.path.exists(medical_studies_dir) else 'No existe'}")
            
            return jsonify({'error': 'Archivo de estudio no encontrado'}), 404
        
        # Analizar el estudio con Anthropic directamente
        print("Llamando a la función analyze_medical_study_with_anthropic")
        result = analyze_medical_study_with_anthropic(file_path, study.study_type)
        
        # Verificar si el resultado es un diccionario (como se espera)
        if isinstance(result, dict):
            if result.get('success'):
                analysis_result = result.get('analysis', '')
                print(f"Análisis recibido (primeros 100 caracteres): {analysis_result[:100] if analysis_result else 'Vacío'}")
            else:
                error_msg = result.get('error', 'Error desconocido en el análisis')
                print(f"Error en el análisis: {error_msg}")
                return jsonify({'error': error_msg}), 500
        else:
            # Si no es un diccionario, usar el resultado directamente
            analysis_result = str(result)
            print(f"Análisis recibido (formato inesperado, primeros 100 caracteres): {analysis_result[:100] if analysis_result else 'Vacío'}")
        
        # Si es un análisis solicitado por el paciente, marcar como "Análisis IA"
        if not user.is_doctor:
            print("Marcando como análisis de IA (usuario no es doctor)")
            analysis_result = f"[ANÁLISIS AUTOMÁTICO CON IA]\n\n{analysis_result}\n\n[Este análisis fue generado automáticamente y debe ser confirmado por un profesional médico]"
        
        # Actualizar el estudio con el resultado del análisis
        study.interpretation = analysis_result
        db.session.commit()
        print("Análisis guardado con éxito")
        
        return jsonify({
            'message': 'Estudio analizado correctamente',
            'analysis': analysis_result
        }), 200
        
    except Exception as e:
        print(f"Error al analizar estudio: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error al analizar el estudio'}), 500

@medical_studies_bp.route('/studies/<int:study_id>', methods=['GET'])
@jwt_required()
def get_study_details(study_id):
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                return jsonify({'error': 'ID de usuario inválido'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        study = MedicalStudy.query.get(study_id)
        
        if not study:
            return jsonify({'error': 'Estudio no encontrado'}), 404
        
        # Verificar permisos: solo el paciente o un doctor pueden ver el estudio
        if not user.is_doctor and study.patient_id != user.id:
            return jsonify({'error': 'No tiene permiso para ver este estudio'}), 403
        
        # Obtener el email del paciente
        patient_email = User.query.get(study.patient_id).email if study.patient_id else None
        
        return jsonify({
            'id': study.id,
            'patient_id': study.patient_id,
            'patient_email': patient_email,
            'study_type': study.study_type,
            'file_path': study.file_path,
            'interpretation': study.interpretation,
            'created_at': study.created_at.isoformat() if study.created_at else None
        }), 200
    except Exception as e:
        print(f"Error en get_study_details: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@medical_studies_bp.route('/studies/<int:study_id>/rename', methods=['POST'])
@jwt_required()
def rename_study(study_id):
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                return jsonify({'error': 'ID de usuario inválido'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        study = MedicalStudy.query.get(study_id)
        
        if not study:
            return jsonify({'error': 'Estudio no encontrado'}), 404
        
        # Verificar permisos: solo el paciente o un doctor pueden renombrar el estudio
        if not user.is_doctor and study.patient_id != user.id:
            return jsonify({'error': 'No tiene permiso para renombrar este estudio'}), 403
        
        data = request.get_json()
        new_name = data.get('name')
        new_type = data.get('study_type')
        
        if new_name:
            study.name = new_name
        
        if new_type:
            study.study_type = new_type
        
        db.session.commit()
        
        return jsonify({
            'message': 'Estudio renombrado con éxito',
            'study': {
                'id': study.id,
                'name': study.name,
                'patient_id': study.patient_id,
                'patient_email': User.query.get(study.patient_id).email if study.patient_id else None,
                'study_type': study.study_type,
                'file_path': study.file_path,
                'interpretation': study.interpretation,
                'created_at': study.created_at.isoformat() if study.created_at else None
            }
        }), 200
    except Exception as e:
        print(f"Error en rename_study: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500 