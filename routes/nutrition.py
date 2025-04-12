from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, User, NutritionAnalysis, NutritionLog
from utils.openai_utils import analyze_food_image, extract_nutritional_data
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
    # Asegurarse de que el directorio de uploads existe
    os.makedirs(os.path.join(app.root_path, 'uploads', 'nutrition'), exist_ok=True)

@nutrition_bp.route('/analyze-food', methods=['POST'])
@jwt_required()
def analyze_food():
    try:
        print("=== Iniciando análisis de alimentos ===")
        
        # Asegurarse de que el directorio existe
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'nutrition')
        os.makedirs(upload_dir, exist_ok=True)
        print(f"Directorio de uploads asegurado: {upload_dir}")
        
        user_id = get_jwt_identity()
        print(f"ID de usuario: {user_id}")
        
        user = User.query.get(user_id)
        print(f"Usuario encontrado: {user.email if user else 'No encontrado'}")
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar archivo
        print("Verificando archivo en la solicitud...")
        if 'file' not in request.files:
            print("No se encontró archivo en la solicitud")
            return jsonify({'error': 'No se envió ningún archivo'}), 400
            
        file = request.files['file']
        print(f"Archivo recibido: {file.filename}, tipo: {file.content_type}")
        
        if file.filename == '':
            print("Nombre de archivo vacío")
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
            
        if not allowed_file(file.filename):
            print(f"Tipo de archivo no permitido: {file.filename}")
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400
        
        # Crear nombre de archivo seguro
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        print(f"Guardando archivo en: {file_path}")
        
        # Guardar archivo
        try:
            file.save(file_path)
            print("Archivo guardado exitosamente")
            print(f"Tamaño del archivo: {os.path.getsize(file_path)} bytes")
        except Exception as save_error:
            print(f"Error al guardar archivo: {str(save_error)}")
            return jsonify({'error': 'Error al guardar el archivo'}), 500
        
        # Verificar que el archivo existe y es accesible
        if not os.path.exists(file_path):
            print("El archivo no existe después de guardarlo")
            return jsonify({'error': 'Error al guardar el archivo'}), 500
        
        print("Intentando leer el archivo guardado...")
        try:
            with open(file_path, 'rb') as test_file:
                test_data = test_file.read()
                print(f"Archivo leído exitosamente, tamaño: {len(test_data)} bytes")
        except Exception as read_error:
            print(f"Error al leer el archivo guardado: {str(read_error)}")
            return jsonify({'error': 'Error al procesar el archivo'}), 500
        
        # Analizar la imagen
        print("Iniciando análisis de la imagen con OpenAI...")
        try:
            analysis = analyze_food_image(file_path)
            print("Análisis completado")
            print(f"Resultado del análisis (primeros 100 caracteres): {analysis[:100] if analysis else 'None'}")
            
            if not analysis:
                print("El análisis retornó None, usando análisis por defecto")
                analysis = """
                # Análisis Nutricional (Error)
                No se pudo analizar la imagen. Consulte a un profesional.
                """
        except Exception as analysis_error:
            print(f"Error durante el análisis: {str(analysis_error)}")
            print(f"Tipo de error: {type(analysis_error)}")
            import traceback
            traceback.print_exc()
            analysis = "Error al analizar la imagen"
        
        # Extraer datos nutricionales
        print("Extrayendo datos nutricionales del análisis...")
        try:
            nutritional_data = extract_nutritional_data(analysis)
            print(f"Datos nutricionales extraídos: {nutritional_data}")
        except Exception as extract_error:
            print(f"Error al extraer datos nutricionales: {str(extract_error)}")
            nutritional_data = {'calories': 0, 'proteins': 0, 'carbs': 0, 'fats': 0}
        
        # Guardar en NutritionLog
        try:
            print("Guardando entrada en NutritionLog...")
            log_entry = NutritionLog(
                user_id=user_id,
                log_date=date.today(),
                calories=nutritional_data.get('calories', 0),
                proteins=nutritional_data.get('proteins', 0.0),
                carbs=nutritional_data.get('carbs', 0.0),
                fats=nutritional_data.get('fats', 0.0),
            )
            db.session.add(log_entry)
            db.session.commit()
            print(f"Entrada de log guardada con ID: {log_entry.id}")
        except Exception as log_error:
            db.session.rollback()
            print(f"Error al guardar en NutritionLog: {log_error}")
            # No fallar toda la solicitud, pero registrar el error
        
        return jsonify({
            'message': 'Análisis completado',
            'analysis': analysis,
            'nutritional_data': nutritional_data,
        }), 200
        
    except Exception as e:
        print("=== ERROR EN ANALYZE_FOOD ===")
        print(f"Error: {str(e)}")
        print(f"Tipo de error: {type(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
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