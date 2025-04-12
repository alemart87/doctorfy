import os
import base64
import json
import requests  # Usar requests para llamadas HTTP
import imghdr
from flask import current_app
from PIL import Image
import io
import tempfile
from dotenv import load_dotenv
import fitz  # PyMuPDF
import mimetypes # Para detectar el tipo de imagen

# Cargar variables de entorno
load_dotenv()

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01" # Versión de la API de Anthropic

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

def analyze_medical_study_with_anthropic(file_path, study_type):
    """
    Analiza un estudio médico usando la API de Anthropic Claude directamente.
    """
    if not ANTHROPIC_API_KEY:
        print("Error: ANTHROPIC_API_KEY no está configurada.")
        return {
            "success": False,
            "error": "API Key de Anthropic no configurada.",
            "provider": "anthropic"
        }

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json"
    }

    try:
        is_pdf = file_path.lower().endswith('.pdf')
        messages = []

        if is_pdf:
            text_content = extract_text_from_pdf(file_path)
            if text_content is None:
                 raise ValueError("No se pudo extraer texto del PDF.")

            messages.append({
                "role": "user",
                "content": f"Eres un asistente médico especializado en análisis de estudios {study_type}. Analiza el siguiente texto extraído de un estudio médico y proporciona un análisis detallado y recomendaciones:\n\n{text_content}"
            })
        else:
            # Manejar imágenes
            try:
                with open(file_path, "rb") as image_file:
                    image_data = image_file.read()
                base64_image = base64.b64encode(image_data).decode("utf-8")

                # Detectar media type
                mime_type, _ = mimetypes.guess_type(file_path)
                if not mime_type or not mime_type.startswith('image/'):
                    mime_type = 'image/jpeg' # Usar jpeg como default si no se detecta
                    print(f"Advertencia: No se pudo detectar el tipo MIME, usando {mime_type}")

                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Eres un asistente médico especializado en análisis de estudios {study_type}. Analiza la imagen proporcionada y extrae la información relevante. Proporciona un análisis detallado y recomendaciones."
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
                })
            except FileNotFoundError:
                 print(f"Error: Archivo de imagen no encontrado en {file_path}")
                 raise
            except Exception as img_err:
                 print(f"Error al procesar la imagen: {img_err}")
                 raise

        payload = {
            "model": "claude-3-opus-20240229", # O el modelo que prefieras
            "max_tokens": 4000,
            "messages": messages
        }

        print(f"Enviando solicitud a Anthropic API: {ANTHROPIC_API_URL}")
        response = requests.post(ANTHROPIC_API_URL, headers=headers, json=payload)
        response.raise_for_status() # Lanza una excepción para errores HTTP (4xx o 5xx)

        response_data = response.json()
        print("Respuesta recibida de Anthropic API.")

        # Extraer el contenido del mensaje de respuesta
        if response_data.get("content") and isinstance(response_data["content"], list) and len(response_data["content"]) > 0:
            analysis = response_data["content"][0].get("text", "No se encontró texto en la respuesta.")
        else:
            analysis = "Respuesta inesperada de la API de Anthropic."
            print(f"Respuesta inesperada: {response_data}")

        return {
            "success": True,
            "analysis": analysis,
            "provider": "anthropic"
        }

    except requests.exceptions.RequestException as e:
        print(f"Error de red al llamar a Anthropic API: {str(e)}")
        error_details = f"Error de red: {e}"
        if e.response is not None:
            try:
                error_details += f" - Respuesta: {e.response.text}"
            except Exception:
                pass # Ignorar si no se puede leer la respuesta
        return {
            "success": False,
            "error": error_details,
            "provider": "anthropic"
        }
    except Exception as e:
        print(f"Error general en Anthropic (llamada directa API): {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Error inesperado: {str(e)}",
            "provider": "anthropic"
        }

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
            max_tokens=1000
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