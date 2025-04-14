const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://doctorfy.onrender.com'
  : 'http://localhost:5000/api';

export const endpoints = {
  auth: {
    register: `${API_URL}/auth/register`,
    // ...resto de endpoints
  },
  // ...resto de categorías
};

const config = {
  API_URL,
  endpoints,
};

export default config; 