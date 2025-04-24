import os
import base64
import json
from openai import OpenAI # Importar el cliente oficial
from dotenv import load_dotenv
import fitz # PyMuPDF
import mimetypes
import traceback
import re # Para extraer datos nutricionales

# Cargar variables de entorno
load_dotenv()

# Inicializar el cliente de OpenAI
try:
    # La inicialización es más simple con la biblioteca cliente
    client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    print("Cliente OpenAI inicializado.")
except Exception as client_init_error:
    print(f"Error CRÍTICO al inicializar cliente OpenAI: {client_init_error}")
    # Si falla aquí, las funciones que usan 'client' fallarán.
    # Podrías lanzar una excepción o asignar None y verificarlo en cada función.
    client = None
    traceback.print_exc()


# --- Funciones Principales (Restauradas para usar el cliente OpenAI) ---

def analyze_medical_study(file_path, study_type):
    """
    Analiza un estudio médico usando el cliente OpenAI.
    """
    if not client:
        return {"success": False, "error": "Cliente OpenAI no inicializado.", "provider": "openai"}

    try:
        is_pdf = file_path.lower().endswith('.pdf')
        messages = []
        model = "gpt-4o" # Usar gpt-4o que maneja texto e imágenes

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
            except FileNotFoundError:
                 print(f"Error: Archivo de imagen no encontrado en {file_path}")
                 raise
            except Exception as img_err:
                 print(f"Error al procesar la imagen: {img_err}")
                 raise

        print(f"Llamando a OpenAI API con modelo {model}...")
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=8000 # Ajustar según necesidad
        )
        print("Respuesta recibida de OpenAI.")

        analysis = response.choices[0].message.content
        return {
            "success": True,
            "analysis": analysis,
            "provider": "openai"
        }

    except Exception as e:
        print(f"Error en analyze_medical_study (OpenAI Client): {str(e)}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "provider": "openai"
        }

def analyze_food_image_from_base64(base64_image):
    """
    Analiza una imagen de comida en base64 usando el cliente OpenAI.
    """
    if not client:
        return "Error: Cliente OpenAI no inicializado."

    try:
        # Modificar el prompt para ser más específico y evitar rechazos
        messages = [
            {"role": "system", "content": "Eres un asistente nutricional que analiza imágenes de alimentos para proporcionar información nutricional aproximada. Tu objetivo es ayudar a los usuarios a entender mejor el contenido nutricional de sus comidas."},
            {"role": "user", "content": [
                {"type": "text", "text": "Esta es una imagen de mi comida. Por favor, proporciona la siguiente información:\n1. Identificación de los alimentos visibles\n2. Estimación aproximada de calorías (si es posible)\n3. Estimación aproximada de macronutrientes: proteínas, carbohidratos y grasas (en gramos)\n4. Valoración general de la comida desde una perspectiva nutricional\n5. Sugerencias para mejorar el balance nutricional\n\nSi no puedes identificar claramente la comida, simplemente describe lo que ves e indica que no puedes proporcionar un análisis nutricional preciso."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]}
        ]

        print("Llamando a OpenAI API para análisis de comida (base64)...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3,  # Reducir la temperatura para respuestas más consistentes
            max_tokens=8000
        )
        print("Respuesta recibida de OpenAI.")
        analysis = response.choices[0].message.content
        
        # Verificar si la respuesta contiene un rechazo
        if "no puedo ayudar con esa solicitud" in analysis.lower() or "no puedo analizar" in analysis.lower():
            print("OpenAI rechazó la solicitud. Intentando con un prompt alternativo...")
            
            # Intentar con un prompt alternativo más simple
            alt_messages = [
                {"role": "system", "content": "Eres un asistente que describe imágenes de alimentos."},
                {"role": "user", "content": [
                    {"type": "text", "text": "¿Qué alimentos ves en esta imagen? Por favor, describe los ingredientes visibles."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]}
            ]
            
            alt_response = client.chat.completions.create(
                model="gpt-4o",
                messages=alt_messages,
                temperature=0.3,
                max_tokens=8000
            )
            
            food_description = alt_response.choices[0].message.content
            
            # Usar la descripción para generar un análisis nutricional
            nutrition_messages = [
                {"role": "system", "content": "Eres un nutricionista que proporciona información nutricional aproximada basada en descripciones de alimentos."},
                {"role": "user", "content": f"Basado en esta descripción de alimentos: '{food_description}', proporciona un análisis nutricional aproximado incluyendo:\n1. Calorías estimadas\n2. Proteínas (g)\n3. Carbohidratos (g)\n4. Grasas (g)\n5. Valoración nutricional general\n6. Sugerencias para mejorar"}
            ]
            
            nutrition_response = client.chat.completions.create(
                model="gpt-4o",
                messages=nutrition_messages,
                temperature=0.3,
                max_tokens=8000
            )
            
            analysis = f"# Análisis Nutricional\n\n## Alimentos Identificados\n{food_description}\n\n## Información Nutricional\n{nutrition_response.choices[0].message.content}"
            print("Análisis generado con enfoque alternativo.")
        
        return analysis

    except Exception as e:
        print(f"Error en analyze_food_image_from_base64 (OpenAI Client): {str(e)}")
        traceback.print_exc()
        return """
        # Análisis Nutricional
        ## Error
        No se pudo analizar la imagen debido a un error interno con el cliente OpenAI. Por favor, inténtelo de nuevo más tarde.
        ## Información Nutricional
        - Calorías: No disponible
        - Proteínas: No disponible
        - Carbohidratos: No disponible
        - Grasas: No disponible
        """

def analyze_food_image(file_path):
    """
    Analiza una imagen de comida desde un archivo usando el cliente OpenAI.
    """
    try:
        print(f"=== Iniciando análisis de imagen (Ruta original: {file_path}) ===")
        with open(file_path, "rb") as image_file:
            image_data = image_file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        print(f"Imagen codificada, longitud base64: {len(base64_image)}")

        return analyze_food_image_from_base64(base64_image)

    except FileNotFoundError:
        print(f"Error: Archivo no encontrado en {file_path}")
        return "Error: Archivo de imagen no encontrado."
    except Exception as e:
        print(f"Error general en analyze_food_image (OpenAI Client): {str(e)}")
        traceback.print_exc()
        return "Error al procesar la imagen."

def extract_nutrition_data(analysis_text):
    """
    Extrae datos nutricionales estructurados del texto de análisis.
    (Sin cambios, opera sobre texto)
    """
    data = {"calories": 0, "proteins": 0, "carbs": 0, "fats": 0}
    if not analysis_text or not isinstance(analysis_text, str):
        print("Texto de análisis inválido para extracción.")
        return data

    print(f"Extrayendo datos de: {analysis_text[:200]}...")

    # (Patrones Regex se mantienen igual)
    cal_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:kcal|calorías|cal)\b',
        r'(?:calorías|energía|valor energético):\s*(\d+(?:\.\d+)?)',
        r'aproximadamente\s*(\d+(?:\.\d+)?)\s*calorías',
        r'calorías\s*totales:\s*(\d+(?:\.\d+)?)'
    ]
    for pattern in cal_patterns:
        cal_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if cal_match:
            try: data["calories"] = float(cal_match.group(1)); print(f"Calorías: {data['calories']}"); break
            except ValueError: pass

    protein_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*proteínas?\b',
        r'proteínas?:\s*(\d+(?:\.\d+)?)\s*g',
        r'proteínas?[^\d]*?(\d+(?:\.\d+)?)\s*g',
        r'contenido\s*de\s*proteínas?:\s*(\d+(?:\.\d+)?)',
        r'proteínas?[^:]*?:\s*(\d+(?:\.\d+)?)',
        r'proteínas?[^\.]*?(\d+(?:\.\d+)?)\s*gramos'
    ]
    for pattern in protein_patterns:
        protein_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if protein_match:
            try: data["proteins"] = float(protein_match.group(1)); print(f"Proteínas: {data['proteins']}"); break
            except ValueError: pass

    carbs_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*(?:carbohidratos?|hidratos\s*de\s*carbono|carbs?)\b',
        r'(?:carbohidratos?|hidratos|carbs?):\s*(\d+(?:\.\d+)?)\s*g',
        r'(?:carbohidratos?|hidratos|carbs?)[^\d]*?(\d+(?:\.\d+)?)\s*g',
        r'contenido\s*de\s*(?:carbohidratos?|hidratos):\s*(\d+(?:\.\d+)?)',
        r'(?:carbohidratos?|hidratos|carbs?)[^:]*?:\s*(\d+(?:\.\d+)?)',
        r'(?:carbohidratos?|hidratos|carbs?)[^\.]*?(\d+(?:\.\d+)?)\s*gramos'
    ]
    for pattern in carbs_patterns:
        carbs_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if carbs_match:
            try: data["carbs"] = float(carbs_match.group(1)); print(f"Carbohidratos: {data['carbs']}"); break
            except ValueError: pass

    fats_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*(?:de)?\s*(?:grasas|lípidos|fat)\b',
        r'(?:grasas|lípidos|fat):\s*(\d+(?:\.\d+)?)\s*g',
        r'(?:grasas|lípidos|fat)[^\d]*?(\d+(?:\.\d+)?)\s*g',
        r'contenido\s*de\s*(?:grasas|lípidos):\s*(\d+(?:\.\d+)?)',
        r'(?:grasas|lípidos)[^:]*?:\s*(\d+(?:\.\d+)?)',
        r'(?:grasas|lípidos)[^\.]*?(\d+(?:\.\d+)?)\s*gramos',
        r'grasas\s+totales:\s*(\d+(?:\.\d+)?)'
    ]
    for pattern in fats_patterns:
        fats_match = re.search(pattern, analysis_text, re.IGNORECASE)
        if fats_match:
            try: data["fats"] = float(fats_match.group(1)); print(f"Grasas: {data['fats']}"); break
            except ValueError: pass

    # Fallback tabla/lista (se mantiene)
    table_patterns = [r'proteínas\s*\|\s*(\d+(?:\.\d+)?)', r'carbohidratos\s*\|\s*(\d+(?:\.\d+)?)', r'grasas\s*\|\s*(\d+(?:\.\d+)?)']
    list_patterns = [r'-\s*proteínas:?\s*(\d+(?:\.\d+)?)', r'-\s*carbohidratos:?\s*(\d+(?:\.\d+)?)', r'-\s*grasas:?\s*(\d+(?:\.\d+)?)']

    if data["proteins"] == 0:
        match = re.search(table_patterns[0], analysis_text, re.IGNORECASE) or re.search(list_patterns[0], analysis_text, re.IGNORECASE)
        if match:
            try:
                data["proteins"] = float(match.group(1))
                print(f"Proteínas (fallback): {data['proteins']}")
            except ValueError:
                pass # Ignorar si el valor no es un número válido
    if data["carbs"] == 0:
        match = re.search(table_patterns[1], analysis_text, re.IGNORECASE) or re.search(list_patterns[1], analysis_text, re.IGNORECASE)
        if match:
            try:
                data["carbs"] = float(match.group(1))
                print(f"Carbohidratos (fallback): {data['carbs']}")
            except ValueError:
                pass # Ignorar si el valor no es un número válido
    if data["fats"] == 0:
        match = re.search(table_patterns[2], analysis_text, re.IGNORECASE) or re.search(list_patterns[2], analysis_text, re.IGNORECASE)
        if match:
            try:
                data["fats"] = float(match.group(1))
                print(f"Grasas (fallback): {data['fats']}")
            except ValueError:
                pass # Ignorar si el valor no es un número válido

    print(f"Datos nutricionales extraídos finales: {data}")
    return data

def analyze_nutrition(food_description):
    """
    Analiza la información nutricional usando el cliente OpenAI.
    """
    if not client:
        return "Error: Cliente OpenAI no inicializado."

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

        print("Llamando a OpenAI API para análisis nutricional...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Eres un asistente nutricional especializado en análisis de alimentos."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=8000
        )
        print("Respuesta recibida de OpenAI.")
        analysis = response.choices[0].message.content
        return analysis

    except Exception as e:
        print(f"Error en analyze_nutrition (OpenAI Client): {str(e)}")
        traceback.print_exc()
        return "No se pudo realizar el análisis nutricional. Por favor, consulte a un profesional de la nutrición."

def generate_health_recommendations(user_data, health_profile):
    """
    Genera recomendaciones de salud usando el cliente OpenAI.
    """
    if not client:
        return "Error: Cliente OpenAI no inicializado."

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

        print("Llamando a OpenAI API para recomendaciones de salud...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Eres un asistente médico especializado en recomendaciones de salud personalizadas."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=8000
        )
        print("Respuesta recibida de OpenAI.")
        recommendations = response.choices[0].message.content
        return recommendations

    except Exception as e:
        print(f"Error en generate_health_recommendations (OpenAI Client): {str(e)}")
        traceback.print_exc()
        return "No se pudieron generar recomendaciones de salud. Por favor, consulte a un profesional de la salud."

def chat_with_medical_ai(messages, user_profile=None, specialty="general"):
    """
    Mantiene una conversación con la IA médica.
    
    Args:
        messages: Lista de mensajes previos en formato [{role: "user/assistant", content: "mensaje"}]
        user_profile: Información del perfil del usuario para personalizar respuestas
        specialty: Especialidad médica para enfocar las respuestas ("general", "nutrition", "psychology", "clinical")
    
    Returns:
        Respuesta de la IA
    """
    if not client:
        return {"success": False, "error": "Cliente OpenAI no inicializado."}
    
    try:
        # Construir el prompt del sistema según la especialidad
        system_prompts = {
            "general": "Eres un asistente médico virtual de Doctorfy, una plataforma de salud digital. Proporciona información médica precisa y basada en evidencia. Recuerda que no reemplazas a un médico real y siempre debes recomendar consultar con profesionales de la salud para diagnósticos y tratamientos. Mantén un tono profesional pero amigable.",
            
            "nutrition": "Eres un nutricionista virtual de Doctorfy, especializado en nutrición y dietética. Proporciona consejos nutricionales basados en evidencia científica, recomendaciones de dietas saludables y orientación sobre hábitos alimenticios. Evita dar consejos extremos y recuerda recomendar consultar con profesionales para planes personalizados.",
            
            "psychology": "Eres un psicólogo virtual de Doctorfy. Ofrece apoyo emocional, técnicas de manejo del estrés y consejos para el bienestar mental. No diagnostiques trastornos mentales y recomienda buscar ayuda profesional para problemas serios. Mantén un tono empático y comprensivo.",
            
            "clinical": "Eres un médico clínico virtual de Doctorfy. Proporciona información sobre síntomas, condiciones médicas y procedimientos clínicos. Explica conceptos médicos en términos comprensibles. Recuerda que no puedes diagnosticar y siempre debes recomendar consultar con un médico real."
        }
        
        # Obtener el prompt adecuado o usar el general por defecto
        system_prompt = system_prompts.get(specialty.lower(), system_prompts["general"])
        
        # Añadir información del perfil del usuario si está disponible
        if user_profile:
            profile_info = f"""
            Información del paciente:
            - Edad: {user_profile.get('age', 'No disponible')}
            - Género: {user_profile.get('gender', 'No disponible')}
            - Altura: {user_profile.get('height', 'No disponible')} cm
            - Peso: {user_profile.get('weight', 'No disponible')} kg
            - Condiciones médicas: {user_profile.get('medical_conditions', 'Ninguna reportada')}
            - Alergias: {user_profile.get('allergies', 'Ninguna reportada')}
            
            Adapta tus respuestas considerando esta información del paciente.
            """
            system_prompt += profile_info
        
        # Construir la lista completa de mensajes
        full_messages = [{"role": "system", "content": system_prompt}]
        
        # Añadir el historial de conversación
        for message in messages:
            if message["role"] in ["user", "assistant"]:
                full_messages.append(message)
        
        # Llamar a la API de OpenAI
        print(f"Llamando a OpenAI API para chat médico (especialidad: {specialty})...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=full_messages,
            temperature=0.7,
            max_tokens=2000
        )
        
        ai_response = response.choices[0].message.content
        
        return {
            "success": True,
            "response": ai_response,
            "specialty": specialty
        }
        
    except Exception as e:
        print(f"Error en chat_with_medical_ai: {str(e)}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        } 