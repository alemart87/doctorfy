const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
};

export default {
  API_URL,
  endpoints,
}; 