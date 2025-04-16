import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// Añadir al principio del archivo
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  // Mantener console.error para depuración
}

// Configurar axios para usar la URL base de la API
const apiUrl = process.env.REACT_APP_API_URL || '';
axios.defaults.baseURL = apiUrl;

console.log('API URL configurada:', apiUrl); // Para depuración

// Interceptor global para manejar errores de red
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en solicitud API:', error);
    // Si el error es 401 (no autorizado), redirigir al login
    if (error.response && error.response.status === 401) {
      console.log('Sesión expirada o token inválido, redirigiendo a login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Manejador global de errores
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(); 