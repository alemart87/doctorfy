import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import api from '../api/axios';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          console.log('User data:', response.data); // Para depuración
          setUser(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Error al verificar token:', error);
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };
    
    checkToken();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      setUser(response.data);
      setError(null);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Error al cargar el perfil de usuario');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log("DEBUG: Respuesta recibida en login:", response.data);
      
      const userData = response.data.user;
      const token = response.data.token;
      
      if (userData && userData.id && token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData.id);
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      } else {
        console.error("Error: La respuesta del login no tiene la estructura esperada.", response.data);
        throw new Error("Respuesta inválida del servidor al iniciar sesión.");
      }
    } catch (error) {
      console.error("Error en la función login:", error);
      setLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      console.log('Respuesta del registro:', response.data);
      
      if (!response.data.token) {
        console.error('No se recibió token en la respuesta del registro');
        return { 
          success: false, 
          error: 'Error en la autenticación después del registro' 
        };
      }
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al registrarse' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    return user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');
  };

  const isSuperAdmin = () => {
    return user && user.role === 'SUPERADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAdmin,
        isSuperAdmin,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 