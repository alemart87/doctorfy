from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date
import enum
from enum import Enum
import uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Enum

db = SQLAlchemy()

# Nuevo Enum para los estados del estudio
class StudyStatus(enum.Enum):
    PENDING = 'PENDING'
    PROCESSING = 'PROCESSING'
    COMPLETED = 'COMPLETED' # Usaremos este para indicar que la interpretación está lista
    FAILED = 'FAILED'

class UserRole(enum.Enum):
    USER = "user"
    DOCTOR = "doctor"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"
    VERY_ACTIVE = "very_active"

class HealthScore(str, Enum):
    VERY_HEALTHY = "very_healthy"
    HEALTHY = "healthy"
    MODERATELY_HEALTHY = "moderately_healthy"
    LESS_HEALTHY = "less_healthy"
    UNHEALTHY = "unhealthy"

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
    
    # Campos adicionales
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    height = db.Column(db.Float)  # en cm
    profile_picture = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    address = db.Column(db.String(255))
    emergency_contact = db.Column(db.String(255))
    
    # Relaciones
    consultations = db.relationship('Consultation', backref='patient', lazy=True, foreign_keys='Consultation.patient_id')
    payments = db.relationship('Payment', backref='user', lazy=True)
    
    # Relaciones adicionales
    health_profiles = db.relationship('HealthProfile', backref='user', lazy=True)
    medications = db.relationship('Medication', backref='user', lazy=True)
    physical_activities = db.relationship('PhysicalActivity', backref='user', lazy=True)
    blood_pressure_records = db.relationship('BloodPressure', backref='user', lazy=True)
    weight_records = db.relationship('WeightRecord', backref='user', lazy=True)
    
    daily_calorie_goal = db.Column(db.Integer, nullable=True, default=2000) # Objetivo calórico diario
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        return self.role in ['ADMIN', 'SUPERADMIN']
    
    def is_superadmin(self):
        return self.role == UserRole.SUPERADMIN
    
    def calculate_age(self):
        if not self.date_of_birth:
            return None
        today = datetime.date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
    
    def to_dict(self):
        base_dict = {
            'id': self.id,
            'email': self.email,
            'is_doctor': self.is_doctor,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'age': self.calculate_age(),
            'gender': self.gender,
            'height': self.height,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat()
        }
        
        # Si es doctor, agregar información específica
        if self.is_doctor:
            base_dict.update({
                'specialty': self.specialty,
                'license_number': self.license_number,
                'subscription_active': self.subscription_active
            })
        
        return base_dict

    def __repr__(self):
        return f'<User {self.email}>'

class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    education = db.Column(db.Text)
    experience_years = db.Column(db.Integer)
    consultation_fee = db.Column(db.Float)
    available_online = db.Column(db.Boolean, default=False)
    languages = db.Column(ARRAY(db.String))
    office_address = db.Column(db.String(255))
    office_phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    credentials = db.relationship('DoctorCredential', backref='doctor', lazy=True)
    reviews = db.relationship('DoctorReview', backref='doctor', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialty': self.specialty,
            'license_number': self.license_number,
            'description': self.description,
            'education': self.education,
            'experience_years': self.experience_years,
            'consultation_fee': self.consultation_fee,
            'available_online': self.available_online,
            'languages': self.languages,
            'office_address': self.office_address,
            'office_phone': self.office_phone,
            'average_rating': self.get_average_rating(),
            'review_count': len(self.reviews),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_average_rating(self):
        if not self.reviews:
            return 0
        return sum(review.rating for review in self.reviews) / len(self.reviews)

class MedicalStudy(db.Model):
    __tablename__ = 'medical_studies'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=True)
    study_type = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    interpretation = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(db.String(20), default='PENDING', nullable=False)
    name = db.Column(db.Text, nullable=True)
    
    patient = db.relationship('User', backref=db.backref('medical_studies', lazy=True))
    doctor = db.relationship('Doctor', backref=db.backref('assigned_studies', lazy=True))
    
    def __repr__(self):
        return f'<MedicalStudy {self.id} - {self.study_type}>'

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

class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    token = db.Column(db.String(100), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def is_valid(self):
        return not self.used and datetime.utcnow() < self.expires_at

class HealthProfile(db.Model):
    __tablename__ = 'health_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activity_level = db.Column(db.String(20))
    health_score = db.Column(db.String(20))
    preexisting_conditions = db.Column(db.Text)  # Lista separada por comas o JSON
    allergies = db.Column(db.Text)
    smoking = db.Column(db.Boolean, default=False)
    alcohol_consumption = db.Column(db.String(20))  # none, light, moderate, heavy
    sleep_hours = db.Column(db.Float)
    stress_level = db.Column(db.Integer)  # 1-10
    diet_type = db.Column(db.String(50))  # omnivore, vegetarian, vegan, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_level': self.activity_level,
            'health_score': self.health_score,
            'preexisting_conditions': self.preexisting_conditions,
            'allergies': self.allergies,
            'smoking': self.smoking,
            'alcohol_consumption': self.alcohol_consumption,
            'sleep_hours': self.sleep_hours,
            'stress_level': self.stress_level,
            'diet_type': self.diet_type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Medication(db.Model):
    __tablename__ = 'medications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50))
    frequency = db.Column(db.String(50))  # daily, twice daily, etc.
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    reminder_times = db.Column(db.Text)  # JSON array of times
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relación con recordatorios
    reminders = db.relationship('MedicationReminder', backref='medication', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'reminder_times': self.reminder_times,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class MedicationReminder(db.Model):
    __tablename__ = 'medication_reminders'
    
    id = db.Column(db.Integer, primary_key=True)
    medication_id = db.Column(db.Integer, db.ForeignKey('medications.id'), nullable=False)
    reminder_time = db.Column(db.Time, nullable=False)
    is_taken = db.Column(db.Boolean, default=False)
    taken_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PhysicalActivity(db.Model):
    __tablename__ = 'physical_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer)  # en minutos
    intensity = db.Column(db.String(20))  # low, moderate, high
    calories_burned = db.Column(db.Integer)
    date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'duration': self.duration,
            'intensity': self.intensity,
            'calories_burned': self.calories_burned,
            'date': self.date.isoformat(),
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

class BloodPressure(db.Model):
    __tablename__ = 'blood_pressure_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    systolic = db.Column(db.Integer, nullable=False)  # presión sistólica
    diastolic = db.Column(db.Integer, nullable=False)  # presión diastólica
    pulse = db.Column(db.Integer)  # pulso
    measured_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'systolic': self.systolic,
            'diastolic': self.diastolic,
            'pulse': self.pulse,
            'measured_at': self.measured_at.isoformat(),
            'notes': self.notes
        }

class WeightRecord(db.Model):
    __tablename__ = 'weight_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    weight = db.Column(db.Float, nullable=False)  # en kg
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'weight': self.weight,
            'date': self.date.isoformat(),
            'notes': self.notes
        }
    
    def calculate_bmi(self, height):
        if not height or height <= 0:
            return None
        # Altura en metros (convertir de cm)
        height_m = height / 100
        return round(self.weight / (height_m * height_m), 2)

# Modelo para las credenciales del doctor (títulos, certificados, etc.)
class DoctorCredential(db.Model):
    __tablename__ = 'doctor_credentials'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'title': self.title,
            'institution': self.institution,
            'year': self.year,
            'description': self.description,
            'file_path': self.file_path,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Modelo para las reseñas de doctores
class DoctorReview(db.Model):
    __tablename__ = 'doctor_reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con el usuario que hizo la reseña
    user = db.relationship('User', backref='doctor_reviews')
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'user_id': self.user_id,
            'user_name': f"{self.user.first_name} {self.user.last_name}" if self.user.first_name and self.user.last_name else self.user.email,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Nuevo modelo para registrar entradas nutricionales
class NutritionLog(db.Model):
    __tablename__ = 'nutrition_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # Usamos Date para registrar el día, no la hora exacta
    log_date = db.Column(db.Date, nullable=False, default=date.today)
    calories = db.Column(db.Integer, nullable=False, default=0)
    proteins = db.Column(db.Float, nullable=False, default=0.0)
    carbs = db.Column(db.Float, nullable=False, default=0.0)
    fats = db.Column(db.Float, nullable=False, default=0.0)
    # Opcional: guardar el análisis de texto o la ruta de la imagen original
    source_analysis_id = db.Column(db.Integer, db.ForeignKey('nutrition_analysis.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('nutrition_logs', lazy=True))
    source_analysis = db.relationship('NutritionAnalysis', backref=db.backref('log_entry', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'log_date': self.log_date.isoformat(),
            'calories': self.calories,
            'proteins': self.proteins,
            'carbs': self.carbs,
            'fats': self.fats,
            'source_analysis_id': self.source_analysis_id,
            'created_at': self.created_at.isoformat()
        }

# Tabla de relación entre médicos y pacientes
class DoctorPatient(db.Model):
    __tablename__ = 'doctor_patients'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    doctor = db.relationship('Doctor', backref=db.backref('patient_associations', lazy=True))
    patient = db.relationship('User', backref=db.backref('doctor_associations', lazy=True))
    
    def __repr__(self):
        return f'<DoctorPatient doctor_id={self.doctor_id} patient_id={self.patient_id}>' 