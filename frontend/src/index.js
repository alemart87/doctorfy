import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// Configurar axios para usar la URL base de la API
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';

// Interceptor global para manejar errores de red
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en solicitud API:', error);
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