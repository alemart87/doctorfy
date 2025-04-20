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
                <li><strong>Monto:</strong> ${amount_eur}</li>
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
    
    # Siempre enviar a alemart87@gmail.com
    ADMIN_EMAIL = "alemart87@gmail.com"
    try:
        send_email(
            subject=subject,
            body=body,
            to_email=ADMIN_EMAIL,  # Email fijo del admin
            html=True
        )
        print(f"✅ Notificación de compra enviada a {ADMIN_EMAIL}")
    except Exception as e:
        print(f"❌ Error enviando notificación al admin: {str(e)}")
        raise  # Re-lanzar el error para manejarlo en el webhook

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
    print("\n=== WEBHOOK RECIBIDO ===")
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
        
        print(f"Tipo de evento: {event.type}")
        
        if event.type == 'checkout.session.completed':
            session = event.data.object
            print(f"Sesión completada: {session.id}")
            
            try:
                customer_email = session.customer_details.email
                quantity = session.metadata.get('quantity', 20)
                amount_total = session.amount_total / 100
                
                print(f"Email del cliente: {customer_email}")
                print(f"Cantidad de créditos: {quantity}")
                print(f"Monto total: ${amount_total}")
                
                # Enviar notificación al admin siempre, incluso para pruebas
                try:
                    print("Enviando notificación al admin...")
                    send_purchase_notification(
                        user={'email': customer_email, 'credits': quantity},
                        credits=quantity,
                        session_id=session.id,
                        amount_eur=amount_total
                    )
                except Exception as email_error:
                    print(f"❌ Error enviando notificación al admin: {str(email_error)}")
                    traceback.print_exc()
                
                # Si no es un email de prueba, procesamos la transacción
                if customer_email != 'stripe@example.com':
                    user = User.query.filter_by(email=customer_email).first()
                    if user:
                        # Procesar transacción
                        transaction = CreditTransaction(
                            user_id=user.id,
                            amount=int(quantity),
                            stripe_session_id=session.id,
                            status='completed'
                        )
                        
                        user.credits = float(user.credits or 0) + int(quantity)
                        db.session.add(transaction)
                        db.session.commit()
                        
                        print(f"✅ {quantity} créditos asignados a {user.email}")
                        
                        # Enviar email de agradecimiento al usuario
                        try:
                            print(f"Enviando email de agradecimiento a {user.email}...")
                            send_purchase_thank_you(user, quantity)
                            print("✅ Email de agradecimiento enviado")
                        except Exception as email_error:
                            print(f"❌ Error enviando email de agradecimiento: {str(email_error)}")
                            traceback.print_exc()
                    else:
                        print(f"❌ Usuario no encontrado: {customer_email}")
                        return jsonify({'error': 'User not found'}), 404
                else:
                    print("✅ Evento de prueba procesado")
                    
            except Exception as e:
                print(f"❌ Error procesando la compra: {str(e)}")
                traceback.print_exc()
                return jsonify({'error': str(e)}), 400
                
        return jsonify({'status': 'success'})
        
    except Exception as e:
        print(f"❌ Error general: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400 