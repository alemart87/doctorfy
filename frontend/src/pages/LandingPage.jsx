import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
  Divider,
  Chip,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import { FloatingDisc, AnimatedBackgroundText, RotatingText } from '../components/AnimatedElements';
import TrueFocus from '../components/TrueFocus';
import { useInView } from 'react-intersection-observer';
import {
  LocalHospital as LocalHospitalIcon,
  Science as ScienceIcon,
  Restaurant as RestaurantIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Accessibility as AccessibilityIcon,
  Chat as ChatIcon,
  LocalHospital as DoctorIcon,
  Restaurant as NutritionIcon,
  Psychology as PsychologyIcon,
  Science as ClinicalIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import Particles from '../components/Particles';
import ClickSpark from '../components/ClickSpark';
import Orb from '../components/Orb';
import ActionButton from '../components/ActionButton';
import CountUp from '../components/CountUp';
import LiquidChrome from '../components/LiquidChrome';
import { keyframes } from '@mui/system';
import { alpha } from '@mui/material/styles';
import DecryptedText from '../components/DecryptedText';
import { Helmet } from 'react-helmet-async';

// Definir la animación de pulso
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 59, 48, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
  }
`;

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Refs para animaciones basadas en scroll
  const [heroRef, heroInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const [statsRef, statsInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [testimonialsRef, testimonialsInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: false, threshold: 0.3 });

  const calorieCounterRef = useRef(null);
  const calorieCounterInView = useInView(calorieCounterRef, { once: true, amount: 0.3 });

  const healthAlertRef = useRef(null);
  const healthAlertInView = useInView(healthAlertRef, { once: true, amount: 0.3 });

  const chatSectionRef = useRef(null);
  const chatSectionInView = useInView(chatSectionRef, { once: true, amount: 0.3 });

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const features = [
    {
      title: "Análisis de Estudios Médicos",
      description: "Sube tus estudios médicos y obtén un análisis detallado en segundos, con recomendaciones personalizadas.",
      icon: <LocalHospitalIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Análisis Nutricional",
      description: "Fotografía tus comidas y recibe información nutricional detallada, incluyendo calorías y macronutrientes.",
      icon: <RestaurantIcon fontSize="large" sx={{ color: theme.palette.secondary.main }} />,
    },
    {
      title: "Directorio de Médicos",
      description: "Conecta con médicos especializados que pueden revisar tus análisis y proporcionar orientación profesional.",
      icon: <AccessibilityIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Tecnología Avanzada",
      description: "Utilizamos modelos de IA de última generación para proporcionar análisis precisos y confiables.",
      icon: <ScienceIcon fontSize="large" sx={{ color: theme.palette.secondary.main }} />,
    },
    {
      title: "Resultados Rápidos",
      description: "Obtén resultados en segundos, no en días, permitiéndote tomar decisiones informadas sobre tu salud.",
      icon: <SpeedIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Privacidad Garantizada",
      description: "Tu información médica está segura con nosotros. Utilizamos encriptación de nivel bancario.",
      icon: <SecurityIcon fontSize="large" sx={{ color: theme.palette.secondary.main }} />,
    },
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Paciente",
      avatar: "/avatars/avatar1.jpg",
      content: "Doctorfy ha cambiado la forma en que manejo mi salud. Ahora puedo entender mis estudios médicos sin esperar semanas para ver a un especialista.",
    },
    {
      name: "Dr. Carlos Ramírez",
      role: "Cardiólogo",
      avatar: "/avatars/avatar2.jpg",
      content: "Como médico, valoro cómo Doctorfy ayuda a mis pacientes a llegar a las consultas mejor informados, lo que hace nuestras sesiones más productivas.",
    },
    {
      name: "Laura Martínez",
      role: "Nutricionista",
      avatar: "/avatars/avatar3.jpg",
      content: "La función de análisis nutricional es impresionante. Mis clientes ahora pueden hacer un seguimiento de su ingesta con precisión sin complicaciones.",
    },
  ];

  return (
    <React.Fragment>
      <Helmet>
        <title>Doctorfy - Plataforma de Salud con IA | Psicología 24/7</title>
        <meta 
          name="description" 
          content="Doctorfy: Consultas médicas y psicológicas ilimitadas con IA. Análisis de estudios médicos en segundos. Psicología 24/7 sin esperas. ¡Prueba gratis 2 días!" 
        />
        <link rel="canonical" href="https://doctorfy.onrender.com/" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "HealthAndBeautyBusiness",
              "name": "Doctorfy",
              "description": "Plataforma de salud con IA que ofrece consultas médicas y psicológicas ilimitadas 24/7",
              "url": "https://doctorfy.onrender.com",
              "logo": "https://doctorfy.onrender.com/logo192.png",
              "sameAs": [
                "https://twitter.com/doctorfy",
                "https://facebook.com/doctorfy",
                "https://instagram.com/doctorfy"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "ES"
              },
              "offers": {
                "@type": "Offer",
                "price": "35.00",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
              },
              "potentialAction": {
                "@type": "ReserveAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://doctorfy.onrender.com/subscription",
                  "inLanguage": "es",
                  "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/IOSPlatform",
                    "http://schema.org/AndroidPlatform"
                  ]
                },
                "result": {
                  "@type": "Reservation",
                  "name": "Suscripción Premium"
                }
              }
            }
          `}
        </script>
      </Helmet>
      
      <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
        extraScale={1.3}
      >
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
          <Box sx={{ 
            minHeight: '100vh', 
            background: '#000000',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Fondo de Partículas */}
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
              <Particles
                particleColors={['#00bcd4', '#7c4dff']}
                particleCount={200}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
              />
            </Box>

            {/* Contenido con fondo semi-transparente */}
            <Box sx={{ 
              position: 'relative',
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              height: '100%'
            }}>
              {/* Navbar */}
              <LandingNavbar />
              
      {/* Hero Section */}
              <Box 
                ref={heroRef}
                component={motion.div}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                variants={containerVariants}
                sx={{ 
                  minHeight: '90vh',
                  display: 'flex',
                  alignItems: 'center',
                  pt: { xs: 8, md: 0 }
                }}
              >
        <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <motion.div variants={itemVariants}>
                <Typography
                  variant="h1"
                  sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                    mb: 2,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 5px 15px rgba(0,0,0,0.2)',
                  }}
                >
                          Doctorfy
                </Typography>
                <Typography
                          variant="h2"
                          sx={{
                            fontSize: { xs: '1.5rem', md: '2rem', lg: '2.5rem' },
                            color: 'white',
                            opacity: 0.9,
                            mb: 4,
                          }}
                        >
                          Democratizando la SALUD
                        </Typography>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Box sx={{ mb: 3 }}>
                          <TrueFocus 
                            sentence="Inteligencia Artificial para tu Salud"
                            manualMode={false}
                            blurAmount={3}
                            borderColor={theme.palette.primary.main}
                            glowColor={`${theme.palette.primary.main}80`}
                            animationDuration={1}
                            pauseBetweenAnimations={2}
                          />
                        </Box>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 2,
                            mt: 4 
                          }}
                        >
                          <div className="action-button-container">
                            <motion.button
                              className="action-button guide-button"
                              onClick={() => navigate('/guide')}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="action-button-content">
                                <span className="action-button-prefix">GUIA DE</span>
                                <span className="action-button-text">SALUD IA</span>
                              </div>
                            </motion.button>
                          </div>
                        </Box>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Typography 
                          variant="h6" 
                  sx={{
                            mb: 4, 
                            color: theme.palette.grey[300],
                            maxWidth: '90%',
                            lineHeight: 1.6
                          }}
                        >
                          Consulta tus análisis con nuestra IA y obtén resultados en 30 segundos, 
                          no en 3 días como con médicos tradicionales.
                </Typography>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Button
                    variant="contained"
                            color="primary"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                              py: 1.5, 
                              px: 4, 
                      borderRadius: '30px',
                              fontWeight: 600,
                              fontSize: '1rem',
                              textTransform: 'none',
                              boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                      '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: `0 6px 25px ${theme.palette.primary.main}60`,
                              },
                              transition: 'all 0.3s ease',
                    }}
                  >
                    Comenzar Ahora
                  </Button>
                  <Button
                    variant="outlined"
                            color="secondary"
                    size="large"
                            onClick={() => navigate('/login')}
                    sx={{
                              py: 1.5, 
                              px: 4, 
                      borderRadius: '30px',
                              fontWeight: 600,
                              fontSize: '1rem',
                              textTransform: 'none',
                              borderWidth: '2px',
                      '&:hover': {
                                borderWidth: '2px',
                                transform: 'translateY(-3px)',
                                boxShadow: `0 6px 25px ${theme.palette.secondary.main}40`,
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Iniciar Sesión
                  </Button>
                        </Box>
                      </motion.div>
                </Box>
              </Grid>

                  <Grid item xs={12} md={5}>
                    <Box sx={{ 
                      position: 'relative',
                      height: { xs: '300px', md: '400px' },
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <Orb
                          hue={94}
                          hoverIntensity={2.45}
                          rotateOnHover={true}
                          forceHoverState={false}
                        />
                      </motion.div>
                    </Box>
              </Grid>
            </Grid>
        </Container>
            </Box>

      {/* Calorie Counter Section */}
      <Box 
        ref={calorieCounterRef}
        component={motion.div}
        initial="hidden"
        animate={calorieCounterInView ? "visible" : "hidden"}
        variants={containerVariants}
        sx={{ 
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Container maxWidth="lg">
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              align="center"
              sx={{ 
                mb: 3,
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Controla tus Calorías con una Simple Foto
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h5" 
              align="center" 
              color="textSecondary" 
              sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}
            >
              Mide tus calorías diarias y recibe alertas inteligentes para mantener tu dieta bajo control.
              ¡Todo con solo fotografiar cada alimento que consumes!
            </Typography>
          </motion.div>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={5}>
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <Paper 
                  elevation={4}
                  sx={{
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(46, 204, 113, 0.3) 100%)`,
                    border: `2px solid rgba(46, 204, 113, 0.5)`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2 }}>
                    <Chip 
                      label="META LOGRADA" 
                      color="success" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 3, color: '#2ecc71' }}>
                    Tu consumo de hoy
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 2 }}>
                    <CountUp
                      from={0}
                      to={2000}
                      separator=","
                      direction="up"
                      duration={2.5}
                      className="count-up-text"
                      sx={{ 
                        fontSize: { xs: '3rem', md: '4rem' },
                        fontWeight: 700,
                        color: '#2ecc71',
                        mr: 1
                      }}
                    />
                    <Typography variant="h5" color="textSecondary">
                      calorías
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    height: '10px', 
                    width: '100%', 
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderRadius: '5px',
                    mb: 2
                  }}>
                    <Box sx={{ 
                      height: '100%', 
                      width: '100%', 
                      backgroundColor: '#2ecc71',
                      borderRadius: '5px',
                      transition: 'width 2s ease-in-out'
                    }} />
                  </Box>
                  
                  <Typography variant="body1" color="textSecondary">
                    ¡Felicidades! Has alcanzado tu meta diaria de 2,000 calorías.
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <Paper 
                  elevation={4}
                  sx={{
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.3) 100%)`,
                    border: `2px solid rgba(231, 76, 60, 0.5)`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2 }}>
                    <Chip 
                      label="META EXCEDIDA" 
                      color="error" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 3, color: '#e74c3c' }}>
                    Tu consumo de ayer
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 2 }}>
                    <CountUp
                      from={0}
                      to={2150}
                      separator=","
                      direction="up"
                      duration={2.5}
                      className="count-up-text"
                      sx={{ 
                        fontSize: { xs: '3rem', md: '4rem' },
                        fontWeight: 700,
                        color: '#e74c3c',
                        mr: 1
                      }}
                    />
                    <Typography variant="h5" color="textSecondary">
                      calorías
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    height: '10px', 
                    width: '100%', 
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderRadius: '5px',
                    mb: 2
                  }}>
                    <Box sx={{ 
                      height: '100%', 
                      width: '107.5%', 
                      backgroundColor: '#e74c3c',
                      borderRadius: '5px',
                      transition: 'width 2s ease-in-out'
                    }} />
                  </Box>
                  
                  <Typography variant="body1" color="textSecondary">
                    Has excedido tu meta diaria por 150 calorías. ¡Doctorfy te ayudará a mejorar mañana!
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
          
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/nutrition')}
                sx={{
                  py: 1.5, 
                  px: 4, 
                  borderRadius: '30px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: `0 4px 20px ${theme.palette.secondary.main}40`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 6px 25px ${theme.palette.secondary.main}60`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Probar Análisis Nutricional
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Sección de Psicología IA - AJUSTADA */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }} // Transición más lenta
        sx={{ 
          py: { xs: 8, md: 12 },
          position: 'relative',
          zIndex: 2,
          background: 'linear-gradient(135deg, #121212 0%, #000000 100%)', // Fondo negro
          color: 'white',
          overflow: 'hidden',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Elementos decorativos */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -50, 
            right: -50, 
            width: 300, 
            height: 300, 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(124, 77, 255, 0.1) 0%, rgba(124, 77, 255, 0) 70%)'
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: -100, 
            left: -100, 
            width: 400, 
            height: 400, 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(0, 188, 212, 0.1) 0%, rgba(0, 188, 212, 0) 70%)'
          }} 
        />
        
        <Container maxWidth="lg">
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              align="center"
              sx={{ 
                mb: 3,
                fontWeight: 700,
                background: `linear-gradient(90deg, #00bcd4, #7c4dff)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <DecryptedText
                text="PSICOLOGÍA IA 24/7"
                speed={80} // Velocidad más lenta (mayor valor = más lento)
                maxIterations={20} // Más iteraciones para un efecto más prolongado
                sequential={true}
                revealDirection="center"
                animateOn="view"
                characters="PSICOLOGÍA IA 24/7!@#$%^&*"
                encryptedClassName="encrypted-text"
                parentClassName="decrypted-text-container"
                className="decrypted-text"
              />
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                mb: 5, 
                maxWidth: 800, 
                mx: 'auto',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500
              }}
            >
              Acceso ILIMITADO, sin TURNOS, en el MOMENTO. Habla con nuestra psicóloga IA cuando lo necesites.
            </Typography>
          </motion.div>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <Paper 
                  elevation={8}
                  sx={{ 
                    p: 4, 
                    borderRadius: 4,
                    background: 'rgba(18, 18, 18, 0.8)', // Fondo más oscuro
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(124, 77, 255, 0.2)', // Borde con color de acento
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2 }}>
                    <Chip 
                      label="DISPONIBLE AHORA" 
                      sx={{ 
                        bgcolor: '#4CAF50', 
                        color: 'white',
                        fontWeight: 'bold',
                        animation: `${pulse} 2s infinite`
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'white', mb: 3 }}>
                    Conversación con Psicóloga IA
                  </Typography>
                  
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                      "Últimamente me siento muy ansioso y me cuesta dormir..."
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Usuario - Hace 1 minuto
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(124, 77, 255, 0.15)', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                      "Entiendo que estás pasando por un momento difícil. La ansiedad puede afectar significativamente tu sueño. Podemos trabajar juntos en técnicas de relajación y establecer una rutina nocturna que te ayude a descansar mejor..."
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Psicóloga IA - Ahora
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => navigate('/subscription')}
                      sx={{
                        py: 1.5,
                        fontWeight: 'bold',
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #00bcd4 30%, #7c4dff 90%)', // Gradiente consistente
                        color: 'white',
                        '&:hover': {
                          boxShadow: '0 8px 16px rgba(124, 77, 255, 0.4)',
                          transform: 'translateY(-3px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Iniciar Sesión Terapéutica
                    </Button>
                  </Box>
                  
                  <Typography variant="body2" align="center" sx={{ mt: 2, color: 'rgba(255,255,255,0.7)' }}>
                    Respuestas inmediatas, confidenciales y basadas en evidencia científica
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      color: 'white', 
                      background: `linear-gradient(90deg, #00bcd4, #7c4dff)`, 
                      WebkitBackgroundClip: 'text', 
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Beneficios de la Psicología IA
                  </Typography>
                  
                  <List>
                    {[
                      "Disponible 24 horas al día, 7 días a la semana",
                      "Sin citas previas ni tiempos de espera",
                      "Respuestas inmediatas a tus preocupaciones",
                      "Confidencialidad total garantizada",
                      "Basado en técnicas terapéuticas probadas",
                      "Accesible desde cualquier dispositivo"
                    ].map((benefit, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit} 
                          primaryTypographyProps={{ 
                            color: 'white',
                            fontWeight: 'medium' 
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
                    {[
                      "Ansiedad", "Depresión", "Estrés", "Relaciones", "Autoestima", 
                      "Duelo", "Trauma", "Adicciones", "Fobias", "Insomnio"
                    ].map((topic, index) => (
                      <Chip 
                        key={index}
                        label={topic}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(124, 77, 255, 0.15)', 
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(124, 77, 255, 0.25)',
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Button 
                  variant="contained" 
                  size="large"
                  fullWidth
                  onClick={() => navigate('/subscription')}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #00bcd4 30%, #7c4dff 90%)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 20px rgba(124, 77, 255, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  COMENZAR AHORA
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Health Alert Section */}
      <Box 
        ref={healthAlertRef}
        component={motion.div}
        initial="hidden"
        animate={healthAlertInView ? "visible" : "hidden"}
        variants={containerVariants}
        sx={{ 
          py: { xs: 8, md: 12 },
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
          minHeight: '500px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)',
        }}
      >
        {/* Fondo interactivo LiquidChrome */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 0,
          opacity: 0.4, // Reducido para mayor contraste
          mixBlendMode: 'screen', // Efecto espejo
        }}>
          <LiquidChrome
            baseColor={[0.05, 0.1, 0.3]} // Color azul más oscuro
            speed={0.3}
            amplitude={0.5}
            interactive={true}
          />
        </Box>
        
        {/* Contenido superpuesto */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h2"
                  sx={{ 
                    mb: 3,
                    fontWeight: 800,
                    color: 'white',
                    textShadow: '0 0 20px rgba(0,120,255,0.7)',
                  }}
                >
                  ¿Te llegó un análisis por mail y tienes urgencia?
                </Typography>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    color: 'white',
                    textShadow: '0 0 10px rgba(0,120,255,0.5)',
                    fontWeight: 400
                  }}
                >
                  No esperes más para entender tus resultados. Ingresa a Doctorfy y obtén un análisis inmediato de tus estudios médicos con inteligencia artificial avanzada.
                </Typography>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/medical-studies')}
                    sx={{
                      py: 1.5, 
                      px: 4, 
                      borderRadius: '30px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: '#1976d2',
                      boxShadow: '0 0 30px rgba(0,120,255,0.5)',
                      '&:hover': {
                        backgroundColor: 'white',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 0 40px rgba(0,120,255,0.7)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Analizar mis estudios
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      py: 1.5, 
                      px: 4, 
                      borderRadius: '30px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      borderColor: 'rgba(255,255,255,0.7)',
                      borderWidth: '2px',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Iniciar sesión
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              >
                <Box
                  sx={{
                    p: 4,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 10px 40px rgba(255,0,0,0.3), 0 0 100px rgba(0,120,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '5px', 
                    height: '100%', 
                    backgroundColor: '#ff3b30',
                    boxShadow: '0 0 20px rgba(255,0,0,0.7)'
                  }} />
                  
                  <Typography 
                    variant="h5" 
                    color="error" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#ff3b30',
                        marginRight: '10px',
                        animation: `${pulse} 2s infinite`
                      }
                    }}
                  >
                    ALERTA MÉDICA URGENTE
                  </Typography>
                  
                  <Typography variant="body1" color="white" sx={{ mb: 2, fontWeight: 300 }}>
                    Estimado paciente,
                  </Typography>
                  
                  <Typography variant="body1" color="white" sx={{ mb: 2, fontWeight: 300 }}>
                    Hemos detectado valores anormales en sus últimos análisis de sangre que requieren atención inmediata. Por favor, revise los resultados en nuestra plataforma.
                  </Typography>
                  
                  <Typography variant="body1" color="white" sx={{ mb: 3, fontWeight: 300 }}>
                    Doctorfy puede ayudarle a entender estos resultados y conectarle con un especialista si es necesario.
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      paddingTop: 2
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Recibido: Hoy, 10:45 AM
                    </Typography>
                    
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ 
                        borderRadius: '20px', 
                        textTransform: 'none',
                        boxShadow: '0 0 15px rgba(255,0,0,0.4)',
                        '&:hover': {
                          boxShadow: '0 0 20px rgba(255,0,0,0.6)',
                        }
                      }}
                    >
                      Ver resultados
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
        
        {/* Efecto de reflejo en la parte inferior */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '150px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,120,255,0.05) 100%)',
            transform: 'scaleY(-1)',
            filter: 'blur(10px)',
            opacity: 0.5,
            zIndex: 0,
          }}
        />
      </Box>

      {/* Chat Section - Versión mejorada con fondo negro */}
      <Box 
        ref={chatSectionRef}
        component={motion.div}
        initial="hidden"
        animate={chatSectionInView ? "visible" : "hidden"}
        variants={containerVariants}
        sx={{ 
          py: { xs: 8, md: 12 },
          position: 'relative',
          zIndex: 2,
          background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)', // Fondo negro
          color: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h2"
                  sx={{ 
                    mb: 3,
                    fontWeight: 800,
                    color: 'white',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Consulta Médica Inteligente
                </Typography>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 400,
                    lineHeight: 1.6
                  }}
                >
                  Nuestro asistente médico con IA te proporciona respuestas inmediatas a tus consultas de salud, nutrición y bienestar emocional, basadas en evidencia científica.
                </Typography>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/medical-chat')}
                    sx={{
                      py: 1.5, 
                      px: 4, 
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: 'white',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.7)}`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Iniciar Chat Médico
                  </Button>
                </Box>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                    Lo que nuestros usuarios dicen:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>
                    "El asistente médico me ayudó a entender mis síntomas y me orientó sobre cuándo debía consultar con un especialista. ¡Una herramienta increíble!"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      — María G., paciente de Doctorfy
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    bgcolor: '#121212',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Box sx={{ 
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}>
                    <ChatIcon sx={{ color: 'white', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Asistente Médico IA
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3, maxHeight: '350px', overflowY: 'auto', bgcolor: '#1a1a1a' }}>
                    {/* Mensajes de ejemplo */}
                    <Box sx={{ display: 'flex', mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.grey[800], color: 'white', mr: 2 }}>U</Avatar>
                      <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '0 16px 16px 16px', maxWidth: '80%', color: 'white' }}>
                        <Typography variant="body2">
                          Últimamente he tenido dolores de cabeza frecuentes, especialmente después de trabajar en la computadora.
                        </Typography>
                      </Paper>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 3, justifyContent: 'flex-end' }}>
                      <Paper sx={{ 
                        p: 2, 
                        bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                        borderRadius: '16px 0 16px 16px', 
                        maxWidth: '80%',
                        color: 'white'
                      }}>
                        <Typography variant="body2">
                          Los dolores de cabeza después de usar la computadora podrían estar relacionados con la fatiga visual. Te recomendaría:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0, mt: 1 }}>
                          <Typography component="li" variant="body2">Tomar descansos cada 20 minutos</Typography>
                          <Typography component="li" variant="body2">Ajustar el brillo de tu pantalla</Typography>
                          <Typography component="li" variant="body2">Considerar lentes con filtro de luz azul</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Si los síntomas persisten, sería recomendable consultar con un oftalmólogo.
                        </Typography>
                      </Paper>
                      <Avatar sx={{ 
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        ml: 2 
                      }}>AI</Avatar>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.grey[800], color: 'white', mr: 2 }}>U</Avatar>
                      <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '0 16px 16px 16px', maxWidth: '80%', color: 'white' }}>
                        <Typography variant="body2">
                          Gracias por los consejos. ¿Hay ejercicios específicos para reducir la tensión ocular?
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                  
                  <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', bgcolor: '#121212' }}>
                    <TextField
                      fullWidth
                      placeholder="Escribe tu consulta médica..."
                      variant="outlined"
                      size="small"
                      sx={{ 
                        mr: 1,
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255,255,255,0.5)',
                        },
                      }}
                    />
                    <Button 
                      variant="contained" 
                      sx={{ 
                        minWidth: 'auto', 
                        borderRadius: '8px',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
          
          {/* Características del chat - Versión mejorada */}
          <Box sx={{ mt: 8 }}>
            <Grid container spacing={3}>
              {[
                {
                  icon: <DoctorIcon sx={{ fontSize: 36 }} />,
                  title: "Consulta Médica General",
                  description: "Resuelve dudas sobre síntomas, condiciones médicas y recomendaciones de salud basadas en evidencia científica."
                },
                {
                  icon: <NutritionIcon sx={{ fontSize: 36 }} />,
                  title: "Asesoría Nutricional",
                  description: "Obtén consejos personalizados sobre alimentación saludable, dietas específicas y hábitos nutricionales."
                },
                {
                  icon: <PsychologyIcon sx={{ fontSize: 36 }} />,
                  title: "Apoyo Psicológico",
                  description: "Recibe orientación para el manejo del estrés, ansiedad y técnicas efectivas para mejorar tu bienestar emocional."
                },
                {
                  icon: <ClinicalIcon sx={{ fontSize: 36 }} />,
                  title: "Información Clínica",
                  description: "Comprende mejor tus análisis clínicos, procedimientos médicos y terminología especializada."
                }
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.3 } }}
                  >
                    <Paper
                      elevation={4}
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        bgcolor: 'rgba(26,26,26,0.95)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': {
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }
                      }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Avatar
                          sx={{
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            mr: 2
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ flexGrow: 1, color: 'rgba(255,255,255,0.7)' }}>
                        {feature.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
            <Box 
              ref={featuresRef}
              component={motion.div}
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={containerVariants}
              sx={{ 
                py: { xs: 8, md: 12 },
                position: 'relative',
                zIndex: 2,
                backgroundColor: 'rgba(18, 18, 18, 0.7)',
                backdropFilter: 'blur(10px)',
              }}
            >
        <Container maxWidth="lg">
                <motion.div variants={itemVariants}>
          <Typography
            variant="h2"
            align="center"
                    sx={{ 
                      mb: 2,
                      fontWeight: 700,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
          >
            Características Principales
          </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography 
                    variant="h6" 
                    align="center" 
                    color="textSecondary" 
                    sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
                  >
                    Doctorfy combina inteligencia artificial avanzada con experiencia médica para ofrecerte
                    análisis precisos y recomendaciones personalizadas.
                  </Typography>
                </motion.div>
                
          <Grid container spacing={4}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <motion.div 
                        variants={cardVariants}
                        custom={index}
                        whileHover={{ y: -10, transition: { duration: 0.3 } }}
                      >
                        <Card 
                          elevation={4}
                          sx={{ 
                            height: '100%',
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.grey[800]}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 10px 30px ${theme.palette.primary.main}20`,
                              borderColor: theme.palette.primary.main,
                            }
                          }}
                        >
                          <CardContent sx={{ p: 4 }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        {feature.icon}
                            </Box>
                      <Typography
                              variant="h5" 
                              component="h3" 
                              align="center" 
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {feature.title}
                      </Typography>
                            <Typography variant="body1" align="center" color="textSecondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                        </Card>
                      </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

            {/* Stats Section */}
            <Box 
              ref={statsRef}
              component={motion.div}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              variants={containerVariants}
              sx={{ 
                py: { xs: 8, md: 12 },
                background: `linear-gradient(135deg, ${theme.palette.grey[900]}99 0%, ${theme.palette.background.default}99 100%)`,
                backdropFilter: 'blur(10px)',
                position: 'relative',
                zIndex: 2,
              }}
            >
        <Container maxWidth="lg">
                <motion.div variants={itemVariants}>
          <Typography
            variant="h2"
            align="center"
                    sx={{ 
                      mb: 8,
                      fontWeight: 700,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Por Qué Elegir Doctorfy
          </Typography>
                </motion.div>
                
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                    >
                      <Paper 
                        elevation={4}
        sx={{
                          p: 4, 
                          textAlign: 'center',
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`,
                          border: `1px solid ${theme.palette.grey[800]}`,
                        }}
                      >
          <Typography
                          variant="h2" 
              sx={{
                            fontWeight: 700, 
                            color: theme.palette.primary.main,
                            mb: 1
                          }}
                        >
                          98%
          </Typography>
                        <Typography variant="h6" color="textSecondary">
                          Precisión en Análisis
                </Typography>
                      </Paper>
                    </motion.div>
            </Grid>
            
                  <Grid item xs={12} sm={6} md={4}>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                    >
                      <Paper 
                        elevation={4}
                    sx={{
                          p: 4, 
                      textAlign: 'center',
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`,
                          border: `1px solid ${theme.palette.grey[800]}`,
                    }}
                  >
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontWeight: 700, 
                            color: theme.palette.secondary.main,
                        mb: 1
                      }}
                    >
                          30s
                        </Typography>
                        <Typography variant="h6" color="textSecondary">
                          Tiempo Promedio de Análisis
                    </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                    >
                  <Paper
                        elevation={4}
                    sx={{
                          p: 4, 
                      textAlign: 'center',
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`,
                          border: `1px solid ${theme.palette.grey[800]}`,
                    }}
                  >
                        <Typography 
                          variant="h2" 
                      sx={{
                            fontWeight: 700, 
                            color: theme.palette.primary.main,
                            mb: 1
                          }}
                        >
                          10k+
                    </Typography>
                        <Typography variant="h6" color="textSecondary">
                          Usuarios Satisfechos
                    </Typography>
                  </Paper>
                    </motion.div>
              </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
            <Box 
              ref={testimonialsRef}
              component={motion.div}
              initial="hidden"
              animate={testimonialsInView ? "visible" : "hidden"}
              variants={containerVariants}
              sx={{ 
                py: { xs: 8, md: 12 },
                position: 'relative',
                zIndex: 2,
              }}
            >
        <Container maxWidth="lg">
                <motion.div variants={itemVariants}>
          <Typography
            variant="h2"
            align="center"
                    sx={{ 
                      mb: 2,
                      fontWeight: 700,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
          >
            Lo Que Dicen Nuestros Usuarios
          </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography 
                    variant="h6" 
                    align="center" 
                    color="textSecondary" 
                    sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
                  >
                    Descubre cómo Doctorfy está transformando la forma en que las personas manejan su salud.
                  </Typography>
                </motion.div>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <motion.div 
                        variants={cardVariants}
                        custom={index}
                        whileHover={{ y: -10, transition: { duration: 0.3 } }}
                      >
                        <Card 
                          elevation={4}
                          sx={{ 
                    height: '100%',
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.grey[800]}`,
                            transition: 'all 0.3s ease',
                    '&:hover': {
                              boxShadow: `0 10px 30px ${theme.palette.primary.main}20`,
                              borderColor: theme.palette.primary.main,
                            }
                          }}
                        >
                          <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                              <Avatar 
                                src={testimonial.avatar} 
                                alt={testimonial.name}
                                sx={{ 
                                  width: 60, 
                                  height: 60,
                                  border: `2px solid ${theme.palette.primary.main}`,
                                  boxShadow: `0 0 10px ${theme.palette.primary.main}40`,
                                }}
                              />
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                                <Typography variant="body2" color="textSecondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="body1" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                              "{testimonial.content}"
                            </Typography>
                          </CardContent>
                  </Card>
                      </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
            
            {/* Sección CTA con ActionButton */}
            <Box 
              ref={ctaRef}
              component={motion.div}
              initial="hidden"
              animate={ctaInView ? "visible" : "hidden"}
              variants={containerVariants}
              sx={{ 
                py: { xs: 8, md: 12 },
                position: 'relative',
                zIndex: 2,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,216,255,0.1) 50%, rgba(0,0,0,0) 100%)',
              }}
            >
              <Container maxWidth="md">
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h2"
                    align="center"
                    sx={{ 
                      mb: 3,
                      fontWeight: 700,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ¿Listo para revolucionar tu salud?
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography 
                    variant="h5" 
                    align="center" 
                    color="textSecondary" 
                    sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}
                  >
                    Descubre cómo la inteligencia artificial puede transformar tu bienestar con análisis precisos y recomendaciones personalizadas.
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ActionButton />
                  </Box>
                </motion.div>
              </Container>
            </Box>

      {/* Footer */}
            <Box 
              sx={{ 
                py: 4,
                background: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.grey[800]}`,
                position: 'relative',
                zIndex: 2,
              }}
            >
        <Container maxWidth="lg">
                <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                Doctorfy
              </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      © {new Date().getFullYear()} Doctorfy. Todos los derechos reservados.
              </Typography>
            </Grid>
            
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 3, flexWrap: 'wrap' }}>
                      <Button color="inherit" onClick={() => navigate('/')}>
                  Inicio
                      </Button>
                      <Button color="inherit" onClick={() => navigate('/medical-studies')}>
                  Estudios Médicos
                      </Button>
                      <Button color="inherit" onClick={() => navigate('/nutrition')}>
                        Nutrición
                      </Button>
                      <Button color="inherit" onClick={() => navigate('/doctors')}>
                        Doctores
                      </Button>
                      <Button color="inherit" onClick={() => navigate('/login')}>
                        Iniciar Sesión
                      </Button>
              </Box>
            </Grid>
            </Grid>
              </Container>
            </Box>
          </Box>
      </Box>

      {/* Sección de prueba gratuita */}
      <Box 
        sx={{ 
          py: 8, 
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Elementos decorativos */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -100, 
            right: -100, 
            width: 300, 
            height: 300, 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: -50, 
            left: -50, 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
          }} 
        />
        
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h3" 
                component="h2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                ¡PRUEBA GRATUITA POR 2 DÍAS!
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mb: 3,
                  lineHeight: 1.6
                }}
              >
                Accede a todas las funciones premium sin compromiso: consultas médicas ilimitadas, asistencia psicológica 24/7 y mucho más.
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    Psicología Ilimitada
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    Consultas Médicas 24/7
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    Sin Compromiso
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                size="large"
                component="a"
                href="/subscription"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  boxShadow: '0 8px 16px rgba(76,175,80,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #43A047 30%, #7CB342 90%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 20px rgba(76,175,80,0.6)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                COMENZAR PRUEBA GRATUITA
              </Button>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box 
                sx={{ 
                  position: 'relative',
                  p: 2
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.4) 0%, rgba(156, 39, 176, 0.4) 100%)',
                    transform: 'rotate(-3deg)',
                    zIndex: 0
                  }} 
                />
                
                <Paper 
                  elevation={6}
                  sx={{ 
                    p: 4, 
                    borderRadius: 4,
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: -15,
                      right: -15,
                      bgcolor: '#E91E63',
                      color: 'white',
                      borderRadius: '50%',
                      width: 80,
                      height: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(233, 30, 99, 0.4)',
                      zIndex: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1 }}>GRATIS</Typography>
                    <Typography variant="h6" sx={{ lineHeight: 1 }}>2 DÍAS</Typography>
                  </Box>
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    Plan Premium
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      €35
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 1, opacity: 0.7 }}>
                      /mes
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <List dense>
                    {[
                      "Consultas psicológicas ilimitadas",
                      "Asistencia médica 24/7",
                      "Análisis de estudios médicos",
                      "Recomendaciones nutricionales",
                      "Soporte prioritario"
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>              
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  </ClickSpark>
</React.Fragment>
);
};

export default LandingPage; 