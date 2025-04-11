from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import enum

db = SQLAlchemy()

class UserRole(enum.Enum):
    USER = "user"
    DOCTOR = "doctor"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_doctor = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), default='USER')  # USER, DOCTOR, ADMIN, SUPERADMIN
    specialty = db.Column(db.String(100), nullable=True)
    license_number = db.Column(db.String(50), nullable=True)
    subscription_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    consultations = db.relationship('Consultation', backref='patient', lazy=True, foreign_keys='Consultation.patient_id')
    payments = db.relationship('Payment', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        return self.role in ['ADMIN', 'SUPERADMIN']
    
    def is_superadmin(self):
        return self.role == UserRole.SUPERADMIN
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_doctor': self.is_doctor,
            'role': self.role,
            'specialty': self.specialty,
            'license_number': self.license_number,
            'subscription_active': self.subscription_active,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<User {self.email}>'

class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    specialty = db.Column(db.String(100))
    license_number = db.Column(db.String(50))
    subscription_active = db.Column(db.Boolean, default=False)
    subscription_end = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialty': self.specialty,
            'license_number': self.license_number,
            'subscription_active': self.subscription_active,
            'subscription_end': self.subscription_end.isoformat() if self.subscription_end else None
        }

class MedicalStudy(db.Model):
    __tablename__ = 'medical_studies'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.String(255), nullable=True)
    study_type = db.Column(db.String(50), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    interpretation = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con el usuario (paciente)
    patient = db.relationship('User', backref=db.backref('medical_studies', lazy=True))
    
    def __repr__(self):
        return f'<MedicalStudy {self.id}>'

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='PYG')
    stripe_payment_id = db.Column(db.String(100), unique=True)
    payment_type = db.Column(db.String(50))  # 'subscription' o 'consultation'
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Consultation(db.Model):
    __tablename__ = 'consultations'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'))
    consultation_type = db.Column(db.String(50))  # 'medical_study', 'nutrition', etc.
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NutritionAnalysis(db.Model):
    __tablename__ = 'nutrition_analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    analysis = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con el usuario
    user = db.relationship('User', backref=db.backref('nutrition_analyses', lazy=True))
    
    def __repr__(self):
        return f'<NutritionAnalysis {self.id}>' 