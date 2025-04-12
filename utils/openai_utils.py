import os
import base64
from openai import OpenAI
from flask import current_app
from .anthropic_utils import analyze_medical_study_with_anthropic
from dotenv import load_dotenv
import httpx
import traceback # Asegurar que traceback esté importado
import requests
import json

# Cargar variables de entorno
load_dotenv()

# Definir cabeceras simples y seguras
SAFE_ASCII_HEADERS = {
    "User-Agent": "DoctorfyApp/1.0",
    "Accept": "application/json",
    "Content-Type": "application/json", # OpenAI lo ajustará para multipart si es necesario
    # Añadir otras cabeceras necesarias si OpenAI las requiere explícitamente
}

# Intentar configurar httpx para usar UTF-8 por defecto (puede no funcionar en todas las versiones)
# Esto es más una medida de diagnóstico
try:
    # Nota: httpx no tiene una configuración global simple para esto.
    # En su lugar, nos aseguraremos de que el cliente OpenAI use un cliente httpx configurado si es posible.
    # Crear un cliente httpx con codificación explícita si es necesario (aunque OpenAI crea el suyo)
    # http_client = httpx.Client(headers={'accept-encoding': 'identity'}) # Ejemplo, no directamente aplicable aquí
    pass # Dejar como estaba, la configuración global no es estándar
except Exception as config_error:
    print(f"Advertencia: No se pudo configurar httpx explícitamente: {config_error}")


# Inicializar el cliente de OpenAI con cabeceras personalizadas
try:
    # Crear un cliente httpx base si es necesario para pasar headers (OpenAI >v1.0 maneja esto internamente)
    # http_client = httpx.Client(headers=SAFE_ASCII_HEADERS) # Ejemplo si fuera necesario
    client = OpenAI(
        api_key=os.environ.get('OPENAI_API_KEY'),
        default_headers=SAFE_ASCII_HEADERS.copy() # Pasar cabeceras por defecto seguras
    )
    print("Cliente OpenAI inicializado con cabeceras seguras.")
except Exception as client_init_error:
    print(f"Error al inicializar cliente OpenAI: {client_init_error}")
    # Fallback a inicialización estándar si falla la personalización de headers
    client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    print("Cliente OpenAI inicializado con configuración estándar (fallback).")

def analyze_medical_study(file_path, study_type):
    """
    Analiza un estudio médico usando Anthropic
    
    Args:
        file_path (str): Ruta al archivo del estudio
        study_type (str): Tipo de estudio médico
        
    Returns:
        str: Resultado del análisis
    """
    # Usar exclusivamente Anthropic
    return analyze_medical_study_with_anthropic(file_path, study_type)

def analyze_food_image(file_path):
    """
    Analiza una imagen de comida y devuelve información nutricional
    """
    try:
        print(f"=== Iniciando análisis de imagen (Ruta original: {file_path}) ===")

        # Leer el archivo directamente en memoria
        print("Leyendo archivo...")
        # (Mantenemos la lógica de lectura robusta por si acaso)
        try:
            with open(file_path, "rb") as image_file:
                image_data = image_file.read()
            print(f"Archivo leído, tamaño: {len(image_data)} bytes")
        except Exception as read_error:
            print(f"Error al leer el archivo: {str(read_error)}")
            try:
                with open(file_path.encode('utf-8'), "rb") as image_file:
                    image_data = image_file.read()
                print(f"Archivo leído (con ruta codificada), tamaño: {len(image_data)} bytes")
            except Exception as read_error_encoded:
                 print(f"Error al leer el archivo (incluso con ruta codificada): {str(read_error_encoded)}")
                 raise read_error_encoded

        # Codificar en base64
        print("Codificando imagen en base64...")
        base64_image = base64.b64encode(image_data).decode('utf-8')
        print(f"Imagen codificada, longitud base64: {len(base64_image)}")

        # Construir el payload
        messages = [
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
        ]

        print("Llamando a la API de OpenAI...")
        # Log de las cabeceras que el cliente OpenAI *debería* usar
        print(f"Cabeceras por defecto del cliente OpenAI: {client.default_headers}")

        # Llamada estándar a la API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=1000
            # Podríamos intentar pasar headers aquí también si default_headers no funciona
            # extra_headers=SAFE_ASCII_HEADERS.copy()
        )

        print("Respuesta recibida de OpenAI")
        return response.choices[0].message.content

    except UnicodeEncodeError as uee:
        print(f"=== ERROR DE CODIFICACIÓN UNICODE EN ANALYZE_FOOD_IMAGE ===")
        print(f"Error: {str(uee)}")
        print("Este error persiste y parece estar relacionado con la forma en que la biblioteca HTTP maneja la información del entorno o las cabeceras en Windows.")
        traceback.print_exc()
        return None
    except Exception as e:
        print(f"=== ERROR GENERAL EN ANALYZE_FOOD_IMAGE ===")
        print(f"Error: {str(e)}")
        print(f"Tipo de error: {type(e)}")
        traceback.print_exc()
        return None

def analyze_food_image_from_base64(base64_image):
    """
    Analiza una imagen de comida en formato base64 y devuelve información nutricional
    """
    try:
        # Intentar usar la API de OpenAI directamente con los datos en base64
        try:
            # Realizar la llamada a la API
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
            
            # Extraer la respuesta
            return response.choices[0].message.content
        except Exception as api_error:
            print(f"Error en la llamada a la API: {str(api_error)}")
            # Si falla, devolver un mensaje genérico
            return """
            # Análisis Nutricional

            ## Identificación de los alimentos
            No se pudo identificar los alimentos en la imagen.

            ## Información Nutricional
            - Calorías: No disponible
            - Proteínas: No disponible
            - Carbohidratos: No disponible
            - Grasas: No disponible

            ## Valoración Nutricional
            No se pudo realizar una valoración nutricional.

            ## Recomendaciones
            Se recomienda consultar con un nutricionista profesional para obtener un análisis personalizado.
            """
            
    except Exception as e:
        print(f"Error general al analizar la imagen: {str(e)}")
        return """
        # Análisis Nutricional

        ## Identificación de los alimentos
        No se pudo identificar los alimentos en la imagen.

        ## Información Nutricional
        - Calorías: No disponible
        - Proteínas: No disponible
        - Carbohidratos: No disponible
        - Grasas: No disponible

        ## Valoración Nutricional
        No se pudo realizar una valoración nutricional.

        ## Recomendaciones
        Se recomienda consultar con un nutricionista profesional para obtener un análisis personalizado.
        """

def extract_nutritional_data(analysis_text):
    """
    Función para extraer datos nutricionales del texto de forma más robusta.
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

    print(f"Extrayendo datos nutricionales de: {analysis_text[:300]}...") # Mostrar más texto para depuración
    
    # Imprimir el texto completo para depuración (solo durante desarrollo)
    print("TEXTO COMPLETO DEL ANÁLISIS:")
    print(analysis_text)
    print("FIN DEL TEXTO COMPLETO")

    import re

    # --- Expresiones Regulares Mejoradas ---

    # Buscar Calorías (más flexible)
    calories_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:kcal|calorías|calorias|cal\.?)\b',  # 250 kcal
        r'calorías?:\s*(\d+(?:\.\d+)?)',  # Calorías: 250
        r'calorías?[^\d]*?(\d+(?:\.\d+)?)',  # Calorías - 250
        r'aproximadamente\s*(\d+(?:\.\d+)?)\s*calorías',  # aproximadamente 250 calorías
        r'total\s*de\s*(\d+(?:\.\d+)?)\s*calorías',  # total de 250 calorías
        r'estimad[oa]s?\s*(?:en)?\s*(\d+(?:\.\d+)?)',  # estimadas en 250
        r'alrededor\s*de\s*(\d+(?:\.\d+)?)\s*calorías'  # alrededor de 250 calorías
    ]
    
    for pattern in calories_patterns:
        calories_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if calories_match:
            try:
                data["calories"] = int(float(calories_match.group(1)))
                print(f"Calorías encontradas con patrón '{pattern}': {data['calories']}")
                break
            except ValueError:
                print(f"Valor de calorías no válido encontrado: {calories_match.group(1)}")

    # Buscar Proteínas (más flexible)
    proteins_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*(?:proteínas|proteina|protein)\b',  # 20g de proteínas
        r'proteínas?:\s*(\d+(?:\.\d+)?)\s*g',  # Proteínas: 20g
        r'proteínas?[^\d]*?(\d+(?:\.\d+)?)\s*g',  # Proteínas - 20g
        r'contenido\s*de\s*proteínas?:\s*(\d+(?:\.\d+)?)',  # contenido de proteínas: 20
        r'proteínas?[^:]*?:\s*(\d+(?:\.\d+)?)',  # Proteínas (alto contenido): 20
        r'proteínas?[^\.]*?(\d+(?:\.\d+)?)\s*gramos'  # proteínas... 20 gramos
    ]
    
    for pattern in proteins_patterns:
        proteins_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if proteins_match:
            try:
                data["proteins"] = float(proteins_match.group(1))
                print(f"Proteínas encontradas con patrón '{pattern}': {data['proteins']}")
                break
            except ValueError:
                print(f"Valor de proteínas no válido encontrado: {proteins_match.group(1)}")

    # Buscar Carbohidratos (más flexible)
    carbs_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*(?:carbohidratos|carbs?|hidratos\s+de\s+carbono)\b',  # 30g de carbohidratos
        r'(?:carbohidratos|carbs?):\s*(\d+(?:\.\d+)?)\s*g',  # Carbohidratos: 30g
        r'(?:carbohidratos|carbs?)[^\d]*?(\d+(?:\.\d+)?)\s*g',  # Carbohidratos - 30g
        r'contenido\s*de\s*(?:carbohidratos|carbs?):\s*(\d+(?:\.\d+)?)',  # contenido de carbohidratos: 30
        r'(?:carbohidratos|carbs?)[^:]*?:\s*(\d+(?:\.\d+)?)',  # Carbohidratos (principalmente del arroz): 30
        r'(?:carbohidratos|carbs?)[^\.]*?(\d+(?:\.\d+)?)\s*gramos',  # carbohidratos... 30 gramos
        r'hidratos\s+de\s+carbono:\s*(\d+(?:\.\d+)?)'  # hidratos de carbono: 30
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

    # Buscar Grasas (más flexible)
    fats_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*(?:grasas|lípidos|fat)\b',  # 10g de grasas
        r'(?:grasas|lípidos|fat):\s*(\d+(?:\.\d+)?)\s*g',  # Grasas: 10g
        r'(?:grasas|lípidos|fat)[^\d]*?(\d+(?:\.\d+)?)\s*g',  # Grasas - 10g
        r'contenido\s*de\s*(?:grasas|lípidos):\s*(\d+(?:\.\d+)?)',  # contenido de grasas: 10
        r'(?:grasas|lípidos)[^:]*?:\s*(\d+(?:\.\d+)?)',  # Grasas (principalmente saludables): 10
        r'(?:grasas|lípidos)[^\.]*?(\d+(?:\.\d+)?)\s*gramos',  # grasas... 10 gramos
        r'grasas\s+totales:\s*(\d+(?:\.\d+)?)'  # grasas totales: 10
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

    # Búsqueda de tabla de información nutricional
    # A veces OpenAI devuelve una tabla con formato como:
    # | Nutriente | Cantidad |
    # | Proteínas | 25g      |
    table_patterns = [
        r'proteínas\s*\|\s*(\d+(?:\.\d+)?)',  # Proteínas | 25
        r'carbohidratos\s*\|\s*(\d+(?:\.\d+)?)',  # Carbohidratos | 30
        r'grasas\s*\|\s*(\d+(?:\.\d+)?)'  # Grasas | 10
    ]
    
    # Buscar proteínas en tabla
    if data["proteins"] == 0:
        proteins_table_match = re.search(table_patterns[0], analysis_text, re.IGNORECASE)
        if proteins_table_match:
            try:
                data["proteins"] = float(proteins_table_match.group(1))
                print(f"Proteínas encontradas en tabla: {data['proteins']}")
            except ValueError:
                pass
    
    # Buscar carbohidratos en tabla
    if data["carbs"] == 0:
        carbs_table_match = re.search(table_patterns[1], analysis_text, re.IGNORECASE)
        if carbs_table_match:
            try:
                data["carbs"] = float(carbs_table_match.group(1))
                print(f"Carbohidratos encontrados en tabla: {data['carbs']}")
            except ValueError:
                pass
    
    # Buscar grasas en tabla
    if data["fats"] == 0:
        fats_table_match = re.search(table_patterns[2], analysis_text, re.IGNORECASE)
        if fats_table_match:
            try:
                data["fats"] = float(fats_table_match.group(1))
                print(f"Grasas encontradas en tabla: {data['fats']}")
            except ValueError:
                pass

    # Búsqueda de valores en formato de lista
    # A veces OpenAI devuelve listas como:
    # - Proteínas: 25g
    list_patterns = [
        r'-\s*proteínas:?\s*(\d+(?:\.\d+)?)',  # - Proteínas: 25
        r'-\s*carbohidratos:?\s*(\d+(?:\.\d+)?)',  # - Carbohidratos: 30
        r'-\s*grasas:?\s*(\d+(?:\.\d+)?)'  # - Grasas: 10
    ]
    
    # Buscar proteínas en lista
    if data["proteins"] == 0:
        proteins_list_match = re.search(list_patterns[0], analysis_text, re.IGNORECASE)
        if proteins_list_match:
            try:
                data["proteins"] = float(proteins_list_match.group(1))
                print(f"Proteínas encontradas en lista: {data['proteins']}")
            except ValueError:
                pass
    
    # Buscar carbohidratos en lista
    if data["carbs"] == 0:
        carbs_list_match = re.search(list_patterns[1], analysis_text, re.IGNORECASE)
        if carbs_list_match:
            try:
                data["carbs"] = float(carbs_list_match.group(1))
                print(f"Carbohidratos encontrados en lista: {data['carbs']}")
            except ValueError:
                pass
    
    # Buscar grasas en lista
    if data["fats"] == 0:
        fats_list_match = re.search(list_patterns[2], analysis_text, re.IGNORECASE)
        if fats_list_match:
            try:
                data["fats"] = float(fats_list_match.group(1))
                print(f"Grasas encontradas en lista: {data['fats']}")
            except ValueError:
                pass

    print(f"Datos nutricionales extraídos finales: {data}")
    return data

def analyze_nutrition(food_description):
    """
    Analiza la información nutricional de alimentos utilizando GPT-4o
    
    Args:
        food_description: Descripción de los alimentos a analizar
        
    Returns:
        Análisis nutricional
    """
    try:
        # Crear el prompt para el análisis
        prompt = f"""
        Eres un nutricionista experto analizando la siguiente descripción de alimentos:
        
        {food_description}
        
        Por favor, proporciona:
        1. Análisis nutricional detallado (calorías, macronutrientes, micronutrientes)
        2. Beneficios para la salud
        3. Posibles riesgos o consideraciones
        4. Recomendaciones para una dieta balanceada
        """
        
        # Realizar la llamada a la API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Eres un asistente nutricional especializado en análisis de alimentos."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # Extraer y devolver la respuesta
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Error al analizar la nutrición: {str(e)}")
        return "No se pudo realizar el análisis nutricional. Por favor, consulte a un profesional de la nutrición."

def generate_health_recommendations(user_data, health_profile):
    """
    Genera recomendaciones de salud personalizadas utilizando GPT-4o
    
    Args:
        user_data: Datos del usuario
        health_profile: Perfil de salud del usuario
        
    Returns:
        Recomendaciones de salud personalizadas
    """
    try:
        # Crear el prompt para las recomendaciones
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
        2. Recomendaciones específicas para mejorar la salud
        3. Sugerencias de hábitos saludables
        4. Posibles áreas de preocupación que deberían ser monitoreadas
        """
        
        # Realizar la llamada a la API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Eres un asistente médico especializado en recomendaciones de salud personalizadas."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # Extraer y devolver la respuesta
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Error al generar recomendaciones de salud: {str(e)}")
        return "No se pudieron generar recomendaciones de salud. Por favor, consulte a un profesional de la salud." 