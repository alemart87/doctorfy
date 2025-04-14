import config from '../config';

const api = {
  async call(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const token = localStorage.getItem('token');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Métodos específicos
  auth: {
    login: (credentials) => api.call(config.endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (userData) => api.call(config.endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  },
};

export default api; 