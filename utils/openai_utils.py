import os
import base64
import json
import requests # Usar requests para llamadas HTTP
from dotenv import load_dotenv
import fitz # PyMuPDF
import mimetypes
import traceback
import re # Para extraer datos nutricionales

# Cargar variables de entorno
load_dotenv()

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# --- Funciones Auxiliares ---

def _call_openai_api(payload):
    """Función auxiliar para llamar a la API de OpenAI."""
    if not OPENAI_API_KEY:
        print("Error: OPENAI_API_KEY no está configurada.")
        raise ValueError("API Key de OpenAI no configurada.")

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    print(f"Enviando solicitud a OpenAI API: {OPENAI_API_URL}")
    try:
        response = requests.post(OPENAI_API_URL, headers=headers, json=payload)
        response.raise_for_status() # Lanza excepción para errores HTTP
        response_data = response.json()
        print("Respuesta recibida de OpenAI API.")

        if response_data.get("choices") and len(response_data["choices"]) > 0:
            message_content = response_data["choices"][0].get("message", {}).get("content")
            if message_content:
                return message_content
            else:
                print(f"Respuesta inesperada (sin contenido): {response_data}")
                return "No se encontró contenido en la respuesta de OpenAI."
        else:
            print(f"Respuesta inesperada (sin choices): {response_data}")
            return "Respuesta inesperada de la API de OpenAI."

    except requests.exceptions.RequestException as e:
        print(f"Error de red al llamar a OpenAI API: {str(e)}")
        error_details = f"Error de red: {e}"
        if e.response is not None:
            try:
                error_details += f" - Respuesta: {e.response.text}"
            except Exception:
                pass
        raise ConnectionError(error_details) from e # Relanzar como ConnectionError
    except Exception as e:
        print(f"Error general en _call_openai_api: {str(e)}")
        traceback.print_exc()
        raise # Relanzar la excepción original

# --- Funciones Principales (Adaptadas para llamada directa API) ---

def analyze_medical_study(file_path, study_type):
    """
    Analiza un estudio médico usando la API de OpenAI directamente.
    """
    try:
        is_pdf = file_path.lower().endswith('.pdf')
        messages = []

        if is_pdf:
            text_content = ""
            try:
                doc = fitz.open(file_path)
                for page in doc:
                    text_content += page.get_text()
                if not text_content:
                    raise ValueError("PDF vacío o no se pudo extraer texto.")
            except Exception as pdf_err:
                 print(f"Error al procesar PDF: {pdf_err}")
                 raise ValueError(f"Error al procesar PDF: {pdf_err}") from pdf_err

            messages = [
                {"role": "system", "content": f"Eres un asistente médico especializado en análisis de estudios {study_type}."},
                {"role": "user", "content": f"Analiza el siguiente texto extraído de un estudio médico y proporciona un análisis detallado y recomendaciones:\n\n{text_content}"}
            ]
            model = "gpt-4o" # Modelo bueno para texto
        else:
            # Manejar imágenes
            try:
                with open(file_path, "rb") as image_file:
                    image_data = image_file.read()
                base64_image = base64.b64encode(image_data).decode('utf-8')

                mime_type, _ = mimetypes.guess_type(file_path)
                if not mime_type or not mime_type.startswith('image/'):
                    mime_type = 'image/jpeg'

                messages = [
                    {"role": "system", "content": f"Eres un asistente médico especializado en análisis de estudios {study_type}."},
                    {"role": "user", "content": [
                        {"type": "text", "text": f"Analiza este estudio {study_type} y proporciona un informe detallado."},
                        {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}}
                    ]}
                ]
                model = "gpt-4o" # Modelo con capacidad de visión
            except FileNotFoundError:
                 print(f"Error: Archivo de imagen no encontrado en {file_path}")
                 raise
            except Exception as img_err:
                 print(f"Error al procesar la imagen: {img_err}")
                 raise

        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": 1500 # Ajustar según necesidad
        }

        analysis = _call_openai_api(payload)
        return {
            "success": True,
            "analysis": analysis,
            "provider": "openai"
        }

    except Exception as e:
        print(f"Error en analyze_medical_study (OpenAI Direct): {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "provider": "openai"
        }

def analyze_food_image_from_base64(base64_image):
    """
    Analiza una imagen de comida en base64 usando la API de OpenAI directamente.
    """
    try:
        messages = [
            {"role": "system", "content": "Eres un nutricionista experto. Analiza la imagen de comida y proporciona información nutricional detallada."},
            {"role": "user", "content": [
                {"type": "text", "text": "Analiza esta imagen de comida y proporciona la siguiente información:\n1. Identificación de los alimentos\n2. Calorías aproximadas\n3. Macronutrientes (proteínas, carbohidratos, grasas)\n4. Valoración nutricional\n5. Recomendaciones\n\nFormatea la respuesta de manera clara y estructurada."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}} # Asumimos JPEG si no se especifica
            ]}
        ]

        payload = {
            "model": "gpt-4o",
            "messages": messages,
            "max_tokens": 1000
        }

        analysis = _call_openai_api(payload)
        return analysis

    except Exception as e:
        print(f"Error en analyze_food_image_from_base64 (OpenAI Direct): {str(e)}")
        # Devolver un mensaje de error genérico formateado como el análisis esperado
        return """
        # Análisis Nutricional

        ## Error
        No se pudo analizar la imagen debido a un error interno. Por favor, inténtelo de nuevo más tarde.

        ## Información Nutricional
        - Calorías: No disponible
        - Proteínas: No disponible
        - Carbohidratos: No disponible
        - Grasas: No disponible
        """

def analyze_food_image(file_path):
    """
    Analiza una imagen de comida desde un archivo usando la API de OpenAI directamente.
    """
    try:
        print(f"=== Iniciando análisis de imagen (Ruta original: {file_path}) ===")
        with open(file_path, "rb") as image_file:
            image_data = image_file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        print(f"Imagen codificada, longitud base64: {len(base64_image)}")

        # Llamar a la función que maneja base64
        return analyze_food_image_from_base64(base64_image)

    except FileNotFoundError:
        print(f"Error: Archivo no encontrado en {file_path}")
        return "Error: Archivo de imagen no encontrado."
    except Exception as e:
        print(f"Error general en analyze_food_image (OpenAI Direct): {str(e)}")
        traceback.print_exc()
        return "Error al procesar la imagen."


def extract_nutrition_data(analysis_text):
    """
    Extrae datos nutricionales estructurados del texto de análisis.
    (Esta función no necesita cambios ya que opera sobre el texto devuelto)
    """
    data = {"calories": 0, "proteins": 0, "carbs": 0, "fats": 0}
    if not analysis_text or not isinstance(analysis_text, str):
        print("Texto de análisis inválido para extracción.")
        return data

    print(f"Extrayendo datos de: {analysis_text[:200]}...") # Log inicial

    # Patrones Regex mejorados y más flexibles
    # Calorías
    cal_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:kcal|calorías|cal)\b', # 150 kcal, 150 calorías
        r'(?:calorías|energía|valor energético):\s*(\d+(?:\.\d+)?)', # Calorías: 150
        r'aproximadamente\s*(\d+(?:\.\d+)?)\s*calorías', # aproximadamente 150 calorías
        r'calorías\s*totales:\s*(\d+(?:\.\d+)?)' # Calorías totales: 150
    ]
    for pattern in cal_patterns:
        cal_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if cal_match:
            try:
                data["calories"] = float(cal_match.group(1))
                print(f"Calorías encontradas con patrón '{pattern}': {data['calories']}")
                break # Tomar la primera coincidencia
            except ValueError:
                print(f"Valor de calorías no válido encontrado: {cal_match.group(1)}")

    # Proteínas
    protein_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*proteínas?\b', # 10g de proteína
        r'proteínas?:\s*(\d+(?:\.\d+)?)\s*g', # Proteínas: 10g
        r'proteínas?[^\d]*?(\d+(?:\.\d+)?)\s*g', # Proteínas - 10g
        r'contenido\s*de\s*proteínas?:\s*(\d+(?:\.\d+)?)', # contenido de proteínas: 10
        r'proteínas?[^:]*?:\s*(\d+(?:\.\d+)?)', # Proteínas (fuente completa): 10
        r'proteínas?[^\.]*?(\d+(?:\.\d+)?)\s*gramos' # proteínas... 10 gramos
    ]
    for pattern in protein_patterns:
        protein_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if protein_match:
            try:
                data["proteins"] = float(protein_match.group(1))
                print(f"Proteínas encontradas con patrón '{pattern}': {data['proteins']}")
                break
            except ValueError:
                 print(f"Valor de proteínas no válido encontrado: {protein_match.group(1)}")

    # Carbohidratos
    carbs_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*(?:carbohidratos?|hidratos\s*de\s*carbono|carbs?)\b', # 30g de carbohidratos
        r'(?:carbohidratos?|hidratos|carbs?):\s*(\d+(?:\.\d+)?)\s*g', # Carbohidratos: 30g
        r'(?:carbohidratos?|hidratos|carbs?)[^\d]*?(\d+(?:\.\d+)?)\s*g', # Carbohidratos - 30g
        r'contenido\s*de\s*(?:carbohidratos?|hidratos):\s*(\d+(?:\.\d+)?)', # contenido de carbohidratos: 30
        r'(?:carbohidratos?|hidratos|carbs?)[^:]*?:\s*(\d+(?:\.\d+)?)', # Carbohidratos (complejos): 30
        r'(?:carbohidratos?|hidratos|carbs?)[^\.]*?(\d+(?:\.\d+)?)\s*gramos' # carbohidratos... 30 gramos
    ]
    for pattern in carbs_patterns:
        carbs_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if carbs_match:
            try:
                data["carbs"] = float(carbs_match.group(1))
                print(f"Carbohidratos encontrados con patrón '{pattern}': {data['carbs']}")
                break
            except ValueError:
                print(f"Valor de carbohidratos no válido encontrado: {carbs_match.group(1)}")

    # Grasas
    fats_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*(?:grasas|lípidos|fat)\b', # 10g de grasas
        r'(?:grasas|lípidos|fat):\s*(\d+(?:\.\d+)?)\s*g', # Grasas: 10g
        r'(?:grasas|lípidos|fat)[^\d]*?(\d+(?:\.\d+)?)\s*g', # Grasas - 10g
        r'contenido\s*de\s*(?:grasas|lípidos):\s*(\d+(?:\.\d+)?)', # contenido de grasas: 10
        r'(?:grasas|lípidos)[^:]*?:\s*(\d+(?:\.\d+)?)', # Grasas (principalmente saludables): 10
        r'(?:grasas|lípidos)[^\.]*?(\d+(?:\.\d+)?)\s*gramos', # grasas... 10 gramos
        r'grasas\s+totales:\s*(\d+(?:\.\d+)?)' # grasas totales: 10
    ]
    for pattern in fats_patterns:
        fats_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if fats_match:
            try:
                data["fats"] = float(fats_match.group(1))
                print(f"Grasas encontradas con patrón '{pattern}': {data['fats']}")
                break
            except ValueError:
                print(f"Valor de grasas no válido encontrado: {fats_match.group(1)}")

    # Búsqueda de tabla y lista (como fallback si los patrones anteriores fallan)
    # (Se mantienen los patrones de tabla y lista por si acaso)
    table_patterns = [
        r'proteínas\s*\|\s*(\d+(?:\.\d+)?)',
        r'carbohidratos\s*\|\s*(\d+(?:\.\d+)?)',
        r'grasas\s*\|\s*(\d+(?:\.\d+)?)'
    ]
    list_patterns = [
        r'-\s*proteínas:?\s*(\d+(?:\.\d+)?)',
        r'-\s*carbohidratos:?\s*(\d+(?:\.\d+)?)',
        r'-\s*grasas:?\s*(\d+(?:\.\d+)?)'
    ]

    if data["proteins"] == 0:
        match = re.search(table_patterns[0], analysis_text, re.IGNORECASE) or re.search(list_patterns[0], analysis_text, re.IGNORECASE)
        if match:
            try: data["proteins"] = float(match.group(1)); print(f"Proteínas (fallback tabla/lista): {data['proteins']}")
            except ValueError: pass
    if data["carbs"] == 0:
        match = re.search(table_patterns[1], analysis_text, re.IGNORECASE) or re.search(list_patterns[1], analysis_text, re.IGNORECASE)
        if match:
            try: data["carbs"] = float(match.group(1)); print(f"Carbohidratos (fallback tabla/lista): {data['carbs']}")
            except ValueError: pass
    if data["fats"] == 0:
        match = re.search(table_patterns[2], analysis_text, re.IGNORECASE) or re.search(list_patterns[2], analysis_text, re.IGNORECASE)
        if match:
            try: data["fats"] = float(match.group(1)); print(f"Grasas (fallback tabla/lista): {data['fats']}")
            except ValueError: pass


    print(f"Datos nutricionales extraídos finales: {data}")
    return data


def analyze_nutrition(food_description):
    """
    Analiza la información nutricional usando la API de OpenAI directamente.
    """
    try:
        prompt = f"""
        Eres un nutricionista experto analizando la siguiente descripción de alimentos:

        {food_description}

        Por favor, proporciona:
        1. Análisis nutricional detallado (calorías, macronutrientes, micronutrientes)
        2. Beneficios para la salud
        3. Posibles riesgos o consideraciones
        4. Recomendaciones para una dieta balanceada
        """

        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "Eres un asistente nutricional especializado en análisis de alimentos."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 1000
        }

        analysis = _call_openai_api(payload)
        return analysis

    except Exception as e:
        print(f"Error en analyze_nutrition (OpenAI Direct): {str(e)}")
        return "No se pudo realizar el análisis nutricional. Por favor, consulte a un profesional de la nutrición."


def generate_health_recommendations(user_data, health_profile):
    """
    Genera recomendaciones de salud usando la API de OpenAI directamente.
    """
    try:
        prompt = f"""
        Eres un médico generando recomendaciones de salud personalizadas para un paciente con el siguiente perfil:

        Datos personales:
        - Edad: {user_data.get('age', 'No disponible')}
        - Género: {user_data.get('gender', 'No disponible')}
        - Altura: {user_data.get('height', 'No disponible')} cm
        - Peso: {user_data.get('weight', 'No disponible')} kg

        Perfil de salud:
        - Nivel de actividad: {health_profile.get('activity_level', 'No disponible')}
        - Condiciones preexistentes: {health_profile.get('preexisting_conditions', 'Ninguna')}
        - Alergias: {health_profile.get('allergies', 'Ninguna')}
        - Fumador: {'Sí' if health_profile.get('smoking') else 'No'}
        - Consumo de alcohol: {health_profile.get('alcohol_consumption', 'No disponible')}
        - Horas de sueño: {health_profile.get('sleep_hours', 'No disponible')}
        - Nivel de estrés: {health_profile.get('stress_level', 'No disponible')}
        - Tipo de dieta: {health_profile.get('diet_type', 'No disponible')}

        Por favor, proporciona:
        1. Evaluación general de la salud
        2. Recomendaciones específicas para mejorar la salud (dieta, ejercicio, hábitos)
        3. Sugerencias de hábitos saludables concretos y accionables
        4. Posibles áreas de preocupación que deberían ser monitoreadas o discutidas con un médico
        """

        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "Eres un asistente médico especializado en recomendaciones de salud personalizadas."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.5, # Un poco más de creatividad/variedad
            "max_tokens": 1500
        }

        recommendations = _call_openai_api(payload)
        return recommendations

    except Exception as e:
        print(f"Error en generate_health_recommendations (OpenAI Direct): {str(e)}")
        return "No se pudieron generar recomendaciones de salud. Por favor, consulte a un profesional de la salud." 