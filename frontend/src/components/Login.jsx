import api from '../utils/api';

const handleLogin = async (credentials) => {
  try {
    const response = await api.auth.login(credentials);
    // Manejar respuesta exitosa
  } catch (error) {
    // Manejar error
    console.error('Login failed:', error);
  }
}; 