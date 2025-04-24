import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
import datetime
import logging

logger = logging.getLogger(__name__)

def send_email(subject, body, to_email=None, html=False):
    """
    Envía un correo electrónico utilizando las credenciales SMTP configuradas.
    
    Args:
        subject (str): Asunto del correo
        body (str): Cuerpo del correo
        to_email (str, optional): Destinatario. Si es None, se usa el email configurado en SMTP_USERNAME
        html (bool, optional): Si el cuerpo es HTML. Por defecto es False.
    
    Returns:
        bool: True si el correo se envió correctamente, False en caso contrario
    """
    try:
        # Obtener configuración de correo desde variables de entorno
        smtp_server = os.environ.get('SMTP_SERVER')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        # Si no se especifica destinatario, usar el mismo remitente
        if to_email is None:
            to_email = smtp_username
        
        # Crear mensaje
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_username
        msg['To'] = to_email
        
        # Adjuntar cuerpo del mensaje
        if html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        # Conectar al servidor SMTP
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        
        # Enviar correo
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        
        logger.info(f"Correo enviado exitosamente a {to_email}")
        return True
    
    except Exception as e:
        logger.error(f"Error al enviar correo: {str(e)}")
        return False

def send_password_reset_email(to_email, reset_url):
    """
    Envía un correo electrónico con instrucciones para restablecer la contraseña
    """
    # Asegurarnos que el reset_url use el dominio correcto
    if "doctorfy.onrender.com" in reset_url:
        reset_url = reset_url.replace("doctorfy.onrender.com", "www.doctorfy.app")
    
    subject = "Restablecimiento de contraseña - Doctorfy"
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ 
                background: linear-gradient(135deg, #00bcd4, #0097a7);
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{ 
                padding: 30px;
                background: #fff;
                border: 1px solid #eee;
                border-radius: 0 0 10px 10px;
            }}
            .button {{ 
                display: inline-block;
                background: linear-gradient(135deg, #00bcd4, #0097a7);
                color: white;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .warning {{
                background: #fff3e0;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #ff9800;
            }}
            .footer {{ 
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #777;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Doctorfy</h1>
                <p>Restablecimiento de Contraseña</p>
            </div>
            
            <div class="content">
                <h2>¿Olvidaste tu contraseña?</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
                   Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Restablecer Contraseña</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <p>Este enlace expirará en 24 horas por razones de seguridad.</p>
                    <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
                </div>
                
                <p>O copia y pega esta URL en tu navegador:</p>
                <p style="word-break: break-all; color: #666;">{reset_url}</p>
            </div>
            
            <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>&copy; {datetime.datetime.now().year} Doctorfy. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(subject, html_content, to_email, html=True)

def send_registration_notification(user_data):
    """
    Envía una notificación por correo cuando un nuevo usuario se registra.
    
    Args:
        user_data (dict): Datos del usuario registrado
    
    Returns:
        bool: True si el correo se envió correctamente, False en caso contrario
    """
    subject = "Nuevo usuario registrado en Doctorfy"
    
    # Actualizar la URL base
    BASE_URL = "https://www.doctorfy.app"
    
    # Crear cuerpo del mensaje en HTML con enlace al panel de administración
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
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Nuevo usuario registrado en Doctorfy</h1>
            <p>Se ha registrado un nuevo usuario en la plataforma:</p>
            
            <div class="info">
                <p><strong>Email:</strong> {user_data.get('email')}</p>
                <p><strong>ID:</strong> {user_data.get('id')}</p>
                <p><strong>Fecha:</strong> {user_data.get('created_at')}</p>
                <p><strong>Tipo de usuario:</strong> {"Médico" if user_data.get('is_doctor') else "Paciente"}</p>
            </div>
            
            <p>Si este usuario necesita acceso a la plataforma, puedes activar su suscripción manualmente desde el panel de administración:</p>
            
            <a href="{BASE_URL}/admin/users" class="button">Ir al Panel de Administración</a>
            
            <div class="footer">
                <p>Este es un mensaje automático del sistema Doctorfy.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Enviar correo a la dirección configurada
    return send_email(subject, html_body, to_email="info@marketeapy.com", html=True)

def send_welcome_email(user):
    """Envía un correo de bienvenida al usuario con información sobre sus créditos."""
    subject = "¡Bienvenido a Doctorfy! Tus créditos de bienvenida están listos"
    
    # Actualizar la URL base
    BASE_URL = "https://www.doctorfy.app"
    
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            h1 {{ color: #00bcd4; text-align: center; }}
            .info {{ background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }}
            .credits-box {{ 
                background: linear-gradient(135deg, #00bcd4, #0097a7);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }}
            .credits-number {{
                font-size: 48px;
                font-weight: bold;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                margin: 10px 0;
            }}
            .feature {{
                background: rgba(0,188,212,0.1);
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
            }}
            .button {{
                display: inline-block;
                background-color: #00bcd4;
                color: white;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 25px;
                margin-top: 20px;
                font-weight: bold;
            }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #777; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>¡Bienvenido a Doctorfy!</h1>
            
            <div class="credits-box">
                <h2>Tus Créditos de Bienvenida</h2>
                <div class="credits-number">15</div>
                <p>créditos disponibles para comenzar</p>
            </div>
            
            <div class="info">
                <h3>¿Qué puedes hacer con tus créditos?</h3>
                <div class="feature">
                    <strong>🏥 Análisis Médicos (5 créditos)</strong>
                    <p>Analiza estudios médicos como radiografías, resonancias y más.</p>
                </div>
                <div class="feature">
                    <strong>🍎 Análisis Nutricionales (1 crédito)</strong>
                    <p>Obtén información nutricional detallada de tus alimentos.</p>
                </div>
            </div>
            
            <div class="info">
                <h3>Información Importante</h3>
                <ul>
                    <li>Los créditos no expiran</li>
                    <li>Solo se consumen cuando el análisis es exitoso</li>
                    <li>Puedes ver tu balance en la barra superior de la aplicación</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="{BASE_URL}/credits-info" class="button">
                    Ver Más Información
                </a>
            </div>
            
            <div class="footer">
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p>Equipo Doctorfy</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(subject, html_body, to_email=user.email, html=True) 