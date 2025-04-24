from flask import Blueprint, request, jsonify, current_app, send_file, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, MedicalStudy, User, StudyStatus
from utils.openai_utils import analyze_medical_study
from utils.anthropic_utils import analyze_medical_study_with_anthropic
from utils.auth import doctor_required
import os, uuid, mimetypes, asyncio, zipfile, tempfile, io
from datetime import datetime

medical_studies_bp = Blueprint('medical_studies', __name__)

# Configuración para subida de archivos
UPLOAD_FOLDER = 'uploads/medical_studies'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'dcm'}

def init_app(app):
    """Inicializa la aplicación con las configuraciones necesarias"""
    app.config['MEDICAL_STUDIES_FOLDER'] = os.path.join(app.config['UPLOAD_FOLDER'], 'medical_studies')
    os.makedirs(app.config['MEDICAL_STUDIES_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@medical_studies_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_study():
    """Subir un nuevo estudio médico"""
    try:
        # Obtener el ID del usuario del token
        user_id = get_jwt_identity()
        
        # Soporta lista de archivos (campo "files")
        files = request.files.getlist('files')
        
        if not files:
            return jsonify({'error': 'No se envió ningún archivo'}), 400
        
        # (opcional) limitar a 4
        if len(files) > 4:
            return jsonify({'error': 'Máximo 4 archivos por estudio'}), 400
        
        study_type = request.form.get('study_type', 'general')
        study_name = request.form.get('name', None)
        
        print(f"Archivos recibidos: {[file.filename for file in files]}, tipo: {study_type}")
        
        saved_paths = []
        for file in files:
            # Verificar si el archivo tiene un nombre
            if file.filename == '':
                print(f"No se seleccionó el archivo: {file.filename}")
                continue
            
            # Verificar si el archivo tiene una extensión permitida
            if not allowed_file(file.filename):
                print(f"Tipo de archivo no permitido: {file.filename}")
                continue
            
            # Crear un nombre de archivo seguro y único
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            
            # Guardar el archivo en el directorio de estudios médicos
            file_path = os.path.join(current_app.config['MEDICAL_STUDIES_FOLDER'], unique_filename)
            print(f"Guardando archivo en: {file_path}")
            file.save(file_path)
            
            # La ruta que se guarda en la base de datos es relativa
            db_file_path = unique_filename  # Solo el nombre del archivo
            
            saved_paths.append(db_file_path)
        
        # guardar un único registro del estudio con la lista de imágenes
        study = MedicalStudy(
            patient_id=user_id,
            study_type=study_type,
            file_path=";".join(saved_paths),   # o tabla hija, según tu modelo
            name=study_name if study_name else files[0].filename.rsplit('.', 1)[0],
            status='PENDING'  # Usar string en lugar de enum
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
                'name': study.name,
                'status': study.status,
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
                'file_paths': study.file_path.split(';'),
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
    """Analizar un estudio médico existente"""
    try:
        print(f"Iniciando análisis del estudio {study_id}")
        
        # Obtener el ID del usuario del token
        user_id = get_jwt_identity()
        print(f"ID de usuario del token: {user_id}, tipo: {type(user_id)}")
        
        # Convertir user_id a entero si es una cadena
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
                print(f"ID de usuario convertido a entero: {user_id}")
            except ValueError:
                print(f"No se pudo convertir user_id a entero: {user_id}")
        
        # Buscar el estudio en la base de datos
        study = MedicalStudy.query.get(study_id)
        
        if not study:
            print(f"Estudio no encontrado: {study_id}")
            return jsonify({'error': 'Estudio no encontrado'}), 404
            
        print(f"Estudio encontrado: ID={study.id}, patient_id={study.patient_id}")
        
        # Verificar que el usuario tenga acceso a este estudio
        user = User.query.get(user_id)
        if not user:
            print(f"Usuario no encontrado: {user_id}")
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        print(f"Usuario: {user.email}, is_doctor={user.is_doctor}, user_id={user.id}")
        
        # Los médicos pueden ver estudios de cualquier paciente, los pacientes solo los suyos
        if not user.is_doctor and study.patient_id != user.id:
            print(f"Acceso denegado: user_id={user_id}, study.patient_id={study.patient_id}")
            return jsonify({'error': 'No tienes permiso para analizar este estudio'}), 403
        
        # ---------- NUEVO  : soportar varios archivos ----------
        rel_paths = [p.strip() for p in (study.file_path or '').split(';') if p.strip()]
        abs_paths = [
            os.path.join(current_app.config['MEDICAL_STUDIES_FOLDER'], rel)
            for rel in rel_paths
        ]
        valid_paths = [p for p in abs_paths if os.path.exists(p)]

        current_app.logger.info(f"Archivos válidos: {valid_paths}")
        if not valid_paths:
            current_app.logger.warning("Ninguno de los archivos existe en disco")
            return jsonify({'error': 'Archivo(s) de estudio no encontrado(s)'}), 404

        from utils.anthropic_utils import analyze_medical_study_with_anthropic

        final_report_parts = []
        for idx, pth in enumerate(valid_paths, start=1):
            # Evitar caracteres fuera de CP‑1252 (Windows) ─ usar ASCII
            current_app.logger.info(
                f"-> Analizando archivo {idx}/{len(valid_paths)}: {pth}"
            )
            report = asyncio.run(
                analyze_medical_study_with_anthropic(
                    pth,
                    study.study_type,
                    f"Paciente ID: {study.patient_id} | Archivo {idx}"
                )
            )
            if report:
                header = f"### Informe archivo {idx}: {os.path.basename(pth)}\n"
                final_report_parts.append(header + report.strip())

        analysis = "\n\n".join(final_report_parts)
        
        # Actualizar el estudio con el análisis
        study.interpretation = analysis
        study.status = 'COMPLETED'  # Usar string en lugar de enum
        db.session.commit()
        
        return jsonify({
            'message': 'Estudio analizado con éxito',
            'analysis': analysis
        })
        
    except Exception as e:
        print(f"Error en el análisis: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f"Error al contactar al servicio de análisis: {str(e)}"}), 500

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
            'file_paths': study.file_path.split(';'),
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

@medical_studies_bp.route('/studies/<int:study_id>/download', methods=['GET'])
@jwt_required()
def download_study(study_id):
    """Descargar un estudio médico"""
    try:
        # Obtener el ID del usuario del token
        user_id = get_jwt_identity()
        
        # Convertir user_id a entero si es una cadena
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                pass
        
        # Buscar el estudio en la base de datos
        study = MedicalStudy.query.get(study_id)
        
        if not study:
            return jsonify({'error': 'Estudio no encontrado'}), 404
        
        # Verificar que el usuario tenga acceso a este estudio
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Los médicos pueden ver estudios de cualquier paciente, los pacientes solo los suyos
        if not user.is_doctor and study.patient_id != user.id:
            return jsonify({'error': 'No tienes permiso para descargar este estudio'}), 403
        
        rel_paths = [p.strip() for p in (study.file_path or '').split(';') if p.strip()]

        if not rel_paths:
            return jsonify({'error': 'Archivo de estudio no encontrado'}), 404

        # --- Un solo archivo ---
        if len(rel_paths) == 1:
            file_path = os.path.join(current_app.config['MEDICAL_STUDIES_FOLDER'], rel_paths[0])
            if not os.path.exists(file_path):
                return jsonify({'error': 'Archivo de estudio no encontrado'}), 404

            original = rel_paths[0].split('_', 1)[-1]
            return send_file(
                file_path,
                as_attachment=True,
                download_name=original,
                mimetype=mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
            )

        # --- Varios archivos → ZIP temporal ---
        tmp_fd, tmp_zip = tempfile.mkstemp(suffix='.zip')
        with zipfile.ZipFile(tmp_zip, 'w') as zf:
            for rel in rel_paths:
                abs_p = os.path.join(current_app.config['MEDICAL_STUDIES_FOLDER'], rel)
                if os.path.exists(abs_p):
                    zf.write(abs_p, arcname=rel.split('_', 1)[-1])
        os.close(tmp_fd)

        return send_file(
            tmp_zip,
            as_attachment=True,
            download_name=f'estudio_{study.id}.zip',
            mimetype='application/zip'
        )
        
    except Exception as e:
        print(f"Error al descargar estudio: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@medical_studies_bp.route('/studies/<int:study_id>/interpretation/download', methods=['GET'])
@jwt_required()
def download_interpretation(study_id):
    """Descargar la interpretación de un estudio en formato .txt"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)

        study = MedicalStudy.query.get(study_id)
        if not study:
            return jsonify({'error': 'Estudio no encontrado'}), 404

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        if not user.is_doctor and study.patient_id != user.id:
            return jsonify({'error': 'No tienes permiso'}), 403

        if not study.interpretation:
            return jsonify({'error': 'El estudio aún no tiene interpretación'}), 400

        content = study.interpretation
        filename = f"interpretacion_estudio_{study.id}.txt"
        return send_file(
            io.BytesIO(content.encode('utf-8')),
            as_attachment=True,
            download_name=filename,
            mimetype='text/plain; charset=utf-8'
        )
    except Exception as e:
        current_app.logger.error(f"Error download_interpretation: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500 