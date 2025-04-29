import React, { createContext, useState, useEffect, useContext } from 'react';
// Quitar authService si ya no se usa o asegurarse que use 'api'
// import { authService } from '../services/api';
import api from '../api/axios'; // Usar directamente la instancia de axios configurada
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const navigate = useNavigate();
  // Quitar estado separado, se derivará de 'user'
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Función Helper para cargar perfil ---
  const fetchUserProfile = async () => {
    try {
      // Usa la ruta que devuelve User.to_dict() completo
      const response = await api.get('/api/profile/me'); // Asegúrate que esta ruta exista y devuelva el perfil
      setUser(response.data); // Guarda el perfil COMPLETO
      setError(null); // Limpiar errores previos si carga bien
      return response.data; // Devolver datos por si se necesitan
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Limpiar usuario si falla la carga del perfil
      setUser(null);
      // Podrías querer establecer un error específico de carga de perfil
      // setError("No se pudo cargar la información del usuario.");
      throw err; // Re-lanzar para que la carga inicial sepa que falló
    }
  };

  useEffect(() => {
    // --- Lógica de carga inicial modificada ---
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token && token.split('.').length === 3) {
        try {
          // Llama a la función helper para obtener el perfil completo
          await fetchUserProfile();
        } catch (error) {
          // Si fetchUserProfile falla (ej: token inválido), limpiar token
          console.log("Token might be invalid, clearing token.");
          localStorage.removeItem('token');
          setUser(null); // Asegurarse que user es null si falla
        }
      } else if (token) {
        // Si el token existe pero no tiene el formato correcto
        console.error('Token inválido encontrado, limpiando:', token);
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false); // Terminar carga inicial (después del try/catch)
    };
    loadUserFromToken();
  }, []); // Ejecutar solo una vez al montar

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

  const login = async (credentials) => {
    // setLoading(true); // Opcional
    setError(null);
    try {
      // 1. Hacer la llamada a la API de login (solo para obtener token)
      // Asegúrate que la ruta '/auth/login' es correcta
      const loginResponse = await api.post('/api/auth/login', credentials);
      const { token, user: userData } = loginResponse.data; // Asume que devuelve al menos el token

      // Verificar que el token tenga la estructura correcta
      if (!token || token.split('.').length !== 3) {
        throw new Error('Token inválido recibido del servidor');
      }

      // 2. Guardar token
      localStorage.setItem('token', token);
      setUser(userData);
      // api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Interceptor ya lo hace

      // setLoading(false); // Opcional
      return { success: true };

    } catch (error) {
      console.error('Error en login:', error);
      localStorage.removeItem('token'); // Limpiar token si login o fetchProfile falla
      setUser(null);
      // setLoading(false); // Opcional
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión o cargar perfil'
      };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      // 1. Hacer la llamada a la API de registro
      // Asegúrate que la ruta '/auth/register' es correcta
      const registerResponse = await api.post('/api/auth/register', userData);

      // Verificar si la respuesta contiene el token
      const { token } = registerResponse.data;

      if (!token || token.split('.').length !== 3) {
        throw new Error('Token inválido recibido del servidor');
      }

      // Si el registro SÍ devuelve token:
      // 2. Guardar token
      localStorage.setItem('token', token);
      setUser(registerResponse.data.user);
      // api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Interceptor ya lo hace

      // Redirigir a la guía para nuevos usuarios
      navigate('/guide');

      return { success: true };

    } catch (error) {
      console.error('Error en registro:', error);
      setUser(null);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrarse o cargar perfil'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // delete api.defaults.headers.common['Authorization']; // Opcional
    console.log("User logged out.");
    navigate('/login');
  };

  // Función para verificar el estado de la suscripción
  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token.split('.').length !== 3) {
        console.error('No hay token válido disponible');
        return { active: false, subscription: false, trial: false };
      }

      const response = await api.get('/api/subscription/status');
      
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

  // --- isAdmin y isSuperAdmin (sin cambios) ---
  const isAdmin = () => user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');
  const isSuperAdmin = () => user && user.role === 'SUPERADMIN';


  // --- Valor proporcionado por el contexto ---
  const value = {
    user,
    // setUser, // Exponer solo si es necesario
    loading, // Estado de carga inicial
    error,   // Último error
    subscriptionStatus,
    login,
    register,
    logout,
    isAdmin,
    isSuperAdmin,
    checkSubscription,
    startSubscription,
    accessCustomerPortal,
    isAuthenticated: !!user, // Derivado directamente
  };

  // No renderizar children hasta que termine la carga inicial
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Quitar export default si no se usa
// export default AuthContext; 