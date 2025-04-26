from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, User, HealthProfile, Medication, MedicationReminder, PhysicalActivity, BloodPressure, WeightRecord
import os
import uuid
from datetime import datetime, date
import json
import time

profile_bp = Blueprint('profile', __name__)

# Configuración para subida de archivos
UPLOAD_FOLDER = 'uploads/profile_pics'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        # Obtener el perfil de salud más reciente
        health_profile = HealthProfile.query.filter_by(user_id=current_user_id).order_by(HealthProfile.created_at.desc()).first()
        
        # Obtener el registro de peso más reciente
        weight_record = WeightRecord.query.filter_by(user_id=current_user_id).order_by(WeightRecord.date.desc()).first()
        
        # Construir la respuesta
        response = user.to_dict()
        
        if health_profile:
            response['health_profile'] = health_profile.to_dict()
        
        if weight_record:
            response['weight'] = weight_record.weight
            if user.height:
                response['bmi'] = weight_record.calculate_bmi(user.height)
        
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        data = request.get_json()
        
        # Actualizar campos permitidos
        allowed_fields = [
            'first_name', 'last_name', 'date_of_birth', 
            'gender', 'height', 'phone_number', 
            'address', 'emergency_contact'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Perfil actualizado con éxito',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/upload-profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se envió ningún archivo'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400

        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        # Eliminar la foto anterior si existe
        if user.profile_picture:
            try:
                old_picture_path = os.path.join(current_app.config['UPLOAD_FOLDER'], user.profile_picture)
                if os.path.exists(old_picture_path):
                    os.remove(old_picture_path)
            except Exception as e:
                print(f"Error al eliminar foto anterior: {str(e)}")

        # Generar nombre de archivo único
        filename = secure_filename(file.filename)
        unique_filename = f"profile_pics/user_{current_user_id}_{uuid.uuid4()}_{filename}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Guardar el archivo
        file.save(file_path)
        
        # Verificar que el archivo se guardó correctamente con reintentos
        max_retries = 5
        retry_delay = 0.5  # segundos
        file_size_threshold = 100  # bytes mínimos para considerar archivo válido
        
        for attempt in range(max_retries):
            if os.path.exists(file_path):
                try:
                    # Verificar que el archivo sea accesible y tenga tamaño
                    file_stats = os.stat(file_path)
                    if file_stats.st_size > file_size_threshold:
                        # Intentar abrir y leer el archivo
                        with open(file_path, 'rb') as f:
                            f.seek(0, 2)  # Ir al final del archivo
                            if f.tell() > file_size_threshold:
                                break
                except (IOError, OSError) as e:
                    print(f"Intento {attempt + 1}: Error al verificar archivo - {str(e)}")
            
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        else:
            return jsonify({'error': 'Error al guardar el archivo'}), 500
            
        # Actualizar la base de datos
        user.profile_picture = unique_filename
        db.session.commit()
        
        # Esperar un momento adicional para asegurar que el archivo esté disponible
        time.sleep(0.5)
        
        return jsonify({
            'message': 'Foto de perfil actualizada con éxito',
            'profile_picture': unique_filename
        }), 200
        
    except Exception as e:
        print(f"Error al subir foto de perfil: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/health-profile', methods=['POST'])
@jwt_required()
def create_health_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Crear o actualizar el perfil de salud
    health_profile = HealthProfile(
        user_id=user_id,
        activity_level=data.get('activity_level'),
        health_score=data.get('health_score'),
        preexisting_conditions=data.get('preexisting_conditions'),
        allergies=data.get('allergies'),
        smoking=data.get('smoking', False),
        alcohol_consumption=data.get('alcohol_consumption'),
        sleep_hours=data.get('sleep_hours'),
        stress_level=data.get('stress_level'),
        diet_type=data.get('diet_type')
    )
    
    db.session.add(health_profile)
    db.session.commit()
    
    return jsonify({
        'message': 'Perfil de salud creado con éxito',
        'health_profile': health_profile.to_dict()
    }), 201

@profile_bp.route('/health-profile', methods=['GET'])
@jwt_required()
def get_health_profile():
    user_id = get_jwt_identity()
    
    # Obtener el perfil de salud más reciente
    health_profile = HealthProfile.query.filter_by(user_id=user_id).order_by(HealthProfile.created_at.desc()).first()
    
    if not health_profile:
        return jsonify({'error': 'Perfil de salud no encontrado'}), 404
    
    return jsonify(health_profile.to_dict()), 200

@profile_bp.route('/medications', methods=['POST'])
@jwt_required()
def add_medication():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validar datos
    if not data.get('name'):
        return jsonify({'error': 'El nombre del medicamento es requerido'}), 400
    
    # Procesar fechas
    start_date = None
    end_date = None
    
    if data.get('start_date'):
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha de inicio inválido. Use YYYY-MM-DD'}), 400
    
    if data.get('end_date'):
        try:
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha de fin inválido. Use YYYY-MM-DD'}), 400
    
    # Crear el medicamento
    medication = Medication(
        user_id=user_id,
        name=data['name'],
        dosage=data.get('dosage'),
        frequency=data.get('frequency'),
        start_date=start_date,
        end_date=end_date,
        reminder_times=json.dumps(data.get('reminder_times', [])),
        notes=data.get('notes')
    )
    
    db.session.add(medication)
    db.session.commit()
    
    # Crear recordatorios si se proporcionaron
    if data.get('reminder_times'):
        for time_str in data['reminder_times']:
            try:
                reminder_time = datetime.strptime(time_str, '%H:%M').time()
                reminder = MedicationReminder(
                    medication_id=medication.id,
                    reminder_time=reminder_time
                )
                db.session.add(reminder)
            except ValueError:
                pass  # Ignorar tiempos con formato incorrecto
        
        db.session.commit()
    
    return jsonify({
        'message': 'Medicamento agregado con éxito',
        'medication': medication.to_dict()
    }), 201

@profile_bp.route('/medications', methods=['GET'])
@jwt_required()
def get_medications():
    user_id = get_jwt_identity()
    
    # Obtener todos los medicamentos del usuario
    medications = Medication.query.filter_by(user_id=user_id).order_by(Medication.created_at.desc()).all()
    
    return jsonify({
        'medications': [medication.to_dict() for medication in medications]
    }), 200

@profile_bp.route('/medications/<int:medication_id>', methods=['PUT'])
@jwt_required()
def update_medication(medication_id):
    user_id = get_jwt_identity()
    medication = Medication.query.get(medication_id)
    
    if not medication:
        return jsonify({'error': 'Medicamento no encontrado'}), 404
    
    if medication.user_id != int(user_id):
        return jsonify({'error': 'No tiene permiso para modificar este medicamento'}), 403
    
    data = request.get_json()
    
    # Actualizar campos
    if 'name' in data:
        medication.name = data['name']
    if 'dosage' in data:
        medication.dosage = data['dosage']
    if 'frequency' in data:
        medication.frequency = data['frequency']
    if 'notes' in data:
        medication.notes = data['notes']
    
    # Procesar fechas
    if 'start_date' in data and data['start_date']:
        try:
            medication.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha de inicio inválido. Use YYYY-MM-DD'}), 400
    
    if 'end_date' in data and data['end_date']:
        try:
            medication.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha de fin inválido. Use YYYY-MM-DD'}), 400
    
    # Actualizar recordatorios
    if 'reminder_times' in data:
        medication.reminder_times = json.dumps(data['reminder_times'])
        
        # Eliminar recordatorios existentes
        MedicationReminder.query.filter_by(medication_id=medication.id).delete()
        
        # Crear nuevos recordatorios
        for time_str in data['reminder_times']:
            try:
                reminder_time = datetime.strptime(time_str, '%H:%M').time()
                reminder = MedicationReminder(
                    medication_id=medication.id,
                    reminder_time=reminder_time
                )
                db.session.add(reminder)
            except ValueError:
                pass  # Ignorar tiempos con formato incorrecto
    
    db.session.commit()
    
    return jsonify({
        'message': 'Medicamento actualizado con éxito',
        'medication': medication.to_dict()
    }), 200

@profile_bp.route('/medications/<int:medication_id>', methods=['DELETE'])
@jwt_required()
def delete_medication(medication_id):
    user_id = get_jwt_identity()
    medication = Medication.query.get(medication_id)
    
    if not medication:
        return jsonify({'error': 'Medicamento no encontrado'}), 404
    
    if medication.user_id != int(user_id):
        return jsonify({'error': 'No tiene permiso para eliminar este medicamento'}), 403
    
    # Eliminar recordatorios asociados
    MedicationReminder.query.filter_by(medication_id=medication.id).delete()
    
    # Eliminar el medicamento
    db.session.delete(medication)
    db.session.commit()
    
    return jsonify({
        'message': 'Medicamento eliminado con éxito'
    }), 200

@profile_bp.route('/physical-activities', methods=['POST'])
@jwt_required()
def add_physical_activity():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validar datos
    if not data.get('activity_type'):
        return jsonify({'error': 'El tipo de actividad es requerido'}), 400
    
    # Procesar fecha
    activity_date = None
    if data.get('date'):
        try:
            activity_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
    else:
        activity_date = date.today()
    
    # Crear la actividad física
    activity = PhysicalActivity(
        user_id=user_id,
        activity_type=data['activity_type'],
        duration=data.get('duration'),
        intensity=data.get('intensity'),
        calories_burned=data.get('calories_burned'),
        date=activity_date,
        notes=data.get('notes')
    )
    
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({
        'message': 'Actividad física registrada con éxito',
        'activity': activity.to_dict()
    }), 201

@profile_bp.route('/physical-activities', methods=['GET'])
@jwt_required()
def get_physical_activities():
    user_id = get_jwt_identity()
    
    # Parámetros de filtro opcionales
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = PhysicalActivity.query.filter_by(user_id=user_id)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(PhysicalActivity.date >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(PhysicalActivity.date <= end)
        except ValueError:
            pass
    
    activities = query.order_by(PhysicalActivity.date.desc()).all()
    
    return jsonify({
        'activities': [activity.to_dict() for activity in activities]
    }), 200

@profile_bp.route('/blood-pressure', methods=['POST'])
@jwt_required()
def add_blood_pressure():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validar datos
    if not data.get('systolic') or not data.get('diastolic'):
        return jsonify({'error': 'Los valores sistólico y diastólico son requeridos'}), 400
    
    # Crear el registro de presión arterial
    bp_record = BloodPressure(
        user_id=user_id,
        systolic=data['systolic'],
        diastolic=data['diastolic'],
        pulse=data.get('pulse'),
        notes=data.get('notes')
    )
    
    db.session.add(bp_record)
    db.session.commit()
    
    return jsonify({
        'message': 'Presión arterial registrada con éxito',
        'blood_pressure': bp_record.to_dict()
    }), 201

@profile_bp.route('/blood-pressure', methods=['GET'])
@jwt_required()
def get_blood_pressure():
    user_id = get_jwt_identity()
    
    # Parámetros de filtro opcionales
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = BloodPressure.query.filter_by(user_id=user_id)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(BloodPressure.measured_at >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(BloodPressure.measured_at <= end)
        except ValueError:
            pass
    
    records = query.order_by(BloodPressure.measured_at.desc()).all()
    
    return jsonify({
        'blood_pressure_records': [record.to_dict() for record in records]
    }), 200

@profile_bp.route('/weight', methods=['POST'])
@jwt_required()
def add_weight():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validar datos
    if not data.get('weight'):
        return jsonify({'error': 'El peso es requerido'}), 400
    
    # Procesar fecha
    weight_date = None
    if data.get('date'):
        try:
            weight_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
    else:
        weight_date = date.today()
    
    # Crear el registro de peso
    weight_record = WeightRecord(
        user_id=user_id,
        weight=data['weight'],
        date=weight_date,
        notes=data.get('notes')
    )
    
    db.session.add(weight_record)
    db.session.commit()
    
    # Calcular IMC si el usuario tiene altura registrada
    user = User.query.get(user_id)
    bmi = None
    if user and user.height:
        bmi = weight_record.calculate_bmi(user.height)
    
    return jsonify({
        'message': 'Peso registrado con éxito',
        'weight_record': weight_record.to_dict(),
        'bmi': bmi
    }), 201

@profile_bp.route('/weight', methods=['GET'])
@jwt_required()
def get_weight():
    user_id = get_jwt_identity()
    
    # Parámetros de filtro opcionales
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = WeightRecord.query.filter_by(user_id=user_id)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(WeightRecord.date >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(WeightRecord.date <= end)
        except ValueError:
            pass
    
    records = query.order_by(WeightRecord.date.desc()).all()
    
    # Calcular IMC para cada registro si el usuario tiene altura registrada
    user = User.query.get(user_id)
    result = []
    
    for record in records:
        record_dict = record.to_dict()
        if user and user.height:
            record_dict['bmi'] = record.calculate_bmi(user.height)
        result.append(record_dict)
    
    return jsonify({
        'weight_records': result
    }), 200

@profile_bp.route('/health-analysis', methods=['GET'])
@jwt_required()
def get_health_analysis():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Obtener datos relevantes para el análisis
    health_profile = HealthProfile.query.filter_by(user_id=user_id).order_by(HealthProfile.created_at.desc()).first()
    weight_record = WeightRecord.query.filter_by(user_id=user_id).order_by(WeightRecord.date.desc()).first()
    bp_record = BloodPressure.query.filter_by(user_id=user_id).order_by(BloodPressure.measured_at.desc()).first()
    
    # Calcular IMC si es posible
    bmi = None
    bmi_category = None
    if weight_record and user.height:
        bmi = weight_record.calculate_bmi(user.height)
        if bmi < 18.5:
            bmi_category = "Bajo peso"
        elif bmi < 25:
            bmi_category = "Peso normal"
        elif bmi < 30:
            bmi_category = "Sobrepeso"
        else:
            bmi_category = "Obesidad"
    
    # Analizar presión arterial
    bp_category = None
    if bp_record:
        systolic = bp_record.systolic
        diastolic = bp_record.diastolic
        
        if systolic < 120 and diastolic < 80:
            bp_category = "Normal"
        elif systolic < 130 and diastolic < 80:
            bp_category = "Elevada"
        elif systolic < 140 or diastolic < 90:
            bp_category = "Hipertensión Etapa 1"
        else:
            bp_category = "Hipertensión Etapa 2"
    
    # Construir recomendaciones basadas en los datos
    recommendations = []
    
    if bmi and bmi > 25:
        recommendations.append("Considera reducir tu peso para mejorar tu salud general.")
    
    if bp_category and bp_category != "Normal":
        recommendations.append("Tu presión arterial está elevada. Considera consultar con un médico.")
    
    if health_profile:
        if health_profile.smoking:
            recommendations.append("Dejar de fumar mejoraría significativamente tu salud.")
        
        if health_profile.stress_level and health_profile.stress_level > 7:
            recommendations.append("Tu nivel de estrés es alto. Considera técnicas de relajación o meditación.")
        
        if health_profile.sleep_hours and health_profile.sleep_hours < 7:
            recommendations.append("Estás durmiendo menos de lo recomendado. Intenta dormir al menos 7-8 horas por noche.")
    
    # Construir la respuesta
    response = {
        'user_info': {
            'name': f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.email,
            'age': user.calculate_age(),
            'gender': user.gender
        },
        'health_metrics': {}
    }
    
    if bmi:
        response['health_metrics']['bmi'] = {
            'value': bmi,
            'category': bmi_category
        }
    
    if bp_record:
        response['health_metrics']['blood_pressure'] = {
            'systolic': bp_record.systolic,
            'diastolic': bp_record.diastolic,
            'category': bp_category
        }
    
    if health_profile:
        response['health_metrics']['lifestyle'] = {
            'activity_level': health_profile.activity_level,
            'smoking': health_profile.smoking,
            'alcohol_consumption': health_profile.alcohol_consumption,
            'sleep_hours': health_profile.sleep_hours,
            'stress_level': health_profile.stress_level
        }
    
    response['recommendations'] = recommendations
    
    return jsonify(response), 200 