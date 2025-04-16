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