import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const SubscriptionBanner = () => {
  const { user, checkSubscription } = useAuth();
  const [hasSubscription, setHasSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const checkUserSubscription = async () => {
      try {
        const isActive = await checkSubscription();
        setHasSubscription(isActive);
      } catch (err) {
        setError('Error al verificar la suscripción');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      checkUserSubscription();
    }
  }, [user, checkSubscription]);
  
  // Si el usuario es alemart87@gmail.com, no mostrar el banner
  if (user && user.email === 'alemart87@gmail.com') {
    return null;
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (hasSubscription) {
    return (
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e8f5e9' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1">
            Tu suscripción está activa. ¡Gracias por ser parte de Doctorfy!
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            component="a"
            href="https://billing.stripe.com/p/login/bIYg2u2eNbOl7mgdQQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            Administrar Suscripción
          </Button>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Typography variant="h6" sx={{ mb: 1 }}>
        Suscripción Requerida
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Para acceder a todas las funcionalidades de Doctorfy, es necesario tener una suscripción activa.
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary"
        component="a"
        href="https://buy.stripe.com/8wM14lh1j3Jo7L23cI"
        target="_blank"
        rel="noopener noreferrer"
      >
        Suscribirse Ahora
      </Button>
    </Paper>
  );
};

export default SubscriptionBanner; 