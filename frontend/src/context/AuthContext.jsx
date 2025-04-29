import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const navigate = useNavigate();

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error al verificar autenticación:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Añadir un efecto para actualizar el estado de suscripción periódicamente
  useEffect(() => {
    // Verificar el estado de suscripción al cargar el componente
    if (user) {
      checkSubscription();
      
      // Configurar un intervalo para verificar el estado de suscripción cada 5 minutos
      const subscriptionInterval = setInterval(() => {
        checkSubscription();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(subscriptionInterval);
    }
  }, [user]);

  // Configurar axios para incluir el token en todas las peticiones
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Función de inicio de sesión
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Modificar esta parte para mejorar el almacenamiento del token
      try {
        localStorage.removeItem('token'); // Limpiar primero
        localStorage.setItem('token', token);
        
        // Verificación adicional para asegurar que se guardó correctamente
        const storedToken = localStorage.getItem('token');
        if (!storedToken || storedToken !== token) {
          console.error('Error: El token no se guardó correctamente en localStorage');
          // Intento alternativo con sessionStorage como fallback
          sessionStorage.setItem('token', token);
        }
        
        // Configurar el token en axios para todas las solicitudes futuras
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        
        // Verificar si el usuario ha visto la guía
        const hasSeenGuide = localStorage.getItem('hasSeenGuide');
        if (!hasSeenGuide) {
          navigate('/guide');
        } else {
          navigate('/dashboard');
        }
        
        return { success: true, user };
      } catch (storageError) {
        console.error('Error al guardar token en localStorage:', storageError);
        // Usar sessionStorage como alternativa
        try {
          sessionStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(user);
          
          // Verificar si el usuario ha visto la guía
          const hasSeenGuide = localStorage.getItem('hasSeenGuide');
          if (!hasSeenGuide) {
            navigate('/guide');
          } else {
            navigate('/dashboard');
          }
          
          return { success: true, user };
        } catch (sessionError) {
          console.error('Error al guardar token en sessionStorage:', sessionError);
          return { success: false, error: 'Error al guardar la sesión' };
        }
      }
    } catch (error) {
      console.error('Error de login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Función de cierre de sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        navigate('/guide');
        return { success: true };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al registrar usuario'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para verificar si el usuario es administrador
  const isAdmin = () => {
    return user && user.is_admin;
  };

  // Función para obtener el token
  const getToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      return null;
    }
    return token;
  };

  // Función para verificar el token
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }
      
      const response = await axios.get('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.valid;
    } catch (error) {
      console.error('Error al verificar token:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return false;
    }
  };

  // Función para verificar el estado de la suscripción
  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token disponible');
        return { active: false, subscription: false, trial: false };
      }

      const response = await axios.get('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Respuesta de verificación de suscripción:", response.data);
      setSubscriptionStatus(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al verificar suscripción:', error);
      return { active: false, subscription: false, trial: false };
    }
  };

  // Función simplificada para iniciar el proceso de suscripción
  const startSubscription = async () => {
    try {
      // Redirigir directamente al enlace de pago de Stripe
      window.location.href = 'https://buy.stripe.com/8wM14lh1j3Jo7L23cI';
      return { success: true };
    } catch (error) {
      console.error('Error al iniciar suscripción:', error);
      return { 
        success: false, 
        message: 'Error al procesar la suscripción'
      };
    }
  };

  // Función simplificada para acceder al portal de clientes
  const accessCustomerPortal = async () => {
    try {
      // Redirigir directamente al portal de clientes de Stripe
      window.location.href = 'https://billing.stripe.com/p/login/bIYg2u2eNbOl7mgdQQ';
      return { success: true };
    } catch (error) {
      console.error('Error al acceder al portal de clientes:', error);
      return { 
        success: false, 
        message: 'Error al acceder al portal de clientes'
      };
    }
  };

  // Proporcionar el contexto
  const value = {
    user,
    isLoading,
    subscriptionStatus,
    login,
    logout,
    register,
    isAdmin,
    getToken,
    verifyToken,
    checkSubscription,
    startSubscription,
    accessCustomerPortal
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 