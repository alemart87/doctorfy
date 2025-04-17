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
    subject = "Restablecimiento de contraseña - Doctorfy"
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #2196f3; color: white; padding: 10px 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .button {{ display: inline-block; background-color: #2196f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; }}
            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Doctorfy</h1>
            </div>
            <div class="content">
                <h2>Restablecimiento de contraseña</h2>
                <p>Has solicitado restablecer tu contraseña en Doctorfy. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Restablecer contraseña</a>
                </p>
                <p>O copia y pega la siguiente URL en tu navegador:</p>
                <p>{reset_url}</p>
                <p>Este enlace expirará en 24 horas.</p>
                <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
            </div>
            <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>&copy; {datetime.datetime.now().year} Doctorfy. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(subject, html_content, to_email)

def send_registration_notification(user_data):
    """
    Envía una notificación por correo cuando un nuevo usuario se registra.
    
    Args:
        user_data (dict): Datos del usuario registrado
    
    Returns:
        bool: True si el correo se envió correctamente, False en caso contrario
    """
    subject = "Nuevo usuario registrado en Doctorfy"
    
    # Crear cuerpo del mensaje en HTML
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            h1 {{ color: #7c4dff; }}
            .info {{ background-color: #f9f9f9; padding: 15px; border-radius: 5px; }}
            .footer {{ margin-top: 20px; font-size: 12px; color: #777; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Nuevo usuario registrado en Doctorfy</h1>
            <p>Se ha registrado un nuevo usuario en la plataforma:</p>
            
            <div class="info">
                <p><strong>Email:</strong> {user_data.get('email')}</p>
                <p><strong>Fecha:</strong> {user_data.get('created_at')}</p>
                <p><strong>Tipo de usuario:</strong> {"Médico" if user_data.get('is_doctor') else "Paciente"}</p>
            </div>
            
            <div class="footer">
                <p>Este es un mensaje automático del sistema Doctorfy.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Enviar correo a la dirección configurada
    return send_email(subject, html_body, to_email="info@marketeapy.com", html=True) 