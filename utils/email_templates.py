# Estilos base para todas las plantillas
BASE_STYLES = """
    body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        margin: 0; 
        padding: 0;
    }
    .container { 
        max-width: 600px; 
        margin: 0 auto; 
        padding: 20px;
    }
    .header { 
        background: linear-gradient(135deg, #00bcd4, #0097a7);
        color: white;
        padding: 30px;
        text-align: center;
        border-radius: 10px;
        margin-bottom: 30px;
    }
"""

# Plantillas de correo predefinidas
EMAIL_TEMPLATES = {
    "ceo_welcome": {
        "name": "Mensaje de Bienvenida del CEO",
        "subject": "¡Bienvenido/a a la revolución de la salud digital! 🚀",
        "template": """
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                    <h1>¡Bienvenido/a a Doctorfy!</h1>
                    <p>El futuro de la salud está aquí</p>
                </div>

                <p>Estimado/a {name},</p>

                <p>Me llena de emoción darte la bienvenida personalmente a la familia Doctorfy. Tu decisión de unirte a nosotros marca el comienzo de una nueva era en el cuidado de tu salud.</p>

                <p>En Doctorfy no solo construimos tecnología; creamos puentes entre la medicina avanzada y las personas. Cada línea de código, cada análisis y cada interacción está diseñada pensando en ti y en tu bienestar.</p>

                <p>Imagina tener el poder de comprender tus estudios médicos al instante, de tomar decisiones informadas sobre tu nutrición, y de tener acceso a asistencia médica inteligente 24/7. Eso es Doctorfy, y ahora es tuyo.</p>

                <p>Te invito a explorar todas nuestras funcionalidades. Descubrirás que hemos pensado en cada detalle para hacer tu experiencia extraordinaria.</p>

                <p>Y recuerda: estamos aquí para ti. Tu salud es nuestra misión.</p>

                <div style="border-top: 2px solid #eee; margin-top: 30px; padding-top: 20px; text-align: right;">
                    <p style="font-style: italic; color: #666;">Con entusiasmo y compromiso,</p>
                    <p><strong>Rafael Martínez</strong><br>
                    CEO & Fundador<br>
                    Doctorfy</p>
                </div>
            </div>
        </body>
        </html>
        """
    },
    
    "platform_benefits": {
        "name": "Beneficios de la Plataforma",
        "subject": "Descubre el poder de Doctorfy en tus manos 💫",
        "template": """
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                    <h1>Tu salud, potenciada por la tecnología</h1>
                </div>

                <p>¡Hola {name}!</p>

                <p>¿Sabías que estás siendo parte de una revolución en el cuidado de la salud? Permíteme compartirte cómo Doctorfy está transformando vidas:</p>

                <div style="background: #f8f9fa; border-left: 4px solid #00bcd4; padding: 15px; margin: 15px 0; border-radius: 4px;">
                    <h3>🏥 Análisis Médicos Instantáneos</h3>
                    <p>Olvídate de esperar días por interpretaciones. Nuestra IA analiza tus estudios en segundos, con precisión y claridad.</p>
                </div>

                <div style="background: #f8f9fa; border-left: 4px solid #00bcd4; padding: 15px; margin: 15px 0; border-radius: 4px;">
                    <h3>🍎 Nutrición Personalizada</h3>
                    <p>Cada alimento cuenta. Analiza tu comida y recibe recomendaciones adaptadas a tus necesidades.</p>
                </div>

                <div style="background: #f8f9fa; border-left: 4px solid #00bcd4; padding: 15px; margin: 15px 0; border-radius: 4px;">
                    <h3>🤖 Asistente de Salud 24/7</h3>
                    <p>Tu compañero de salud siempre disponible, respondiendo dudas y guiándote hacia un mejor bienestar.</p>
                </div>

                <p>Cada una de estas herramientas fue creada pensando en ti, en tu tiempo y en tu tranquilidad. La tecnología al servicio de tu bienestar.</p>

                <div style="border-top: 2px solid #eee; margin-top: 30px; padding-top: 20px; text-align: right;">
                    <p style="font-style: italic; color: #666;">Cuidando tu salud,</p>
                    <p><strong>Rafael Martínez</strong><br>
                    CEO & Fundador<br>
                    Doctorfy</p>
                </div>
            </div>
        </body>
        </html>
        """
    },
    
    "follow_up": {
        "name": "Seguimiento de Satisfacción",
        "subject": "Tu experiencia nos importa ❤️",
        "template": """
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                    <h1>Tu voz nos hace mejores</h1>
                </div>

                <p>Querido/a {name},</p>

                <p>Espero que Doctorfy esté haciendo tu vida más fácil. Como fundador, leo personalmente cada comentario que recibimos, porque tu experiencia es el corazón de nuestra innovación.</p>

                <p>Me encantaría conocer tu historia con Doctorfy:</p>

                <ul style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <li style="margin-bottom: 10px;">¿Qué momento con Doctorfy te ha sorprendido más?</li>
                    <li style="margin-bottom: 10px;">¿Hay algo que podamos hacer mejor para ti?</li>
                    <li style="margin-bottom: 10px;">¿Qué nuevas funciones te gustaría ver?</li>
                </ul>

                <p>Responde directamente a este correo. Tu opinión llegará directamente a mi bandeja de entrada, y personalmente me aseguraré de que sea escuchada.</p>

                <p>Juntos estamos construyendo el futuro de la salud digital.</p>

                <div style="border-top: 2px solid #eee; margin-top: 30px; padding-top: 20px; text-align: right;">
                    <p style="font-style: italic; color: #666;">Agradecido por tu confianza,</p>
                    <p><strong>Rafael Martínez</strong><br>
                    CEO & Fundador<br>
                    Doctorfy</p>
                </div>
            </div>
        </body>
        </html>
        """
    }
} 