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
            
            <a href="https://doctorfy.onrender.com/admin/users" class="button">Ir al Panel de Administración</a>
            
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
    """
    Envía un correo de bienvenida al usuario con información sobre su período de prueba.
    
    Args:
        user: Objeto User con la información del usuario
    
    Returns:
        bool: True si el correo se envió correctamente, False en caso contrario
    """
    subject = "¡Bienvenido a Doctorfy! Tu período de prueba gratuito ha comenzado"
    
    # Formatear las fechas para mostrarlas en el correo
    trial_end = user.trial_end.strftime('%d/%m/%Y a las %H:%M') if user.trial_end else 'No disponible'
    
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
            .highlight {{ color: #7c4dff; font-weight: bold; }}
            .steps {{ margin-top: 20px; }}
            .step {{ margin-bottom: 15px; }}
            .step-number {{ display: inline-block; width: 25px; height: 25px; background-color: #7c4dff; color: white; border-radius: 50%; text-align: center; margin-right: 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>¡Bienvenido a Doctorfy!</h1>
            <p>Gracias por registrarte en nuestra plataforma de salud inteligente. Estamos emocionados de tenerte con nosotros.</p>
            
            <div class="info">
                <h2>Tu período de prueba gratuito</h2>
                <p>Has comenzado tu período de prueba gratuito de <span class="highlight">2 días</span>, que finalizará el:</p>
                <p style="font-size: 18px; font-weight: bold; text-align: center;">{trial_end}</p>
                <p>Durante este tiempo, podrás disfrutar de todas las funcionalidades premium de Doctorfy sin costo alguno.</p>
            </div>
            
            <div class="steps">
                <h2>Primeros pasos en Doctorfy</h2>
                
                <div class="step">
                    <span class="step-number">1</span>
                    <strong>Explora el Dashboard</strong>: Accede a todas las funcionalidades desde tu panel principal.
                </div>
                
                <div class="step">
                    <span class="step-number">2</span>
                    <strong>Consulta la Guía</strong>: Aprende a utilizar todas las herramientas disponibles.
                </div>
                
                <div class="step">
                    <span class="step-number">3</span>
                    <strong>Prueba el Asistente Virtual</strong>: Resuelve tus dudas médicas y psicológicas con nuestro chatbot.
                </div>
                
                <div class="step">
                    <span class="step-number">4</span>
                    <strong>Sube tus Estudios Médicos</strong>: Obtén interpretaciones rápidas y precisas.
                </div>
            </div>
            
            <p style="margin-top: 20px;">¿Listo para comenzar?</p>
            
            <a href="https://doctorfy.onrender.com/dashboard" class="button">Ir al Dashboard</a>
            
            <div class="footer">
                <p>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.</p>
                <p>Equipo Doctorfy</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(subject, html_body, to_email=user.email, html=True) 