/**
 * Utilidades para manejar las URLs de la API y recursos
 */

/**
 * Obtiene la URL base de la API según el entorno
 * @returns {string} URL base de la API
 */
export const getApiBaseUrl = () => {
  return process.env.NODE_ENV === 'development' 
    ? '' // En desarrollo, usamos el proxy configurado en package.json
    : process.env.REACT_APP_API_URL || '';
};

/**
 * Construye la URL completa para un recurso de la API
 * @param {string} endpoint - Endpoint de la API (debe comenzar con /)
 * @returns {string} URL completa
 */
export const getApiUrl = (endpoint) => {
  return `${getApiBaseUrl()}${endpoint}`;
};

/**
 * Obtiene la URL para una imagen o archivo
 * @param {string} path - Ruta relativa del archivo
 * @returns {string} URL completa del archivo
 */
export const getMediaUrl = (path) => {
  // Asegurarse de que path no comience con /
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${getApiBaseUrl()}/api/media/uploads/${cleanPath}`;
};

/**
 * Formatea una fecha en formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Fecha desconocida';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Determina si un archivo es una imagen basado en su extensión
 * @param {string} filePath - Ruta del archivo
 * @returns {boolean} true si es una imagen
 */
export const isImageFile = (filePath) => {
  if (!filePath) return false;
  const ext = filePath.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}; 