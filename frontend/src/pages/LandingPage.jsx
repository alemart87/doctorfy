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
  Divider
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
  Accessibility as AccessibilityIcon
} from '@mui/icons-material';
import Particles from '../components/Particles';
import ClickSpark from '../components/ClickSpark';
import Orb from '../components/Orb';
import ActionButton from '../components/ActionButton';

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
      </div>
    </ClickSpark>
  );
};

export default LandingPage; 