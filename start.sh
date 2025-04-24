#!/bin/bash
echo "Verificando versión de OpenAI..."
pip show openai
echo "Iniciando aplicación Flask..."
cd /app && gunicorn app:create_app --bind 0.0.0.0:$PORT 