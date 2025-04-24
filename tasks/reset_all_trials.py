import os
import sys
from datetime import datetime, timedelta

# Añadir el directorio raíz al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, User
import logging

logger = logging.getLogger(__name__)

def reset_all_trials():
    """
    Reinicia los períodos de prueba para todos los usuarios.
    """
    app = create_app()
    
    with app.app_context():
        # Obtener todos los usuarios que no sean alemart87@gmail.com
        users = User.query.filter(User.email != 'alemart87@gmail.com').all()
        
        logger.info(f"Encontrados {len(users)} usuarios para reiniciar período de prueba")
        
        now = datetime.utcnow()
        
        for user in users:
            # Configurar período de prueba de 2 días desde ahora
            user.trial_start = now
            user.trial_end = now + timedelta(days=2)
            user.trial_used = False
            
            # Si no tiene suscripción activa, asegurarse de que subscription_active sea False
            if not user.subscription_active:
                user.subscription_active = False
            
            logger.info(f"Reiniciado período de prueba para usuario {user.email} (ID: {user.id})")
        
        db.session.commit()
        logger.info("Períodos de prueba reiniciados correctamente")

if __name__ == "__main__":
    reset_all_trials() 