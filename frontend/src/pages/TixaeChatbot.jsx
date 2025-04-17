import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  useTheme, 
  alpha,
  Button,
  Divider,
  Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Aurora from '../components/Aurora';
import ChatIcon from '@mui/icons-material/Chat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonIcon from '@mui/icons-material/Person';

const TixaeChatbot = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  
  useEffect(() => {
    // Configurar el chatbot TIXAE con los datos del usuario
    if (user && chatContainerRef.current) {
      window.VG_CONFIG = {
        ID: "YOe2HrXYtpSyaTOeMhQA",
        region: 'eu',
        render: 'full-width',
        stylesheets: [
          "https://vg-bunny-cdn.b-cdn.net/vg_live_build/styles.css",
        ],
        // Personalizar con los datos del usuario logueado
        user: {
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario Doctorfy',
          email: user.email || '',
          phone: user.phone_number || '',
        }
      };
      
      // Cargar el script del chatbot
      const script = document.createElement("script");
      script.src = "https://vg-bunny-cdn.b-cdn.net/vg_live_build/vg_bundle.js";
      script.defer = true;
      document.body.appendChild(script);
      
      // Limpiar al desmontar
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [user]);
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#000',
      position: 'relative',
      pt: 8,
      pb: 8,
      overflow: 'hidden'
    }}>
      {/* Fondo Aurora con mayor intensidad */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <Aurora 
          opacity={0.6} 
          speed={0.3} 
          size={1000} 
          blur={100} 
          primaryColor="#673AB7" 
          secondaryColor="#9C27B0"
        />
      </Box>
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              mb: 2,
              fontWeight: 900,
              textAlign: 'center',
              fontSize: { xs: '3rem', md: '5rem' },
              background: 'linear-gradient(45deg, #673AB7 30%, #E91E63 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(103, 58, 183, 0.5)',
              letterSpacing: '-0.02em'
            }}
          >
            Asistente Virtual Doctorfy
          </Typography>
          
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 6,
              textAlign: 'center',
              color: 'white',
              fontWeight: 300,
              opacity: 0.9,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Consulta con nuestro asistente virtual para resolver tus dudas médicas
          </Typography>
        </motion.div>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Paper 
                elevation={8} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  height: '100%',
                  backgroundColor: alpha('#121212', 0.7),
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 80px rgba(0,0,0,0.3), 0 0 20px rgba(103, 58, 183, 0.3)',
                  color: 'white'
                }}
              >
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: alpha(theme.palette.primary.main, 0.9) }}>
                  Beneficios de nuestro Asistente Virtual
                </Typography>
                
                <Divider sx={{ mb: 4, borderColor: alpha(theme.palette.primary.main, 0.3), opacity: 0.5 }} />
                
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start' }}>
                  <Box 
                    sx={{ 
                      mr: 2, 
                      p: 1.5, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChatIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ mb: 1, color: theme.palette.primary.main, fontWeight: 600 }}>
                      Respuestas Inmediatas
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                      Obtén respuestas a tus preguntas médicas al instante, sin necesidad de esperar por una cita.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start' }}>
                  <Box 
                    sx={{ 
                      mr: 2, 
                      p: 1.5, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ mb: 1, color: theme.palette.primary.main, fontWeight: 600 }}>
                      Disponible 24/7
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                      Nuestro asistente está disponible a cualquier hora del día, todos los días de la semana.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start' }}>
                  <Box 
                    sx={{ 
                      mr: 2, 
                      p: 1.5, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <VerifiedUserIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ mb: 1, color: theme.palette.primary.main, fontWeight: 600 }}>
                      Información Confiable
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                      Todas las respuestas están basadas en información médica verificada y actualizada.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box 
                    sx={{ 
                      mr: 2, 
                      p: 1.5, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ mb: 1, color: theme.palette.primary.main, fontWeight: 600 }}>
                      Personalizado para Ti
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                      El asistente tiene acceso a tu información básica para brindarte una experiencia personalizada.
                    </Typography>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    mt: 6, 
                    p: 3, 
                    borderRadius: 3, 
                    bgcolor: alpha('#000', 0.3),
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <Typography variant="h6" color="rgba(255,255,255,0.7)" sx={{ fontStyle: 'italic' }}>
                    <strong>Nota importante:</strong> Este asistente virtual proporciona información general y no sustituye la consulta con un profesional médico. En caso de emergencia, contacta a servicios médicos de emergencia.
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <Paper 
                elevation={8} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  backgroundColor: alpha('#121212', 0.7),
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 80px rgba(0,0,0,0.3), 0 0 20px rgba(233, 30, 99, 0.3)',
                  height: '700px', // Altura aumentada para el chatbot
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'white'
                }}
              >
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: alpha(theme.palette.secondary.main, 0.9) }}>
                  Chatbot Médico
                </Typography>
                
                <Divider sx={{ mb: 4, borderColor: alpha(theme.palette.secondary.main, 0.3), opacity: 0.5 }} />
                
                {/* Contenedor del chatbot TIXAE */}
                <Box 
                  ref={chatContainerRef}
                  id="VG_OVERLAY_CONTAINER" 
                  sx={{ 
                    flex: 1,
                    width: '100%',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: alpha('#000', 0.3),
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at center, rgba(103, 58, 183, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
                      pointerEvents: 'none',
                      zIndex: 0
                    }
                  }}
                >
                  {/* Aquí es donde TIXAE Agents renderiza el widget */}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                py: 1.5, 
                px: 4, 
                borderRadius: 3,
                borderWidth: 2,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'translateY(-3px)',
                  boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                },
                transition: 'all 0.3s ease'
              }}
            >
              Volver al Dashboard
            </Button>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/medical-chat')}
              sx={{ 
                py: 1.5, 
                px: 4, 
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.5)}`
                },
                transition: 'all 0.3s ease'
              }}
            >
              Ir al Chat Médico IA
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default TixaeChatbot; 