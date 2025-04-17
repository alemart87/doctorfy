import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton,
  useTheme,
  Paper,
  Collapse,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
  const { user, checkSubscription } = useAuth();
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
  
  return (
    <Collapse in={!dismissed}>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 70, md: 20 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: { xs: '90%', sm: '80%', md: '60%' },
          maxWidth: 800,
        }}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            {/* Círculos decorativos */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                zIndex: 0
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: -30, 
                left: -30, 
                width: 120, 
                height: 120, 
                borderRadius: '50%', 
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                zIndex: 0
              }} 
            />
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 2, sm: 3 },
                position: 'relative',
                zIndex: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                <Box 
                  sx={{ 
                    bgcolor: '#E91E63',
                    color: 'white',
                    borderRadius: '50%',
                    width: { xs: 40, sm: 50 },
                    height: { xs: 40, sm: 50 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 4px 8px rgba(233, 30, 99, 0.4)',
                  }}
                >
                  <AccessTimeIcon fontSize={isMobile ? "small" : "medium"} />
                </Box>
                <Box>
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    sx={{ 
                      color: 'white',
                      fontWeight: 'bold',
                      lineHeight: 1.2
                    }}
                  >
                    ¡PRUEBA GRATUITA POR 2 DÍAS!
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant={isMobile ? "body2" : "body1"} 
                      sx={{ 
                        color: 'rgba(255,255,255,0.9)',
                        mr: 1
                      }}
                    >
                      La oferta termina en:
                    </Typography>
                    <CountdownTimer 
                      endDate={offerEndDate} 
                      onComplete={handleDismiss}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "small" : "medium"}
                  onClick={() => navigate('/subscription')}
                  sx={{
                    mr: 1,
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                    boxShadow: '0 4px 8px rgba(76,175,80,0.4)',
                    animation: `${pulse} 1.5s infinite`,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #43A047 30%, #7CB342 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px rgba(76,175,80,0.6)',
                      animation: 'none'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  COMENZAR AHORA
                </Button>
                <IconButton 
                  size="small" 
                  onClick={handleDismiss}
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Collapse>
  );
};

export default TrialBanner; 