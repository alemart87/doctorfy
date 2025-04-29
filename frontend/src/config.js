// Configuración de URLs según el entorno
const isDev = process.env.NODE_ENV === 'development';

// URL base para la API
export const API_URL = isDev 
  ? 'http://localhost:5000/api'
  : 'https://doctorfy.onrender.com/api';  // Ajusta a tu URL de Render

// URL base para archivos subidos
export const UPLOADS_URL = isDev
  ? 'http://localhost:5000/uploads'
  : 'https://doctorfy.onrender.com/uploads';  // Ajusta a tu URL de Render

export const endpoints = {
  auth: {
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
    me: `${API_URL}/auth/me`,
  },
  medicalStudies: {
    upload: `${API_URL}/medical-studies/upload`,
    interpret: (studyId) => `${API_URL}/medical-studies/interpret/${studyId}`,
    list: `${API_URL}/medical-studies/studies`,
    details: (studyId) => `${API_URL}/medical-studies/studies/${studyId}`,
  },
  nutrition: {
    analyzeFood: `${API_URL}/nutrition/analyze-food`,
  },
  doctors: {
    directory: `${API_URL}/doctors/directory`,
    subscribe: `${API_URL}/doctors/subscribe`,
  },
  profile: {
    uploadPicture: `${API_URL}/profile/upload-profile-picture`,
  }
};

const config = {
  API_URL,
  endpoints,
};

export default config; 