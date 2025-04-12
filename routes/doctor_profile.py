from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, User, Doctor, DoctorCredential, DoctorReview
import os
import uuid
from datetime import datetime
import json

doctor_profile_bp = Blueprint('doctor_profile', __name__)

# Configuración para subida de archivos
UPLOAD_FOLDER = 'uploads/doctor_credentials'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@doctor_profile_bp.route('', methods=['GET'])
@jwt_required()
def get_doctor_profile():
    user_id = get_jwt_identity()
    
    try:
        # Verificar que el usuario es un médico
        user = User.query.get(user_id)
        
        if not user or not user.is_doctor:
            return jsonify({'error': 'Acceso denegado. Se requiere ser médico.'}), 403
        
        # Obtener el perfil del médico
        doctor = Doctor.query.filter_by(user_id=user_id).first()
        
        if not doctor:
            return jsonify({'error': 'Perfil de médico no encontrado'}), 404
        
        # Obtener credenciales
        credentials = DoctorCredential.query.filter_by(doctor_id=doctor.id).all()
        credentials_data = [credential.to_dict() for credential in credentials]
        
        # Construir respuesta
        profile_data = {
            'id': doctor.id,
            'specialty': doctor.specialty,
            'license_number': doctor.license_number,
            'description': doctor.description,
            'education': doctor.education,
            'experience_years': doctor.experience_years,
            'consultation_fee': doctor.consultation_fee,
            'available_online': doctor.available_online,
            'languages': doctor.languages,
            'office_address': doctor.office_address,
            'office_phone': doctor.office_phone,
            'office_hours': getattr(doctor, 'office_hours', ''),
            'website': getattr(doctor, 'website', ''),
            'social_media': getattr(doctor, 'social_media', {}),
            'profile_picture': user.profile_picture,
            'credentials': credentials_data
        }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        print(f"Error al obtener perfil del médico: {str(e)}")
        return jsonify({'error': 'Error al obtener información del perfil'}), 500

@doctor_profile_bp.route('/update', methods=['POST'])
@jwt_required()
def update_doctor_profile():
    user_id = get_jwt_identity()
    
    try:
        # Verificar que el usuario es un médico
        user = User.query.get(user_id)
        
        if not user or not user.is_doctor:
            return jsonify({'error': 'Acceso denegado. Se requiere ser médico.'}), 403
        
        # Obtener el perfil del médico
        doctor = Doctor.query.filter_by(user_id=user_id).first()
        
        if not doctor:
            return jsonify({'error': 'Perfil de médico no encontrado'}), 404
        
        # Obtener datos del formulario
        profile_data = json.loads(request.form.get('data', '{}'))
        
        # Actualizar datos del médico
        doctor.specialty = profile_data.get('specialty', doctor.specialty)
        doctor.license_number = profile_data.get('license_number', doctor.license_number)
        doctor.description = profile_data.get('description', doctor.description)
        doctor.education = profile_data.get('education', doctor.education)
        doctor.experience_years = profile_data.get('experience_years', doctor.experience_years)
        doctor.consultation_fee = profile_data.get('consultation_fee', doctor.consultation_fee)
        doctor.available_online = profile_data.get('available_online', doctor.available_online)
        doctor.languages = profile_data.get('languages', doctor.languages)
        doctor.office_address = profile_data.get('office_address', doctor.office_address)
        doctor.office_phone = profile_data.get('office_phone', doctor.office_phone)
        
        # Campos adicionales
        doctor.office_hours = profile_data.get('office_hours', getattr(doctor, 'office_hours', ''))
        doctor.website = profile_data.get('website', getattr(doctor, 'website', ''))
        doctor.social_media = profile_data.get('social_media', getattr(doctor, 'social_media', {}))
        
        # Procesar imagen de perfil si se proporciona
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            
            if file and file.filename:
                # Crear nombre de archivo seguro
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                
                # Guardar archivo
                upload_dir = os.path.join(current_app.root_path, 'uploads', 'profile_pics')
                os.makedirs(upload_dir, exist_ok=True)
                file_path = os.path.join(upload_dir, unique_filename)
                file.save(file_path)
                
                # Actualizar ruta en el usuario
                user.profile_picture = f"profile_pics/{unique_filename}"
        
        # Actualizar credenciales
        if 'credentials' in profile_data:
            # Eliminar credenciales existentes
            DoctorCredential.query.filter_by(doctor_id=doctor.id).delete()
            
            # Añadir nuevas credenciales
            for cred_data in profile_data['credentials']:
                credential = DoctorCredential(
                    doctor_id=doctor.id,
                    title=cred_data.get('title', ''),
                    institution=cred_data.get('institution', ''),
                    year=cred_data.get('year'),
                    description=cred_data.get('description', '')
                )
                db.session.add(credential)
        
        # Guardar cambios
        db.session.commit()
        
        return jsonify({'message': 'Perfil actualizado correctamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error al actualizar perfil del médico: {str(e)}")
        return jsonify({'error': 'Error al actualizar el perfil'}), 500

@doctor_profile_bp.route('/credentials', methods=['GET'])
@jwt_required()
def get_credentials():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_doctor:
        return jsonify({'error': 'No autorizado'}), 403
    
    doctor = Doctor.query.filter_by(user_id=user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Perfil de doctor no encontrado'}), 404
    
    credentials = [credential.to_dict() for credential in doctor.credentials]
    
    return jsonify({
        'credentials': credentials
    }), 200

@doctor_profile_bp.route('/credentials', methods=['POST'])
@jwt_required()
def add_credential():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_doctor:
        return jsonify({'error': 'No autorizado'}), 403
    
    doctor = Doctor.query.filter_by(user_id=user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Perfil de doctor no encontrado'}), 404
    
    # Verificar si se envió un archivo
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió ningún archivo'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de archivo no permitido'}), 400
    
    # Guardar el archivo
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    # Asegurarse de que el directorio existe
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    file.save(file_path)
    
    # Obtener datos del formulario
    title = request.form.get('title')
    institution = request.form.get('institution')
    year = request.form.get('year')
    description = request.form.get('description')
    
    if not title or not institution:
        return jsonify({'error': 'Título e institución son requeridos'}), 400
    
    # Crear la credencial
    credential = DoctorCredential(
        doctor_id=doctor.id,
        title=title,
        institution=institution,
        year=int(year) if year else None,
        description=description,
        file_path=f"doctor_credentials/{unique_filename}"
    )
    
    db.session.add(credential)
    db.session.commit()
    
    return jsonify({
        'message': 'Credencial agregada con éxito',
        'credential': credential.to_dict()
    }), 201

@doctor_profile_bp.route('/credentials/<int:credential_id>', methods=['DELETE'])
@jwt_required()
def delete_credential(credential_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_doctor:
        return jsonify({'error': 'No autorizado'}), 403
    
    doctor = Doctor.query.filter_by(user_id=user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Perfil de doctor no encontrado'}), 404
    
    credential = DoctorCredential.query.get(credential_id)
    
    if not credential or credential.doctor_id != doctor.id:
        return jsonify({'error': 'Credencial no encontrada'}), 404
    
    # Eliminar el archivo si existe
    if credential.file_path:
        file_path = os.path.join(current_app.root_path, 'uploads', credential.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.session.delete(credential)
    db.session.commit()
    
    return jsonify({
        'message': 'Credencial eliminada con éxito'
    }), 200

@doctor_profile_bp.route('/<int:doctor_id>/reviews', methods=['GET'])
def get_doctor_reviews(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    
    if not doctor:
        return jsonify({'error': 'Doctor no encontrado'}), 404
    
    reviews = [review.to_dict() for review in doctor.reviews]
    
    return jsonify({
        'reviews': reviews,
        'average_rating': doctor.get_average_rating(),
        'review_count': len(reviews)
    }), 200

@doctor_profile_bp.route('/<int:doctor_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(doctor_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    doctor = Doctor.query.get(doctor_id)
    
    if not doctor:
        return jsonify({'error': 'Doctor no encontrado'}), 404
    
    # Verificar si el usuario ya ha dejado una reseña para este doctor
    existing_review = DoctorReview.query.filter_by(doctor_id=doctor_id, user_id=user_id).first()
    
    if existing_review:
        return jsonify({'error': 'Ya has dejado una reseña para este doctor'}), 400
    
    data = request.get_json()
    
    rating = data.get('rating')
    comment = data.get('comment')
    
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'error': 'La calificación debe ser un número entre 1 y 5'}), 400
    
    # Crear la reseña
    review = DoctorReview(
        doctor_id=doctor_id,
        user_id=user_id,
        rating=rating,
        comment=comment
    )
    
    db.session.add(review)
    db.session.commit()
    
    return jsonify({
        'message': 'Reseña agregada con éxito',
        'review': review.to_dict()
    }), 201

@doctor_profile_bp.route('/<int:doctor_id>/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(doctor_id, review_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    review = DoctorReview.query.get(review_id)
    
    if not review or review.doctor_id != doctor_id:
        return jsonify({'error': 'Reseña no encontrada'}), 404
    
    # Solo el usuario que creó la reseña o un administrador puede eliminarla
    if review.user_id != user_id and user.role not in ['ADMIN', 'SUPERADMIN']:
        return jsonify({'error': 'No autorizado'}), 403
    
    db.session.delete(review)
    db.session.commit()
    
    return jsonify({
        'message': 'Reseña eliminada con éxito'
    }), 200 