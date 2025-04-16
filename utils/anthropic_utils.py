import os
import base64
import json
import anthropic # Importar el cliente oficial
import imghdr
from flask import current_app
from PIL import Image
import io
import tempfile
from dotenv import load_dotenv
import fitz  # PyMuPDF
import mimetypes # Para detectar el tipo de imagen
import traceback
import time # Importar time para los reintentos
from utils.image_utils import compress_image, get_mime_type, get_image_size_mb, resize_image_if_needed

# Cargar variables de entorno
load_dotenv()

# Variable global para el cliente de Anthropic (opcional, pero puede ser eficiente)
client = None

def get_anthropic_client():
    """Obtiene o inicializa el cliente de Anthropic."""
    global client
    if client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            current_app.logger.error("ANTHROPIC_API_KEY no está configurada.")
            raise ValueError("La clave API de Anthropic no está configurada.")
        client = anthropic.Anthropic(api_key=api_key)
        current_app.logger.info("Cliente de Anthropic inicializado.")
    return client

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01" # Versión de la API de Anthropic
MAX_RETRIES = 3 # Número máximo de reintentos
INITIAL_BACKOFF = 1 # Tiempo inicial de espera en segundos

def extract_text_from_pdf(pdf_path):
    """
    Extrae texto de un archivo PDF
    """
    try:
        text = ""
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error al extraer texto del PDF: {str(e)}")
        return None # Devolver None para indicar error

def compress_image_for_anthropic(image_path, max_size_mb=4.5, min_quality=30):
    """
    Comprime una imagen para que sea menor que el límite de Anthropic (5MB)
    Utiliza una estrategia progresiva de compresión y redimensionamiento
    """
    try:
        print(f"Comprimiendo imagen: {image_path}")
        print(f"Tamaño original: {os.path.getsize(image_path) / (1024 * 1024):.2f}MB")
        
        # Abrir la imagen
        img = Image.open(image_path)
        original_format = img.format
        
        # Convertir a RGB si es necesario (para imágenes PNG con transparencia)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = background
        
        # Calcular el tamaño máximo en bytes
        max_size_bytes = max_size_mb * 1024 * 1024
        
        # Estrategia 1: Redimensionar primero si la imagen es muy grande
        max_dimension = 2000
        if max(img.size) > max_dimension:
            ratio = max_dimension / max(img.size)
            new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
            img = img.resize(new_size, Image.LANCZOS)
            print(f"Imagen redimensionada a {new_size}")
        
        # Estrategia 2: Comprimir con calidad progresivamente menor
        quality = 95
        compressed = False
        
        while quality >= min_quality:
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=quality, optimize=True)
            buffer_size = buffer.tell()
            
            if buffer_size <= max_size_bytes:
                compressed = True
                break
                
            quality -= 5
            print(f"Intentando con calidad: {quality}, tamaño actual: {buffer_size / (1024 * 1024):.2f}MB")
        
        # Estrategia 3: Si la compresión no es suficiente, redimensionar progresivamente
        if not compressed:
            scale_factor = 0.9
            current_img = img
            
            while scale_factor > 0.3:
                new_size = (int(current_img.size[0] * scale_factor), int(current_img.size[1] * scale_factor))
                current_img = img.resize(new_size, Image.LANCZOS)
                
                buffer = io.BytesIO()
                current_img.save(buffer, format="JPEG", quality=quality, optimize=True)
                buffer_size = buffer.tell()
                
                if buffer_size <= max_size_bytes:
                    img = current_img
                    compressed = True
                    print(f"Imagen redimensionada a {new_size} con factor {scale_factor}")
                    break
                    
                scale_factor -= 0.1
                print(f"Intentando con factor de escala: {scale_factor}, tamaño actual: {buffer_size / (1024 * 1024):.2f}MB")
        
        # Si ninguna estrategia funcionó, usar la compresión más agresiva
        if not compressed:
            print("Aplicando compresión extrema...")
            buffer = io.BytesIO()
            img = img.resize((800, int(800 * img.size[1] / img.size[0])), Image.LANCZOS)
            img.save(buffer, format="JPEG", quality=min_quality, optimize=True)
        
        # Guardar la imagen comprimida
        buffer.seek(0)
        compressed_path = f"{os.path.splitext(image_path)[0]}_compressed.jpg"
        with open(compressed_path, 'wb') as f:
            f.write(buffer.getvalue())
            
        compressed_size = os.path.getsize(compressed_path) / (1024 * 1024)
        print(f"Imagen comprimida guardada en: {compressed_path}")
        print(f"Tamaño final: {compressed_size:.2f}MB (reducción del {(1 - compressed_size / (os.path.getsize(image_path) / (1024 * 1024))) * 100:.1f}%)")
        
        return compressed_path
    except Exception as e:
        print(f"Error al comprimir imagen: {e}")
        import traceback
        traceback.print_exc()
        return image_path  # Devolver la original en caso de error

async def analyze_medical_study_with_anthropic(file_path, study_type="general", user_info=None):
    """
    Analiza un estudio médico (imagen) usando la API de Anthropic Claude 3.5 Sonnet.

    Args:
        file_path (str): Ruta al archivo de imagen del estudio.
        study_type (str): Tipo de estudio (ej. 'radiografía de tórax', 'resonancia magnética').
        user_info (dict, optional): Información adicional del usuario/paciente.

    Returns:
        str: La interpretación generada por la IA, o None si ocurre un error.
    """
    try:
        anthropic_client = get_anthropic_client() # Usar la función para obtener el cliente

        if not os.path.exists(file_path):
            current_app.logger.error(f"El archivo no existe en la ruta: {file_path}")
            return None # Devolver None si el archivo no existe

        current_app.logger.info(f"Analizando archivo: {file_path}")
        current_app.logger.info(f"Tamaño original: {get_image_size_mb(file_path):.2f}MB")

        # Redimensionar imagen si es necesario
        resized_path = resize_image_if_needed(file_path)
        if resized_path:
            current_app.logger.info(f"Imagen redimensionada a: {resized_path}")
            current_app.logger.info(f"Tamaño redimensionado: {get_image_size_mb(resized_path):.2f}MB")
            analysis_path = resized_path
        else:
            analysis_path = file_path # Usar original si no se redimensionó

        # Leer la imagen y codificarla en base64
        with open(analysis_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")

        # Determinar el media type
        media_type = mimetypes.guess_type(analysis_path)[0]
        if not media_type:
            # Asumir un tipo por defecto si no se puede adivinar
            media_type = "image/jpeg"
            current_app.logger.warning(f"No se pudo determinar el media type para {analysis_path}, asumiendo {media_type}")

        # Construir el prompt
        prompt_parts = [
            f"Por favor, analiza la siguiente imagen de un estudio médico ({study_type}).",
            "Actúa como un radiólogo experto o especialista relevante para el tipo de estudio.",
            "Proporciona una interpretación detallada, incluyendo hallazgos clave, posibles diagnósticos diferenciales y recomendaciones si aplica.",
            "Formatea la respuesta en Markdown claro y estructurado."
        ]
        
        # Verificar que user_info sea un diccionario antes de usarlo
        if user_info and isinstance(user_info, dict):
            prompt_parts.append("\nInformación adicional del paciente:")
            if user_info.get('age'):
                prompt_parts.append(f"- Edad: {user_info['age']}")
            if user_info.get('gender'):
                prompt_parts.append(f"- Género: {user_info['gender']}")
            if user_info.get('symptoms'):
                prompt_parts.append(f"- Síntomas/Motivo del estudio: {user_info['symptoms']}")
        elif user_info and isinstance(user_info, str):
            # Si es un string, simplemente añadirlo como información adicional
            prompt_parts.append(f"\nInformación adicional: {user_info}")

        prompt = "\n".join(prompt_parts)

        current_app.logger.info(f"Llamando a Anthropic API con modelo claude-3-5-sonnet-20240620...")
        
        # Imprimir información de depuración
        current_app.logger.info(f"Tipo MIME: {media_type}")
        current_app.logger.info(f"Tamaño de la imagen en base64: {len(image_data)} caracteres")
        current_app.logger.info(f"Prompt: {prompt[:100]}...")

        try:
            message = anthropic_client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=2048,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": image_data,
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ],
                    }
                ],
            )

            current_app.logger.info("Respuesta recibida de Anthropic.")

            # Extraer el texto de la respuesta
            interpretation_text = ""
            if message.content and isinstance(message.content, list):
                for block in message.content:
                    if block.type == 'text':
                        interpretation_text += block.text

            if not interpretation_text:
                current_app.logger.warning("La respuesta de Anthropic no contenía texto interpretable.")
                return None # Devolver None si no hay texto

            # --- Asegúrate de devolver el texto ---
            current_app.logger.info("Interpretación generada exitosamente.")
            return interpretation_text.strip()
            
        except anthropic.APIStatusError as e:
            current_app.logger.error(f"Error de estado de Anthropic API: status_code={e.status_code}, response={e.response}")
            # Intentar obtener más detalles del error
            error_details = None
            try:
                error_details = e.response.json()
                current_app.logger.error(f"Detalles del error: {error_details}")
            except:
                current_app.logger.error("No se pudieron obtener detalles adicionales del error")
            
            # Intentar con un modelo diferente como fallback
            if e.status_code == 400:
                current_app.logger.info("Intentando con modelo alternativo claude-3-haiku-20240307...")
                try:
                    message = anthropic_client.messages.create(
                        model="claude-3-haiku-20240307",  # Modelo más ligero
                        max_tokens=2048,
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "image",
                                        "source": {
                                            "type": "base64",
                                            "media_type": media_type,
                                            "data": image_data,
                                        },
                                    },
                                    {
                                        "type": "text",
                                        "text": prompt
                                    }
                                ],
                            }
                        ],
                    )
                    
                    current_app.logger.info("Respuesta recibida del modelo alternativo.")
                    
                    # Extraer el texto de la respuesta
                    interpretation_text = ""
                    if message.content and isinstance(message.content, list):
                        for block in message.content:
                            if block.type == 'text':
                                interpretation_text += block.text
                    
                    if interpretation_text:
                        current_app.logger.info("Interpretación generada exitosamente con modelo alternativo.")
                        return interpretation_text.strip()
                except Exception as fallback_error:
                    current_app.logger.error(f"Error con modelo alternativo: {fallback_error}")
            
            return None

    except anthropic.APIConnectionError as e:
        current_app.logger.error(f"Error de conexión con Anthropic API: {e}")
        return None
    except anthropic.RateLimitError as e:
        current_app.logger.error(f"Error de límite de tasa con Anthropic API: {e}")
        return None
    except Exception as e:
        current_app.logger.error(f"Error inesperado durante el análisis con Anthropic: {str(e)}")
        import traceback
        current_app.logger.error(traceback.format_exc())
        return None
    finally:
        # Opcional: Eliminar el archivo redimensionado si se creó uno temporal
        if 'resized_path' in locals() and resized_path and resized_path != file_path and os.path.exists(resized_path):
             try:
                 os.remove(resized_path)
                 current_app.logger.info(f"Archivo redimensionado temporal eliminado: {resized_path}")
             except OSError as e:
                 current_app.logger.error(f"Error al eliminar archivo temporal {resized_path}: {e}")

def extract_from_pdf(file_path):
    """
    Extrae texto e imágenes de un archivo PDF
    
    Args:
        file_path (str): Ruta al archivo PDF
        
    Returns:
        dict: Diccionario con texto e imágenes extraídas
    """
    result = {"text": "", "images": []}
    
    try:
        # Abrir el PDF
        doc = fitz.open(file_path)
        
        # Extraer texto
        text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
        
        result["text"] = text
        
        # Extraer imágenes (máximo 5 para no exceder límites de API)
        image_count = 0
        for page_num in range(len(doc)):
            if image_count >= 5:
                break
                
            page = doc.load_page(page_num)
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list):
                if image_count >= 5:
                    break
                    
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                
                # Convertir bytes a base64
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                result["images"].append(image_base64)
                image_count += 1
        
        return result
        
    except Exception as e:
        print(f"Error al extraer contenido del PDF: {str(e)}")
        return {"text": f"Error al procesar el PDF: {str(e)}", "images": []}

def encode_image_to_base64(image_path):
    """
    Convierte una imagen a base64
    
    Args:
        image_path (str): Ruta a la imagen
        
    Returns:
        str: Imagen codificada en base64
    """
    try:
        # Si es una imagen PNG, convertirla a JPEG para mayor compatibilidad
        file_extension = os.path.splitext(image_path)[1].lower()
        
        if file_extension == '.png':
            try:
                # Intentar convertir PNG a JPEG
                print(f"Convirtiendo PNG a JPEG para mayor compatibilidad: {image_path}")
                with Image.open(image_path) as img:
                    # Crear un archivo temporal para la imagen JPEG
                    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                        temp_path = temp_file.name
                        # Convertir a RGB (por si es RGBA) y guardar como JPEG
                        img = img.convert('RGB')
                        img.save(temp_path, format='JPEG', quality=95)
                
                # Leer la imagen JPEG convertida
                with open(temp_path, "rb") as image_file:
                    base64_data = base64.b64encode(image_file.read()).decode('utf-8')
                
                # Eliminar el archivo temporal
                os.unlink(temp_path)
                
                return base64_data
            except Exception as convert_error:
                print(f"Error al convertir PNG a JPEG: {str(convert_error)}. Usando PNG original.")
                # Si falla la conversión, continuar con el PNG original
        
        # Leer la imagen original
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        print(f"Error al codificar imagen: {str(e)}")
        return ""

def analyze_medical_study_with_openai(image_path, study_type):
    """
    Analiza un estudio médico usando OpenAI Vision como respaldo
    """
    try:
        print(f"Iniciando análisis de estudio médico con OpenAI: {image_path}, tipo: {study_type}")
        
        # Verificar si el archivo existe
        if not os.path.exists(image_path):
            print(f"ERROR: El archivo no existe: {image_path}")
            return "No se pudo analizar el estudio médico. El archivo no existe."
        
        # Cargar la imagen como base64
        print(f"Cargando imagen desde: {image_path}")
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        print(f"Imagen cargada y codificada en base64 (primeros 50 caracteres): {base64_image[:50]}...")
        
        # Crear un prompt específico según el tipo de estudio
        system_content = ""
        user_text = ""
        
        if study_type == "xray":
            system_content = """Eres un radiólogo experimentado que ayuda a estudiantes de medicina a interpretar radiografías. 
            Proporciona análisis educativos, detallados y accesibles, explicando las estructuras anatómicas visibles, 
            posibles hallazgos anormales y diagnósticos diferenciales. Incluye recomendaciones de seguimiento si es necesario."""
            
            user_text = """Por favor, analiza esta radiografía como si estuvieras enseñando a un estudiante de medicina:
            1) Identifica las estructuras anatómicas visibles
            2) Describe cualquier hallazgo normal o anormal
            3) Sugiere posibles diagnósticos diferenciales si hay anomalías
            4) Recomienda estudios adicionales si fueran necesarios
            5) Proporciona consejos educativos sobre cómo interpretar mejor este tipo de imagen"""
            
        elif study_type == "mri":
            system_content = """Eres un radiólogo especializado en resonancias magnéticas que ayuda a estudiantes de medicina.
            Proporciona análisis educativos, detallados y accesibles de las imágenes de RM, explicando las estructuras anatómicas,
            la intensidad de señal, posibles patologías y diagnósticos diferenciales."""
            
            user_text = """Por favor, analiza esta resonancia magnética como si estuvieras enseñando a un estudiante de medicina:
            1) Identifica las estructuras anatómicas visibles y su intensidad de señal
            2) Describe cualquier hallazgo normal o anormal
            3) Sugiere posibles diagnósticos diferenciales si hay anomalías
            4) Recomienda estudios adicionales si fueran necesarios
            5) Proporciona consejos educativos sobre cómo interpretar mejor este tipo de imagen"""
            
        elif study_type == "ct":
            system_content = """Eres un radiólogo especializado en tomografías computarizadas que ayuda a estudiantes de medicina.
            Proporciona análisis educativos, detallados y accesibles de las imágenes de TC, explicando las estructuras anatómicas,
            la densidad de los tejidos, posibles patologías y diagnósticos diferenciales."""
            
            user_text = """Por favor, analiza esta tomografía computarizada como si estuvieras enseñando a un estudiante de medicina:
            1) Identifica las estructuras anatómicas visibles y su densidad
            2) Describe cualquier hallazgo normal o anormal
            3) Sugiere posibles diagnósticos diferenciales si hay anomalías
            4) Recomienda estudios adicionales si fueran necesarios
            5) Proporciona consejos educativos sobre cómo interpretar mejor este tipo de imagen"""
            
        else:
            system_content = """Eres un médico especialista que ayuda a estudiantes de medicina a interpretar estudios médicos.
            Proporciona análisis educativos, detallados y accesibles, explicando lo que se observa en la imagen,
            posibles hallazgos y su relevancia clínica."""
            
            user_text = """Por favor, analiza este estudio médico como si estuvieras enseñando a un estudiante de medicina:
            1) Describe lo que se observa en la imagen
            2) Identifica cualquier hallazgo normal o anormal
            3) Explica la relevancia clínica de lo observado
            4) Sugiere posibles diagnósticos si es apropiado
            5) Proporciona consejos educativos sobre este tipo de estudio"""
        
        # Verificar la clave API
        from openai import OpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("ERROR: No se encontró la clave API de OpenAI en las variables de entorno")
            return "No se pudo analizar el estudio médico. Falta la configuración de la API."
        else:
            print(f"Clave API de OpenAI encontrada (primeros 5 caracteres): {api_key[:5]}...")
        
        # Inicializar el cliente de OpenAI
        client = OpenAI(api_key=api_key)
        
        # Llamar a la API de OpenAI
        print("Llamando a la API de OpenAI con modelo gpt-4o")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": system_content
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=8000
        )
        
        # Extraer la interpretación
        print("Respuesta recibida de OpenAI")
        interpretation = response.choices[0].message.content
        print(f"Interpretación (primeros 100 caracteres): {interpretation[:100]}...")
        
        return interpretation
    except Exception as e:
        print(f"ERROR en analyze_medical_study_with_openai: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"No se pudo analizar el estudio médico con OpenAI: {str(e)}"

def analyze_food_image_with_anthropic(file_path):
    """
    Analiza una imagen de alimentos usando la API de Anthropic Claude.
    
    Args:
        file_path (str): Ruta al archivo de imagen.
        
    Returns:
        str: Texto del análisis o mensaje de error.
    """
    try:
        # Verificar que el archivo exista
        if not os.path.exists(file_path):
            print(f"El archivo no existe: {file_path}")
            return "Error: El archivo no existe"
        
        # Obtener el cliente de Anthropic
        client = get_anthropic_client()
        
        # Leer la imagen y codificarla en base64
        with open(file_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")

        # Determinar el tipo MIME
        mime_type = get_mime_type(file_path)

        # Crear el mensaje para Anthropic
        messages = [{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Eres un nutricionista experto. Analiza esta imagen de comida y proporciona la siguiente información:\n1. Identificación de los alimentos\n2. Calorías aproximadas\n3. Macronutrientes (proteínas, carbohidratos, grasas)\n4. Valoración nutricional\n5. Recomendaciones\n\nFormatea la respuesta de manera clara y estructurada."
                },
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": mime_type,
                        "data": image_data
                    }
                }
            ]
        }]

        # Llamar a la API de Anthropic
        print(f"Llamando a Anthropic API con modelo claude-3-5-sonnet-20240620...")
        try:
            response = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=4000,
                messages=messages
            )
            print("Respuesta recibida de Anthropic.")
            return response.content[0].text
        except anthropic.RateLimitError as rate_error:
            print(f"Error de límite de tasa en Anthropic: {rate_error}")
            return """
            # Análisis Nutricional
            ## Error
            El servicio está experimentando alta demanda. Por favor, intenta de nuevo en unos minutos.
            """
        except anthropic.BadRequestError as bad_request:
            print(f"Error de solicitud incorrecta: {bad_request}")
            if "image exceeds 5 MB maximum" in str(bad_request):
                return """
                # Análisis Nutricional
                ## Error
                La imagen es demasiado grande para ser procesada. Por favor, intenta con una imagen más pequeña.
                """
            return f"""
            # Análisis Nutricional
            ## Error
            Error en la solicitud: {str(bad_request)}
            """
        except anthropic.APIError as api_error:
            print(f"Error de API en Anthropic: {api_error}")
            return """
            # Análisis Nutricional
            ## Error
            Error en el servicio de análisis. Por favor, intenta de nuevo más tarde.
            """
        except Exception as e:
            print(f"Error general en Anthropic: {e}", exc_info=True)
            return f"""
            # Análisis Nutricional
            ## Error
            Error al analizar la imagen: {str(e)}
            """

    except Exception as e:
        print(f"Error en analyze_food_image_with_anthropic: {str(e)}", exc_info=True)
        return """
        # Análisis Nutricional
        ## Error
        No se pudo analizar la imagen debido a un error. Por favor, inténtelo de nuevo más tarde.
        """ 