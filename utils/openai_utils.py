import os
import base64
from openai import OpenAI
from flask import current_app
from .anthropic_utils import analyze_medical_study_with_anthropic
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Inicializar el cliente de OpenAI
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def analyze_medical_study(image_path, study_type):
    """
    Analiza un estudio médico usando la API de OpenAI con GPT-4o
    """
    try:
        # Abrir la imagen
        with open(image_path, "rb") as image_file:
            # Usar la API de OpenAI para analizar la imagen con GPT-4o
            response = client.chat.completions.create(
                model="gpt-4o",  # Usar el modelo GPT-4o
                messages=[
                    {
                        "role": "system",
                        "content": f"Eres un médico especialista analizando un {study_type}. Proporciona una interpretación detallada y profesional."
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": f"Por favor, analiza este estudio médico ({study_type}) y proporciona una interpretación detallada:"},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64.b64encode(image_file.read()).decode('utf-8')}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
            
            # Extraer la interpretación de la respuesta
            interpretation = response.choices[0].message.content
            return interpretation
            
    except Exception as e:
        print(f"Error al analizar el estudio médico: {str(e)}")
        # Si falla OpenAI, intentar con Anthropic como respaldo
        try:
            return analyze_medical_study_with_anthropic(image_path, study_type)
        except:
            return f"No se pudo analizar el estudio médico. Error: {str(e)}"

def analyze_food_image(file_path):
    """
    Analiza una imagen de comida y devuelve información nutricional
    """
    try:
        with open(file_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un nutricionista experto. Analiza la imagen de comida y proporciona información nutricional detallada."
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Analiza esta imagen de comida y proporciona la siguiente información:\n1. Identificación de los alimentos\n2. Calorías aproximadas\n3. Macronutrientes (proteínas, carbohidratos, grasas)\n4. Valoración nutricional\n5. Recomendaciones\n\nFormatea la respuesta de manera clara y estructurada."},
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
            
            return response.choices[0].message.content
            
    except Exception as e:
        print(f"Error al analizar la imagen de comida: {str(e)}")
        return f"No se pudo analizar la imagen. Error: {str(e)}"

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