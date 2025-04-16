from flask import Blueprint, send_from_directory, current_app, abort
import os
from flask_jwt_extended import jwt_required, get_jwt_identity

media_bp = Blueprint('media', __name__)

@media_bp.route('/uploads/medical_studies/<filename>')
@jwt_required()
def get_medical_study_image(filename):
    """Obtener una imagen de estudio médico"""
    try:
        # Verificar que el usuario tiene acceso a esta imagen
        # Aquí deberías implementar lógica para verificar permisos
        
        # Ruta al directorio de estudios médicos
        directory = current_app.config['MEDICAL_STUDIES_FOLDER']
        return send_from_directory(directory, filename)
    except Exception as e:
        current_app.logger.error(f"Error al obtener imagen de estudio médico: {e}")
        abort(404)

@media_bp.route('/uploads/nutrition/<filename>')
@jwt_required()
def get_nutrition_image(filename):
    """Obtener una imagen de nutrición"""
    try:
        # Verificar que el usuario tiene acceso a esta imagen
        # Aquí deberías implementar lógica para verificar permisos
        
        # Ruta al directorio de imágenes de nutrición
        directory = current_app.config['NUTRITION_IMAGES_FOLDER']
        return send_from_directory(directory, filename)
    except Exception as e:
        current_app.logger.error(f"Error al obtener imagen de nutrición: {e}")
        abort(404)

# Registrar el blueprint en app.py
# app.register_blueprint(media_bp, url_prefix='/api/media') 