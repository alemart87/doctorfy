from PIL import Image
import io
import os
import logging
import mimetypes

logger = logging.getLogger(__name__)

def compress_image(image_path, max_size_mb=4.5, output_path=None, min_quality=30):
    """
    Comprime una imagen para que sea menor que el tamaño máximo especificado
    
    Args:
        image_path (str): Ruta a la imagen original
        max_size_mb (float): Tamaño máximo en MB
        output_path (str, optional): Ruta donde guardar la imagen comprimida. Si es None, se genera automáticamente
        min_quality (int): Calidad mínima de compresión (1-100)
        
    Returns:
        str: Ruta a la imagen comprimida
    """
    try:
        # Verificar si la imagen ya es lo suficientemente pequeña
        original_size_mb = os.path.getsize(image_path) / (1024 * 1024)
        logger.info(f"Tamaño original de la imagen: {original_size_mb:.2f}MB")
        
        if original_size_mb <= max_size_mb:
            logger.info(f"La imagen ya es menor que {max_size_mb}MB, no es necesario comprimirla")
            return image_path
            
        # Generar ruta de salida si no se proporciona
        if output_path is None:
            filename, ext = os.path.splitext(image_path)
            output_path = f"{filename}_compressed.jpg"
        
        # Abrir la imagen
        img = Image.open(image_path)
        
        # Convertir a RGB si es necesario (para imágenes PNG con transparencia)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = background
        
        # Calcular el tamaño máximo en bytes
        max_size_bytes = max_size_mb * 1024 * 1024
        
        # Estrategia 1: Redimensionar primero si la imagen es muy grande
        max_dimension = 2000
        if max(img.size) > max_dimension:
            ratio = max_dimension / max(img.size)
            new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
            img = img.resize(new_size, Image.LANCZOS)
            logger.info(f"Imagen redimensionada a {new_size}")
        
        # Estrategia 2: Comprimir con calidad progresivamente menor
        quality = 95
        compressed = False
        
        while quality >= min_quality:
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=quality, optimize=True)
            buffer_size = buffer.tell()
            
            if buffer_size <= max_size_bytes:
                compressed = True
                break
                
            quality -= 5
            logger.info(f"Intentando con calidad: {quality}, tamaño actual: {buffer_size / (1024 * 1024):.2f}MB")
        
        # Estrategia 3: Si la compresión no es suficiente, redimensionar progresivamente
        if not compressed:
            scale_factor = 0.9
            current_img = img
            
            while scale_factor > 0.3:
                new_size = (int(current_img.size[0] * scale_factor), int(current_img.size[1] * scale_factor))
                current_img = img.resize(new_size, Image.LANCZOS)
                
                buffer = io.BytesIO()
                current_img.save(buffer, format="JPEG", quality=quality, optimize=True)
                buffer_size = buffer.tell()
                
                if buffer_size <= max_size_bytes:
                    img = current_img
                    compressed = True
                    logger.info(f"Imagen redimensionada a {new_size} con factor {scale_factor}")
                    break
                    
                scale_factor -= 0.1
                logger.info(f"Intentando con factor de escala: {scale_factor}, tamaño actual: {buffer_size / (1024 * 1024):.2f}MB")
        
        # Si ninguna estrategia funcionó, usar la compresión más agresiva
        if not compressed:
            logger.warning("Aplicando compresión extrema...")
            buffer = io.BytesIO()
            img = img.resize((800, int(800 * img.size[1] / img.size[0])), Image.LANCZOS)
            img.save(buffer, format="JPEG", quality=min_quality, optimize=True)
        
        # Guardar la imagen comprimida
        buffer.seek(0)
        with open(output_path, 'wb') as f:
            f.write(buffer.getvalue())
            
        compressed_size = os.path.getsize(output_path) / (1024 * 1024)
        logger.info(f"Imagen comprimida guardada en: {output_path}")
        logger.info(f"Tamaño final: {compressed_size:.2f}MB (reducción del {(1 - compressed_size / original_size_mb) * 100:.1f}%)")
        
        return output_path
    except Exception as e:
        logger.error(f"Error al comprimir imagen: {e}", exc_info=True)
        return image_path  # Devolver la original en caso de error

def get_image_dimensions(image_path):
    """
    Obtiene las dimensiones de una imagen
    
    Args:
        image_path (str): Ruta a la imagen
        
    Returns:
        tuple: (ancho, alto) de la imagen
    """
    try:
        with Image.open(image_path) as img:
            return img.size
    except Exception as e:
        logger.error(f"Error al obtener dimensiones de imagen: {e}")
        return (0, 0)

def get_image_format(image_path):
    """
    Obtiene el formato de una imagen
    
    Args:
        image_path (str): Ruta a la imagen
        
    Returns:
        str: Formato de la imagen (JPEG, PNG, etc.)
    """
    try:
        with Image.open(image_path) as img:
            return img.format
    except Exception as e:
        logger.error(f"Error al obtener formato de imagen: {e}")
        return None

def get_mime_type(image_path):
    """
    Obtiene el tipo MIME de una imagen
    
    Args:
        image_path (str): Ruta a la imagen
        
    Returns:
        str: Tipo MIME de la imagen
    """
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type or not mime_type.startswith('image/'):
        mime_type = 'image/jpeg'
    return mime_type

def get_image_size_mb(file_path):
    """
    Calcula el tamaño de un archivo en megabytes.

    Args:
        file_path (str): Ruta al archivo.

    Returns:
        float: Tamaño del archivo en MB, o 0.0 si el archivo no existe o hay error.
    """
    try:
        if os.path.exists(file_path):
            size_bytes = os.path.getsize(file_path)
            return size_bytes / (1024 * 1024)
        else:
            return 0.0
    except OSError as e:
        print(f"Error al obtener tamaño del archivo {file_path}: {e}")
        return 0.0

def resize_image_if_needed(file_path, max_size_mb=4.5, max_dimension=2000):
    """
    Redimensiona una imagen si es demasiado grande en tamaño de archivo o dimensiones.
    
    Args:
        file_path (str): Ruta a la imagen original
        max_size_mb (float): Tamaño máximo en MB
        max_dimension (int): Dimensión máxima (ancho o alto) en píxeles
        
    Returns:
        str: Ruta a la imagen redimensionada o None si no fue necesario redimensionar
    """
    try:
        # Verificar si la imagen ya es lo suficientemente pequeña
        original_size_mb = get_image_size_mb(file_path)
        logger.info(f"Verificando si la imagen necesita redimensionamiento: {file_path}")
        logger.info(f"Tamaño original: {original_size_mb:.2f}MB")
        
        # Obtener dimensiones
        with Image.open(file_path) as img:
            width, height = img.size
            logger.info(f"Dimensiones originales: {width}x{height}")
            
            # Verificar si necesita redimensionamiento
            needs_resize = False
            
            # Por tamaño de archivo
            if original_size_mb > max_size_mb:
                logger.info(f"La imagen excede el tamaño máximo de {max_size_mb}MB")
                needs_resize = True
                
            # Por dimensiones
            if max(width, height) > max_dimension:
                logger.info(f"La imagen excede la dimensión máxima de {max_dimension}px")
                needs_resize = True
                
            if not needs_resize:
                logger.info("No es necesario redimensionar la imagen")
                return None
                
            # Generar ruta para la imagen redimensionada
            filename, ext = os.path.splitext(file_path)
            resized_path = f"{filename}_resized{ext}"
            
            # Redimensionar si es necesario por dimensiones
            if max(width, height) > max_dimension:
                ratio = max_dimension / max(width, height)
                new_size = (int(width * ratio), int(height * ratio))
                img = img.resize(new_size, Image.LANCZOS)
                logger.info(f"Imagen redimensionada a {new_size}")
            
            # Guardar con compresión si es JPEG
            if ext.lower() in ['.jpg', '.jpeg']:
                img.save(resized_path, format="JPEG", quality=85, optimize=True)
            else:
                img.save(resized_path)
                
            resized_size_mb = get_image_size_mb(resized_path)
            logger.info(f"Imagen redimensionada guardada en: {resized_path}")
            logger.info(f"Nuevo tamaño: {resized_size_mb:.2f}MB")
            
            # Si aún es demasiado grande, comprimir más
            if resized_size_mb > max_size_mb:
                logger.info("La imagen redimensionada sigue siendo demasiado grande, aplicando compresión adicional")
                compressed_path = compress_image(resized_path, max_size_mb)
                
                # Eliminar el archivo intermedio si se creó uno nuevo
                if compressed_path != resized_path and os.path.exists(resized_path):
                    os.remove(resized_path)
                    logger.info(f"Archivo intermedio eliminado: {resized_path}")
                
                return compressed_path
            
            return resized_path
            
    except Exception as e:
        logger.error(f"Error al redimensionar imagen: {e}", exc_info=True)
        return None  # No se pudo redimensionar 