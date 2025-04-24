import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging():
    """
    Configura el sistema de logging para la aplicación
    """
    # Configurar el directorio de logs
    log_dir = 'logs'
    try:
        os.makedirs(log_dir, exist_ok=True)  # Añadir exist_ok=True
    except Exception as e:
        # Si no podemos crear el directorio, usamos el directorio temporal del sistema
        import tempfile
        log_dir = tempfile.gettempdir()
        print(f"No se pudo crear directorio de logs, usando {log_dir}: {str(e)}")
    
    # Configurar el logger
    logger = logging.getLogger('doctorfy')
    logger.setLevel(logging.INFO)
    
    # Formato para los logs
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Handler para la consola
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Handler para archivo rotativo
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Configurar loggers específicos
    anthropic_logger = logging.getLogger('utils.anthropic_utils')
    anthropic_logger.setLevel(logging.DEBUG)
    
    image_logger = logging.getLogger('utils.image_utils')
    image_logger.setLevel(logging.DEBUG)
    
    # Silenciar algunos loggers ruidosos
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('PIL').setLevel(logging.WARNING)
    
    # Configurar logger para correos
    email_logger = logging.getLogger('utils.email_utils')
    email_logger.setLevel(logging.DEBUG)
    
    # Crear un manejador específico para eventos de correo
    email_handler = RotatingFileHandler(
        os.path.join(log_dir, 'email.log'),
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3
    )
    email_handler.setFormatter(formatter)
    email_logger.addHandler(email_handler)
    
    return logger 