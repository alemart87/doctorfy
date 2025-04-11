# Usar una imagen base de Python
FROM python:3.9-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de requerimientos primero
COPY requirements.txt .

# Instalar dependencias de Python (incluyendo la versión específica de OpenAI)
RUN pip install --no-cache-dir openai==1.61.1 gunicorn
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Construir la aplicación React
RUN apt-get update && apt-get install -y \
    curl \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && cd frontend \
    && npm install \
    && npm run build \
    && cd .. \
    && apt-get purge -y --auto-remove curl nodejs \
    && rm -rf /var/lib/apt/lists/*

# Crear directorios necesarios
RUN mkdir -p uploads/medical_studies uploads/nutrition uploads/profile_pics

# Exponer el puerto para Flask
EXPOSE $PORT

# Crear archivo de configuración de Gunicorn
RUN echo 'import os\n\
workers = int(os.environ.get("GUNICORN_WORKERS", "2"))\n\
threads = int(os.environ.get("GUNICORN_THREADS", "4"))\n\
timeout = 120\n\
bind = f"0.0.0.0:{os.environ.get(\"PORT\", \"8000\")}"\n\
accesslog = "-"\n\
errorlog = "-"\n\
loglevel = "info"\n\
worker_class = "sync"\n\
worker_connections = 1000\n\
' > /app/gunicorn_config.py

# Crear script de inicio principal
RUN echo '#!/bin/bash\n\
echo "Verificando versión de OpenAI..."\n\
pip show openai\n\
echo "Iniciando aplicación Flask..."\n\
cd /app && gunicorn app:create_app --config gunicorn_config.py --bind 0.0.0.0:$PORT\n\
' > /app/start.sh && chmod +x /app/start.sh

# Comando para ejecutar el script de inicio
CMD ["/app/start.sh"] 