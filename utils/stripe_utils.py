import stripe
from flask import current_app, url_for
from models import db, Payment, Doctor, User, Consultation
from datetime import datetime, timedelta

def init_stripe():
    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

def create_checkout_session_for_doctor(doctor_id):
    init_stripe()
    
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return None
    
    user = User.query.get(doctor.user_id)
    if not user:
        return None
    
    # Crear un objeto de pago en nuestra base de datos
    payment = Payment(
        user_id=user.id,
        amount=250000,  # 250.000 Gs
        payment_type='subscription',
        status='pending'
    )
    db.session.add(payment)
    db.session.commit()
    
    # Crear la sesión de checkout en Stripe
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': current_app.config['DOCTOR_SUBSCRIPTION_PRICE'],
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=url_for('doctors.subscription_success', payment_id=payment.id, _external=True),
            cancel_url=url_for('doctors.subscription_cancel', payment_id=payment.id, _external=True),
            client_reference_id=str(payment.id),
            metadata={
                'payment_id': payment.id,
                'user_id': user.id,
                'doctor_id': doctor.id,
                'payment_type': 'subscription'
            }
        )
        
        # Actualizar el pago con el ID de la sesión de Stripe
        payment.stripe_payment_id = checkout_session.id
        db.session.commit()
        
        return checkout_session
        
    except Exception as e:
        # En caso de error, marcar el pago como fallido
        payment.status = 'failed'
        db.session.commit()
        raise e

def create_checkout_session_for_consultation(user_id, consultation_type):
    init_stripe()
    
    user = User.query.get(user_id)
    if not user:
        return None
    
    # Crear un objeto de pago en nuestra base de datos
    payment = Payment(
        user_id=user.id,
        amount=40000,  # 40.000 Gs
        payment_type='consultation',
        status='pending'
    )
    db.session.add(payment)
    
    # Crear una consulta asociada al pago
    consultation = Consultation(
        patient_id=user.id,
        consultation_type=consultation_type,
        status='pending'
    )
    db.session.add(consultation)
    db.session.flush()
    
    # Asociar el pago a la consulta
    payment.consultation_id = consultation.id
    db.session.commit()
    
    # Crear la sesión de checkout en Stripe
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': current_app.config['PATIENT_CONSULTATION_PRICE'],
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=url_for('medical_studies.consultation_success', payment_id=payment.id, _external=True),
            cancel_url=url_for('medical_studies.consultation_cancel', payment_id=payment.id, _external=True),
            client_reference_id=str(payment.id),
            metadata={
                'payment_id': payment.id,
                'user_id': user.id,
                'consultation_id': consultation.id,
                'consultation_type': consultation_type,
                'payment_type': 'consultation'
            }
        )
        
        # Actualizar el pago con el ID de la sesión de Stripe
        payment.stripe_payment_id = checkout_session.id
        db.session.commit()
        
        return checkout_session
        
    except Exception as e:
        # En caso de error, marcar el pago como fallido
        payment.status = 'failed'
        consultation.status = 'failed'
        db.session.commit()
        raise e

def handle_checkout_session_completed(session):
    """
    Maneja el evento de sesión de checkout completada de Stripe
    """
    payment_id = session.get('metadata', {}).get('payment_id')
    if not payment_id:
        return False
    
    payment = Payment.query.get(payment_id)
    if not payment:
        return False
    
    # Actualizar el estado del pago
    payment.status = 'completed'
    
    # Si es una suscripción de doctor, actualizar el estado de la suscripción
    if payment.payment_type == 'subscription':
        doctor_id = session.get('metadata', {}).get('doctor_id')
        if doctor_id:
            doctor = Doctor.query.get(doctor_id)
            if doctor:
                doctor.subscription_active = True
                doctor.subscription_end = datetime.utcnow() + timedelta(days=30)  # Suscripción por 30 días
    
    # Si es un pago de consulta, actualizar el estado de la consulta
    elif payment.payment_type == 'consultation':
        consultation_id = session.get('metadata', {}).get('consultation_id')
        if consultation_id:
            consultation = Consultation.query.get(consultation_id)
            if consultation:
                consultation.status = 'paid'
    
    db.session.commit()
    return True 