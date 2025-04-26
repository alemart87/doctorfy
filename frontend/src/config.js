const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_BACKEND_URL || 'https://doctorfy.onrender.com'
  : process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const API_URL = `${BACKEND_URL}/api`;

export const UPLOADS_URL = `${BACKEND_URL}/uploads`;

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