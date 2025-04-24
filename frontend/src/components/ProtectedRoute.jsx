import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, requireSubscription = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessDetails, setAccessDetails] = useState(null);

  // Verificar acceso directamente con el backend
  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        // Si el usuario es alemart87@gmail.com, siempre tiene acceso
        if (user.email === 'alemart87@gmail.com') {
          setHasAccess(true);
          setCheckingAccess(false);
          return;
        }

        // Para otros usuarios, verificar acceso directamente con el backend
        if (requireSubscription) {
          try {
            // Llamar directamente al endpoint de depuración para obtener información completa
            const response = await axios.get('/api/debug/subscription-check');
            console.log("Información de acceso:", response.data);
            
            // Usar directamente el campo has_access del backend
            setHasAccess(response.data.has_access);
            setAccessDetails(response.data);
          } catch (error) {
            console.error('Error al verificar acceso:', error);
            setHasAccess(false);
          }
        } else {
          // Si no se requiere suscripción para esta ruta
          setHasAccess(true);
        }
        setCheckingAccess(false);
      }
    };

    if (user && !loading) {
      checkAccess();
    } else if (!loading) {
      setCheckingAccess(false);
    }
  }, [user, loading, requireSubscription]);

  // Mientras se verifica el estado de autenticación o acceso, mostrar un indicador de carga
  if (loading || (user && checkingAccess)) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#000'
      }}>
        <CircularProgress color="primary" />
        <Typography color="white" sx={{ mt: 2 }}>
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Si el usuario no está autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si el usuario está autenticado pero no tiene acceso
  if (requireSubscription && hasAccess === false) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#000',
        padding: 3
      }}>
        <Paper sx={{ 
          maxWidth: 600, 
          p: 4, 
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 2
        }}>
          <Typography variant="h4" gutterBottom color="primary">
            Acceso Restringido
          </Typography>
          
          <Typography variant="body1" paragraph>
            Para acceder a esta sección, necesitas una suscripción activa o estar en tu período de prueba gratuito.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Tu período de prueba ha finalizado o aún no has activado tu suscripción.
          </Typography>
          
          {accessDetails && (
            <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Detalles de acceso:
              </Typography>
              <Typography variant="body2">
                • Email: {accessDetails.email}
              </Typography>
              <Typography variant="body2">
                • Período de prueba: {accessDetails.trial_details.in_trial ? 'Activo' : 'Inactivo'}
              </Typography>
              {accessDetails.trial_details.trial_start && (
                <Typography variant="body2">
                  • Inicio de prueba: {new Date(accessDetails.trial_details.trial_start).toLocaleString()}
                </Typography>
              )}
              {accessDetails.trial_details.trial_end && (
                <Typography variant="body2">
                  • Fin de prueba: {new Date(accessDetails.trial_details.trial_end).toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2">
                • Prueba utilizada: {accessDetails.trial_details.trial_used ? 'Sí' : 'No'}
              </Typography>
              <Typography variant="body2">
                • Tiempo restante: {accessDetails.trial_details.trial_remaining_hours ? `${accessDetails.trial_details.trial_remaining_hours} horas` : 'Agotado'}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              component={Link} 
              to="/subscription" 
              variant="contained" 
              color="primary"
              size="large"
            >
              Suscribirme Ahora
            </Button>
            
            <Button 
              component={Link} 
              to="/" 
              variant="outlined"
            >
              Volver al Inicio
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Si el usuario está autenticado y tiene acceso, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute; 