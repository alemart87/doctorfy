const login = async (email, password) => {
  try {
    setLoading(true);
    const response = await axios.post('/api/auth/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      
      // Verificar si el usuario ha visto la guía
      const hasSeenGuide = localStorage.getItem('hasSeenGuide');
      if (!hasSeenGuide) {
        navigate('/guide');
      } else {
        navigate('/dashboard');
      }
      
      return { success: true };
    }
  } catch (error) {
    console.error('Error en login:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Error al iniciar sesión'
    };
  } finally {
    setLoading(false);
  }
};

// Similar para register 

export const AuthProvider = ({ children }) => {
  // Estado existente...
  
  // Función para obtener el token
  const getToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Si no hay token, redirigir al login
      logout();
      return null;
    }
    return token;
  };
  
  // Añadir esta función a AuthContext
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }
      
      // Verificar el token con el backend
      const response = await axios.get('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.valid;
    } catch (error) {
      console.error('Error al verificar token:', error);
      // Si hay un error, probablemente el token no sea válido
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return false;
    }
  };
  
  // Incluir getToken en el valor del contexto
  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    isAdmin,
    getToken, // Añadir esta función
    verifyToken, // Añadir esta función
    // Otras funciones existentes...
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 