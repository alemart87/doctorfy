import os
from dotenv import load_dotenv
from utils.email_utils import send_email

def test_email_sending():
    # Cargar variables de entorno
    load_dotenv()
    
    # Probar envío de correo
    subject = "Prueba de envío de correo desde Doctorfy"
    body = """
    <html>
    <body>
        <h1>Prueba de envío de correo</h1>
        <p>Este es un correo de prueba para verificar la configuración SMTP.</p>
        <p>Si estás recibiendo este correo, la configuración es correcta.</p>
    </body>
    </html>
    """
    
    success = send_email(subject, body, to_email="info@marketeapy.com", html=True)
    
    if success:
        print("Correo enviado exitosamente.")
    else:
        print("Error al enviar el correo. Verifica la configuración SMTP.")

if __name__ == "__main__":
    test_email_sending() 