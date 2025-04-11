from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, MedicalStudy, User
from utils.openai_utils import analyze_medical_study
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
        print("Recibida solicitud para subir estudio médico")
        user_id = get_jwt_identity()
        print(f"ID de usuario: {user_id}")
        
        user = User.query.get(user_id)
        
        if not user:
            print(f"Usuario no encontrado con ID: {user_id}")
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
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
        file_path = os.path.join(current_app.root_path, 'uploads', 'medical_studies', unique_filename)
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
    try:
        print(f"Iniciando análisis del estudio {study_id}")
        
        user_id = get_jwt_identity()
        print(f"ID de usuario del token: {user_id}, tipo: {type(user_id)}")
        
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
                print(f"ID de usuario convertido a entero: {user_id}")
            except ValueError:
                print(f"No se pudo convertir el ID de usuario a entero: {user_id}")
                return jsonify({'error': 'ID de usuario inválido'}), 400
            
        user = User.query.get(user_id)
        print(f"Usuario encontrado: {user.email if user else 'No encontrado'}")
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar si el usuario es doctor o es el propietario del estudio
        study = MedicalStudy.query.get(study_id)
        print(f"Estudio encontrado: {study.id if study else 'No encontrado'}")
        
        if not study:
            return jsonify({'error': 'Estudio no encontrado'}), 404
        
        # Permitir que el paciente analice su propio estudio
        if study.patient_id != user.id and not user.is_doctor:
            print(f"Permiso denegado: patient_id={study.patient_id}, user.id={user.id}, is_doctor={user.is_doctor}")
            return jsonify({'error': 'No tiene permiso para analizar este estudio'}), 403
        
        # Obtener la ruta completa del archivo
        file_path = os.path.join(current_app.root_path, 'uploads', study.file_path)
        print(f"Ruta del archivo: {file_path}")
        print(f"¿El archivo existe? {os.path.exists(file_path)}")
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'Archivo de estudio no encontrado'}), 404
        
        # Analizar el estudio con OpenAI
        print("Llamando a la función analyze_medical_study")
        interpretation = analyze_medical_study(file_path, study.study_type)
        print(f"Interpretación recibida (primeros 100 caracteres): {interpretation[:100] if interpretation else 'Vacía'}")
        
        # Si es un análisis solicitado por el paciente, marcar como "Análisis IA"
        if not user.is_doctor:
            print("Marcando como análisis de IA (usuario no es doctor)")
            interpretation = f"[ANÁLISIS AUTOMÁTICO CON IA]\n\n{interpretation}\n\n[Este análisis fue generado automáticamente y debe ser confirmado por un profesional médico]"
        
        # Guardar la interpretación
        print("Guardando interpretación en la base de datos")
        study.interpretation = interpretation
        db.session.commit()
        print("Interpretación guardada con éxito")
        
        # Obtener el email del paciente
        patient_email = User.query.get(study.patient_id).email if study.patient_id else None
        
        return jsonify({
            'message': 'Estudio analizado con éxito',
            'study': {
                'id': study.id,
                'patient_id': study.patient_id,
                'patient_email': patient_email,
                'study_type': study.study_type,
                'file_path': study.file_path,
                'interpretation': interpretation,
                'created_at': study.created_at.isoformat() if study.created_at else None
            }
        }), 200
    except Exception as e:
        print(f"ERROR en analyze_study: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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