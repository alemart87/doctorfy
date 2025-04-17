import os
import sys
from datetime import datetime, timedelta

# Añadir el directorio raíz al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, User
from utils.email_utils import send_email
import logging

logger = logging.getLogger(__name__)

def check_expired_trials():
    """
    Verifica los períodos de prueba que han expirado y envía recordatorios.
    """
    app = create_app()
    
    with app.app_context():
        now = datetime.utcnow()
        
        # Buscar usuarios cuyo período de prueba haya expirado en las últimas 24 horas
        yesterday = now - timedelta(days=1)
        expired_trials = User.query.filter(
            User.trial_end <= now,
            User.trial_end >= yesterday,
            User.trial_used == False,
            User.subscription_active == False
        ).all()
        
        logger.info(f"Encontrados {len(expired_trials)} períodos de prueba expirados")
        
        for user in expired_trials:
            # Marcar el período de prueba como usado
            user.trial_used = True
            db.session.commit()
            
            # Enviar correo de recordatorio
            send_trial_expired_email(user)
            
            logger.info(f"Correo de expiración enviado a {user.email}")

def send_trial_expired_email(user):
    """
    Envía un correo al usuario informándole que su período de prueba ha expirado.
    """
    subject = "Tu período de prueba en Doctorfy ha finalizado"
    
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            h1 {{ color: #7c4dff; }}
            .info {{ background-color: #f9f9f9; padding: 15px; border-radius: 5px; }}
            .footer {{ margin-top: 20px; font-size: 12px; color: #777; }}
            .button {{ display: inline-block; background-color: #7c4dff; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-top: 15px; }}
            .benefits {{ margin-top: 20px; }}
            .benefit {{ margin-bottom: 10px; }}
            .check {{ color: #4CAF50; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Tu período de prueba ha finalizado</h1>
            <p>Esperamos que hayas disfrutado de los 2 días de acceso gratuito a todas las funcionalidades premium de Doctorfy.</p>
            
            <div class="info">
                <h2>¿Qué sucede ahora?</h2>
                <p>Para seguir disfrutando de todos los beneficios de Doctorfy, te invitamos a suscribirte a nuestro plan premium.</p>
            </div>
            
            <div class="benefits">
                <h2>Con tu suscripción obtendrás:</h2>
                
                <div class="benefit">
                    <span class="check">✓</span> Consultas psicológicas ilimitadas
                </div>
                <div class="benefit">
                    <span class="check">✓</span> Asistencia médica 24/7
                </div>
                <div class="benefit">
                    <span class="check">✓</span> Análisis de estudios médicos
                </div>
                <div class="benefit">
                    <span class="check">✓</span> Recomendaciones nutricionales personalizadas
                </div>
                <div class="benefit">
                    <span class="check">✓</span> Soporte prioritario
                </div>
            </div>
            
            <p style="margin-top: 20px;">No pierdas acceso a estas increíbles funcionalidades:</p>
            
            <a href="https://doctorfy.onrender.com/subscription" class="button">Suscribirme Ahora</a>
            
            <div class="footer">
                <p>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.</p>
                <p>Equipo Doctorfy</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(subject, html_body, to_email=user.email, html=True)

if __name__ == "__main__":
    check_expired_trials() 