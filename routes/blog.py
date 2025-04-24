from flask import Blueprint, jsonify, abort, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import openai, re, uuid, os, datetime as dt

blog_bp = Blueprint('blog', __name__, url_prefix='/api/blog')

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_KEY:
    openai.api_key = OPENAI_KEY

def slugify(text):
    return re.sub(r'[^a-z0-9]+','-',text.lower()).strip('-')

# ➊ Artículos estáticos (podrías cargar de BD/MD en producción)
POSTS = [
    {
        "slug": "ia-medicina-2024",
        "title": "Avances de la IA en Medicina 2024",
        "subtitle": "Diagnóstico asistido, genómica y salud preventiva",
        "date": "2024-12-01",
        "banner": "/images/blog/ia-medicina-2024.jpg",
        "content": """
<h2>Diagnóstico asistido por IA</h2>
<p>Algoritmos de visión computacional ya superan al radiólogo medio en la detección temprana de cáncer de mama...</p>

<h2>Genómica y medicina personalizada</h2>
<p>Modelos de lenguaje aplicados a proteínas permiten diseñar fármacos a medida...</p>

<h2>¿Cómo ayuda Doctorfy?</h2>
<ul>
<li><strong>Analizar estudios médicos</strong> con GPT‑4o</li>
<li><strong>Contar calorías con IA</strong> usando Computer Vision</li>
<li><strong>Psicología 24/7</strong> mediada por LLMs con contexto de salud</li>
</ul>
"""
    },
    {
        "slug": "nutricion-ia",
        "title": "Contar calorías con una foto: ¿mito o realidad?",
        "subtitle": "Cómo funcionan los modelos de visión de alimentos",
        "date": "2024-11-20",
        "banner": "/images/blog/nutricion-ia.jpg",
        "content": """
<p>La segmentación semántica de platos y el reconocimiento de ingredientes han dado un salto con modelos multimodales...</p>
"""
    }
]

@blog_bp.route('/', methods=['GET'])
def list_posts():
    # Sólo meta‑datos
    return jsonify([{
        k: p[k] for k in ('slug','title','subtitle','date','banner')
    } for p in POSTS])

@blog_bp.route('/<slug>', methods=['GET'])
def post_detail(slug):
    post = next((p for p in POSTS if p['slug'] == slug), None)
    if not post:
        abort(404)
    return jsonify(post)

@blog_bp.route('/', methods=['OPTIONS'])
def blog_options():
    """Respuesta vacía para OPTIONS (pre‑flight)."""
    return '', 200

@blog_bp.route('/', methods=['POST'])
def create_post():
    """Genera y publica un post con IA (solo admin)."""
    # Verificar autenticación: JWT o clave API
    admin_key = request.headers.get('X-Admin-Key')
    admin_email = 'alemart87@gmail.com'
    
    # Si hay JWT, verificarlo
    try:
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        verify_jwt_in_request(optional=True)
        current_user_id = get_jwt_identity()
        
        if current_user_id:
            from models import User, db
            user = db.session.get(User, current_user_id)
            if user and user.email == admin_email:
                # Usuario admin autenticado por JWT
                pass
            else:
                # No es admin
                if not admin_key or admin_key != 'doctorfy-admin-2024':
                    abort(403, description="No autorizado")
        else:
            # No hay JWT válido, verificar clave API
            if not admin_key or admin_key != 'doctorfy-admin-2024':
                abort(403, description="No autorizado")
    except Exception as e:
        # Error con JWT, verificar clave API
        if not admin_key or admin_key != 'doctorfy-admin-2024':
            abort(403, description="No autorizado")

    data = request.get_json() or {}
    prompt = data.get('prompt', '').strip()
    if not prompt:
        return jsonify({'error': 'prompt requerido'}), 400

    # →  Generar con GPT si hay clave, si no usar plantilla dummy
    if OPENAI_KEY:
        try:
            print(f"Intentando generar contenido con OpenAI para: {prompt}")
            system = (
                "Eres redactor SEO senior. Genera un artículo HTML5 completo "
                "con títulos h1‑h3, párrafos, listas y meta‑descripción. "
                "Añade palabras clave de medicina e IA. Sin palabras ofensivas."
            )
            user_prompt = f"Redacta un artículo para el blog de Doctorfy. Tema: {prompt}"
            
            # Usar chat.completions.create en lugar de ChatCompletion.create (nueva API)
            try:
                from openai import OpenAI
                client = OpenAI(api_key=OPENAI_KEY)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",  # Modelo más común y estable
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1200
                )
                html = response.choices[0].message.content.strip()
                print("Contenido generado exitosamente con la nueva API de OpenAI")
            except Exception as e1:
                print(f"Error con nueva API de OpenAI: {str(e1)}")
                # Intentar con la API antigua como fallback
                completion = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",  # Modelo más común y estable
                    messages=[{"role":"system","content":system},
                              {"role":"user","content":user_prompt}],
                    temperature=0.7,
                    max_tokens=1200
                )
                html = completion.choices[0].message.content.strip()
                print("Contenido generado exitosamente con la API antigua de OpenAI")
        except Exception as e:
            print(f"Error al generar contenido con OpenAI: {str(e)}")
            # Fallback a contenido estático en caso de error
            html = f"""
            <h1>{prompt.title()}</h1>
            <p>Este artículo fue generado en modo de emergencia debido a un problema con la API de OpenAI.</p>
            <h2>Sobre {prompt}</h2>
            <p>La inteligencia artificial está transformando la forma en que abordamos {prompt.lower()} en el ámbito médico.</p>
            <p>Doctorfy ofrece soluciones innovadoras en este campo.</p>
            """
            print("Usando contenido de emergencia debido a error de OpenAI")
    else:
        html = f"<h1>{prompt.title()}</h1><p>Modo demo: añade tu clave OPENAI_API_KEY para generar contenido automático.</p>"

    # Obtén título (primera línea H1 o prompt)
    import bs4, markdown
    soup = bs4.BeautifulSoup(html, 'html.parser')
    h1 = soup.find('h1')
    title = h1.text if h1 else prompt.title()

    slug = slugify(f"{title[:60]}-{uuid.uuid4().hex[:6]}")
    banner = "/images/blog/default.jpg"

    POSTS.insert(0, {  # al inicio de la lista
        "slug": slug,
        "title": title,
        "subtitle": prompt.capitalize(),
        "date": dt.date.today().isoformat(),
        "banner": banner,
        "content": html
    })

    return jsonify({'success': True, 'slug': slug}), 201 