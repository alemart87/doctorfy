from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, MedicalStudy
from utils.anthropic_utils import generate_integrated_diagnosis_with_anthropic
from datetime import datetime

diagnosis_bp = Blueprint('diagnosis_bp', __name__)

@diagnosis_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_diagnosis():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        data = request.get_json()
        study_ids = data.get('study_ids') # Lista de IDs de MedicalStudy
        symptoms_text = data.get('symptoms_text')

        if not study_ids and not symptoms_text:
            return jsonify({"error": "Se requieren IDs de estudios o texto de síntomas"}), 400
        
        if not isinstance(study_ids, list) and study_ids is not None:
             return jsonify({"error": "study_ids debe ser una lista"}), 400

        # Lógica de créditos (ejemplo: 10 créditos por diagnóstico integrado)
        required_credits = 10.0 # Definir costo
        if user.credits < required_credits:
            return jsonify({
                "error": "Créditos insuficientes para generar el diagnóstico.",
                "message": f"Necesitas {required_credits} créditos, pero tienes {user.credits}."
            }), 402 # Payment Required

        studies_details = []
        if study_ids:
            for study_id in study_ids:
                study = MedicalStudy.query.filter_by(id=study_id, patient_id=user_id).first()
                if study:
                    if not study.interpretation:
                        current_app.logger.warning(f"Estudio ID {study_id} seleccionado para diagnóstico no tiene interpretación. Se omitirá de los detalles para Anthropic, pero se informará al usuario.")
                        # Podrías optar por devolver un error aquí o simplemente omitirlo.
                        # return jsonify({"error": f"El estudio '{study.name or study.study_type}' (ID: {study_id}) no ha sido interpretado aún."}), 400
                    
                    studies_details.append({
                        "name": study.name or f"Estudio ID {study.id}",
                        "type": study.study_type,
                        "date": study.updated_at.strftime('%Y-%m-%d') if study.updated_at else "Fecha desconocida",
                        "interpretation": study.interpretation if study.interpretation else "Este estudio aún no ha sido interpretado o la interpretación no está disponible."
                    })
                else:
                    current_app.logger.warning(f"Estudio ID {study_id} no encontrado o no pertenece al usuario {user_id}")
                    # Considerar si devolver un error o simplemente ignorar IDs no válidos/no autorizados

        if not studies_details and not symptoms_text: # Si después de filtrar, no quedan estudios válidos y no hay síntomas
            return jsonify({"error": "No se proporcionaron estudios válidos ni síntomas para el análisis."}), 400

        user_profile_info = {
            "age": user.calculate_age(),
            "gender": user.gender,
            # Podríamos añadir más campos del perfil si son relevantes y están disponibles
            # "conditions": user.health_profile.preexisting_conditions if user.health_profiles else None 
            # (requeriría cargar health_profiles o tener un campo directo en User)
        }
        
        # Limitar la longitud de los síntomas para evitar prompts excesivamente largos
        MAX_SYMPTOMS_LENGTH = 3000 
        if symptoms_text and len(symptoms_text) > MAX_SYMPTOMS_LENGTH:
            symptoms_text = symptoms_text[:MAX_SYMPTOMS_LENGTH]
            current_app.logger.warning(f"Texto de síntomas truncado a {MAX_SYMPTOMS_LENGTH} caracteres para el usuario {user_id}")


        current_app.logger.info(f"Preparando para generar diagnóstico para usuario {user_id} con {len(studies_details)} estudios y síntomas: '{symptoms_text[:100]}...'")

        diagnosis_result = generate_integrated_diagnosis_with_anthropic(
            studies_details=studies_details,
            symptoms_text=symptoms_text if symptoms_text else "El paciente no reportó síntomas específicos para este análisis.",
            user_profile_info=user_profile_info
        )

        if "Error:" in diagnosis_result or "El servicio de análisis está temporalmente sobrecargado" in diagnosis_result:
             # No descontar créditos si hubo un error significativo en la generación
            current_app.logger.error(f"Error en la generación de diagnóstico para {user_id}: {diagnosis_result}")
            return jsonify({"error": "No se pudo generar el diagnóstico.", "details": diagnosis_result}), 500
        
        # Consumir créditos si el análisis fue exitoso (o al menos no un error obvio)
        user.credits -= required_credits
        db.session.commit()
        
        current_app.logger.info(f"Diagnóstico generado para {user_id}. Créditos restantes: {user.credits}")

        return jsonify({
            "diagnosis": diagnosis_result,
            "credits_remaining": user.credits
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error en la ruta /generate_diagnosis: {str(e)}")
        import traceback
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Error interno del servidor al generar el diagnóstico."}), 500 