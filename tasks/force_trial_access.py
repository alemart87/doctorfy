import os
import sys
from datetime import datetime, timedelta

# Añadir el directorio raíz al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, User
import logging

logger = logging.getLogger(__name__)

def force_trial_access():
    """
    Fuerza el acceso a todos los usuarios configurando correctamente los períodos de prueba.
    """
    app = create_app()
    
    with app.app_context():
        # Obtener todos los usuarios que no sean alemart87@gmail.com
        users = User.query.filter(User.email != 'alemart87@gmail.com').all()
        
        logger.info(f"Encontrados {len(users)} usuarios para forzar acceso")
        
        now = datetime.utcnow()
        
        for user in users:
            # Configurar período de prueba de 2 días desde ahora
            user.trial_start = now
            user.trial_end = now + timedelta(days=2)
            user.trial_used = False  # Importante: asegurarse de que este campo sea False
            
            logger.info(f"Forzado acceso para usuario {user.email} (ID: {user.id})")
        
        db.session.commit()
        logger.info("Acceso forzado correctamente para todos los usuarios")

if __name__ == "__main__":
    force_trial_access() 