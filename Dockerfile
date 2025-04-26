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
    # && pip install --no-cache-dir SQLAlchemy==1.4.46 # Comentado si ya está en requirements.txt
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn \
    && rm -rf /var/lib/apt/lists/*

# Copiar el resto del código del backend
# (Puedes usar COPY . . o copiar selectivamente como antes, no afecta la funcionalidad principal aquí)
COPY . .
# Opcional: Copia selectiva si prefieres
# COPY app.py .
# COPY models.py .
# COPY config.py .
# COPY routes/ ./routes/
# COPY utils/ ./utils/

# Crear directorios en el disco persistente es manejado por app.py,
# por lo que esta línea en Dockerfile no es estrictamente necesaria para persistencia.
# RUN mkdir -p uploads/medical_studies uploads/nutrition uploads/profile_pics

# Exponer el puerto que usará la aplicación
EXPOSE $PORT

# Configurar Flask para servir solo la API
ENV FLASK_ENV=production
# Flask NO debe servir el frontend en esta configuración
# <-- ASEGÚRATE QUE SEA false
ENV SERVE_FRONTEND=false

# Comando para ejecutar la aplicación (API)
CMD gunicorn --bind 0.0.0.0:$PORT app:app 