"""
Script para actualizar la base de datos con las tablas necesarias para el chat médico.
"""
import os
import sys
from flask import Flask
from flask_migrate import Migrate, upgrade

# Añadir el directorio raíz al path para poder importar los módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import db, ChatSession, ChatMessage, UserChatUsage, SubscriptionPlan, UserSubscription
from app import create_app

def update_database():
    """Actualiza la base de datos con las nuevas tablas para el chat."""
    app = create_app()
    
    with app.app_context():
        # Verificar si las tablas ya existen
        inspector = db.inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        tables_to_check = [
            'chat_sessions', 
            'chat_messages', 
            'user_chat_usage', 
            'subscription_plans', 
            'user_subscriptions'
        ]
        
        missing_tables = [table for table in tables_to_check if table not in existing_tables]
        
        if missing_tables:
            print(f"Creando tablas faltantes: {', '.join(missing_tables)}")
            # Crear las tablas si no existen
            db.create_all()
            
            # Crear planes de suscripción predeterminados si es necesario
            if 'subscription_plans' in missing_tables:
                create_default_plans(app)
                
            print("Tablas creadas correctamente.")
        else:
            print("Todas las tablas necesarias ya existen.")
        
        print("Base de datos actualizada correctamente.")

def create_default_plans(app):
    """Crea planes de suscripción predeterminados"""
    with app.app_context():
        # Verificar si ya existen planes
        if SubscriptionPlan.query.count() == 0:
            plans = [
                {
                    "name": "Plan Gratuito",
                    "description": "Acceso básico con límites mensuales",
                    "price": 0.0,
                    "billing_cycle": "monthly",
                    "message_limit": 50,
                    "tokens_limit": 10000,
                    "specialties_included": "general",
                    "priority_response": False,
                    "advanced_features": False
                },
                {
                    "name": "Plan Básico",
                    "description": "Acceso a todas las especialidades con límites razonables",
                    "price": 9.99,
                    "billing_cycle": "monthly",
                    "message_limit": 200,
                    "tokens_limit": 50000,
                    "specialties_included": "general,nutrition,psychology,clinical",
                    "priority_response": False,
                    "advanced_features": False
                },
                {
                    "name": "Plan Premium",
                    "description": "Acceso ilimitado a todas las especialidades",
                    "price": 19.99,
                    "billing_cycle": "monthly",
                    "message_limit": 0,  # Ilimitado
                    "tokens_limit": 0,   # Ilimitado
                    "specialties_included": "general,nutrition,psychology,clinical",
                    "priority_response": True,
                    "advanced_features": True
                }
            ]
            
            for plan_data in plans:
                plan = SubscriptionPlan(**plan_data)
                db.session.add(plan)
            
            db.session.commit()
            print("Planes de suscripción predeterminados creados.")

if __name__ == "__main__":
    update_database() 