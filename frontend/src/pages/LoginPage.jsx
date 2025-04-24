import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  // ... otros estados y lógica ...

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      // ... llamada a la API para login ...
      const response = await axios.post('/api/auth/login', values);
      
      if (response.data && response.data.token) {
        login(response.data); // Actualiza el contexto de autenticación
        navigate('/dashboard');
      } else {
         setErrors({ submit: 'Respuesta inválida del servidor' });
      }
    } catch (error) {
      // ... manejo de errores ...
      setErrors({ submit: error.response?.data?.message || 'Error al iniciar sesión' });
    } finally {
      setSubmitting(false);
    }
  };

  // ... resto del componente ...
}; 