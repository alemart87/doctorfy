# --- Stage 1: Build Frontend ---
FROM node:18-alpine as builder

WORKDIR /app/frontend

# Copiar solo los archivos necesarios para instalar dependencias del frontend
COPY frontend/package.json frontend/package-lock.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el resto del código fuente del frontend
COPY frontend/ ./

# Construir el frontend para producción
# Asegúrate que la API_URL en tu config.js o .env del frontend
# apunte a la URL relativa /api o a la URL de tu backend en producción
RUN npm run build

# --- Stage 2: Python Backend ---
FROM python:3.10-slim

WORKDIR /app

# Copiar los archivos de requerimientos primero
COPY requirements.txt .

# Instalar dependencias del sistema y Python
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn \
    && rm -rf /var/lib/apt/lists/*

# Copiar el código del backend
# Copia selectivamente para evitar copiar node_modules del host si existe
COPY app.py .
COPY models.py .
COPY config.py .
COPY routes/ ./routes/
COPY utils/ ./utils/

# --- Copiar el frontend CONSTRUIDO desde la etapa 'builder' ---
COPY --from=builder /app/frontend/build ./frontend/build

# Crear directorios necesarios
RUN mkdir -p uploads/medical_studies uploads/nutrition uploads/profile_pics

# Exponer el puerto que usará la aplicación
EXPOSE $PORT

# Configurar Flask para servir solo la API
ENV FLASK_ENV=production
# Variable personalizada que puedes usar en app.py
ENV SERVE_FRONTEND=true

# Comando para ejecutar la aplicación
CMD gunicorn --bind 0.0.0.0:$PORT app:app 