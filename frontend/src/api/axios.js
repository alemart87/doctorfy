import axios from 'axios';
// Eliminar import de config si ya no se usa para API_URL
// import config from '../config';

// --- USAR LA VARIABLE DE ENTORNO PARA LA BASE URL ---
// process.env.NODE_ENV se establece automáticamente por Create React App/Vite
// process.env.REACT_APP_BACKEND_URL lo defines tú en Render
const baseURL = process.env.NODE_ENV === 'production'
  ? `${process.env.REACT_APP_BACKEND_URL}/api` // URL de producción con /api
  : 'http://localhost:5000/api'; // URL local para desarrollo

const api = axios.create({
    // baseURL: config.API_URL, // <-- Reemplazar esto
    baseURL: baseURL,          // <-- Con esto
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Importante para CORS con credenciales
});

// Interceptor para mostrar las URLs de las solicitudes
api.interceptors.request.use(request => {
  console.log('Solicitud a:', request.url);
  return request;
});

// Interceptor para mostrar respuestas
api.interceptors.response.use(
  response => {
    console.log('Respuesta exitosa de:', response.config.url);
    return response;
  },
  error => {
    console.error('Error en solicitud a:', error.config?.url, error);
    return Promise.reject(error);
  }
);

// Interceptor para agregar el token a todas las solicitudes
api.interceptors.request.use(
    (config) => {
        // No sobrescribir Content-Type si ya está establecido (para multipart/form-data)
        if (config.headers['Content-Type'] === 'multipart/form-data') {
            delete config.headers['Content-Type'];
        }
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Enviando solicitud a:', config.url);
            console.log('Con token configurado en headers');
        } else {
            console.warn('No se encontró token para la solicitud a:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Error en respuesta:', error.response);
        
        // Si el error es 401 (Unauthorized) o 422 (Token expirado), cerrar sesión
        if (error.response && (error.response.status === 401 || error.response.status === 422)) {
            console.error("Unauthorized or Unprocessable Entity:", error.response.data);
            // Considera usar un estado global o contexto para manejar la redirección
            // en lugar de window.location.href directamente aquí.
            // alert('Su sesión ha expirado o es inválida. Será redirigido a la página de inicio de sesión.');
            localStorage.removeItem('token');
            // setTimeout(() => {
            //     window.location.href = '/login'; // Esto puede causar problemas en SPA
            // }, 1000);
        }
        return Promise.reject(error);
    }
);

export default api; 