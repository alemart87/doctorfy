const API_URL = process.env.REACT_APP_API_URL || process.env.NODE_ENV === 'production'
  ? 'https://doctorfy.onrender.com/api'
  : 'http://localhost:5000/api';

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
    summary: (date) => `${API_URL}/nutrition/summary/${date}`,
    monthSummary: (year, month) => `${API_URL}/nutrition/summary/month/${year}/${month}`,
    goal: `${API_URL}/nutrition/goal`,
  },
  doctors: {
    directory: `${API_URL}/doctors/directory`,
    subscribe: `${API_URL}/doctors/subscribe`,
    search: `${API_URL}/doctors/search`,
    profile: (doctorId) => `${API_URL}/doctors/${doctorId}`,
  },
  profile: {
    update: `${API_URL}/profile/update`,
    uploadPhoto: `${API_URL}/profile/upload-photo`,
    settings: `${API_URL}/profile/settings`,
  },
  doctorProfile: {
    update: `${API_URL}/doctor-profile/update`,
    credentials: `${API_URL}/doctor-profile/credentials`,
    schedule: `${API_URL}/doctor-profile/schedule`,
  },
  admin: {
    users: `${API_URL}/admin/users`,
    stats: `${API_URL}/admin/stats`,
    settings: `${API_URL}/admin/settings`,
  }
};

const config = {
  API_URL,
  endpoints,
};

export default config; 