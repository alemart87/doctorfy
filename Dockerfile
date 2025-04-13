# Usar una imagen base de Python
FROM python:3.10-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de requerimientos primero
COPY requirements.txt .

# Instalar dependencias del sistema y Python
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir SQLAlchemy==1.4.46 \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn \
    && rm -rf /var/lib/apt/lists/*

# Copiar el resto del código
COPY . .

# Crear directorios necesarios
RUN mkdir -p uploads/medical_studies uploads/nutrition uploads/profile_pics

# Exponer el puerto que usará la aplicación
EXPOSE $PORT

# Configurar Flask para servir solo la API
ENV FLASK_ENV=production
ENV SERVE_FRONTEND=false  # Variable personalizada que puedes usar en app.py

# Comando para ejecutar la aplicación con más información de depuración
CMD gunicorn --bind 0.0.0.0:$PORT app:app 