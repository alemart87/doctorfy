# Imagen base para Python
FROM python:3.9-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias para psycopg2 y otras bibliotecas
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Instalar Gunicorn explícitamente
RUN pip install gunicorn

# Copiar archivos de requisitos primero para aprovechar la caché de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Construir la aplicación React (si no está pre-construida)
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

# Exponer el puerto que usa la aplicación
EXPOSE 8000

# Crear directorios necesarios
RUN mkdir -p uploads/medical_studies uploads/nutrition uploads/profile_pics

# Verificar que Gunicorn esté instalado
RUN which gunicorn || echo "Gunicorn no está en el PATH"

# Comando para ejecutar la aplicación
CMD gunicorn --bind "0.0.0.0:${PORT:-8000}" "app:create_app()" 