import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
import datetime

def send_email(to_email, subject, html_content):
    """
    Función para enviar correos electrónicos
    """
    # Configuración del servidor SMTP
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_username = os.environ.get('SMTP_USERNAME')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    # Verificar que se hayan configurado las credenciales
    if not smtp_username or not smtp_password:
        print("Error: No se han configurado las credenciales SMTP")
        return False
    
    # Crear el mensaje
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_username
    msg['To'] = to_email
    
    # Adjuntar el contenido HTML
    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)
    
    try:
        # Conectar al servidor SMTP
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        
        # Enviar el correo
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        
        print(f"Correo enviado a {to_email}")
        return True
    except Exception as e:
        print(f"Error al enviar correo: {str(e)}")
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
    
    return send_email(to_email, subject, html_content) 