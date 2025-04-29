from flask import Blueprint, jsonify, abort, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename
import openai, re, uuid, os, datetime as dt
from models import db, BlogPost, User # Importa los modelos necesarios
from sqlalchemy.exc import IntegrityError

blog_bp = Blueprint('blog', __name__)

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_KEY:
    # Configura el cliente de OpenAI (preferiblemente fuera de la función si es posible)
    try:
        from openai import OpenAI
        openai_client = OpenAI(api_key=OPENAI_KEY)
        print("Cliente OpenAI inicializado.")
    except ImportError:
        openai_client = None
        print("Advertencia: SDK de OpenAI no encontrado o desactualizado.")
else:
    openai_client = None
    print("Advertencia: OPENAI_API_KEY no configurada.")

ADMIN_EMAIL = 'alemart87@gmail.com'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def slugify(text):
    # Mejora: maneja mejor los acentos y caracteres especiales si es necesario
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

# --- Decorador para verificar si es Admin ---
from functools import wraps

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if not user or user.email != ADMIN_EMAIL:
            abort(403, description="Acceso denegado: Se requiere ser administrador.")
        return fn(*args, **kwargs)
    return wrapper

# --- Endpoints ---

@blog_bp.route('/', methods=['GET'])
def list_posts():
    """Lista todos los posts (solo metadatos)."""
    try:
        posts = BlogPost.query.order_by(BlogPost.created_at.desc()).all()
        # Devuelve solo los datos necesarios para la lista
        return jsonify([post.to_dict(full=False) for post in posts])
    except Exception as e:
        current_app.logger.error(f"Error al listar posts: {str(e)}")
        return jsonify({"error": "Error interno al obtener los posts"}), 500

@blog_bp.route('/<slug>', methods=['GET'])
def post_detail(slug):
    """Obtiene los detalles completos de un post por su slug."""
    try:
        post = BlogPost.query.filter_by(slug=slug).first()
        if not post:
            abort(404, description="Post no encontrado.")
        return jsonify(post.to_dict(full=True))
    except Exception as e:
        current_app.logger.error(f"Error al obtener post {slug}: {str(e)}")
        return jsonify({"error": "Error interno al obtener el post"}), 500

@blog_bp.route('/generate-content', methods=['POST'])
@admin_required
def generate_ai_content():
    """Genera contenido y meta descripción con IA."""
    if not openai_client:
        return jsonify({'error': 'OpenAI no está configurado en el servidor.'}), 503

    data = request.get_json() or {}
    prompt = data.get('prompt', '').strip()
    if not prompt:
        return jsonify({'error': 'Se requiere un "prompt" para generar contenido.'}), 400

    try:
        # Pedir al modelo al menos 1200 palabras y sin usar fences ```html
        system_prompt = (
            "Eres un redactor SEO. Genera un artículo de al menos 1200 palabras en HTML5 (h2,h3,p,ul,li,strong,em). "
            "No uses fences ```html```. "
            "Al final incluye:\n"
            "<!-- META_TITLE_START -->\n"
            "Título SEO (<=70 caracteres)\n"
            "<!-- META_TITLE_END -->\n"
            "<!-- KEYWORDS_START -->\n"
            "Lista de 8–12 keywords separadas por comas\n"
            "<!-- KEYWORDS_END -->\n"
            "<!-- META_DESCRIPTION_START -->\n"
            "Meta descripción (<=160 caracteres)\n"
            "<!-- META_DESCRIPTION_END -->"
        )
        user_prompt = f"Tema del artículo: {prompt}"

        response = openai_client.chat.completions.create(
            model="gpt-4o",
                    messages=[
                {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.7,
            max_tokens=3000  # subimos para asegurar longitud
        )
        full_content = response.choices[0].message.content.strip()

        # 1) Quitar fences ```html … ```
        if full_content.startswith("```"):
            parts = full_content.split("```")
            # toma el texto entre el primer y segundo fence
            if len(parts) >= 3:
                full_content = parts[1].strip()

        # 2) Extraer meta descripción
        meta_description = "Meta descripción generada por IA."  # fallback
        start_tag = "<!-- META_DESCRIPTION_START -->"
        end_tag   = "<!-- META_DESCRIPTION_END -->"
        start_idx = full_content.find(start_tag)
        end_idx   = full_content.find(end_tag)

        if start_idx != -1 and end_idx != -1:
            meta_start = start_idx + len(start_tag)
            meta_description = full_content[meta_start:end_idx].strip()[:160]
            content = full_content[:start_idx].strip()
        else:
            content = full_content  # si no hay tags

        # 3) Verificar recuento de palabras
        word_count = len(re.findall(r'\w+', content))
        if word_count < 1200:
            current_app.logger.warning(f"Contenido generado ({word_count} palabras) < 1200. Deberías verificarlo.")

        # Extraer bloques SEO
        def extract(tag):
            a, b = full_content.find(f"<!-- {tag}_START -->"), full_content.find(f"<!-- {tag}_END -->")
            return full_content[a+len(tag)+13:b].strip() if (a!=-1 and b!=-1) else None
        meta_title    = extract("META_TITLE")
        meta_keywords = extract("KEYWORDS")
        meta_desc     = extract("META_DESCRIPTION")

        # Contenido sin sección SEO
        content = full_content.split("<!-- META_TITLE_START -->")[0].split("<!-- META_DESCRIPTION_START -->")[0].strip()

        # Validar recuento mínimo
        wc = len(re.findall(r'\w+', content))
        if wc<1200:
            current_app.logger.warning(f"Generado con solo {wc} palabras")

        return jsonify({
            'content': content,
            'meta_title':    meta_title,
            'meta_keywords': meta_keywords,
            'meta_description': meta_desc
        })

    except Exception as e:
        current_app.logger.error(f"Error al generar contenido con OpenAI: {str(e)}")
        return jsonify({'error': f'Error al generar contenido: {str(e)}'}), 500

@blog_bp.route('/', methods=['POST'])
@admin_required
def create_post():
    """Crea un nuevo post (manual o con datos generados por IA)."""
    try:
        # Log para depurar
        current_app.logger.info(f"Recibida solicitud POST a /api/blog con datos: {request.form.keys()}")
        
        data = request.form.to_dict()
        title, subtitle, content = data['title'], data['subtitle'], data['content']
        meta_title    = data.get('meta_title', '').strip()[:70]
        meta_keywords = data.get('meta_keywords', '').strip()[:300]
        meta_description = data.get('meta_description', '').strip()[:160]

        if not title or not content:
            return jsonify({'error': 'Título y contenido son requeridos.'}), 400

        # Generar slug único
        base_slug = slugify(title[:60])
        slug = base_slug
        counter = 1
        while BlogPost.query.filter_by(slug=slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        banner_rel_path = None
        if 'banner' in request.files:
            file = request.files['banner']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(f"{slug}-{uuid.uuid4().hex[:8]}-{file.filename}")
                # Asegurarse que el directorio de banners existe
                banner_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'blog_banners')
                os.makedirs(banner_dir, exist_ok=True)
                file_path = os.path.join(banner_dir, filename)
                try:
                    file.save(file_path)
                    banner_rel_path = f"blog_banners/{filename}" # Ruta relativa para guardar en DB
                    current_app.logger.info(f"Banner guardado en: {file_path}")
                except Exception as e:
                    current_app.logger.error(f"Error al guardar banner: {str(e)}")
                    return jsonify({"error": f"Error al guardar imagen del banner: {str(e)}"}), 500
            elif file.filename != '':
                 return jsonify({'error': 'Tipo de archivo de banner no permitido.'}), 400

        new_post = BlogPost(
            slug=slug,
            title=title,
            meta_title=meta_title,
            subtitle=subtitle,
            content=content,
            banner_url=banner_rel_path,
            meta_description=meta_description,
            meta_keywords=meta_keywords,
            author_id=get_jwt_identity() # Asignar al admin actual
        )
        db.session.add(new_post)
        db.session.commit()
        current_app.logger.info(f"Post creado: {slug} (ID: {new_post.id})")
        return jsonify(new_post.to_dict(full=True)), 201
    except IntegrityError as e:
        db.session.rollback()
        current_app.logger.error(f"Error de integridad al crear post: {str(e)}")
        return jsonify({'error': 'Error al crear el post (posible slug duplicado).'}), 409
    except Exception as e:
        current_app.logger.error(f"Error en create_post: {str(e)}")
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@blog_bp.route('/', methods=['POST'])
@admin_required
def create_post_no_slash():
    """Alias para create_post que maneja la ruta sin barra final."""
    return create_post()

@blog_bp.route('/<int:post_id>', methods=['PUT'])
@admin_required
def update_post(post_id):
    """Actualiza un post existente."""
    post = db.session.get(BlogPost, post_id)
    if not post:
        abort(404, description="Post no encontrado.")

    data = request.form.to_dict()
    title = data.get('title', '').strip()
    subtitle = data.get('subtitle', '').strip()
    content = data.get('content', '').strip()
    meta_description = data.get('meta_description', '').strip()[:160]

    if title: post.title = title
    if subtitle: post.subtitle = subtitle
    if content: post.content = content
    if meta_description: post.meta_description = meta_description

    # Actualizar slug si el título cambia (opcional, puede romper URLs)
    # if title and slugify(title[:60]) != post.slug.rsplit('-', 1)[0]:
    #    # Lógica para generar nuevo slug único si es necesario...
    #    pass

    # Manejar actualización del banner
    if 'banner' in request.files:
        file = request.files['banner']
        if file and file.filename != '' and allowed_file(file.filename):
            # Eliminar banner anterior si existe
            if post.banner_url:
                try:
                    old_banner_path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), post.banner_url)
                    if os.path.exists(old_banner_path):
                        os.remove(old_banner_path)
                        current_app.logger.info(f"Banner anterior eliminado: {old_banner_path}")
                except Exception as e:
                    current_app.logger.error(f"Error al eliminar banner anterior: {str(e)}")

            # Guardar nuevo banner
            filename = secure_filename(f"{post.slug}-{uuid.uuid4().hex[:8]}-{file.filename}")
            banner_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'blog_banners')
            os.makedirs(banner_dir, exist_ok=True)
            file_path = os.path.join(banner_dir, filename)
            try:
                file.save(file_path)
                post.banner_url = f"blog_banners/{filename}"
                current_app.logger.info(f"Nuevo banner guardado en: {file_path}")
            except Exception as e:
                 current_app.logger.error(f"Error al guardar nuevo banner: {str(e)}")
                 # Considera si devolver un error o continuar sin actualizar el banner
        elif file.filename != '':
             return jsonify({'error': 'Tipo de archivo de banner no permitido.'}), 400

    try:
        db.session.commit()
        current_app.logger.info(f"Post actualizado: {post.slug} (ID: {post.id})")
        return jsonify(post.to_dict(full=True))
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error al actualizar post {post_id}: {str(e)}")
        return jsonify({'error': f'Error interno al actualizar el post: {str(e)}'}), 500

@blog_bp.route('/<int:post_id>', methods=['DELETE'])
@admin_required
def delete_post(post_id):
    """Elimina un post."""
    post = db.session.get(BlogPost, post_id)
    if not post:
        abort(404, description="Post no encontrado.")

    # Eliminar banner si existe
    if post.banner_url:
        try:
            banner_path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), post.banner_url)
            if os.path.exists(banner_path):
                os.remove(banner_path)
                current_app.logger.info(f"Banner eliminado: {banner_path}")
        except Exception as e:
            current_app.logger.error(f"Error al eliminar banner del post {post_id}: {str(e)}")
            # Considera si continuar con la eliminación del post de todas formas

    try:
        db.session.delete(post)
        db.session.commit()
        current_app.logger.info(f"Post eliminado: {post.slug} (ID: {post_id})")
        return jsonify({'message': 'Post eliminado correctamente.'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error al eliminar post {post_id}: {str(e)}")
        return jsonify({'error': f'Error interno al eliminar el post: {str(e)}'}), 500

@blog_bp.route('/id/<int:post_id>', methods=['GET'])
@admin_required
def get_post_by_id(post_id):
    """Obtiene un post completo por su ID (sólo admin)."""
    try:
        post = db.session.get(BlogPost, post_id)
        if not post:
            abort(404, description="Post no encontrado.")
        
        # Asegúrate de incluir todos los campos en la respuesta
        response_data = post.to_dict(full=True)
        # Añadir campos SEO que podrían faltar en to_dict
        response_data['meta_title'] = post.meta_title
        response_data['meta_keywords'] = post.meta_keywords
        
        return jsonify(response_data), 200
    except Exception as e:
        current_app.logger.error(f"Error al obtener post por ID {post_id}: {str(e)}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

# --- Asegurar directorio de banners ---
# Llama a esta función al iniciar la app si es necesario
def ensure_blog_banner_dir(app):
     with app.app_context():
        banner_dir = os.path.join(app.config.get('UPLOAD_FOLDER', 'uploads'), 'blog_banners')
        os.makedirs(banner_dir, exist_ok=True)
        current_app.logger.info(f"Directorio de banners asegurado: {banner_dir}")

# Podrías llamar a ensure_blog_banner_dir(app) en create_app() en app.py 