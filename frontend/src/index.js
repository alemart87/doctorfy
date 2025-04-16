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

// Configuración condicional de axios según el entorno
const setupAxios = () => {
  // En desarrollo local, usamos el proxy configurado en package.json
  if (process.env.NODE_ENV === 'development') {
    console.log('Entorno de desarrollo: usando proxy local');
    // No necesitamos configurar baseURL porque el proxy se encarga de redirigir las solicitudes
    
    // Para depuración
    axios.interceptors.request.use(request => {
      console.log('Solicitud enviada:', request.url);
      return request;
    });
  } 
  // En producción, usamos la URL de la API configurada en las variables de entorno
  else {
    const apiUrl = process.env.REACT_APP_API_URL || '';
    console.log('Entorno de producción: usando API URL:', apiUrl);
    axios.defaults.baseURL = apiUrl;
  }

  // Interceptor global para manejar errores de red (común para ambos entornos)
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
};

// Configurar axios
setupAxios();

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