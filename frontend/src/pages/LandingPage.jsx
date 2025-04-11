import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaStethoscope, FaFileMedical, FaApple, FaUserMd, FaLock } from 'react-icons/fa';
import { RiMentalHealthFill } from 'react-icons/ri';
import { GiMedicines } from 'react-icons/gi';
import '../styles/LandingPage.css';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  CardMedia,
  useTheme,
  Paper,
  Avatar,
  Divider,
  Fade,
  Zoom,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import {
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  Devices as DevicesIcon,
  AccessTime as AccessTimeIcon,
  MonetizationOn as MonetizationOnIcon,
  Language as LanguageIcon,
  Bolt as BoltIcon
} from '@mui/icons-material';

// Importar imágenes desde un CDN público
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200",
  medical1: "https://images.unsplash.com/photo-1583912267550-82c95c9b6e4c?auto=format&fit=crop&w=500",
  medical2: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=500",
  doctors: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500",
  tech: "https://images.unsplash.com/photo-1576670159805-381a0aa2d599?auto=format&fit=crop&w=500",
  ai: "https://images.unsplash.com/photo-1677442135136-760c813a743d?auto=format&fit=crop&w=800",
};

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  // Efectos de parallax
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  
  // Testimonios
  const testimonials = [
    {
      id: 1,
      name: "Dr. Carlos Méndez",
      role: "Cardiólogo",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "Doctorfy ha revolucionado mi práctica médica. Ahora puedo analizar estudios médicos y ofrecer diagnósticos precisos en tiempo récord."
    },
    {
      id: 2,
      name: "María González",
      role: "Paciente",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "La función de análisis nutricional me ha ayudado a mejorar mis hábitos alimenticios. ¡Increíble poder saber el valor nutricional con solo una foto!"
    },
    {
      id: 3,
      name: "Dr. Javier Ruiz",
      role: "Nutricionista",
      image: "https://randomuser.me/api/portraits/men/62.jpg",
      text: "Como nutricionista, puedo ofrecer planes personalizados basados en datos reales. La IA de Doctorfy es sorprendentemente precisa."
    }
  ];

  // Características
  const features = [
    {
      icon: <HospitalIcon fontSize="large" sx={{ color: '#2196f3' }} />,
      title: 'Gestión de Estudios',
      description: 'Organiza y accede a tus estudios médicos desde cualquier lugar.'
    },
    {
      icon: <ScienceIcon fontSize="large" sx={{ color: '#4caf50' }} />,
      title: 'Análisis con IA',
      description: 'Interpretación preliminar de estudios usando inteligencia artificial avanzada.'
    },
    {
      icon: <SecurityIcon fontSize="large" sx={{ color: '#f44336' }} />,
      title: 'Seguridad Total',
      description: 'Tus datos protegidos con los más altos estándares de seguridad.'
    },
    {
      icon: <SpeedIcon fontSize="large" sx={{ color: '#ff9800' }} />,
      title: 'Acceso Rápido',
      description: 'Interfaz intuitiva y respuesta inmediata a tus necesidades.'
    },
    {
      icon: <BoltIcon fontSize="large" sx={{ color: '#9c27b0' }} />,
      title: 'Diagnóstico Instantáneo',
      description: 'Resultados en segundos vs. horas o días con médicos tradicionales.'
    },
    {
      icon: <LanguageIcon fontSize="large" sx={{ color: '#3f51b5' }} />,
      title: 'Primera IA Médica Paraguaya',
      description: 'Tecnología de vanguardia desarrollada en Paraguay para el mundo.'
    },
    {
      icon: <AccessTimeIcon fontSize="large" sx={{ color: '#009688' }} />,
      title: 'Ahorro de Tiempo',
      description: 'Reduce el tiempo de espera de días a segundos para interpretaciones médicas.'
    },
    {
      icon: <MonetizationOnIcon fontSize="large" sx={{ color: '#795548' }} />,
      title: 'Accesibilidad Económica',
      description: 'Hasta 90% más económico que consultas médicas tradicionales.'
    }
  ];

  // Estadísticas
  const stats = [
    { id: 1, value: "30s", label: "vs 72 horas", description: "Tiempo de diagnóstico" },
    { id: 2, value: "98%", label: "Precisión", description: "Validado por especialistas" },
    { id: 3, value: "90%", label: "Más económico", description: "Que consultas tradicionales" },
    { id: 4, value: "24/7", label: "Disponibilidad", description: "Sin tiempos de espera" }
  ];

  const steps = [
    {
      icon: <UploadIcon fontSize="large" />,
      title: "Sube tus Estudios",
      description: "Carga tus estudios médicos fácilmente desde cualquier dispositivo."
    },
    {
      icon: <AnalyticsIcon fontSize="large" />,
      title: "Análisis Automático",
      description: "Nuestra IA analiza y proporciona interpretaciones preliminares."
    },
    {
      icon: <PsychologyIcon fontSize="large" />,
      title: "Consulta Profesional",
      description: "Conecta con especialistas para una interpretación experta."
    },
    {
      icon: <DevicesIcon fontSize="large" />,
      title: "Acceso Universal",
      description: "Accede a tus resultados desde cualquier dispositivo, en cualquier momento."
    }
  ];

  useEffect(() => {
    // Inicializar cualquier biblioteca de animación adicional si es necesario
  }, []);

  return (
    <Box>
      {/* Hero Section con imagen de fondo */}
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${IMAGES.hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1
          }
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Chip 
                  label="PRIMERA IA MÉDICA DE PARAGUAY" 
                  color="secondary" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    py: 1
                  }} 
                />
                <Typography 
                  variant="h1" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '3rem', md: '4rem' }
                  }}
                >
                  Doctorfy
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ mb: 2, opacity: 0.9 }}
                >
                  Dando acceso a la salud a todos
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ mb: 4, opacity: 0.8, fontWeight: 'normal' }}
                >
                  Consulta tus análisis con nuestra IA y obtén resultados en 30 segundos, 
                  no en 3 días como con médicos tradicionales.
                </Typography>
                <Box sx={{ mt: 4 }}>
                  {!user ? (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{ 
                          mr: 2,
                          px: 4,
                          py: 2,
                          fontSize: '1.2rem',
                          backgroundColor: theme.palette.secondary.main,
                          '&:hover': {
                            backgroundColor: theme.palette.secondary.dark,
                            transform: 'scale(1.05)',
                            transition: 'all 0.3s'
                          }
                        }}
                      >
                        Comenzar Ahora
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{ 
                          px: 4,
                          py: 2,
                          fontSize: '1.2rem',
                          color: 'white',
                          borderColor: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        Iniciar Sesión
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/medical-studies')}
                      sx={{ 
                        px: 4,
                        py: 2,
                        fontSize: '1.2rem'
                      }}
                    >
                      Ir a Mis Estudios
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* AI vs Human Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 700 }}
          >
            IA vs Médicos Tradicionales
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', p: 3, height: '100%' }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'secondary.light' }}>
                  Doctorfy IA
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BoltIcon color="secondary" />
                    <Typography>Resultados en 30 segundos</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon color="secondary" />
                    <Typography>Disponible 24/7, sin citas</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MonetizationOnIcon color="secondary" />
                    <Typography>Hasta 90% más económico</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ScienceIcon color="secondary" />
                    <Typography>Precisión del 98% validada por especialistas</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', p: 3, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  Médicos Tradicionales
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon />
                    <Typography>Espera de 24-72 horas para resultados</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon />
                    <Typography>Horarios limitados y citas previas</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MonetizationOnIcon />
                    <Typography>Costos elevados por consulta</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ScienceIcon />
                    <Typography>Variabilidad según experiencia del médico</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 700 }}
        >
          Características
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in timeout={500 + index * 100}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Avatar
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mb: 2,
                      backgroundColor: 'transparent'
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Doctorfy en Números
          </Typography>
          
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={stat.id}>
                <Fade in timeout={1000 + index * 200}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Typography 
                      variant="h2" 
                      component="div" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'secondary.main',
                        mb: 1
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      component="div"
                      sx={{ mb: 1 }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {stat.description}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Steps Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Cómo Funciona
          </Typography>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={3} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mb: 2,
                        mx: 'auto',
                        backgroundColor: theme.palette.primary.main
                      }}
                    >
                      {step.icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {step.description}
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Lo Que Dicen Nuestros Usuarios
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Fade in timeout={1000 + index * 200}>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                        "{testimonial.text}"
                      </Typography>
                    </CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={testimonial.image} alt={testimonial.name} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>
            Comienza a gestionar tus estudios médicos hoy
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Únete a miles de usuarios que ya confían en Doctorfy
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem'
            }}
          >
            Crear Cuenta Gratis
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Doctorfy
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                La primera Inteligencia Artificial Médica del Paraguay.
                Revolucionando la salud digital con tecnología de vanguardia.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" gutterBottom>
                Enlaces
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Inicio</Link>
                <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>Acerca de</Link>
                <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contacto</Link>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" gutterBottom>
                Servicios
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link to="/medical-studies" style={{ color: 'white', textDecoration: 'none' }}>Estudios Médicos</Link>
                <Link to="/nutrition" style={{ color: 'white', textDecoration: 'none' }}>Análisis Nutricional</Link>
                <Link to="/doctors" style={{ color: 'white', textDecoration: 'none' }}>Directorio Médico</Link>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contacto
              </Typography>
              <Typography variant="body2">
                Av. Principal 123, Asunción, Paraguay
              </Typography>
              <Typography variant="body2">
                +595 981 123456
              </Typography>
              <Typography variant="body2">
                info@doctorfy.com
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              &copy; {new Date().getFullYear()} Doctorfy. Todos los derechos reservados.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Link to="/privacy" style={{ color: 'white', opacity: 0.7, textDecoration: 'none' }}>
                Privacidad
              </Link>
              <Link to="/terms" style={{ color: 'white', opacity: 0.7, textDecoration: 'none' }}>
                Términos
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 