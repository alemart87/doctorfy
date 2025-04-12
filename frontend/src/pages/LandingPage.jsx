import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  useTheme,
  Paper,
  Avatar,
  Fade,
  Slide,
  Link,
  Divider
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
  Restaurant,
  Description
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useInView } from 'react-intersection-observer';
import { Link as RouterLink } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

// Componentes estilizados
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(/path/to/pattern.svg)',
    opacity: 0.1,
    animation: 'float 20s linear infinite',
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  }
}));

const AnimatedIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  color: theme.palette.primary.main,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.2) rotate(10deg)',
  }
}));

// Estilo para el contenedor de la animación de texto
const TypingContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.3)',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  fontFamily: '"Courier New", Courier, monospace',
  color: '#a5d6a7', // Verde claro tipo terminal
  minHeight: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
  width: '100%', // Asegurar que ocupe el espacio
  maxWidth: '600px', // Limitar el ancho si es necesario
  margin: 'auto', // Centrar si es más pequeño que el grid item
}));

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  // Refs para animaciones de scroll
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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
      icon: <SpeedIcon fontSize="large" sx={{ color: '#ff9800' }} />,
      title: 'Diagnóstico Instantáneo',
      description: 'Resultados en segundos vs. horas o días con médicos tradicionales.'
    },
    {
      icon: <SpeedIcon fontSize="large" sx={{ color: '#ff9800' }} />,
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

  const mainFeatures = [
    {
      title: 'Análisis de Estudios Médicos',
      description: 'Interpreta tus estudios médicos con IA avanzada para obtener resultados rápidos y precisos.',
      icon: <Description fontSize="large" />,
      path: '/medical-studies',
      color: theme.palette.primary.main
    },
    {
      title: 'Análisis Nutricional',
      description: 'Analiza el contenido nutricional de tus alimentos con solo una foto y recibe recomendaciones personalizadas.',
      icon: <Restaurant fontSize="large" />,
      path: '/analyze-nutrition',
      color: theme.palette.secondary.main
    },
    {
      title: 'Directorio Médico',
      description: 'Conecta con profesionales de la salud calificados y gestiona tus consultas de manera eficiente.',
      icon: <HospitalIcon fontSize="large" />,
      path: '/doctors',
      color: theme.palette.success.main
    }
  ];

  const benefits = [
    {
      icon: <SpeedIcon />,
      title: 'Resultados Instantáneos',
      description: 'Obtén análisis detallados en segundos gracias a nuestra IA avanzada.'
    },
    {
      icon: <SecurityIcon />,
      title: 'Seguridad Garantizada',
      description: 'Tus datos médicos están protegidos con los más altos estándares de seguridad.'
    },
    {
      icon: <PsychologyIcon />,
      title: 'IA Inteligente',
      description: 'Tecnología de punta que aprende y mejora constantemente para brindarte los mejores resultados.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection ref={heroRef}>
        <Container maxWidth="lg">
          <Fade in={heroInView} timeout={1000}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Tu Salud, Potenciada por IA
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 4
                  }}
                >
                  Análisis médicos y nutricionales instantáneos con inteligencia artificial de última generación.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => navigate('/register')}
                    sx={{
                      borderRadius: '30px',
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      boxShadow: theme.shadows[10],
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    Comenzar Ahora
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderRadius: '30px',
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                    onClick={() => navigate('/about')}
                  >
                    Saber Más
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TypingContainer>
                  <TypeAnimation
                    sequence={[
                      'Analizando radiografía de tórax...\n> Hallazgos: Sin consolidaciones agudas.\n> Impresión: Normal.',
                      2000,
                      'Interpretando resultados de laboratorio...\n> Glucosa: 95 mg/dL (Normal)\n> Colesterol LDL: 110 mg/dL (Límite)',
                      2000,
                      'Generando informe nutricional...\n> Calorías recomendadas: 2200 kcal\n> Macronutrientes: 40% Carbs, 30% Prot, 30% Grasas',
                      2000,
                      'Evaluando electrocardiograma (ECG)...\n> Ritmo: Sinusal normal.\n> Frecuencia: 75 lpm.',
                      2000,
                    ]}
                    wrapper="pre"
                    cursor={true}
                    repeat={Infinity}
                    style={{ fontSize: '1.1em', whiteSpace: 'pre-wrap', width: '100%' }}
                    speed={60}
                    deletionSpeed={80}
                  />
                </TypingContainer>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Box sx={{ py: 10, background: '#f5f5f5' }} ref={featuresRef}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 8, fontWeight: 700 }}
          >
            Características Principales
          </Typography>
          <Grid container spacing={4}>
            {mainFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <Slide
                  direction="up"
                  in={featuresInView}
                  timeout={500 + index * 200}
                >
                  <FeatureCard>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <AnimatedIcon sx={{ color: feature.color, mb: 2 }}>
                        {feature.icon}
                      </AnimatedIcon>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                        sx={{ fontWeight: 600 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {feature.description}
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={() => navigate(feature.path)}
                      >
                        Probar Ahora
                      </Button>
                    </CardContent>
                  </FeatureCard>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 8, fontWeight: 700 }}
          >
            ¿Por qué Doctorfy?
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={4} key={benefit.title}>
                <Fade in={true} timeout={1000 + index * 200}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AnimatedIcon sx={{ mb: 2 }}>
                      {benefit.icon}
                    </AnimatedIcon>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 4, fontWeight: 700 }}
          >
            Comienza tu Viaje hacia una Mejor Salud
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Únete a miles de usuarios que ya están aprovechando el poder de la IA para mejorar su salud.
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                borderRadius: '30px',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                boxShadow: theme.shadows[10],
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              Registrarse Gratis
            </Button>
          </Box>
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
                    <SpeedIcon color="secondary" />
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
                <Link component={RouterLink} to="/" color="inherit">
                  Inicio
                </Link>
                <Link component={RouterLink} to="/about" color="inherit">
                  Acerca de
                </Link>
                <Link component={RouterLink} to="/contact" color="inherit">
                  Contacto
                </Link>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" gutterBottom>
                Servicios
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link component={RouterLink} to="/medical-studies" color="inherit">
                  Estudios Médicos
                </Link>
                <Link component={RouterLink} to="/nutrition" color="inherit">
                  Análisis Nutricional
                </Link>
                <Link component={RouterLink} to="/doctors" color="inherit">
                  Directorio Médico
                </Link>
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
              <Link component={RouterLink} to="/privacy" color="inherit">
                Privacidad
              </Link>
              <Link component={RouterLink} to="/terms" color="inherit">
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