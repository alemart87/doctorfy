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

# Cargar variables de entorno
load_dotenv()

# Inicializar el cliente de Anthropic
try:
    # La inicialización es más simple con la biblioteca cliente
    # Asegúrate de que la versión de anthropic instalada sea compatible con httpx
    client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))
    print("Cliente Anthropic inicializado.")
except Exception as client_init_error:
    print(f"Error CRÍTICO al inicializar cliente Anthropic: {client_init_error}")
    # Manejar el error como en OpenAI
    client = None
    traceback.print_exc()

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

def analyze_medical_study_with_anthropic(image_path, study_type, patient_info=None):
    """Analiza un estudio médico usando Anthropic Claude"""
    if not client:
        return "Error: Cliente Anthropic no inicializado."
        
    try:
        # Verificar el tamaño de la imagen
        image_size_mb = os.path.getsize(image_path) / (1024 * 1024)
        print(f"Tamaño de la imagen original: {image_size_mb:.2f}MB")
        
        # Comprimir la imagen si es necesaria (siempre comprimir si es mayor a 4.5MB)
        if image_size_mb > 4.5:
            print(f"Imagen demasiado grande ({image_size_mb:.2f}MB), comprimiendo...")
            compressed_path = compress_image_for_anthropic(image_path)
            
            # Verificar que la compresión funcionó
            compressed_size_mb = os.path.getsize(compressed_path) / (1024 * 1024)
            if compressed_size_mb > 5:
                print(f"ADVERTENCIA: La imagen comprimida sigue siendo demasiado grande: {compressed_size_mb:.2f}MB")
                # Intentar una compresión más agresiva
                compressed_path = compress_image_for_anthropic(image_path, max_size_mb=4.0, min_quality=20)
                compressed_size_mb = os.path.getsize(compressed_path) / (1024 * 1024)
                
                if compressed_size_mb > 5:
                    return "Error: La imagen es demasiado grande y no se pudo comprimir lo suficiente. Por favor, intenta con una imagen más pequeña o de menor resolución."
            
            image_path = compressed_path
            print(f"Usando imagen comprimida: {image_path} ({compressed_size_mb:.2f}MB)")
        
        # Leer la imagen
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
        base64_image = base64.b64encode(image_data).decode("utf-8")
        
        # Determinar el tipo MIME
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type or not mime_type.startswith('image/'):
            mime_type = 'image/jpeg'
        
        # Crear el mensaje para Anthropic
        messages = [{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"Eres un médico experto analizando este estudio médico de tipo {study_type}. Proporciona un análisis detallado, posibles diagnósticos y recomendaciones."
                },
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": mime_type,
                        "data": base64_image
                    }
                }
            ]
        }]
        
        # Si hay información del paciente, añadirla
        if patient_info:
            messages[0]["content"][0]["text"] += f"\n\nInformación del paciente: {patient_info}"
        
        # Definir el modelo a usar
        model = "claude-3-5-sonnet-20240620"
        print(f"Llamando a Anthropic API con modelo {model}...")
        
        # Hacer la llamada a la API con manejo de errores mejorado
        try:
            response = client.messages.create(
                model=model,
                max_tokens=4000,
                temperature=0.2,
                messages=messages
            )
            print("Respuesta recibida de Anthropic.")
            
            # Extraer el contenido del mensaje de respuesta
            if response.content and isinstance(response.content, list) and len(response.content) > 0:
                analysis = response.content[0].text
                return analysis
            else:
                print(f"Respuesta inesperada: {response}")
                return "Error: Formato de respuesta inesperado de Anthropic."
                
        except anthropic.RateLimitError as rate_error:
            print(f"Error de límite de tasa en Anthropic: {rate_error}")
            return "Lo sentimos, el servicio de análisis está experimentando alta demanda. Por favor, intenta de nuevo en unos minutos."
        except anthropic.BadRequestError as bad_request:
            print(f"Error de solicitud incorrecta: {bad_request}")
            if "image exceeds 5 MB maximum" in str(bad_request):
                return "Error: La imagen es demasiado grande para ser procesada. Por favor, intenta con una imagen más pequeña."
            return f"Error en la solicitud: {str(bad_request)}"
        except anthropic.APIError as api_error:
            print(f"Error de API en Anthropic: {api_error}")
            return "Error en el servicio de análisis. Por favor, intenta de nuevo más tarde."
        except Exception as e:
            print(f"Error general en Anthropic: {e}")
            import traceback
            traceback.print_exc()
            return f"Error al analizar el estudio médico: {str(e)}"
            
    except Exception as e:
        print(f"Error general en analyze_medical_study_with_anthropic: {e}")
        import traceback
        traceback.print_exc()
        return f"Error al procesar la imagen: {str(e)}"

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
    Analiza una imagen de comida usando Anthropic Claude.
    """
    if not client:
        return "Error: Cliente Anthropic no inicializado."

    try:
        # Verificar el tamaño de la imagen
        image_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        print(f"Tamaño de la imagen de comida original: {image_size_mb:.2f}MB")
        
        # Comprimir la imagen si es necesaria
        if image_size_mb > 4.5:
            print(f"Imagen de comida demasiado grande ({image_size_mb:.2f}MB), comprimiendo...")
            compressed_path = compress_image_for_anthropic(file_path)
            
            # Verificar que la compresión funcionó
            compressed_size_mb = os.path.getsize(compressed_path) / (1024 * 1024)
            if compressed_size_mb > 5:
                print(f"ADVERTENCIA: La imagen comprimida sigue siendo demasiado grande: {compressed_size_mb:.2f}MB")
                # Intentar una compresión más agresiva
                compressed_path = compress_image_for_anthropic(file_path, max_size_mb=4.0, min_quality=20)
                compressed_size_mb = os.path.getsize(compressed_path) / (1024 * 1024)
                
                if compressed_size_mb > 5:
                    return """
                    # Análisis Nutricional
                    ## Error
                    La imagen es demasiado grande y no se pudo comprimir lo suficiente. Por favor, intenta con una imagen más pequeña o de menor resolución.
                    """
            
            file_path = compressed_path
            print(f"Usando imagen comprimida: {file_path} ({compressed_size_mb:.2f}MB)")
        
        # Cargar la imagen
        with open(file_path, "rb") as image_file:
            image_data = image_file.read()
        base64_image = base64.b64encode(image_data).decode("utf-8")

        # Determinar el tipo MIME
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type or not mime_type.startswith('image/'):
            mime_type = 'image/jpeg'

        # Definir el modelo a usar
        model = "claude-3-5-sonnet-20240620"
        
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
                        "data": base64_image
                    }
                }
            ]
        }]

        # Llamar a la API de Anthropic con manejo de errores mejorado
        print(f"Llamando a Anthropic API con modelo {model}...")
        try:
            response = client.messages.create(
                model=model,
                max_tokens=4000,
                messages=messages
            )
            print("Respuesta recibida de Anthropic.")
            
            # Extraer el contenido del mensaje de respuesta
            if response.content and isinstance(response.content, list) and len(response.content) > 0:
                analysis = response.content[0].text
                return analysis
            else:
                print(f"Respuesta inesperada: {response}")
                return """
                # Análisis Nutricional
                ## Error
                Formato de respuesta inesperado de Anthropic.
                """
                
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
            print(f"Error general en Anthropic: {e}")
            import traceback
            traceback.print_exc()
            return f"""
            # Análisis Nutricional
            ## Error
            Error al analizar la imagen: {str(e)}
            """

    except Exception as e:
        print(f"Error en analyze_food_image_with_anthropic: {str(e)}")
        traceback.print_exc()
        return """
        # Análisis Nutricional
        ## Error
        No se pudo analizar la imagen debido a un error. Por favor, inténtelo de nuevo más tarde.
        ## Información Nutricional
        - Calorías: No disponible
        - Proteínas: No disponible
        - Carbohidratos: No disponible
        - Grasas: No disponible
        """ 