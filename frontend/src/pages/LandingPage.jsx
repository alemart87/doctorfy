import React, { useEffect, useState } from 'react';
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
  Avatar,
  Link,
  Divider,
  Icon,
  CssBaseline,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import {
  LocalHospital as HospitalIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Restaurant as RestaurantIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useInView } from 'react-intersection-observer';
import { Link as RouterLink } from 'react-router-dom';
import { useSpring, animated, useTrail, useSprings } from '@react-spring/web';
import { FloatingDisc, AnimatedBackgroundText } from '../components/AnimatedElements';
import LandingNavbar from '../components/LandingNavbar';
import { TypeAnimation } from 'react-type-animation';

// --- Componentes Estilizados (Inspirados en Scale) ---

const StyledSection = styled(Box)(({ theme, background }) => ({
  padding: theme.spacing(10, 0),
  overflow: 'hidden',
  background: background || 'transparent',
  position: 'relative',
}));

const HeroSection = styled(StyledSection)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: '#050A14',
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 40%, rgba(25, 118, 210, 0.08) 0%, transparent 70%)',
    zIndex: 0,
  }
}));

const FeatureCardStyled = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: `linear-gradient(145deg, ${theme.palette.grey[800]}, ${theme.palette.grey[900]})`,
  border: `1px solid ${theme.palette.grey[700]}`,
  borderRadius: '12px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent 70%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: `0 20px 30px -10px ${theme.palette.common.black}`,
    borderColor: theme.palette.primary.dark,
  },
  '&:hover::before': {
    opacity: 1,
  }
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: theme.palette.grey[800],
  border: `1px solid ${theme.palette.grey[700]}`,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
}));

const Footer = styled(Box)(({ theme }) => ({
  background: theme.palette.grey[900],
  color: theme.palette.grey[400],
  padding: theme.spacing(6, 0),
}));

const GradientText = styled('span')(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
  backgroundSize: '200% 100%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
  animation: 'gradientMove 8s ease infinite',
  '@keyframes gradientMove': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  },
  textShadow: '0 0 20px rgba(66, 133, 244, 0.4)',
}));

// Mejora del componente TypingBackgroundText para dispositivos móviles
const TypingBackgroundText = ({ text, top, left, right, bottom, color, delay = 0 }) => {
  const theme = useTheme();
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  // Detectar si es dispositivo móvil
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Ajustar el texto para dispositivos móviles si es necesario
  const displayedText = isMobile && text.length > 8 ? text.split(' ')[0] : text;

  useEffect(() => {
    let typingTimer;
    
    if (isTyping && currentIndex < displayedText.length) {
      typingTimer = setTimeout(() => {
        setDisplayText(prev => prev + displayedText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 150);
    } else if (isTyping && currentIndex >= displayedText.length) {
      typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    } else {
      typingTimer = setTimeout(() => {
        if (displayText.length > 0) {
          setDisplayText(prev => prev.slice(0, -1));
        } else {
          setIsTyping(true);
          setCurrentIndex(0);
        }
      }, 50);
    }
    
    return () => clearTimeout(typingTimer);
  }, [displayText, currentIndex, isTyping, displayedText]);

  return (
    <Typography
      variant="h1"
      sx={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        fontWeight: 900,
        fontSize: { 
          xs: '3.5rem',  // Más pequeño pero legible en móviles
          sm: '5rem',    // Tamaño medio en tablets
          md: '8rem',    // Tamaño grande en laptops
          lg: '12rem'    // Tamaño muy grande en desktops
        },
        lineHeight: 0.8,
        color: 'transparent',
        WebkitTextStroke: {
          xs: `1px ${color || 'rgba(103, 58, 183, 0.7)'}`,
          sm: `2px ${color || 'rgba(103, 58, 183, 0.7)'}`,
          md: `3px ${color || 'rgba(103, 58, 183, 0.7)'}`
        },
        filter: {
          xs: `drop-shadow(0 0 8px ${color || 'rgba(103, 58, 183, 0.7)'})`,
          md: `drop-shadow(0 0 30px ${color || 'rgba(103, 58, 183, 0.8)'})`
        },
        transform: left ? 'rotate(-5deg)' : right ? 'rotate(5deg)' : 'rotate(-3deg)',
        userSelect: 'none',
        opacity: { xs: 0.7, md: 0.8 },
        animation: 'pulse 4s infinite alternate',
        whiteSpace: 'nowrap',
        // Asegurarse de que siempre se muestre
        display: 'block'
      }}
    >
      {displayText}
      <Box 
        component="span" 
        sx={{ 
          borderRight: { 
            xs: '0.1em solid',
            md: '0.15em solid'
          }, 
          animation: 'blink-caret 0.75s step-end infinite',
          '@keyframes blink-caret': {
            'from, to': { borderColor: 'transparent' },
            '50%': { borderColor: 'inherit' }
          }
        }}
      />
    </Typography>
  );
};

// --- Componente Principal ---

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  // --- Hooks de Animación ---

  const useFadeInUpAnimation = (delay = 0) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });
    const styles = useSpring({
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0px)' : 'translateY(50px)',
      config: { tension: 280, friction: 60 },
      delay: inView ? delay : 0,
    });
    return [ref, styles];
  };

  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [_, heroTextAnimation] = useFadeInUpAnimation(heroInView ? 200 : 0);
  const [heroButtonsRef, heroButtonsAnimation] = useFadeInUpAnimation(heroInView ? 400 : 0);

  const mainFeatures = [
    {
      title: 'Análisis de Estudios Médicos',
      description: 'Interpreta tus estudios médicos con IA avanzada para obtener resultados rápidos y precisos.',
      icon: DescriptionIcon,
      path: '/medical-studies',
      color: theme.palette.primary.main
    },
    {
      title: 'Análisis Nutricional',
      description: 'Analiza el contenido nutricional de tus alimentos con solo una foto y recibe recomendaciones personalizadas.',
      icon: RestaurantIcon,
      path: '/analyze-nutrition',
      color: theme.palette.secondary.main
    },
    {
      title: 'Directorio Médico',
      description: 'Conecta con profesionales de la salud calificados y gestiona tus consultas de manera eficiente.',
      icon: HospitalIcon,
      path: '/doctors',
      color: theme.palette.success.main
    }
  ];
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const trail = useTrail(mainFeatures.length, {
    opacity: featuresInView ? 1 : 0,
    transform: featuresInView ? 'translateY(0px)' : 'translateY(30px)',
    from: { opacity: 0, transform: 'translateY(30px)' },
    delay: 200,
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const benefits = [
    { icon: SpeedIcon, title: 'Resultados Instantáneos', description: 'Obtén análisis detallados en segundos.' },
    { icon: SecurityIcon, title: 'Seguridad Garantizada', description: 'Tus datos médicos protegidos al máximo nivel.' },
    { icon: SecurityIcon, title: 'IA Inteligente', description: 'Tecnología que aprende y mejora continuamente.' }
  ];
  const [benefitsRef, benefitsAnimation] = useFadeInUpAnimation();

  const stats = [
    { id: 1, value: 30, label: "Segundos", description: "Tiempo promedio de análisis IA" },
    { id: 2, value: 98, label: "% Precisión", description: "Validado vs. especialistas" },
    { id: 3, value: 90, label: "% Ahorro", description: "Comparado a consultas tradicionales" },
    { id: 4, value: 24, label: "/7 Disponibilidad", description: "Acceso inmediato" }
  ];
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const numberSprings = useSprings(
    stats.length,
    stats.map(stat => ({
      from: { number: 0, opacity: 0 },
      to: {
        number: statsInView ? stat.value : 0,
        opacity: statsInView ? 1 : 0,
      },
      config: { duration: 1500, tension: 280, friction: 120 },
      delay: 200
    }))
  );

  const testimonials = [
    { id: 1, name: "Dr. Carlos Méndez", role: "Cardiólogo", image: "https://randomuser.me/api/portraits/men/32.jpg", text: "Doctorfy ha revolucionado mi práctica. Análisis rápidos y precisos como nunca antes." },
    { id: 2, name: "María González", role: "Paciente", image: "https://randomuser.me/api/portraits/women/44.jpg", text: "La función de nutrición es increíble. Me ayuda a entender mis comidas al instante." },
    { id: 3, name: "Dr. Javier Ruiz", role: "Nutricionista", image: "https://randomuser.me/api/portraits/men/62.jpg", text: "Puedo ofrecer planes personalizados basados en datos reales. La IA es sorprendentemente útil." }
  ];
  const [testimonialsRef, testimonialsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const testimonialTrail = useTrail(testimonials.length, {
    opacity: testimonialsInView ? 1 : 0,
    transform: testimonialsInView ? 'translateY(0px)' : 'translateY(30px)',
    from: { opacity: 0, transform: 'translateY(30px)' },
    delay: 200,
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const [ctaRef, ctaAnimation] = useFadeInUpAnimation();

  const [footerRef, footerAnimation] = useFadeInUpAnimation();

  return (
    <Box sx={{ bgcolor: 'grey.900' }}>
      <CssBaseline />
      
      <LandingNavbar />

      <HeroSection ref={heroRef}>
        {heroInView && (
          <>
            <FloatingDisc 
              size={450} 
              top="-10%" 
              left="-15%" 
              delay={100} 
              duration={35000} 
              color={`radial-gradient(circle, rgba(103, 58, 183, 0.3), rgba(63, 81, 181, 0.1))`}
              blur={30}
              opacity={0.7}
              rotation={20}
            />
            <FloatingDisc 
              size={300} 
              top="60%" 
              left="5%" 
              delay={500} 
              duration={28000} 
              color={`radial-gradient(circle, rgba(233, 30, 99, 0.2), rgba(156, 39, 176, 0.1))`}
              blur={25}
              opacity={0.6}
              rotation={15}
            />
            <FloatingDisc 
              size={500} 
              top="-5%" 
              right="-20%" 
              delay={300} 
              duration={40000} 
              color={`radial-gradient(circle, rgba(0, 188, 212, 0.2), rgba(33, 150, 243, 0.1))`}
              blur={35}
              opacity={0.7}
              rotation={-15}
            />
            <FloatingDisc 
              size={250} 
              bottom="-10%" 
              right="15%" 
              delay={700} 
              duration={25000} 
              color={`radial-gradient(circle, rgba(255, 193, 7, 0.2), rgba(255, 87, 34, 0.1))`}
              blur={20}
              opacity={0.6}
              rotation={-10}
            />

            <Box sx={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              overflow: 'hidden',
              zIndex: 1,
            }}>
              <TypingBackgroundText 
                text="MEDICINA" 
                top={{ xs: "8%", md: "5%" }}
                left={{ xs: "2%", md: "2%" }}
                color="rgba(103, 58, 183, 0.7)" 
                delay={0}
              />
              
              <TypingBackgroundText 
                text="IA MÉDICA" 
                top={{ xs: "25%", md: "30%" }}
                left={{ xs: "5%", md: "15%" }}
                color="rgba(233, 30, 99, 0.7)" 
                delay={2000}
              />
              
              <TypingBackgroundText 
                text="FUTURO" 
                top={{ xs: "45%", md: "40%" }}
                right={{ xs: "2%", md: "2%" }}
                color="rgba(233, 30, 99, 0.7)" 
                delay={4000}
              />
              
              <TypingBackgroundText 
                text="INNOVACIÓN" 
                bottom={{ xs: "20%", md: "5%" }}
                left={{ xs: "2%", md: "5%" }}
                color="rgba(0, 188, 212, 0.7)" 
                delay={6000}
              />
              
              {/* Palabras adicionales solo para móviles */}
              <TypingBackgroundText 
                text="SALUD" 
                bottom={{ xs: "35%", sm: "25%" }}
                right={{ xs: "5%", sm: "10%" }}
                color="rgba(156, 39, 176, 0.7)" 
                delay={8000}
              />
            </Box>
          </>
        )}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={{ xs: 2, md: 5 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: { xs: '70vh', md: 'auto' }, // Altura mínima en móviles para empujar los botones hacia abajo
                justifyContent: 'space-between' // Distribuir el contenido verticalmente
              }}>
                <Box>
                  <animated.div ref={heroRef} style={heroTextAnimation}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem', lg: '6rem' },
                        lineHeight: 1.1,
                        mb: { xs: 0.5, md: 1 },
                        background: 'linear-gradient(135deg, #fff 30%, #e0e0e0 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.3))',
                        position: 'relative',
                      }}
                    >
                      <TypeAnimation
                        sequence={[
                          'Potencia Tu Salud',
                          1000,
                          'Transforma Tu Vida',
                          1000,
                          'Revoluciona Tu Bienestar',
                          1000,
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                        style={{ display: 'inline-block' }}
                      />
                      <br />
                      Con{' '}
                </Typography>

                    <Box sx={{ 
                      mb: { xs: 2, md: 4 },
                      height: { xs: '3rem', md: '5rem' },
                      display: 'flex', 
                      alignItems: 'center' 
                    }}>
                      <TypeAnimation
                        sequence={[
                          'Inteligencia Artificial',
                          2000,
                          'Análisis Médico Avanzado',
                          2000,
                          'Nutrición Personalizada',
                          2000,
                          'Tecnología de Vanguardia',
                          2000,
                        ]}
                        wrapper="span"
                        speed={50}
                        style={{
                          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
                          fontWeight: 700,
                          display: 'inline-block',
                          background: 'linear-gradient(90deg, #3f51b5, #f50057, #00bcd4)',
                          backgroundSize: '200% 100%',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 0 15px rgba(63, 81, 181, 0.7))',
                          animation: 'gradientMove 8s ease infinite',
                        }}
                        repeat={Infinity}
                      />
                    </Box>

                <Typography
                  variant="h5"
                  sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: { xs: 3, md: 5 },
                        maxWidth: '600px',
                        fontSize: { xs: '1rem', md: '1.2rem' },
                        lineHeight: 1.6,
                      }}
                    >
                      Análisis médicos y nutricionales instantáneos. La primera IA médica Paraguaya, ahora a tu alcance.
                </Typography>
                  </animated.div>
                </Box>
                
                {/* Espacio flexible que empuja los botones hacia abajo */}
                <Box sx={{ flexGrow: 1, minHeight: { xs: '20vh', md: '0' } }} />
                
                {/* Botones en la parte inferior */}
                <Box>
                  <animated.div ref={heroButtonsRef} style={heroButtonsAnimation}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: { xs: 2, md: 3 },
                      flexWrap: 'wrap',
                      height: { xs: '60px', md: '80px' },
                      alignItems: 'center',
                      marginBottom: { xs: 4, md: 0 }, // Margen inferior en móviles
                    }}>
                  <Button
                    variant="contained"
                        size={useMediaQuery(theme.breakpoints.down('sm')) ? "medium" : "large"}
                        color="primary"
                        onClick={() => navigate(user ? '/dashboard' : '/register')}
                        endIcon={<ArrowForwardIcon />}
                    sx={{
                          borderRadius: '8px',
                          px: { xs: 2, md: 4 },
                          py: { xs: 1.5, md: 2 },
                          fontSize: { xs: '0.9rem', md: '1.1rem' },
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                          background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                          boxShadow: '0 10px 20px rgba(63, 81, 181, 0.4), 0 0 10px rgba(63, 81, 181, 0.8)',
                          position: 'relative',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            animation: 'shimmer 3s infinite',
                          },
                      '&:hover': {
                            background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 15px 30px rgba(63, 81, 181, 0.5), 0 0 15px rgba(63, 81, 181, 0.9)',
                          },
                          '@keyframes shimmer': {
                            '0%': { left: '-100%' },
                            '100%': { left: '100%' }
                      }
                    }}
                  >
                    Comenzar Ahora
                  </Button>
                  <Button
                    variant="outlined"
                        size={useMediaQuery(theme.breakpoints.down('sm')) ? "medium" : "large"}
                        onClick={() => navigate('/about')}
                    sx={{
                          borderRadius: '8px', 
                          px: { xs: 2, md: 4 },
                          py: { xs: 1.5, md: 2 },
                          fontSize: { xs: '0.9rem', md: '1.1rem' },
                          fontWeight: 600,
                          borderWidth: '2px',
                          borderColor: '#f50057',
                          color: '#f50057',
                          whiteSpace: 'nowrap',
                      '&:hover': {
                            borderWidth: '2px',
                            borderColor: '#f50057',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 10px 20px rgba(245, 0, 87, 0.2), 0 0 10px rgba(245, 0, 87, 0.4)',
                          }
                        }}
                  >
                    Saber Más
                  </Button>
                    </Box>
                  </animated.div>
                </Box>
                </Box>
              </Grid>
              </Grid>
        </Container>
      </HeroSection>

      <StyledSection ref={featuresRef} background={theme.palette.grey[800]}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ mb: 8, fontWeight: 700, color: 'common.white' }}>
            Nuestros Servicios Principales
          </Typography>
          <Grid container spacing={4}>
            {trail.map((style, index) => {
              const feature = mainFeatures[index];
              return (
              <Grid item xs={12} md={4} key={feature.title}>
                  <animated.div style={{ ...style, height: '100%' }}>
                    <FeatureCardStyled>
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Icon component={feature.icon} sx={{ fontSize: '3.5rem', color: feature.color, mb: 3 }} />
                        <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600, color: 'common.white' }}>
                        {feature.title}
                      </Typography>
                        <Typography sx={{ color: 'grey.400', mb: 3 }}>
                        {feature.description}
                      </Typography>
                      <Button
                        variant="contained"
                          sx={{ mt: 'auto', borderRadius: '20px' }}
                        onClick={() => navigate(feature.path)}
                          color="primary"
                          endIcon={<ArrowForwardIcon />}
                      >
                          Explorar
                      </Button>
                    </CardContent>
                    </FeatureCardStyled>
                  </animated.div>
              </Grid>
              );
            })}
          </Grid>
        </Container>
      </StyledSection>

      <StyledSection ref={benefitsRef} background={theme.palette.grey[900]}>
        <Container maxWidth="md">
          <animated.div style={benefitsAnimation}>
            <Typography variant="h2" align="center" sx={{ mb: 8, fontWeight: 700, color: 'common.white' }}>
              ¿Por qué elegir <GradientText>Doctorfy</GradientText>?
          </Typography>
            <Grid container spacing={5}>
              {benefits.map((benefit) => (
                <Grid item xs={12} sm={4} key={benefit.title}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Icon component={benefit.icon} sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600, color: 'common.white' }}>
                      {benefit.title}
                    </Typography>
                    <Typography sx={{ color: 'grey.400' }}>
                      {benefit.description}
                    </Typography>
                  </Box>
              </Grid>
            ))}
          </Grid>
          </animated.div>
        </Container>
      </StyledSection>

      <StyledSection ref={statsRef} background={`linear-gradient(to bottom, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`}>
        <Container maxWidth="lg">
          <Typography
            variant="h2" 
            align="center"
              sx={{
              mb: 8, 
              fontWeight: 800, 
              color: 'common.white',
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: 2
              }
            }}
          >
            Impacto Medible
          </Typography>
          <Grid container spacing={4}>
            {numberSprings.map((props, index) => {
              const stat = stats[index];
              return (
              <Grid item xs={12} sm={6} md={3} key={stat.id}>
                  <animated.div style={{ opacity: props.opacity }}>
                    <StatItem>
                      <Typography 
                        variant="h1" 
                        component="div" 
                    sx={{
                          fontWeight: 800, 
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 0,
                          fontSize: { xs: '3.5rem', md: '4rem' },
                      display: 'flex',
                      justifyContent: 'center',
                          alignItems: 'baseline',
                          position: 'relative',
                          filter: 'drop-shadow(0 0 10px rgba(66, 133, 244, 0.3))',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            top: 0,
                            left: 0,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          },
                          '&:hover::after': {
                            opacity: 1,
                          }
                        }}
                      >
                        <animated.span>{props.number.to(n => n.toFixed(0))}</animated.span>
                        <Box component="span" sx={{ 
                          fontSize: '2rem', 
                          ml: 0.5,
                          background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          {stat.label.startsWith('%') || stat.label.startsWith('/') ? stat.label : '+'}
                        </Box>
                      </Typography>
                    <Typography 
                        variant="h6" 
                      component="div" 
                      sx={{ 
                          color: 'common.white', 
                          mb: 1,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          fontSize: '0.9rem'
                        }}
                      >
                        {!stat.label.startsWith('%') && !stat.label.startsWith('/') ? stat.label : ''}
                    </Typography>
                    <Typography 
                        variant="body1" 
                    sx={{
                          color: 'grey.400',
                          fontSize: '0.95rem'
                        }}
                      >
                        {stat.description}
                    </Typography>
                    </StatItem>
                  </animated.div>
              </Grid>
              );
            })}
          </Grid>
        </Container>
      </StyledSection>

      <StyledSection ref={testimonialsRef} background={theme.palette.grey[900]}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ mb: 8, fontWeight: 700, color: 'common.white' }}>
            Lo Que Dicen Nuestros Usuarios
          </Typography>
          <Grid container spacing={4}>
            {testimonialTrail.map((style, index) => {
              const testimonial = testimonials[index];
              return (
              <Grid item xs={12} md={4} key={testimonial.id}>
                  <animated.div style={{ ...style, height: '100%' }}>
                    <TestimonialCard>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'grey.300', flexGrow: 1, mb: 3 }}>
                        "{testimonial.text}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                      <Avatar src={testimonial.image} alt={testimonial.name} />
                      <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'common.white' }}>
                          {testimonial.name}
                        </Typography>
                          <Typography variant="body2" sx={{ color: 'grey.500' }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    </TestimonialCard>
                  </animated.div>
              </Grid>
              );
            })}
          </Grid>
        </Container>
      </StyledSection>

      <StyledSection ref={ctaRef}
        background={`linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`}
      >
        <Container maxWidth="md">
          <animated.div style={ctaAnimation}>
            <Typography variant="h2" align="center" sx={{ mb: 3, fontWeight: 700, color: 'common.white' }}>
              Transforma tu Salud Hoy Mismo
            </Typography>
            <Typography variant="h6" align="center" sx={{ mb: 5, color: 'grey.300' }}>
              Únete a la revolución de la salud digital. Regístrate gratis y experimenta el futuro.
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: '30px',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  boxShadow: `0 8px 15px ${theme.palette.secondary.dark}4D`,
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: `0 10px 25px ${theme.palette.secondary.dark}66`,
                  }
                }}
              >
                {user ? 'Ir al Dashboard' : 'Registrarse Gratis'}
              </Button>
      </Box>
          </animated.div>
        </Container>
      </StyledSection>

      <Footer ref={footerRef}>
        <Container maxWidth="lg">
          <animated.div style={footerAnimation}>
            <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom sx={{ color: 'common.white' }}>
                Doctorfy
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                La primera Inteligencia Artificial Médica del Paraguay.
                  Revolucionando la salud digital.
              </Typography>
            </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Typography variant="overline" gutterBottom sx={{ color: 'grey.500' }}>
                Enlaces
              </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Link component={RouterLink} to="/" color="inherit" sx={{ '&:hover': { color: 'primary.light' } }}>Inicio</Link>
                  <Link component={RouterLink} to="/about" color="inherit" sx={{ '&:hover': { color: 'primary.light' } }}>Acerca de</Link>
                  <Link component={RouterLink} to="/contact" color="inherit" sx={{ '&:hover': { color: 'primary.light' } }}>Contacto</Link>
                  <Link component={RouterLink} to="/faq" color="inherit" sx={{ '&:hover': { color: 'primary.light' } }}>FAQ</Link>
              </Box>
            </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Typography variant="overline" gutterBottom sx={{ color: 'grey.500' }}>
                Servicios
              </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Link component={RouterLink} to="/medical-studies" color="inherit" sx={{ '&:hover': { color: 'primary.light' } }}>Estudios Médicos</Link>
                  <Link component={RouterLink} to="/nutrition" color="inherit" sx={{ '&:hover': { color: 'primary.light' } }}>Análisis Nutricional</Link>
                  <Link component={RouterLink} to="/doctors" color="inherit" sx={{ '&:hover': { color: 'primary.light' } }}>Directorio Médico</Link>
              </Box>
            </Grid>
              <Grid item xs={12} sm={6} md={4}>
                 <Typography variant="overline" gutterBottom sx={{ color: 'grey.500' }}>
                Contacto
              </Typography>
                 <Typography variant="body2">Av. Principal 123, Asunción</Typography>
                 <Typography variant="body2">+595 981 123456</Typography>
                 <Typography variant="body2">info@doctorfy.com</Typography>
            </Grid>
          </Grid>
            <Divider sx={{ bgcolor: 'grey.700', mb: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              &copy; {new Date().getFullYear()} Doctorfy. Todos los derechos reservados.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
                <Link component={RouterLink} to="/privacy" color="inherit" sx={{ fontSize: '0.8rem', '&:hover': { color: 'primary.light' } }}>Privacidad</Link>
                <Link component={RouterLink} to="/terms" color="inherit" sx={{ fontSize: '0.8rem', '&:hover': { color: 'primary.light' } }}>Términos</Link>
            </Box>
          </Box>
          </animated.div>
        </Container>
      </Footer>
    </Box>
  );
};

export default LandingPage; 