from flask import Blueprint, request, jsonify, redirect, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Doctor, User, Payment
from utils.auth import doctor_required
from utils.stripe_utils import create_checkout_session_for_doctor
import stripe
from datetime import datetime, timedelta
from flask import current_app

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/directory', methods=['GET'])
def get_directory():
    doctors = Doctor.query.filter_by(subscription_active=True).all()
    
    result = []
    for doc in doctors:
        user = User.query.get(doc.user_id)
        if user:
            result.append({
                'id': doc.id,
                'name': user.email.split('@')[0],  # Temporal hasta que agreguemos nombres
                'specialty': doc.specialty,
                'license_number': doc.license_number
            })
    
    return jsonify({
        'doctors': result
    }), 200

@doctors_bp.route('/subscribe', methods=['POST'])
@jwt_required()
@doctor_required
def subscribe():
    user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=user_id).first()
    
    if not doctor:
        return jsonify({'error': 'No se encontró el perfil de doctor'}), 404
    
    try:
        checkout_session = create_checkout_session_for_doctor(doctor.id)
        
        return jsonify({
            'checkout_url': checkout_session.url
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doctors_bp.route('/subscription/success', methods=['GET'])
def subscription_success():
    payment_id = request.args.get('payment_id')
    
    if not payment_id:
        return redirect(url_for('frontend.doctor_dashboard', status='error'))
    
    payment = Payment.query.get(payment_id)
    if not payment or payment.status != 'completed':
        # Verificar el estado del pago en Stripe
        try:
            stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
            session = stripe.checkout.Session.retrieve(payment.stripe_payment_id)
            
            if session.payment_status == 'paid':
                payment.status = 'completed'
                doctor = Doctor.query.filter_by(user_id=payment.user_id).first()
                if doctor:
                    doctor.subscription_active = True
                    doctor.subscription_end = datetime.utcnow() + timedelta(days=30)
                db.session.commit()
        except:
            pass
    
    return redirect(url_for('frontend.doctor_dashboard', status='success'))

@doctors_bp.route('/subscription/cancel', methods=['GET'])
def subscription_cancel():
    payment_id = request.args.get('payment_id')
    
    if payment_id:
        payment = Payment.query.get(payment_id)
        if payment:
            payment.status = 'cancelled'
            db.session.commit()
    
    return redirect(url_for('frontend.doctor_dashboard', status='cancelled')) 