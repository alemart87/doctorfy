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

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Asegurarse de que se instale la versión correcta de OpenAI
RUN pip uninstall -y openai && pip install --no-cache-dir openai==0.28.1

# Instalar Gunicorn
RUN pip install --no-cache-dir gunicorn

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

# Crear archivo de configuración de Gunicorn (corregido)
RUN echo 'import os\n\
workers = int(os.environ.get("GUNICORN_WORKERS", "2"))\n\
threads = int(os.environ.get("GUNICORN_THREADS", "4"))\n\
timeout = 120\n\
port = os.environ.get("PORT", "8000")\n\
bind = "0.0.0.0:" + port\n\
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
cd /app && gunicorn app:app --bind 0.0.0.0:$PORT\n\
' > /app/start.sh && chmod +x /app/start.sh

# Comando para ejecutar el script de inicio
CMD ["/app/start.sh"] 