from flask import Blueprint, request, jsonify, current_app, send_file, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, MedicalStudy, User, StudyStatus
from utils.openai_utils import analyze_medical_study
from utils.anthropic_utils import analyze_medical_study_with_anthropic, extract_from_pdf, compress_image_for_anthropic, MAX_ANTHROPIC_IMAGES
from utils.auth import doctor_required
import os, uuid, mimetypes, asyncio, zipfile, tempfile, io, base64, traceback, imghdr
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
async def analyze_study(study_id):
    """Analizar un estudio médico existente, unificando todos sus archivos."""
    try:
        current_app.logger.info(f"Iniciando análisis unificado para el estudio {study_id}")
        
        user_id = get_jwt_identity()
        if isinstance(user_id, str): user_id = int(user_id)
        
        study = MedicalStudy.query.get(study_id)
        if not study:
            current_app.logger.warning(f"Estudio no encontrado: {study_id}")
            return jsonify({'error': 'Estudio no encontrado'}), 404
            
        user = User.query.get(user_id)
        if not user:
            current_app.logger.warning(f"Usuario no encontrado: {user_id} al intentar analizar estudio {study_id}")
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        if not user.is_doctor and study.patient_id != user.id:
            current_app.logger.warning(f"Acceso denegado para usuario {user_id} al estudio {study_id} del paciente {study.patient_id}")
            return jsonify({'error': 'No tienes permiso para analizar este estudio'}), 403
        
        # Verificar créditos disponibles (5 créditos por análisis)
        CREDITS_PER_ANALYSIS = 5
        if user.credits < CREDITS_PER_ANALYSIS:
            current_app.logger.warning(f"Usuario {user_id} no tiene suficientes créditos para analizar el estudio {study_id}. Disponibles: {user.credits}, Requeridos: {CREDITS_PER_ANALYSIS}")
            return jsonify({
                'error': f'No tienes suficientes créditos para realizar este análisis. Necesitas {CREDITS_PER_ANALYSIS} créditos, pero solo tienes {user.credits}.',
                'credits_required': CREDITS_PER_ANALYSIS,
                'credits_available': user.credits
            }), 402  # Payment Required
        
        rel_paths = [p.strip() for p in (study.file_path or '').split(';') if p.strip()]
        if not rel_paths:
            current_app.logger.warning(f"Estudio {study.id} no tiene archivos asociados.")
            return jsonify({'error': 'El estudio no tiene archivos para analizar.'}), 400

        all_texts_for_anthropic = []
        all_images_data_for_anthropic = [] # Lista de dicts para la API de Anthropic

        for rel_path in rel_paths:
            abs_path = os.path.join(current_app.config['MEDICAL_STUDIES_FOLDER'], rel_path)
            if not os.path.exists(abs_path):
                current_app.logger.warning(f"Archivo no encontrado en disco: {abs_path} para estudio {study.id}")
                continue

            file_extension = os.path.splitext(rel_path)[1].lower()

            if file_extension == '.pdf':
                current_app.logger.info(f"Procesando PDF: {rel_path} para estudio {study.id}")
                pdf_data = extract_from_pdf(abs_path)
                
                if pdf_data.get("text"):
                    # Limpiar el texto para eliminar caracteres problemáticos
                    cleaned_text = pdf_data["text"].replace('\x00', '')
                    all_texts_for_anthropic.append(f"--- Contenido del PDF: {os.path.basename(rel_path)} ---\n{cleaned_text}\n--- Fin del contenido de {os.path.basename(rel_path)} ---")
                    current_app.logger.info(f"Extraídos {len(cleaned_text)} caracteres de texto del PDF {rel_path}")
                else:
                    current_app.logger.warning(f"No se pudo extraer texto del PDF {rel_path}")
                
                # Procesar imágenes extraídas del PDF
                images_added = 0
                for img_base64 in pdf_data.get("images", []):
                    if len(all_images_data_for_anthropic) < MAX_ANTHROPIC_IMAGES:
                        # Determinar el tipo de imagen
                        if img_base64.startswith('iVBOR'):
                            media_type = "image/png"
                        elif img_base64.startswith('/9j/'):
                            media_type = "image/jpeg"
                        else:
                            # Intentar determinar el tipo por los primeros bytes
                            try:
                                img_bytes = base64.b64decode(img_base64)
                                img_type = imghdr.what(None, h=img_bytes[:32])
                                media_type = f"image/{img_type}" if img_type else "image/jpeg"
                            except:
                                media_type = "image/jpeg"  # Valor por defecto
                        
                        all_images_data_for_anthropic.append({
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": img_base64
                            }
                        })
                        images_added += 1
                    else:
                        current_app.logger.warning(f"Límite de {MAX_ANTHROPIC_IMAGES} imágenes para Anthropic alcanzado. Omitiendo más imágenes del PDF {rel_path}.")
                        break
                
                current_app.logger.info(f"Añadidas {images_added} imágenes del PDF {rel_path} para análisis")
            
            elif file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.webp']: # Añadir más tipos si es necesario
                if len(all_images_data_for_anthropic) < MAX_ANTHROPIC_IMAGES:
                    current_app.logger.info(f"Procesando imagen: {rel_path} para estudio {study.id}")
                    try:
                        # Comprimir imagen antes de convertir a base64
                        compressed_path = compress_image_for_anthropic(abs_path)
                        
                        with open(compressed_path, "rb") as image_file:
                            image_bytes = image_file.read()
                        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                        
                        media_type, _ = mimetypes.guess_type(compressed_path)
                        if not media_type: # Fallback
                            media_type = 'image/jpeg' if file_extension in ['.jpg', '.jpeg'] else 'image/png'
                        
                        all_images_data_for_anthropic.append({
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_base64
                            }
                        })
                        # Eliminar la imagen comprimida si es diferente de la original
                        if compressed_path != abs_path and os.path.exists(compressed_path):
                            os.remove(compressed_path)
                            current_app.logger.info(f"Archivo comprimido temporal eliminado: {compressed_path}")

                    except Exception as e:
                        current_app.logger.error(f"Error procesando imagen {rel_path}: {e}")
                else:
                    current_app.logger.warning(f"Límite de {MAX_ANTHROPIC_IMAGES} imágenes para Anthropic alcanzado. Omitiendo imagen {rel_path}.")
            else:
                current_app.logger.info(f"Omitiendo archivo con extensión no soportada para análisis directo: {rel_path}")

        # Añadir un límite de tiempo para la operación completa
        try:
            # Crear una tarea con timeout
            analysis_task = asyncio.create_task(
                perform_analysis(study, all_texts_for_anthropic, all_images_data_for_anthropic)
            )
            # Esperar la tarea con un timeout (3 minutos)
            analysis_result_text = await asyncio.wait_for(analysis_task, timeout=180)
        except asyncio.TimeoutError:
            current_app.logger.error(f"Timeout al analizar estudio {study_id}")
            study.status = StudyStatus.FAILED.value
            study.interpretation = "El análisis ha excedido el tiempo máximo permitido. Por favor, inténtalo de nuevo más tarde."
            db.session.commit()
            return jsonify({
                'error': 'El análisis ha excedido el tiempo máximo permitido.',
                'analysis_status': 'TIMEOUT'
            }), 408  # Request Timeout
        
        # Verificar si el resultado es un mensaje de error
        if analysis_result_text.startswith("Error:") or "Error del servicio" in analysis_result_text:
            current_app.logger.warning(f"Análisis fallido para estudio {study_id}: {analysis_result_text}")
            study.status = StudyStatus.FAILED.value
            study.interpretation = analysis_result_text
            db.session.commit()
            
            # Determinar el código HTTP apropiado
            http_status_code = 500  # Internal Server Error por defecto
            if "sobrecargado" in analysis_result_text:
                http_status_code = 503  # Service Unavailable
            elif "Créditos insuficientes" in analysis_result_text:
                http_status_code = 402  # Payment Required
            elif "imágenes proporcionadas no son válidas" in analysis_result_text:
                http_status_code = 400  # Bad Request
                
            return jsonify({'error': analysis_result_text, 'analysis_status': 'FAILED'}), http_status_code

        # Guardar el resultado exitoso y DESCONTAR CRÉDITOS
        study.interpretation = analysis_result_text
        study.status = StudyStatus.COMPLETED.value
        
        # IMPORTANTE: Descontar los créditos al usuario
        user.credits -= CREDITS_PER_ANALYSIS
        current_app.logger.info(f"Descontando {CREDITS_PER_ANALYSIS} créditos al usuario {user_id}. Créditos restantes: {user.credits}")
        
        db.session.commit()
        
        current_app.logger.info(f"Análisis unificado completado para estudio {study.id}. Interpretación guardada. Créditos descontados: {CREDITS_PER_ANALYSIS}")
        
        return jsonify({
            'message': 'Estudio analizado con éxito (unificado)',
            'analysis': analysis_result_text,
            'study_id': study.id,
            'status': study.status,
            'credits_used': CREDITS_PER_ANALYSIS,
            'credits_remaining': user.credits
        })
        
    except Exception as e:
        current_app.logger.error(f"Error en el endpoint /analyze (unificado) para estudio {study_id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        # Asegurarse de que el estudio se marque como fallido si hay una excepción no controlada
        try:
            study_to_fail = MedicalStudy.query.get(study_id)
            if study_to_fail and study_to_fail.status != StudyStatus.COMPLETED.value:
                study_to_fail.status = StudyStatus.FAILED.value
                study_to_fail.interpretation = f"Error interno del servidor durante el análisis: {str(e)}"
                db.session.commit()
        except Exception as db_err:
            current_app.logger.error(f"Error adicional al intentar marcar estudio {study_id} como FAILED: {db_err}")
            
        return jsonify({'error': f"Error al contactar al servicio de análisis: {str(e)}"}), 500

# Función auxiliar para realizar el análisis
async def perform_analysis(study, all_texts_for_anthropic, all_images_data_for_anthropic):
    """Función auxiliar para realizar el análisis con manejo de errores mejorado"""
    try:
        # Concatenar todos los textos
        concatenated_texts = "\n\n".join(all_texts_for_anthropic)
        
        # Obtener el nombre del estudio para mostrar en el análisis
        study_name = study.name or f"Estudio {study.id}"
        
        # Realizar el análisis con Anthropic
        analysis_result = await analyze_medical_study_with_anthropic(
            study_name=study_name,
            concatenated_texts=concatenated_texts,
            image_data_list=all_images_data_for_anthropic,
            user_info=None,  # Opcional: Podrías pasar información adicional del usuario aquí
            study_type_hint=study.study_type
        )
        
        return analysis_result
    except Exception as e:
        current_app.logger.error(f"Error en perform_analysis para estudio {study.id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return f"Error durante el análisis: {str(e)}"

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