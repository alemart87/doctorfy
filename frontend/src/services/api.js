import axios from 'axios';
import { endpoints } from '../config';
import api from '../api/axios';

// Crear una instancia de axios con configuración común
const apiInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios de autenticación
export const authService = {
  login: (credentials) => {
    console.log('Enviando credenciales:', credentials);
    return api.post('/auth/login', credentials);
  },
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
};

// Servicios de estudios médicos
export const medicalStudiesService = {
  uploadStudy: (formData) => {
    console.log('Enviando formData para subir estudio:', formData);
    return api.post('/medical-studies/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  interpretStudy: (studyId, interpretation) => {
    console.log(`Solicitando interpretación para estudio ${studyId}${interpretation ? ' con texto proporcionado' : ' con IA'}`);
    // Si se proporciona una interpretación, la enviamos
    if (interpretation) {
      return api.post(`/medical-studies/studies/${studyId}/interpret`, { interpretation });
    } 
    // Si no, solicitamos un análisis automático
    else {
      return api.post(`/medical-studies/studies/${studyId}/analyze`);
    }
  },
  getStudies: () => api.get('/medical-studies/studies'),
  getStudyDetails: (studyId) => api.get(`/medical-studies/studies/${studyId}`),
  renameStudy: (studyId, data) => {
    console.log(`Renombrando estudio ${studyId} con datos:`, data);
    return api.post(`/medical-studies/studies/${studyId}/rename`, data);
  },
  updateStudy: (studyId, formData) => {
    console.log(`Actualizando estudio ${studyId} con datos:`, formData);
    return api.put(`/medical-studies/studies/${studyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Servicios de nutrición
export const nutritionService = {
  analyzeFood: (formData) => {
    console.log('Enviando formData:', formData);
    return api.post('/nutrition/analyze-food', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Servicios de doctores
export const doctorsService = {
  getDirectory: () => api.get('/doctors/directory'),
  subscribe: () => api.post('/doctors/subscribe'),
};

export default {
  auth: authService,
  medicalStudies: medicalStudiesService,
  nutrition: nutritionService,
  doctors: doctorsService,
}; 