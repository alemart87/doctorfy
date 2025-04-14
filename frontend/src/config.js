// URL base SIN /api
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production'
  ? 'https://doctorfy.onrender.com' // URL Producción SIN /api
  : 'http://localhost:5000');       // URL Local SIN /api

// Prefijo común para todas las rutas de API
const API_PREFIX = '/api';

export const endpoints = {
  auth: {
    register: `${API_BASE_URL}${API_PREFIX}/auth/register`,
    login: `${API_BASE_URL}${API_PREFIX}/auth/login`,
    me: `${API_BASE_URL}${API_PREFIX}/auth/me`,
  },
  medicalStudies: {
    upload: `${API_BASE_URL}${API_PREFIX}/medical-studies/upload`,
    interpret: (studyId) => `${API_BASE_URL}${API_PREFIX}/medical-studies/interpret/${studyId}`,
    list: `${API_BASE_URL}${API_PREFIX}/medical-studies/studies`,
    details: (studyId) => `${API_BASE_URL}${API_PREFIX}/medical-studies/studies/${studyId}`,
  },
  nutrition: {
    analyzeFood: `${API_BASE_URL}${API_PREFIX}/nutrition/analyze-food`,
    summary: (date) => `${API_BASE_URL}${API_PREFIX}/nutrition/summary/${date}`,
    monthSummary: (year, month) => `${API_BASE_URL}${API_PREFIX}/nutrition/summary/month/${year}/${month}`,
    goal: `${API_BASE_URL}${API_PREFIX}/nutrition/goal`,
  },
  doctors: {
    directory: `${API_BASE_URL}${API_PREFIX}/doctors/directory`,
    subscribe: `${API_BASE_URL}${API_PREFIX}/doctors/subscribe`,
    search: `${API_BASE_URL}${API_PREFIX}/doctors/search`,
    profile: (doctorId) => `${API_BASE_URL}${API_PREFIX}/doctors/${doctorId}`,
  },
  profile: {
    update: `${API_BASE_URL}${API_PREFIX}/profile/update`,
    uploadPhoto: `${API_BASE_URL}${API_PREFIX}/profile/upload-photo`,
    settings: `${API_BASE_URL}${API_PREFIX}/profile/settings`,
  },
  doctorProfile: {
    update: `${API_BASE_URL}${API_PREFIX}/doctor-profile/update`,
    credentials: `${API_BASE_URL}${API_PREFIX}/doctor-profile/credentials`,
    schedule: `${API_BASE_URL}${API_PREFIX}/doctor-profile/schedule`,
  },
  admin: {
    users: `${API_BASE_URL}${API_PREFIX}/admin/users`,
    stats: `${API_BASE_URL}${API_PREFIX}/admin/stats`,
    settings: `${API_BASE_URL}${API_PREFIX}/admin/settings`,
  },
  // Endpoint de salud (si lo necesitas en config)
  health: `${API_BASE_URL}${API_PREFIX}/health`,
};

const config = {
  API_BASE_URL, // Puedes exportar la base si la necesitas
  API_PREFIX,   // Y el prefijo
  endpoints,
};

export default config; 