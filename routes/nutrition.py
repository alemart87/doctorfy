from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, User, NutritionAnalysis, NutritionLog
from utils.openai_utils import analyze_food_image, extract_nutrition_data
from utils.anthropic_utils import analyze_food_image_with_anthropic
import os
import uuid
import base64
from datetime import date
from sqlalchemy import func, extract
from datetime import datetime

nutrition_bp = Blueprint('nutrition', __name__)

# Configuración para subida de archivos
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Función para crear directorios necesarios
def init_app(app):
    """Inicializa la aplicación con las configuraciones necesarias"""
    app.config['NUTRITION_IMAGES_FOLDER'] = os.path.join(app.config['UPLOAD_FOLDER'], 'nutrition')
    os.makedirs(app.config['NUTRITION_IMAGES_FOLDER'], exist_ok=True)

@nutrition_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_food():
    """Analizar una imagen de alimentos"""
    try:
        # Obtener el ID del usuario del token
        user_id = get_jwt_identity()
        current_app.logger.info(f"Solicitud de análisis de alimentos recibida del usuario {user_id}")
        
        # Verificar si se envió un archivo
        if 'file' not in request.files:
            current_app.logger.warning("No se envió ningún archivo")
            return jsonify({'error': 'No se envió ningún archivo'}), 400
        
        file = request.files['file']
        current_app.logger.info(f"Archivo recibido: {file.filename}")
        
        # Verificar si el archivo tiene un nombre
        if file.filename == '':
            current_app.logger.warning("No se seleccionó ningún archivo")
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
        
        # Verificar si el archivo tiene una extensión permitida
        if not allowed_file(file.filename):
            current_app.logger.warning(f"Tipo de archivo no permitido: {file.filename}")
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400
        
        # Crear un nombre de archivo seguro y único
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Guardar el archivo en el directorio de imágenes de nutrición
        file_path = os.path.normpath(os.path.join(current_app.config['NUTRITION_IMAGES_FOLDER'], unique_filename))
        current_app.logger.info(f"Guardando archivo en: {file_path}")
        file.save(file_path)
        
        # La ruta que se guarda en la base de datos es relativa
        db_file_path = os.path.join('nutrition', unique_filename)
        
        # Analizar la imagen con Anthropic
        current_app.logger.info("Llamando a analyze_food_image_with_anthropic")
        analysis_text = analyze_food_image_with_anthropic(file_path)
        
        if not analysis_text:
            current_app.logger.error("El análisis devolvió None")
            return jsonify({'error': 'Error al analizar la imagen'}), 500
            
        if analysis_text.startswith("Error:"):
            current_app.logger.error(f"Error en el análisis: {analysis_text}")
            return jsonify({'error': analysis_text[7:]}), 500
        
        # Crear el registro en la base de datos
        current_app.logger.info("Guardando análisis en la base de datos")
        analysis = NutritionAnalysis(
            user_id=user_id,
            file_path=db_file_path,
            analysis=analysis_text
        )
        
        db.session.add(analysis)
        db.session.commit()
        current_app.logger.info(f"Análisis guardado con ID: {analysis.id}")
        
        return jsonify({
            'message': 'Imagen analizada con éxito',
            'analysis': analysis_text,
            'image_url': f"/api/nutrition/analyses/{analysis.id}/image"
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error al analizar imagen: {str(e)}")
        import traceback
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@nutrition_bp.route('/analyses', methods=['GET'])
@jwt_required()
def get_analyses():
    """Obtener todos los análisis nutricionales del usuario"""
    try:
        user_id = get_jwt_identity()
        
        analyses = NutritionAnalysis.query.filter_by(user_id=user_id).order_by(NutritionAnalysis.created_at.desc()).all()
        
        return jsonify({
            'analyses': [{
                'id': analysis.id,
                'file_path': analysis.file_path,
                'analysis': analysis.analysis,
                'created_at': analysis.created_at.isoformat() if analysis.created_at else None
            } for analysis in analyses]
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error al obtener análisis: {str(e)}")
        return jsonify({'error': str(e)}), 500

@nutrition_bp.route('/analyses/<int:analysis_id>/image', methods=['GET'])
@jwt_required()
def get_analysis_image(analysis_id):
    """Obtener la imagen de un análisis nutricional"""
    try:
        user_id = get_jwt_identity()
        
        analysis = NutritionAnalysis.query.get(analysis_id)
        
        if not analysis:
            return jsonify({'error': 'Análisis no encontrado'}), 404
        
        # Verificar que el usuario tenga acceso a este análisis
        if analysis.user_id != user_id:
            return jsonify({'error': 'No tienes permiso para ver este análisis'}), 403
        
        # Construir la ruta completa al archivo
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], analysis.file_path)
        
        # Verificar que el archivo exista
        if not os.path.exists(file_path):
            return jsonify({'error': 'Archivo de imagen no encontrado'}), 404
        
        # Enviar el archivo como respuesta
        return send_file(file_path)
    except Exception as e:
        current_app.logger.error(f"Error al obtener imagen: {str(e)}")
        return jsonify({'error': str(e)}), 500

@nutrition_bp.route('/summary/<string:log_date_str>', methods=['GET'])
@jwt_required()
def get_daily_summary(log_date_str):
    user_id = get_jwt_identity()
    try:
        # Convertir string YYYY-MM-DD a objeto date
        log_date = datetime.strptime(log_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Usar YYYY-MM-DD'}), 400

    try:
        # Consultar y agregar datos para el usuario y la fecha
        summary = db.session.query(
            func.sum(NutritionLog.calories).label('total_calories'),
            func.sum(NutritionLog.proteins).label('total_proteins'),
            func.sum(NutritionLog.carbs).label('total_carbs'),
            func.sum(NutritionLog.fats).label('total_fats')
        ).filter(
            NutritionLog.user_id == user_id,
            NutritionLog.log_date == log_date
        ).group_by(NutritionLog.user_id).first() # group_by es necesario para sum

        user = User.query.get(user_id)
        daily_goal = user.daily_calorie_goal if user else 2000 # Obtener objetivo

        if summary:
            result = {
                'date': log_date.isoformat(),
                'calories': summary.total_calories or 0,
                'proteins': summary.total_proteins or 0.0,
                'carbs': summary.total_carbs or 0.0,
                'fats': summary.total_fats or 0.0,
                'daily_calorie_goal': daily_goal
            }
        else:
            # Si no hay entradas para ese día
            result = {
                'date': log_date.isoformat(),
                'calories': 0,
                'proteins': 0.0,
                'carbs': 0.0,
                'fats': 0.0,
                'daily_calorie_goal': daily_goal
            }
        return jsonify(result), 200

    except Exception as e:
        print(f"Error en get_daily_summary: {str(e)}")
        return jsonify({'error': 'Error al obtener el resumen diario'}), 500

@nutrition_bp.route('/summary/month/<int:year>/<int:month>', methods=['GET'])
@jwt_required()
def get_monthly_summary(year, month):
    user_id = get_jwt_identity()
    if not (1 <= month <= 12):
         return jsonify({'error': 'Mes inválido'}), 400

    try:
        # Consultar y agregar datos para el usuario y el mes/año
        summary = db.session.query(
            func.sum(NutritionLog.calories).label('total_calories'),
            func.sum(NutritionLog.proteins).label('total_proteins'),
            func.sum(NutritionLog.carbs).label('total_carbs'),
            func.sum(NutritionLog.fats).label('total_fats'),
            func.count(NutritionLog.id).label('entry_count') # Contar entradas
        ).filter(
            NutritionLog.user_id == user_id,
            extract('year', NutritionLog.log_date) == year,
            extract('month', NutritionLog.log_date) == month
        ).group_by(NutritionLog.user_id).first()

        if summary:
             # Calcular promedios si hay entradas
            avg_calories = (summary.total_calories / summary.entry_count) if summary.entry_count > 0 else 0
            result = {
                'year': year,
                'month': month,
                'total_calories': summary.total_calories or 0,
                'total_proteins': summary.total_proteins or 0.0,
                'total_carbs': summary.total_carbs or 0.0,
                'total_fats': summary.total_fats or 0.0,
                'average_daily_calories': avg_calories,
                'entry_count': summary.entry_count
            }
        else:
             result = {
                'year': year,
                'month': month,
                'total_calories': 0,
                'total_proteins': 0.0,
                'total_carbs': 0.0,
                'total_fats': 0.0,
                'average_daily_calories': 0,
                'entry_count': 0
            }
        return jsonify(result), 200

    except Exception as e:
        print(f"Error en get_monthly_summary: {str(e)}")
        return jsonify({'error': 'Error al obtener el resumen mensual'}), 500

@nutrition_bp.route('/goal', methods=['GET', 'PUT'])
@jwt_required()
def manage_calorie_goal():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if request.method == 'GET':
        return jsonify({'daily_calorie_goal': user.daily_calorie_goal}), 200

    elif request.method == 'PUT':
        data = request.get_json()
        new_goal = data.get('daily_calorie_goal')

        if new_goal is None or not isinstance(new_goal, int) or new_goal <= 0:
            return jsonify({'error': 'Objetivo calórico inválido'}), 400

        try:
            user.daily_calorie_goal = new_goal
            db.session.commit()
            return jsonify({
                'message': 'Objetivo calórico actualizado',
                'daily_calorie_goal': user.daily_calorie_goal
            }), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar objetivo: {str(e)}")
            return jsonify({'error': 'Error al actualizar el objetivo'}), 500 