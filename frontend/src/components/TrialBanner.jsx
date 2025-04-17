import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton,
  useTheme,
  Paper,
  Collapse,
  useMediaQuery,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CelebrationIcon from '@mui/icons-material/Celebration';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import CountdownTimer from './CountdownTimer';
import { keyframes } from '@mui/system';

// Definir la animación de pulso
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

const TrialBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const { user, checkSubscription, subscriptionStatus } = useAuth();
  const [hasSubscription, setHasSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [offerEndDate, setOfferEndDate] = useState(() => {
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 48);
    return endDate;
  });
  
  useEffect(() => {
    // Verificar si el usuario ya ha cerrado el banner anteriormente
    const bannerDismissed = localStorage.getItem('trialBannerDismissed');
    if (bannerDismissed) {
      setDismissed(true);
    }
    
    // Verificar si el usuario tiene una suscripción
    const checkUserSubscription = async () => {
      if (user) {
        try {
          const isActive = await checkSubscription();
          setHasSubscription(isActive);
        } catch (err) {
          console.error('Error al verificar suscripción:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkUserSubscription();
  }, [user, checkSubscription]);
  
  const handleDismiss = () => {
    setDismissed(true);
    // Guardar en localStorage para que no vuelva a aparecer en esta sesión
    localStorage.setItem('trialBannerDismissed', 'true');
  };
  
  // No mostrar para usuarios con email alemart87@gmail.com, usuarios con suscripción o si está cargando
  if (dismissed || loading || hasSubscription || (user && user.email === 'alemart87@gmail.com')) {
    return null;
  }
  
  // Si no hay información de suscripción o el usuario tiene suscripción activa, no mostrar nada
  if (!subscriptionStatus || subscriptionStatus.subscription) {
    return null;
  }
  
  // Si el usuario está en período de prueba
  if (subscriptionStatus.trial) {
    // Calcular tiempo restante en formato legible
    const hoursRemaining = subscriptionStatus.trial_remaining || 0;
    let timeDisplay = '';
    
    if (hoursRemaining > 24) {
      const days = Math.floor(hoursRemaining / 24);
      const hours = hoursRemaining % 24;
      timeDisplay = `${days} día${days !== 1 ? 's' : ''} y ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      timeDisplay = `${hoursRemaining} hora${hoursRemaining !== 1 ? 's' : ''}`;
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #2c3e50 0%, #4a69bd 100%)',
            color: 'white',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.15)', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CelebrationIcon fontSize="large" sx={{ color: '#FFD700' }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ¡Período de Prueba Activo!
                  </Typography>
                  <Chip 
                    label="PREMIUM" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#FFD700', 
                      color: '#2c3e50',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Estás disfrutando de acceso completo a todas las funcionalidades premium durante <span style={{ fontWeight: 'bold', color: '#FFD700' }}>{timeDisplay}</span> más.
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/subscription')}
              sx={{ 
                bgcolor: '#FFD700', 
                color: '#2c3e50',
                fontWeight: 'bold',
                px: 3,
                '&:hover': {
                  bgcolor: '#F4C430',
                },
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                minWidth: { xs: '100%', sm: 'auto' }
              }}
            >
              Suscribirme Ahora
            </Button>
          </Box>
        </Paper>
      </motion.div>
    );
  }
  
  // Si el período de prueba ha expirado
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%)',
          color: 'white',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: '50%', 
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <WarningIcon fontSize="large" sx={{ color: '#FFC107' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Tu período de prueba ha finalizado
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Suscríbete ahora para seguir disfrutando de todas las funcionalidades premium de Doctorfy.
              </Typography>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/subscription')}
            sx={{ 
              bgcolor: '#FFC107', 
              color: '#6a1b9a',
              fontWeight: 'bold',
              px: 3,
              '&:hover': {
                bgcolor: '#FFD54F',
              },
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Suscribirme Ahora
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default TrialBanner; 