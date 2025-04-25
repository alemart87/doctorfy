from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, NutritionAnalysis, PhysicalActivity
from sqlalchemy import func, Date, cast, Float, Text
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

calories_bp = Blueprint('calories', __name__)

@calories_bp.route('/daily', methods=['GET'])
@jwt_required()
def get_daily_calories():
    user_id = get_jwt_identity()
    date_str = request.args.get('date') # Espera formato YYYY-MM-DD

    if not date_str:
        return jsonify({"error": "Falta el parámetro 'date'"}), 400

    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Formato de fecha inválido. Usar YYYY-MM-DD"}), 400

    # --- Calcular Calorías Consumidas (CON CAST A JSONB) ---
    try:
        total_consumed = db.session.query(
            func.sum(
                cast(
                    cast(NutritionAnalysis.analysis, JSONB).op('->>')('calories'),
                    Float
                )
            )
        ).filter(
            NutritionAnalysis.user_id == user_id,
            cast(NutritionAnalysis.created_at, Date) == target_date,
            cast(NutritionAnalysis.analysis, JSONB).op('->>')('calories') != None
        ).scalar()

        total_consumed = total_consumed or 0

    except Exception as e:
        db.session.rollback()
        print(f"Error querying JSON calories from NutritionAnalysis: {e}")
        total_consumed = 0

    # --- Calcular Calorías Quemadas ---
    total_burned = 0
    try:
        total_burned = db.session.query(func.sum(PhysicalActivity.calories_burned)).filter(
            PhysicalActivity.user_id == user_id,
            cast(PhysicalActivity.date, Date) == target_date
        ).scalar()
        total_burned = total_burned or 0
    except Exception as e:
        print(f"Error querying burned calories (might be due to previous transaction abort): {e}")
        total_burned = 0

    print(f"[DEBUG] User: {user_id}, Date: {target_date}, Consumed: {total_consumed}, Burned: {total_burned}")

    return jsonify({
        "date": date_str,
        "total_consumed": float(total_consumed),
        "total_burned": float(total_burned)
    })

# --- Endpoint para Registrar Actividad Física ---
@calories_bp.route('/log-activity', methods=['POST'])
@jwt_required()
def log_activity():
    user_id = get_jwt_identity()
    data = request.get_json()

    activity_type = data.get('activity_type')
    duration = data.get('duration') # en minutos
    calories_burned = data.get('calories_burned')
    activity_date_str = data.get('date') # YYYY-MM-DD

    if not all([activity_type, duration, calories_burned, activity_date_str]):
        return jsonify({"error": "Faltan datos para registrar la actividad"}), 400

    # Validar tipos de datos
    try:
        duration = int(duration)
        calories_burned = float(calories_burned)
        activity_date = datetime.strptime(activity_date_str, '%Y-%m-%d').date()
        if duration <= 0 or calories_burned <= 0:
            raise ValueError("Duración y calorías deben ser positivas")
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Datos inválidos: {e}"}), 400

    try:
        new_activity = PhysicalActivity(
            user_id=user_id,
            activity_type=activity_type,
            duration=duration,
            calories_burned=calories_burned,
            date=activity_date # Asegúrate que tu modelo PhysicalActivity use 'date'
        )
        db.session.add(new_activity)
        db.session.commit()

        return jsonify({"message": "Actividad registrada con éxito", "logged_activity": new_activity.to_dict()}), 201 # Devolver la actividad registrada puede ser útil
    except Exception as e:
        db.session.rollback()
        print(f"Error al guardar actividad: {e}") # Log del error en backend
        return jsonify({"error": "Error interno al guardar la actividad"}), 500 