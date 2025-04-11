import axios from 'axios';

// Determinar la URL base según el entorno
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Importante para CORS con credenciales
});

// Interceptor para agregar el token a todas las solicitudes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Asegurarse de que el token tenga el formato correcto
            config.headers['Authorization'] = `Bearer ${token}`;
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
            console.warn('Error de autenticación, redirigiendo a login');
            
            // Mostrar mensaje al usuario
            alert('Su sesión ha expirado o es inválida. Será redirigido a la página de inicio de sesión.');
            
            // Limpiar token
            localStorage.removeItem('token');
            
            // Redirigir a login después de un breve retraso
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
        return Promise.reject(error);
    }
);

export default api; 