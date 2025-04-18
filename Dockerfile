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

# Copiar todo lo que hay en doctorfy/
COPY . .

# Copiar la carpeta scripts que está junto a doctorfy/
# (ruta relativa al contexto de construcción, es decir, al repo raíz)
COPY ../scripts ./scripts

# Ejecutar el generador de sitemap
RUN python scripts/generate_sitemap.py

# Crear directorios necesarios
RUN mkdir -p uploads/medical_studies uploads/nutrition uploads/profile_pics

# Exponer el puerto que usará la aplicación
EXPOSE $PORT

# Configurar Flask para servir solo la API
ENV FLASK_ENV=production
# Variable personalizada que puedes usar en app.py
ENV SERVE_FRONTEND=false

# Comando para ejecutar la aplicación (DEBE quedar el último)
CMD gunicorn --bind 0.0.0.0:$PORT app:app