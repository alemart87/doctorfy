from flask import Blueprint, jsonify, request, current_app
import stripe
from models import db, User, CreditTransaction
from utils.email_utils import send_email
import os
import traceback
from datetime import datetime

payments_bp = Blueprint('payments', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
PRODUCT_ID = 'prod_SA8W9pcwKE2odz'  # Tu ID de producto existente

def send_purchase_notification(user, credits, session_id, amount_eur):
    subject = "🎉 Nueva compra de créditos en Doctorfy"
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Nueva Compra de Créditos</h2>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la transacción:</h3>
            <ul>
                <li><strong>Usuario:</strong> {user.email}</li>
                <li><strong>Créditos comprados:</strong> {credits}</li>
                <li><strong>Monto:</strong> {amount_eur}€</li>
                <li><strong>ID de Sesión:</strong> {session_id}</li>
                <li><strong>Fecha:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</li>
            </ul>
        </div>
        
        <p>El usuario ahora tiene un total de {user.credits} créditos.</p>
        
        <p style="color: #666; font-size: 0.9em;">
        Este es un mensaje automático del sistema de Doctorfy.
        </p>
    </body>
    </html>
    """
    
    send_email(
        subject=subject,
        body=body,
        to_email="alemart87@gmail.com",
        html=True
    )

def send_purchase_thank_you(user, credits):
    subject = "¡Gracias por tu compra en Doctorfy! 🚀"
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                <h1 style="margin: 0;">¡Gracias por confiar en Doctorfy!</h1>
            </div>
            
            <p>Estimado/a {user.first_name or user.email.split('@')[0]},</p>
            
            <p>¡Tu compra de <strong>{credits} créditos</strong> se ha completado con éxito! 🎉</p>
            
            <p>Con esta inversión en tu salud, ahora podrás:</p>
            <ul>
                <li>📊 Analizar más estudios médicos con nuestra IA</li>
                <li>🥗 Obtener recomendaciones nutricionales personalizadas</li>
                <li>🤖 Consultar con nuestro asistente virtual de salud</li>
            </ul>
            
            <p>Tu nuevo balance es de <strong>{user.credits} créditos</strong>.</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #00bcd4; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>¿Sabías que?</strong> Cada análisis médico que realizas con Doctorfy te ayuda a tomar mejores decisiones sobre tu salud, respaldado por tecnología de IA de última generación.</p>
            </div>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos respondiendo a este correo.</p>
            
            <div style="border-top: 2px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #666;">Con entusiasmo por tu bienestar,</p>
                <p style="font-weight: bold; color: #00bcd4;">Equipo Doctorfy</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    send_email(
        subject=subject,
        body=body,
        to_email=user.email,
        html=True
    )

@payments_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    print("\n=== WEBHOOK RECIBIDO RAFAEL EL MEJOR ===")
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # Verificar firma
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )
        
        print(f"Tipo de evento: {event.type}")
        
        if event.type == 'checkout.session.completed':
            session = event.data.object
            print(f"Sesión completada: {session.id}")
            
            # Enviar email inmediato de confirmación
            customer_email = session.customer_details.email
            print(f"Enviando email inicial a {customer_email}")
            
            # Primer email - Confirmación inmediata
            try:
                subject = "Compra recibida en Doctorfy"
                body = f"""
                <html>
                <body>
                    <h1>¡Gracias por tu compra!</h1>
                    <p>Hola,</p>
                    <p>Hemos recibido tu pago correctamente.</p>
                    <p><strong>En breve recibirás tus créditos en tu cuenta.</strong></p>
                    <p>Te enviaremos otro email cuando los créditos estén disponibles.</p>
                    <p>Gracias por confiar en Doctorfy.</p>
                </body>
                </html>
                """
                
                send_email(subject, body, to_email=customer_email, html=True)
                print(f"✉️ Email inicial enviado a {customer_email}")
            except Exception as e:
                print(f"❌ Error enviando email inicial: {str(e)}")
            
            # Obtener detalles del producto
            line_items = stripe.checkout.Session.list_line_items(session.id)
            
            if line_items.data:
                quantity = line_items.data[0].quantity
                amount_total = session.amount_total / 100  # Convertir de centavos a euros
                print(f"Cantidad a asignar: {quantity}")
                
                # Buscar el usuario
                user = User.query.filter_by(email=customer_email).first()
                
                if user:
                    print(f"Usuario encontrado: {user.email}")
                    
                    # Registrar la transacción
                    transaction = CreditTransaction(
                        user_id=user.id,
                        amount=quantity,
                        stripe_session_id=session.id,
                        status='completed'
                    )
                    
                    # Actualizar créditos del usuario
                    old_credits = float(user.credits or 0)
                    user.credits = old_credits + quantity
                    
                    db.session.add(transaction)
                    db.session.commit()
                    
                    print(f"✅ {quantity} créditos asignados a {user.email}")
                    
                    # Enviar emails de confirmación
                    try:
                        # Email al admin
                        send_purchase_notification(
                            user=user,
                            credits=quantity,
                            session_id=session.id,
                            amount_eur=amount_total
                        )
                        print("✉️ Notificación enviada al admin")
                        
                        # Email al usuario
                        send_purchase_thank_you(user, quantity)
                        print(f"✉️ Email de confirmación enviado a {user.email}")
                    except Exception as e:
                        print(f"❌ Error enviando emails de confirmación: {str(e)}")
                        traceback.print_exc()
                else:
                    print(f"❌ No se encontró usuario con email: {customer_email}")
        
        return jsonify({'status': 'success'})
        
    except Exception as e:
        print(f"❌ Error general: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400 