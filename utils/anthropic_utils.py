import os
import base64
import requests
import json
import imghdr
from flask import current_app

def analyze_medical_study_with_anthropic(image_path, study_type):
    """
    Analiza un estudio médico usando Anthropic Claude Vision o OpenAI como respaldo
    """
    try:
        print(f"Iniciando análisis de estudio médico con Anthropic: {image_path}, tipo: {study_type}")
        
        # Verificar si el archivo existe
        if not os.path.exists(image_path):
            print(f"ERROR: El archivo no existe: {image_path}")
            return "No se pudo analizar el estudio médico. El archivo no existe."
        
        # Detectar el tipo de imagen
        image_type = imghdr.what(image_path)
        print(f"Tipo de imagen detectado: {image_type}")
        
        if not image_type:
            print("ERROR: No se pudo determinar el tipo de imagen")
            return "No se pudo analizar el estudio médico. Formato de imagen no reconocido."
        
        # Mapear el tipo de imagen a un tipo MIME
        mime_type = f"image/{image_type}"
        if image_type == "jpeg" or image_type == "jpg":
            mime_type = "image/jpeg"
        elif image_type == "png":
            mime_type = "image/png"
        
        print(f"Tipo MIME a usar: {mime_type}")
        
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
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            print("ERROR: No se encontró la clave API de Anthropic en las variables de entorno")
            return "No se pudo analizar el estudio médico. Falta la configuración de la API."
        else:
            print(f"Clave API de Anthropic encontrada (primeros 5 caracteres): {api_key[:5]}...")
        
        # Preparar la solicitud para Anthropic Claude
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        # Construir el mensaje con la imagen
        data = {
            "model": "claude-3-haiku-20240307",
            "max_tokens": 1000,
            "system": system_content,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_text
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
                }
            ]
        }
        
        # Llamar a la API de Anthropic
        print("Llamando a la API de Anthropic Claude")
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=data
        )
        
        # Verificar la respuesta
        if response.status_code != 200:
            print(f"ERROR: La API de Anthropic respondió con código {response.status_code}")
            print(f"Respuesta: {response.text}")
            print(f"ERROR con Anthropic: {response.text}. Intentando con OpenAI como respaldo...")
            return analyze_medical_study_with_openai(image_path, study_type)
        
        # Extraer la interpretación
        response_data = response.json()
        print("Respuesta recibida de Anthropic Claude")
        interpretation = response_data["content"][0]["text"]
        print(f"Interpretación (primeros 100 caracteres): {interpretation[:100]}...")
        
        return interpretation
    except Exception as e:
        print(f"ERROR en analyze_medical_study_with_anthropic: {str(e)}")
        print("Intentando con OpenAI como respaldo...")
        try:
            return analyze_medical_study_with_openai(image_path, study_type)
        except Exception as e2:
            print(f"ERROR también en OpenAI: {str(e2)}")
            import traceback
            traceback.print_exc()
            return f"No se pudo analizar el estudio médico con ningún servicio: {str(e)}, {str(e2)}"

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