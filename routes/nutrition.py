from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, User, NutritionAnalysis
from utils.openai_utils import analyze_food_image, extract_nutritional_data
import os
import uuid

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
        # Asegurarse de que el directorio existe al momento de la solicitud
        os.makedirs(os.path.join(current_app.root_path, 'uploads', 'nutrition'), exist_ok=True)
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar si se envió un archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se envió ningún archivo'}), 400
        
        file = request.files['file']
        
        # Verificar si el archivo tiene un nombre
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
        
        # Verificar si el archivo tiene una extensión permitida
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400
        
        # Crear un nombre de archivo seguro y único
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Guardar el archivo en el subdirectorio correcto
        file_path = os.path.join(current_app.root_path, 'uploads', 'nutrition', unique_filename)
        file.save(file_path)
        
        # La ruta que se guarda en la base de datos incluye el subdirectorio
        db_file_path = f"nutrition/{unique_filename}"
        
        # Analizar la imagen con OpenAI
        print(f"Analizando imagen de alimentos: {file_path}")
        analysis = analyze_food_image(file_path)
        print(f"Análisis recibido (primeros 100 caracteres): {analysis[:100] if analysis else 'Vacío'}")
        
        # Extraer datos nutricionales del análisis
        print("Extrayendo datos nutricionales del análisis")
        nutritional_data = extract_nutritional_data(analysis)
        print(f"Datos nutricionales extraídos: {nutritional_data}")
        
        # Crear el registro en la base de datos
        nutrition_analysis = NutritionAnalysis(
            user_id=user_id,
            file_path=db_file_path,
            analysis=analysis
        )
        
        db.session.add(nutrition_analysis)
        db.session.commit()
        
        return jsonify({
            'message': 'Análisis nutricional completado con éxito',
            'analysis': analysis,
            'nutritionalData': nutritional_data,
            'id': nutrition_analysis.id,
            'file_path': nutrition_analysis.file_path
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error en analyze_food: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500 