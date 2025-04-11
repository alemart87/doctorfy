import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WelcomeBanner from '../components/WelcomeBanner';
import api from '../api/axios';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Primero probar la conexión básica sin autenticación
    api.get('/auth/test')
      .then(response => {
        console.log('Conexión básica exitosa:', response.data);
        
        // Luego probar con autenticación
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Token encontrado en Dashboard:', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verificar el token
          api.get('/auth/verify-token')
            .then(response => {
              console.log('Verificación de token exitosa:', response.data);
              
              if (response.data.valid) {
                console.log('Token válido, ID de usuario:', response.data.user_id);
                setError(null);
                
                // Ahora obtener los estudios médicos
                api.get('/medical-studies/studies')
                  .then(response => {
                    console.log('Respuesta de estudios médicos:', response.data);
                  })
                  .catch(error => {
                    console.error('Error al obtener estudios médicos:', error);
                    handleApiError(error);
                  });
              } else {
                console.error('Token no válido:', response.data.error);
                setError('Sesión inválida. Por favor, inicie sesión nuevamente.');
                setTimeout(() => {
                  logout();
                  navigate('/login');
                }, 3000);
              }
            })
            .catch(error => {
              console.error('Error al verificar token:', error);
              handleApiError(error);
            });
        } else {
          console.error('No se encontró token en Dashboard');
          setError('No se encontró token de autenticación. Por favor, inicie sesión.');
          setTimeout(() => navigate('/login'), 3000);
        }
      })
      .catch(error => {
        console.error('Error en la conexión básica:', error);
        setError('Error de conexión con el servidor. Por favor, intente más tarde.');
      });
  }, [navigate, logout]);

  // Función para manejar errores de API
  const handleApiError = (error) => {
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      console.error('Estado del error:', error.response.status);
      
      if (error.response.status === 422 || error.response.status === 401) {
        setError('Sesión expirada o inválida. Por favor, inicie sesión nuevamente.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      } else {
        setError(`Error al cargar datos: ${error.response.data.error || 'Error desconocido'}`);
      }
    } else {
      setError('Error de conexión. Por favor, intente nuevamente.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <WelcomeBanner user={user} />
      
      {/* Resto del contenido del dashboard */}
    </Container>
  );
};

export default Dashboard; 