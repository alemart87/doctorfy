import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requireSubscription = true }) => {
  const { user, loading, checkSubscription } = useAuth();
  const location = useLocation();
  const [hasSubscription, setHasSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  // Verificar suscripción cuando el usuario está autenticado
  useEffect(() => {
    const verifySubscription = async () => {
      if (user) {
        // Si el usuario es alemart87@gmail.com, considerarlo como suscrito
        if (user.email === 'alemart87@gmail.com') {
          setHasSubscription(true);
          setCheckingSubscription(false);
          return;
        }

        // Para otros usuarios, verificar suscripción
        if (requireSubscription) {
          try {
            const isActive = await checkSubscription();
            setHasSubscription(isActive);
          } catch (error) {
            console.error('Error al verificar suscripción:', error);
            setHasSubscription(false);
          }
        } else {
          // Si no se requiere suscripción para esta ruta
          setHasSubscription(true);
        }
        setCheckingSubscription(false);
      }
    };

    if (user && !loading) {
      verifySubscription();
    } else if (!loading) {
      setCheckingSubscription(false);
    }
  }, [user, loading, checkSubscription, requireSubscription]);

  // Mientras se verifica el estado de autenticación o suscripción, mostrar un indicador de carga
  if (loading || (user && checkingSubscription)) {
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
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si el usuario está autenticado pero no tiene suscripción (y se requiere)
  if (requireSubscription && !hasSubscription && user.email !== 'alemart87@gmail.com') {
    return <Navigate to="/subscription" state={{ from: location.pathname }} replace />;
  }

  // Si el usuario está autenticado y tiene suscripción (o no se requiere), mostrar el contenido protegido
  return children;
};

export default ProtectedRoute; 