import os
import sys
from datetime import datetime, timedelta

# Añadir el directorio raíz al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, User
import logging

logger = logging.getLogger(__name__)

def fix_trial_periods():
    """
    Corrige los períodos de prueba para usuarios existentes que no tienen configurado correctamente.
    """
    app = create_app()
    
    with app.app_context():
        # Buscar usuarios sin período de prueba configurado
        users_without_trial = User.query.filter(
            (User.trial_start.is_(None)) | 
            (User.trial_end.is_(None))
        ).all()
        
        logger.info(f"Encontrados {len(users_without_trial)} usuarios sin período de prueba configurado")
        
        now = datetime.utcnow()
        
        for user in users_without_trial:
            # Configurar período de prueba de 2 días desde ahora
            user.trial_start = now
            user.trial_end = now + timedelta(days=2)
            user.trial_used = False
            
            logger.info(f"Configurado período de prueba para usuario {user.email} (ID: {user.id})")
        
        db.session.commit()
        logger.info("Períodos de prueba actualizados correctamente")

if __name__ == "__main__":
    fix_trial_periods() 