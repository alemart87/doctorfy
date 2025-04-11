import os
import base64
from openai import OpenAI
from flask import current_app
from .anthropic_utils import analyze_medical_study_with_anthropic

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def analyze_medical_study(image_path, study_type):
    """
    Analiza un estudio médico usando Anthropic Claude Vision
    """
    # Usar Anthropic Claude para el análisis de estudios médicos
    return analyze_medical_study_with_anthropic(image_path, study_type)

def analyze_food_image(file_path):
    """
    Analiza una imagen de alimentos usando OpenAI Vision
    """
    try:
        print(f"Iniciando análisis de imagen de alimentos: {file_path}")
        
        # Verificar si el archivo existe
        if not os.path.exists(file_path):
            print(f"ERROR: El archivo no existe: {file_path}")
            return "No se pudo analizar la imagen de alimentos. El archivo no existe."
        
        # Codificar la imagen en base64
        print(f"Cargando imagen desde: {file_path}")
        with open(file_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        print(f"Imagen cargada y codificada en base64 (primeros 50 caracteres): {base64_image[:50]}...")
        
        # Verificar la clave API
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("ERROR: No se encontró la clave API de OpenAI en las variables de entorno")
            return "No se pudo analizar la imagen de alimentos. Falta la configuración de la API."
        
        # Realizar la solicitud a OpenAI
        print("Llamando a la API de OpenAI con modelo gpt-4o")
        response = client.chat.completions.create(
            model="gpt-4o",  # Actualizado al modelo actual
            messages=[
                {
                    "role": "system",
                    "content": "Eres un nutricionista experto. Analiza las imágenes de alimentos y proporciona información nutricional detallada."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analiza esta imagen de alimentos y proporciona la siguiente información: 1) Identificación de los alimentos, 2) Valor calórico aproximado, 3) Macronutrientes (proteínas, carbohidratos, grasas), 4) Beneficios para la salud, 5) Posibles advertencias o contraindicaciones, 6) Recomendaciones nutricionales."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        # Extraer y devolver el análisis
        print("Respuesta recibida de OpenAI")
        analysis = response.choices[0].message.content
        print(f"Análisis (primeros 100 caracteres): {analysis[:100]}...")
        
        return analysis
        
    except Exception as e:
        print(f"ERROR en analyze_food_image: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"Error al analizar la imagen de alimentos: {str(e)}"

def extract_nutritional_data(analysis_text):
    """
    Función para extraer datos nutricionales del texto.
    """
    # Valores por defecto
    data = {
        "calories": 0,
        "proteins": 0,
        "carbs": 0,
        "fats": 0
    }
    
    if not analysis_text:
        print("No hay texto de análisis para extraer datos nutricionales")
        return data
    
    print(f"Extrayendo datos nutricionales de: {analysis_text[:100]}...")
    
    # Búsqueda simple de valores
    import re
    
    # Buscar calorías
    calories_match = re.search(r'(\d+)\s*(?:kcal|calorías|calorias)', analysis_text, re.IGNORECASE)
    if calories_match:
        data["calories"] = int(calories_match.group(1))
        print(f"Calorías encontradas: {data['calories']}")
    
    # Buscar proteínas
    proteins_match = re.search(r'(\d+(?:\.\d+)?)\s*g\s*(?:de)?\s*proteínas', analysis_text, re.IGNORECASE)
    if proteins_match:
        data["proteins"] = float(proteins_match.group(1))
        print(f"Proteínas encontradas: {data['proteins']}")
    
    # Buscar carbohidratos
    carbs_match = re.search(r'(\d+(?:\.\d+)?)\s*g\s*(?:de)?\s*(?:carbohidratos|carbs)', analysis_text, re.IGNORECASE)
    if carbs_match:
        data["carbs"] = float(carbs_match.group(1))
        print(f"Carbohidratos encontrados: {data['carbs']}")
    
    # Buscar grasas
    fats_match = re.search(r'(\d+(?:\.\d+)?)\s*g\s*(?:de)?\s*(?:grasas|lípidos)', analysis_text, re.IGNORECASE)
    if fats_match:
        data["fats"] = float(fats_match.group(1))
        print(f"Grasas encontradas: {data['fats']}")
    
    print(f"Datos nutricionales extraídos: {data}")
    return data 