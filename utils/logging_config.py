import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging():
    """
    Configura el sistema de logging para la aplicación
    """
    # Crear directorio de logs si no existe
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Configurar el logger raíz
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Formato para los logs
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Handler para la consola
    console_handler = logging.StreamHandler()
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
    
    return logger 