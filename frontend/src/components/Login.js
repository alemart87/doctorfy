const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  try {
    // Imprimir los datos que se envían
    console.log('Datos enviados en login desde componente:', { email, password });
    
    // Asegurarse de que se envían como valores directos, no como objetos anidados
    const result = await login(email, password);
    
    if (result.success) {
      // Verificar que el token se haya guardado correctamente
      const token = localStorage.getItem('token');
      console.log('Token guardado después del login:', token);
      
      // Asegurarse de que el token se configure en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Headers configurados:', api.defaults.headers.common);
      
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  } catch (err) {
    setError(err.message || 'Error al iniciar sesión');
  }
}; 