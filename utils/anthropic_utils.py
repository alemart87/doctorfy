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
from models import User, db
from flask_jwt_extended import get_jwt_identity
import asyncio

# Cargar variables de entorno
load_dotenv()

# Definir el nombre del modelo de Claude
CLAUDE_MODEL_NAME = "claude-3-5-sonnet-20240620" # Actualizado a Claude 3.5 Sonnet (versión de junio 2024)

# Variable global para el cliente de Anthropic (opcional, pero puede ser eficiente)
_anthropic_client = None # Renombrado para evitar confusión con el módulo

# Límites de tokens de salida por modelo:
# - claude-3-haiku: 4096 tokens máx
# - claude-3-sonnet: 4096 tokens máx
# - claude-3-opus: 4096 tokens máx
# - claude-3-5-sonnet: 15000 tokens máx (¡mayor capacidad!)
MAX_TOKENS = 8000  # Aumentado para aprovechar la mayor capacidad de Claude 3.5

MAX_ANTHROPIC_IMAGES = 15 # Límite global de imágenes a enviar a Anthropic

def get_anthropic_client():
    """Obtiene o inicializa el cliente de Anthropic."""
    global _anthropic_client
    if _anthropic_client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            current_app.logger.error("ANTHROPIC_API_KEY no está configurada.")
            raise ValueError("La clave API de Anthropic no está configurada.")
        # Usar el cliente asíncrono si la función que lo llama es asíncrona
        _anthropic_client = anthropic.AsyncAnthropic(api_key=api_key)
        current_app.logger.info(f"Cliente AsyncAnthropic inicializado para el modelo {CLAUDE_MODEL_NAME}.")
    return _anthropic_client

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"  # versión de la API
MAX_RETRIES = 3
INITIAL_BACKOFF = 1

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

async def analyze_medical_study_with_anthropic(
    study_name: str,
    concatenated_texts: str,
    image_data_list: list, # Lista de dicts: {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": "..."}}
    user_info: str = None,
    study_type_hint: str = None # ej: 'dermatology', 'radiology', 'general'
):
    """
    Analiza un conjunto de textos e imágenes de un estudio médico utilizando Anthropic.
    """
    try:
        client = get_anthropic_client()
        current_app.logger.info(f"Iniciando análisis unificado para: {study_name} con {len(image_data_list)} imágenes y {len(concatenated_texts)} caracteres de texto. Study type hint: {study_type_hint}")

        # Construcción del prompt base
        prompt_parts = [
            f"Eres un asistente médico virtual avanzado, actuando como un médico especialista con vasta experiencia en la interpretación de una amplia gama de estudios médicos. Tu tarea es analizar exhaustivamente el siguiente estudio médico, titulado: '{study_name}'.\n"
            f"Este estudio consiste en el siguiente material combinado: texto extraído de documentos (si se proporciona) Y/O una o más imágenes. Debes integrar TODA la información para tu análisis.\n\n"
            "Genera un informe detallado, estructurado y profesional en formato Markdown, redactado en español. El informe debe ser lo más completo y preciso posible. Incluye las siguientes secciones:\n\n"
            "1.  **Descripción General del Estudio:**\n"
            f"    *   Tipo de estudio principal inferido (ej., {study_type_hint if study_type_hint else 'Estudio General Multimodal'}).\n"
            f"    *   Materiales proporcionados para el análisis (ej., 'Informe de laboratorio en texto y 3 imágenes de radiografía', 'Fotografía de lesión cutánea y notas del paciente', 'Solo texto de un informe de patología').\n"
            "    *   Menciona cualquier información demográfica del paciente o datos clínicos proporcionados que sean relevantes (contenida en 'Información Adicional del Paciente/Estudio' si se provee más abajo).\n\n"
            "2.  **Hallazgos Detallados (Análisis Integrado):**\n"
            "    *   Describe meticulosamente todos los hallazgos observados, tanto normales como anormales, integrando la información del texto y de TODAS las imágenes proporcionadas. Sé específico y utiliza terminología médica apropiada.\n"
            "    *   Si es posible y relevante, indica de qué archivo o tipo de imagen proviene un hallazgo específico para dar contexto (ej., 'En la imagen 1 (radiografía de tórax)...', 'Según el texto del informe de laboratorio...').\n"
            "    *   Si hay hallazgos anormales, describe su localización, tamaño (si se puede estimar), forma, contornos, densidad/intensidad de señal, y cualquier otra característica relevante.\n"
            "    *   Indica la posible significancia clínica de cada hallazgo.\n"
            "    *   Si la calidad de alguna imagen/documento es subóptima o limita la evaluación, menciónalo explícitamente.\n"
        ]

        # Añadir sección específica para dermatología si el hint lo sugiere o si detectamos imágenes de piel
        if (study_type_hint and 'dermatology' in study_type_hint.lower()) or (
            study_type_hint == 'general' and len(image_data_list) > 0
        ):
            prompt_parts.append(
                "    *   **Análisis Dermatológico Específico (si aplica):** Si observas lesiones cutáneas, lunares, manchas u otras condiciones dermatológicas en las imágenes, realiza un análisis dermatológico detallado..."
            )

        prompt_parts.extend([
            "\n3.  **Posibles Diagnósticos Diferenciales (Hipótesis Clínicas Integradas):**\n"
            "    *   Basado EXCLUSIVAMENTE en TODOS los hallazgos descritos (texto e imágenes) y la información proporcionada, enumera entre 3 y 5 posibles diagnósticos diferenciales que podrían explicar los hallazgos anormales (si los hay).\n"
            "    *   Para cada diagnóstico diferencial, proporciona una breve justificación (1-2 frases) de por qué se considera una posibilidad en relación con los hallazgos integrados.\n"
            "    *   **IMPORTANTE**: Inicia esta sección con la siguiente advertencia textual: 'Los siguientes son posibles diagnósticos diferenciales basados en la información analizada. Estos NO constituyen un diagnóstico definitivo y son presentados únicamente con fines informativos y para facilitar la discusión con un profesional médico.'\n\n"
            "4.  **Conclusión y Recomendaciones (Integradas):**\n"
            "    *   Resume brevemente los hallazgos más significativos de todo el estudio.\n"
            "    *   Sugiere posibles siguientes pasos o recomendaciones generales, como la necesidad de correlación con la historia clínica completa, examen físico, o la consulta con un especialista específico (ej., cardiólogo, oncólogo, dermatólogo, neurólogo, etc.).\n"
            "    *   Menciona si podrían ser útiles estudios de imagen adicionales o pruebas de laboratorio complementarias para aclarar los hallazgos (sin prescribirlos, solo como sugerencia de lo que un médico podría considerar).\n\n"
            "5.  **ADVERTENCIA MÉDICA FUNDAMENTAL:**\n"
            "    *   Concluye SIEMPRE tu informe con el siguiente párrafo textual, de manera destacada (por ejemplo, en negrita o como un bloque aparte):\n"
            "    '**Este análisis es generado por un modelo de inteligencia artificial y NO SUSTITUYE una consulta médica profesional ni una segunda opinión médica. La información aquí presentada es para fines educativos y de orientación preliminar. Cualquier decisión relacionada con su salud debe ser tomada en consulta directa con un médico calificado, quien podrá evaluar su caso de manera integral considerando su historial clínico completo y realizando un examen físico si es necesario. No ignore el consejo médico profesional ni retrase la búsqueda de atención médica debido a algo que haya leído en este informe.**'\n\n"
        ])

        if not concatenated_texts and not image_data_list:
             prompt_parts.append("No se ha proporcionado contenido textual ni imágenes para el estudio. Por favor, indica que no hay datos para analizar y finaliza con la advertencia médica fundamental.")
        else:
            prompt_parts.append("Procede con el análisis.")

        final_prompt_text = "".join(prompt_parts)

        messages_content = []

        # Añadir imágenes primero, si existen
        if image_data_list:
            for img_data_dict in image_data_list[:MAX_ANTHROPIC_IMAGES]: # Aplicar límite aquí también como salvaguarda
                messages_content.append(img_data_dict)
            if len(image_data_list) > MAX_ANTHROPIC_IMAGES:
                current_app.logger.warning(f"Se truncaron las imágenes para Anthropic. Se enviaron {MAX_ANTHROPIC_IMAGES} de {len(image_data_list)}.")

        # Añadir el texto del estudio y la información del usuario
        text_content_for_api = ""
        if concatenated_texts:
            text_content_for_api += f"\n--- INICIO DEL TEXTO DEL ESTUDIO ---\n{concatenated_texts[:8000]}\n--- FIN DEL TEXTO DEL ESTUDIO ---\n" # Limitar texto para evitar exceder tokens
            if len(concatenated_texts) > 15000:
                 current_app.logger.warning(f"Texto del estudio truncado a 15000 caracteres para Anthropic.")


        if user_info:
            text_content_for_api += f"\nInformación Adicional del Paciente/Estudio proporcionada por el usuario:\n---\n{user_info}\n---\n"

        if text_content_for_api:
            messages_content.append({"type": "text", "text": text_content_for_api.strip()})
        
        if not messages_content: # Si después de todo no hay contenido (ej. solo user_info pero sin estudio)
            return "No se proporcionó contenido del estudio (texto o imágenes) para analizar. " + \
                   "**Este análisis es generado por un modelo de inteligencia artificial y NO SUSTITUYE una consulta médica profesional... (etc.)**"

        # Convertir el prompt en una instrucción de sistema
        system_prompt = "".join(prompt_parts)
        
        current_app.logger.debug(f"System prompt para Anthropic (parcial): {system_prompt[:500]}...")
        
        # Añadir manejo de reintentos para errores de sobrecarga
        max_retries = 3
        retry_delay = 5  # segundos
        
        for attempt in range(max_retries):
            try:
                response = await client.messages.create(
                    model=CLAUDE_MODEL_NAME,
                        max_tokens=MAX_TOKENS,
                        messages=[
                            {
                                "role": "user",
                            "content": messages_content
                        }
                    ],
                    system=system_prompt
                )
                
                # Extraer el texto de la respuesta
                if hasattr(response, 'content') and len(response.content) > 0:
                    analysis_result = response.content[0].text
                    current_app.logger.info(f"Análisis recibido de Anthropic para {study_name}")
                    return analysis_result
                else:
                    current_app.logger.error(f"Estructura de respuesta inesperada: {response}")
                    return "Error: Formato de respuesta inesperado del modelo de IA. Por favor, inténtalo de nuevo más tarde."
                
            except anthropic.APIStatusError as api_error:
                if api_error.status_code == 529 and attempt < max_retries - 1:
                    # Error de sobrecarga, intentar de nuevo después de un retraso
                    current_app.logger.warning(f"Anthropic sobrecargado (intento {attempt+1}/{max_retries}). Reintentando en {retry_delay} segundos...")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Backoff exponencial
                else:
                    # Otros errores de API o último intento fallido
                    current_app.logger.error(f"Error de API de Anthropic (Status {api_error.status_code}): {api_error.message}")
                    
                    if api_error.status_code == 529:
                        return "El servicio de análisis está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos minutos."
                    elif api_error.status_code == 400 and "image_validation_error" in api_error.message.lower():
                        return "Error: Una o más imágenes proporcionadas no son válidas o no pudieron ser procesadas por el modelo de IA. Por favor, verifica el formato y la calidad de las imágenes."
                    elif api_error.status_code == 402:
                        return "Créditos insuficientes para realizar el análisis. Por favor, contacta al administrador."
                    else:
                        return f"Error del servicio de IA (código {api_error.status_code}). Inténtalo más tarde. No se consumieron créditos."
            
            except Exception as e:
                current_app.logger.error(f"Error al llamar a la API de Anthropic: {str(e)}")
                return f"Error al procesar la solicitud: {str(e)}"
                
    except Exception as e:
        current_app.logger.error(f"Error general en analyze_medical_study_with_anthropic: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return f"Error interno al procesar el estudio: {str(e)}"

def extract_from_pdf(file_path):
    """
    Extrae texto e imágenes de un archivo PDF de manera más robusta
    """
    result = {"text": "", "images": []}
    
    try:
        # Verificar que el archivo existe
        if not os.path.exists(file_path):
            current_app.logger.error(f"El archivo PDF no existe: {file_path}")
            return {"text": "Error: El archivo PDF no existe", "images": []}
            
        # Abrir el PDF con manejo de errores
        try:
            doc = fitz.open(file_path)
        except Exception as e:
            current_app.logger.error(f"Error al abrir el PDF {file_path}: {str(e)}")
            return {"text": f"Error al abrir el PDF: {str(e)}", "images": []}
        
        # Extraer texto
        text = ""
        for page_num in range(len(doc)):
            try:
                page = doc.load_page(page_num)
                page_text = page.get_text()
                text += page_text
                current_app.logger.debug(f"Extraído texto de la página {page_num+1}/{len(doc)} del PDF")
            except Exception as e:
                current_app.logger.warning(f"Error al extraer texto de la página {page_num+1}: {str(e)}")
                # Continuar con la siguiente página
        
        result["text"] = text
        
        # Extraer imágenes con mejor calidad
        image_count = 0
        max_images = 10
        
        # Método 1: Extraer imágenes usando get_images()
        for page_num in range(len(doc)):
            if image_count >= max_images:
                break
                
            try:
                page = doc.load_page(page_num)
                image_list = page.get_images(full=True)
                
                for img_index, img in enumerate(image_list):
                    if image_count >= max_images:
                        break
                    
                    try:
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        
                        # Verificar que la imagen tenga un tamaño razonable y no sea un icono pequeño
                        if len(image_bytes) > 500:  # Ignorar imágenes muy pequeñas
                            # Intentar mejorar la calidad de la imagen
                            try:
                                img_obj = Image.open(io.BytesIO(image_bytes))
                                
                                # Si la imagen es muy pequeña, ignorarla
                                if img_obj.width < 50 or img_obj.height < 50:
                                    continue
                                
                                # Convertir a RGB si es necesario
                                if img_obj.mode in ('RGBA', 'LA') or (img_obj.mode == 'P' and 'transparency' in img_obj.info):
                                    background = Image.new('RGB', img_obj.size, (255, 255, 255))
                                    background.paste(img_obj, mask=img_obj.split()[3] if img_obj.mode == 'RGBA' else None)
                                    img_obj = background
                                
                                # Guardar con buena calidad
                                output = io.BytesIO()
                                img_obj.save(output, format="JPEG", quality=95)
                                image_bytes = output.getvalue()
                            except Exception as img_proc_err:
                                current_app.logger.warning(f"Error al procesar imagen extraída: {str(img_proc_err)}")
                                # Continuar con la imagen original si hay error
                
                # Convertir bytes a base64
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                result["images"].append(image_base64)
                image_count += 1
                current_app.logger.debug(f"Extraída imagen {image_count} del PDF (método 1)")
                    except Exception as img_err:
                        current_app.logger.warning(f"Error al extraer imagen {img_index} de la página {page_num+1}: {str(img_err)}")
            except Exception as page_err:
                current_app.logger.warning(f"Error al procesar la página {page_num+1} para imágenes: {str(page_err)}")
        
        # Método 2: Si no se encontraron imágenes con el método 1 o se encontraron pocas, renderizar páginas como imágenes
        if len(result["images"]) < 3:
            current_app.logger.info(f"Pocas imágenes encontradas con el método 1 ({len(result['images'])}), intentando método 2")
            for page_num in range(min(5, len(doc))):  # Limitar a las primeras 5 páginas para este método
                if image_count >= max_images:
                    break
                    
                try:
                    page = doc.load_page(page_num)
                    # Renderizar la página como una imagen con mayor calidad
                    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3))  # Escala 3x para mejor calidad
                    img_bytes = pix.tobytes("jpeg", quality=90)
                    
                    # Convertir bytes a base64
                    image_base64 = base64.b64encode(img_bytes).decode('utf-8')
                    result["images"].append(image_base64)
                    image_count += 1
                    current_app.logger.debug(f"Renderizada página {page_num+1} como imagen (método 2)")
                except Exception as render_err:
                    current_app.logger.warning(f"Error al renderizar página {page_num+1} como imagen: {str(render_err)}")
        
        # Cerrar el documento
        doc.close()
        
        current_app.logger.info(f"Extracción de PDF completada: {len(result['text'])} caracteres de texto y {len(result['images'])} imágenes")
        return result
        
    except Exception as e:
        current_app.logger.error(f"Error general al extraer contenido del PDF {file_path}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
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
    try:
        # Verificación de usuario y créditos (código existente)
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            current_app.logger.error(f"Usuario no encontrado: {user_id}")
            return "Error: Usuario no encontrado"
            
        if not user.has_enough_credits('nutrition'):
            current_app.logger.warning(f"Créditos insuficientes para usuario {user.email}. Créditos: {user.credits}")
            return """
            # Análisis Nutricional
            ## Error
            Créditos insuficientes. Necesitas 1 crédito.
            """

        current_app.logger.info(f"Iniciando análisis nutricional para {user.email}. Créditos: {user.credits}")
        
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
                    "text": (
                      "Eres un nutricionista experto y te encargas de analizar imágenes de comida, para poder devolver un análisis nutricional de la imagen, para que el usuario pueda conocer el contenido nutricional de la comida que está por ingerir, tomas en cuenta el tamaño de la porción, el tipo de comida, el color, el tamaño, etc. Analiza esta imagen de comida y devuelve EXCLUSIVAMENTE un JSON "
                      "válido con la siguiente estructura (sin explicaciones adicionales):\n\n"
                      "{\n"
                      '  "food": ["Tortilla", "Ensalada", ...],\n'
                      '  "calories": 550,\n'
                      '  "protein_g": 32,\n'
                      '  "carbs_g": 45,\n'
                      '  "fat_g": 18,\n'
                      '  "fiber_g": 8,\n'
                      '  "sugars_g": 10,\n'
                      '  "sodium_mg": 720,\n'
                      '  "quality": "Buena / Regular / Mala / Muy mala / Insalubre",\n'
                      '  "recommendations": "Texto detallado de recomendaciones para el usuario"\n'
                      "}\n\n"
                      "Si algún dato no puede estimarse devuelve 0 (para números) o una cadena vacía."
                    )
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
        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=MAX_TOKENS,
            messages=messages
        )

        if response and response.content[0].text:
            try:
                # Verificar que sea JSON válido
                analysis_result = json.loads(response.content[0].text)
                
                # Consumir créditos DESPUÉS de verificar respuesta válida
                user.consume_credits('nutrition')
                db.session.commit()
                current_app.logger.info(f"""
                    Análisis nutricional exitoso para {user.email}:
                    - Créditos consumidos: 1
                    - Créditos restantes: {user.credits}
                    - Calorías detectadas: {analysis_result.get('calories', 'N/A')}
                    - Alimentos: {', '.join(analysis_result.get('food', []))}
                """)
                
                return response.content[0].text
                
            except json.JSONDecodeError as e:
                current_app.logger.error(f"Error en formato JSON para {user.email}: {str(e)}")
                return """
                # Análisis Nutricional
                ## Error
                Error en el formato de la respuesta. No se consumieron créditos.
                """
        else:
            current_app.logger.error(f"Respuesta vacía de Anthropic para {user.email}")
            return """
            # Análisis Nutricional
            ## Error
            No se recibió respuesta del análisis. No se consumieron créditos.
            """

    except Exception as e:
        current_app.logger.error(f"Error en análisis nutricional para {user.email if user else 'usuario desconocido'}: {str(e)}", exc_info=True)
        return """
        # Análisis Nutricional
        ## Error
        Error en el análisis. No se consumieron créditos.
        """

# ----------------------------------------------------------------------------------
# Nuevo analizador "GENÉRICO"
# ----------------------------------------------------------------------------------

def analyze_general_image_with_anthropic(image_path: str) -> str:
    """
    Analiza cualquier tipo de estudio médico (radiografía, ecografía, hemograma,
    resonancia, etc.) y devuelve:
      1. Descripción / hallazgos relevantes.
      2. Posibles diagnósticos diferenciales (⚠️ no sustituye la valoración médica).
      3. Recomendaciones o siguientes pasos sugeridos.
    """
    try:
        client = get_anthropic_client()

        # preparar la imagen (reutilizamos compresión & base64)
        compressed_path = compress_image_for_anthropic(image_path)
        with open(compressed_path, "rb") as img_file:
            image_data = base64.b64encode(img_file.read()).decode("utf-8")

        mime_type = get_mime_type(compressed_path) or "image/jpeg"

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Eres un médico especialista. Analiza la imagen que recibes "
                            "y genera un informe estructurado en español:"
                            "\n\n1. Tipo de estudio y descripción."
                            "\n2. Hallazgos relevantes."
                            "\n3. Posibles diagnósticos diferenciales (máx. 5)."
                            "\n4. Recomendaciones / pasos siguientes."
                            "\n\nSi la imagen no es de índole médica, indícalo educadamente."
                        )
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
            }
        ]

        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=MAX_TOKENS,
            messages=messages
        )

        return response.content[0].text

    except Exception as e:
        current_app.logger.error(f"Error en analyze_general_image_with_anthropic: {e}", exc_info=True)
        return (
            "# Informe Médico\n"
            "## Error\n"
            "No se pudo analizar el estudio. Por favor, inténtalo de nuevo más tarde."
        ) 