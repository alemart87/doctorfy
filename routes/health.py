from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'API is running'
    }) 