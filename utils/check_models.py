import os
from openai import OpenAI

# Inicializar el cliente de OpenAI
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Obtener la lista de modelos disponibles
models = client.models.list()

# Imprimir los modelos disponibles
print("Modelos disponibles:")
for model in models.data:
    print(f"- {model.id}")

# Buscar modelos con capacidades de visión
print("\nModelos con capacidades de visión:")
vision_models = [model.id for model in models.data if "vision" in model.id.lower() or "gpt-4" in model.id.lower()]
for model in vision_models:
    print(f"- {model}") 