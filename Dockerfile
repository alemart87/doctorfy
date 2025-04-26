# --- Etapa 1: Construir el Frontend ---
FROM node:18-alpine as builder

# Establecer directorio de trabajo para el frontend
WORKDIR /app/frontend

# Copiar archivos de configuración del frontend
COPY frontend/package.json frontend/package-lock.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el resto del código fuente del frontend
COPY frontend/ ./

# Construir el frontend para producción
# Asegúrate que la variable de entorno para la URL de la API sea correcta
# Puedes pasarla como argumento de build o definirla aquí si es fija
# ARG REACT_APP_API_URL=/api
# ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build


# --- Etapa 2: Construir la Imagen Final de Python/Flask ---
FROM python:3.10-slim

# Establecer el directorio de trabajo principal
WORKDIR /app

# Instalar dependencias del sistema necesarias (si aún las necesitas)
# Es posible que algunas ya no sean necesarias si no compilas ciertas librerías Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    # build-essential \ # Podrías intentar quitar esto si no hay errores
    # libffi-dev \      # Podrías intentar quitar esto si no hay errores
    && rm -rf /var/lib/apt/lists/*

# Copiar los archivos de requerimientos de Python
COPY requirements.txt .

# Instalar dependencias de Python
# (Considera quitar SQLAlchemy==1.4.46 si está en requirements.txt)
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir SQLAlchemy==1.4.46 \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

# Copiar el código del backend (Flask)
# Copia selectivamente para evitar copiar node_modules o código fuente del frontend innecesario
COPY app.py ./
COPY config.py ./
COPY models.py ./
COPY utils ./utils
COPY routes ./routes
# Copia cualquier otro archivo/directorio del backend que necesites

# --- Copiar el frontend CONSTRUIDO desde la etapa 'builder' ---
COPY --from=builder /app/frontend/build ./frontend/build

# Crear directorios para subidas (esto es para el contenedor, app.py maneja /persistent)
# RUN mkdir -p uploads/medical_studies uploads/nutrition uploads/profile_pics
# Es mejor dejar que app.py cree las carpetas en /persistent al iniciar

# Exponer el puerto (Render lo define)
EXPOSE $PORT

# Configurar Flask para producción Y permitir servir frontend
ENV FLASK_ENV=production
# ENV SERVE_FRONTEND=true # O elimina esta línea si tu app.py ya sirve por defecto

# Comando para ejecutar la aplicación con Gunicorn
# Asegúrate que app:app sea correcto (el nombre de tu archivo .py y la instancia Flask)
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"] 