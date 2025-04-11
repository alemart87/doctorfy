import os
import base64
from openai import OpenAI
import sys

def test_openai_vision(image_path):
    """
    Prueba la API de OpenAI Vision con una imagen
    """
    try:
        print(f"Probando OpenAI Vision con imagen: {image_path}")
        
        # Verificar si el archivo existe
        if not os.path.exists(image_path):
            print(f"ERROR: El archivo no existe: {image_path}")
            return
        
        # Cargar la imagen como base64
        print(f"Cargando imagen desde: {image_path}")
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        print(f"Imagen cargada y codificada en base64 (primeros 50 caracteres): {base64_image[:50]}...")
        
        # Verificar la clave API
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("ERROR: No se encontró la clave API de OpenAI en las variables de entorno")
            return
        else:
            print(f"Clave API encontrada (primeros 5 caracteres): {api_key[:5]}...")
        
        # Inicializar el cliente de OpenAI
        client = OpenAI(api_key=api_key)
        
        # Llamar a la API de OpenAI
        print("Llamando a la API de OpenAI con modelo gpt-4o")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un asistente que describe imágenes."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "¿Qué ves en esta imagen?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300
        )
        
        # Mostrar la respuesta
        print("\nRespuesta de OpenAI:")
        print(response.choices[0].message.content)
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python test_openai.py ruta/a/la/imagen.jpg")
    else:
        test_openai_vision(sys.argv[1]) 