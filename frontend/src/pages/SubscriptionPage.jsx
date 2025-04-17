import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CardActions, 
  Divider,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';
import Aurora from '../components/Aurora';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Redirigir usuarios según su estado
  useEffect(() => {
    // Si no hay usuario (no está logueado), redirigir a login
    if (user === null) {
      navigate('/login', { state: { from: '/subscription' } });
    }
    // Si el usuario es alemart87@gmail.com, redirigir al dashboard
    else if (user && user.email === 'alemart87@gmail.com') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Si el usuario es alemart87@gmail.com o no está logueado, no renderizar nada mientras se redirecciona
  if (user === null || (user && user.email === 'alemart87@gmail.com')) {
    return null;
  }
  
  const features = [
    {
      icon: <PsychologyIcon fontSize="large" sx={{ color: theme.palette.secondary.main }} />,
      title: "Psicología Ilimitada",
      description: "Acceso completo a consultas psicológicas sin límites durante todo el mes"
    },
    {
      icon: <LocalHospitalIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      title: "Consultas Médicas Ilimitadas",
      description: "Resuelve todas tus dudas médicas con nuestros especialistas virtuales 24/7"
    },
    {
      icon: <AccessTimeIcon fontSize="large" sx={{ color: '#4CAF50' }} />,
      title: "2 Días GRATIS",
      description: "Prueba todas las funciones premium sin compromiso durante 48 horas"
    },
    {
      icon: <SecurityIcon fontSize="large" sx={{ color: '#FF9800' }} />,
      title: "Privacidad Garantizada",
      description: "Tus consultas y datos médicos están protegidos con la máxima seguridad"
    }
  ];
  
  const benefits = [
    "✓ Consultas psicológicas ilimitadas",
    "✓ Asistencia médica 24/7",
    "✓ Análisis de estudios médicos",
    "✓ Recomendaciones nutricionales personalizadas",
    "✓ Seguimiento de tu progreso",
    "✓ Acceso desde cualquier dispositivo",
    "✓ Soporte prioritario",
    "✓ Cancela cuando quieras"
  ];
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#000',
      position: 'relative',
      pt: 8,
      pb: 8,
      overflow: 'hidden'
    }}>
      {/* Fondo Aurora */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <Aurora 
          baseColor="#1a237e"
          glowColor="#3f51b5"
          middleColor="#7986cb"
          size={1000}
          blur={150}
          speed={5}
        />
      </Box>
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              color: 'white',
              fontWeight: 800,
              mb: 2,
              textShadow: '0 0 20px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Potencia Tu Bienestar con Doctorfy Premium
          </Typography>
          
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              mb: 6,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Accede a consultas médicas y psicológicas ilimitadas, análisis de estudios y mucho más.
            <Box component="span" sx={{ display: 'block', mt: 1, fontWeight: 'bold', color: '#4CAF50' }}>
              ¡Prueba GRATIS durante 2 días sin compromiso!
            </Box>
          </Typography>
        </motion.div>
        
        {/* Características destacadas */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <Paper 
                  elevation={6}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    borderRadius: 4,
                    background: 'rgba(30, 40, 100, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 30px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {feature.icon}
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        ml: 2, 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        
        {/* Plan de suscripción */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card 
                raised
                sx={{ 
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/subscription-banner.jpg" // Asegúrate de tener esta imagen
                  alt="Doctorfy Premium"
                  sx={{ 
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
                
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 20, 
                    right: 20, 
                    zIndex: 2 
                  }}
                >
                  <Chip 
                    label="2 DÍAS GRATIS" 
                    color="secondary"
                    sx={{ 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      py: 2,
                      px: 1,
                      background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                      boxShadow: '0 5px 15px rgba(255,152,0,0.4)'
                    }}
                  />
                </Box>
                
                <CardContent sx={{ p: 4, color: 'white' }}>
                  <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Plan Premium
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>
                      €35
                    </Typography>
                    <Typography variant="h6" component="span" sx={{ ml: 1, opacity: 0.8 }}>
                      /mes
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ mr: 1, color: '#FFD700' }} />
                    Todo lo que necesitas para tu salud
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {benefits.map((benefit, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'rgba(255,255,255,0.9)'
                          }}
                        >
                          <CheckCircleIcon sx={{ mr: 1, color: '#4CAF50', fontSize: 20 }} />
                          {benefit}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
                
                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    component="a"
                    href="https://buy.stripe.com/8wM14lh1j3Jo7L23cI"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                      boxShadow: '0 10px 20px rgba(76,175,80,0.4)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #43A047 30%, #7CB342 90%)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 15px 30px rgba(76,175,80,0.6)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    COMENZAR PRUEBA GRATUITA
                  </Button>
                </CardActions>
                
                <Box sx={{ p: 3, pt: 0, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Sin compromiso. Cancela cuando quieras. 
                    La prueba gratuita se convertirá automáticamente en suscripción después de 2 días.
                  </Typography>
                  
                  <Button 
                    variant="text" 
                    color="inherit"
                    component="a"
                    href="https://billing.stripe.com/p/login/bIYg2u2eNbOl7mgdQQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      mt: 2, 
                      color: 'rgba(255,255,255,0.9)',
                      textDecoration: 'underline',
                      '&:hover': {
                        color: 'white'
                      }
                    }}
                  >
                    ¿Ya tienes una suscripción? Administra tu cuenta
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
        
        {/* Testimonios */}
        <Box sx={{ mt: 10, mb: 6 }}>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              color: 'white',
              mb: 4,
              fontWeight: 'bold'
            }}
          >
            Lo que dicen nuestros usuarios
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                name: "María G.",
                role: "Paciente",
                text: "Doctorfy ha cambiado mi vida. Puedo consultar con psicólogos y médicos sin salir de casa. La prueba gratuita me convenció desde el primer día."
              },
              {
                name: "Carlos R.",
                role: "Profesional",
                text: "Las consultas médicas ilimitadas son increíbles. He resuelto dudas a cualquier hora del día y los especialistas son muy profesionales."
              },
              {
                name: "Laura M.",
                role: "Estudiante",
                text: "El servicio de psicología me ha ayudado enormemente con mi ansiedad. Vale cada euro y la prueba gratuita te permite comprobar la calidad."
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      height: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Typography variant="body1" sx={{ color: 'white', mb: 2, fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {testimonial.name.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Box 
            sx={{ 
              mt: 8, 
              p: 5, 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              ¡Comienza tu prueba gratuita hoy!
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
              2 días completos para experimentar todas las funciones premium sin compromiso
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              component="a"
              href="https://buy.stripe.com/8wM14lh1j3Jo7L23cI"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                py: 1.5,
                px: 6,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: 3,
                background: 'white',
                color: theme.palette.secondary.main,
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              COMENZAR AHORA
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SubscriptionPage; 