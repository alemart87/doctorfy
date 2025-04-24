from doctorfy.extensions import db
import datetime

class ChatSession(db.Model):
    """Modelo para sesiones de chat con la IA médica"""
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    specialty = db.Column(db.String(50), default='general')  # general, nutrition, psychology, clinical
    title = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.datetime.utcnow)
    
    # Campos para monetización y análisis de uso
    message_count = db.Column(db.Integer, default=0)  # Total de mensajes en la sesión
    tokens_used = db.Column(db.Integer, default=0)    # Total de tokens utilizados (para modelos basados en tokens)
    is_premium = db.Column(db.Boolean, default=False) # Indica si la sesión fue parte de un plan premium
    
    # Relaciones
    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade='all, delete-orphan')
    user = db.relationship('User', backref='chat_sessions')
    
    # Métodos para monetización
    def increment_message_count(self):
        """Incrementa el contador de mensajes de la sesión"""
        self.message_count += 1
        return self.message_count
    
    def add_tokens(self, token_count):
        """Añade tokens al contador de la sesión"""
        self.tokens_used += token_count
        return self.tokens_used
    
    def __repr__(self):
        return f'<ChatSession {self.id}: {self.title}>'

class ChatMessage(db.Model):
    """Modelo para mensajes individuales en una sesión de chat"""
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' o 'assistant'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Campos para monetización y análisis de uso
    tokens = db.Column(db.Integer, default=0)  # Número de tokens en este mensaje
    date_day = db.Column(db.Date, default=lambda: datetime.datetime.utcnow().date())  # Fecha para agrupación diaria
    date_month = db.Column(db.String(7), default=lambda: datetime.datetime.utcnow().strftime('%Y-%m'))  # Formato YYYY-MM para agrupación mensual
    
    def __repr__(self):
        return f'<ChatMessage {self.id}: {self.role}>'

# Modelo para seguimiento de uso mensual por usuario (para planes de suscripción)
class UserChatUsage(db.Model):
    """Modelo para seguimiento del uso de chat por usuario"""
    __tablename__ = 'user_chat_usage'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    year_month = db.Column(db.String(7), nullable=False)  # Formato YYYY-MM
    message_count = db.Column(db.Integer, default=0)
    tokens_used = db.Column(db.Integer, default=0)
    
    # Límites del plan
    message_limit = db.Column(db.Integer, default=0)  # 0 = sin límite
    tokens_limit = db.Column(db.Integer, default=0)   # 0 = sin límite
    
    # Relación con el usuario
    user = db.relationship('User', backref='chat_usage')
    
    # Índice compuesto para búsquedas rápidas
    __table_args__ = (
        db.UniqueConstraint('user_id', 'year_month', name='uix_user_month'),
    )
    
    def is_within_limits(self):
        """Verifica si el usuario está dentro de los límites de su plan"""
        if self.message_limit > 0 and self.message_count >= self.message_limit:
            return False
        if self.tokens_limit > 0 and self.tokens_used >= self.tokens_limit:
            return False
        return True
    
    def increment_usage(self, messages=1, tokens=0):
        """Incrementa el uso del chat"""
        self.message_count += messages
        self.tokens_used += tokens
        return self.is_within_limits()
    
    def __repr__(self):
        return f'<UserChatUsage {self.user_id}: {self.year_month}>'

# Modelo para planes de suscripción
class SubscriptionPlan(db.Model):
    """Modelo para planes de suscripción"""
    __tablename__ = 'subscription_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    billing_cycle = db.Column(db.String(20), default='monthly')  # monthly, quarterly, yearly
    
    # Límites del plan
    message_limit = db.Column(db.Integer, default=0)  # Mensajes por mes (0 = ilimitado)
    tokens_limit = db.Column(db.Integer, default=0)   # Tokens por mes (0 = ilimitado)
    specialties_included = db.Column(db.String(255))  # Lista de especialidades separadas por comas
    
    # Características adicionales
    priority_response = db.Column(db.Boolean, default=False)
    advanced_features = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<SubscriptionPlan {self.id}: {self.name}>'

# Modelo para suscripciones de usuarios
class UserSubscription(db.Model):
    """Modelo para suscripciones de usuarios"""
    __tablename__ = 'user_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('subscription_plans.id'), nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    end_date = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Información de pago
    payment_id = db.Column(db.String(255))
    last_payment_date = db.Column(db.DateTime)
    next_payment_date = db.Column(db.DateTime)
    
    # Relaciones
    user = db.relationship('User', backref='subscriptions')
    plan = db.relationship('SubscriptionPlan')
    
    def is_valid(self):
        """Verifica si la suscripción está activa y dentro del período"""
        now = datetime.datetime.utcnow()
        return (self.is_active and 
                (self.end_date is None or self.end_date > now))
    
    def __repr__(self):
        return f'<UserSubscription {self.id}: User {self.user_id} - Plan {self.plan_id}>' 