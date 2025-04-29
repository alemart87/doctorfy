const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_BACKEND_URL || 'https://doctorfy.onrender.com'
  : process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const API_URL = `${BACKEND_URL}/api`;

// Asegúrate que la URL base SIEMPRE use HTTPS para producción
const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:5000';

// UPLOADS_URL debe apuntar a la URL donde se sirven los archivos estáticos/subidos
// Podría ser la misma URL base o una diferente si usas CDN o un servicio distinto
export const UPLOADS_URL = `${API_BASE_URL}/uploads`; // Asume que sirves desde /uploads en tu backend

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