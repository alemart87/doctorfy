import React, { createContext, useState, useEffect, useContext } from 'react';
// Quitar authService si ya no se usa o asegurarse que use 'api'
// import { authService } from '../services/api';
import api from '../api/axios'; // Usar directamente la instancia de axios configurada

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Quitar estado separado, se derivará de 'user'
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Función Helper para cargar perfil ---
  const fetchUserProfile = async () => {
    try {
      // Usa la ruta que devuelve User.to_dict() completo
      const response = await api.get('/profile/me'); // Asegúrate que esta ruta exista y devuelva el perfil
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
      if (token) {
        try {
          // Llama a la función helper para obtener el perfil completo
          await fetchUserProfile();
        } catch (error) {
          // Si fetchUserProfile falla (ej: token inválido), limpiar token
          console.log("Token might be invalid, clearing token.");
          localStorage.removeItem('token');
          setUser(null); // Asegurarse que user es null si falla
        }
      }
      setLoading(false); // Terminar carga inicial (después del try/catch)
    };
    loadUserFromToken();
  }, []); // Ejecutar solo una vez al montar

  // Quitar función loadUser separada si ya no se usa
  /*
  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile(); // Esto debería ser api.get('/profile/me')
      setUser(response.data);
      setError(null);
      // setIsAuthenticated(true); // Ya no se necesita
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Error al cargar el perfil de usuario');
      localStorage.removeItem('token');
      // setIsAuthenticated(false); // Ya no se necesita
    } finally {
      setLoading(false);
    }
  };
  */

  const login = async (credentials) => {
    // setLoading(true); // Opcional
    setError(null);
    try {
      // 1. Hacer la llamada a la API de login (solo para obtener token)
      // Asegúrate que la ruta '/auth/login' es correcta
      const loginResponse = await api.post('/auth/login', credentials);
      const { token } = loginResponse.data; // Asume que devuelve al menos el token

      // 2. Guardar token
      localStorage.setItem('token', token);
      // api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Interceptor ya lo hace

      // 3. OBTENER PERFIL COMPLETO usando la función helper
      await fetchUserProfile(); // Esto llamará a setUser internamente

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
      const registerResponse = await api.post('/auth/register', userData);

      // Verificar si la respuesta contiene el token
      const { token } = registerResponse.data;

      if (!token) {
         // Si no devuelve token, intentar hacer login inmediatamente después
         console.warn("Registro exitoso pero no devolvió token. Intentando login...");
         return await login({ email: userData.email, password: userData.password });
      }

      // Si el registro SÍ devuelve token:
      // 2. Guardar token
      localStorage.setItem('token', token);
      // api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Interceptor ya lo hace

      // 3. OBTENER PERFIL COMPLETO
      await fetchUserProfile(); // Esto llamará a setUser

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
    // Considera redirigir aquí si es necesario
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
    login,
    register,
    logout,
    isAdmin,
    isSuperAdmin,
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