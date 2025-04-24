from flask import Blueprint, send_from_directory, current_app, abort, jsonify
import os
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import MedicalStudy, NutritionAnalysis, User, db

media_bp = Blueprint('media', __name__)

@media_bp.route('/uploads/medical_studies/<filename>')
@jwt_required()
def get_medical_study_image(filename):
    """Obtener una imagen de estudio médico"""
    try:
        # Verificar que el usuario tiene acceso a esta imagen
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Buscar el estudio por nombre de archivo
        study = MedicalStudy.query.filter(MedicalStudy.file_path.like(f"%{filename}%")).first()
        
        if not study:
            return jsonify({"error": "Estudio no encontrado"}), 404
            
        # Los médicos pueden ver cualquier estudio, los pacientes solo los suyos
        if not user.is_doctor and str(study.patient_id) != str(user_id):
            return jsonify({"error": "No tienes permiso para ver este estudio"}), 403
        
        # Ruta al directorio de estudios médicos
        directory = current_app.config['MEDICAL_STUDIES_FOLDER']
        return send_from_directory(directory, filename)
    except Exception as e:
        current_app.logger.error(f"Error al obtener imagen de estudio médico: {e}")
        return jsonify({"error": str(e)}), 500

@media_bp.route('/uploads/nutrition/<filename>')
@jwt_required()
def get_nutrition_image(filename):
    """Obtener una imagen de nutrición"""
    try:
        # Verificar que el usuario tiene acceso a esta imagen
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Buscar el análisis por nombre de archivo
        analysis = NutritionAnalysis.query.filter(NutritionAnalysis.image_path.like(f"%{filename}%")).first()
        
        if not analysis:
            return jsonify({"error": "Análisis no encontrado"}), 404
            
        # Los médicos pueden ver cualquier análisis, los pacientes solo los suyos
        if not user.is_doctor and str(analysis.user_id) != str(user_id):
            return jsonify({"error": "No tienes permiso para ver este análisis"}), 403
        
        # Ruta al directorio de imágenes de nutrición
        directory = current_app.config['NUTRITION_IMAGES_FOLDER']
        return send_from_directory(directory, filename)
    except Exception as e:
        current_app.logger.error(f"Error al obtener imagen de nutrición: {e}")
        return jsonify({"error": str(e)}), 500

# Registrar el blueprint en app.py
# app.register_blueprint(media_bp, url_prefix='/api/media') 