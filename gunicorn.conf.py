import os

# Número de workers
workers = int(os.environ.get('GUNICORN_WORKERS', '2'))

# Número de threads por worker
threads = int(os.environ.get('GUNICORN_THREADS', '4'))

# Tiempo de espera para las solicitudes
timeout = 120

# Enlace al socket
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Configuración de registro
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Configuración de worker
worker_class = 'sync'
worker_connections = 1000 