import React from 'react';
import { Box, Container, Typography, Grid, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Particles from '../components/Particles';
import ClickSpark from '../components/ClickSpark';
import GlassIcons from '../components/GlassIcons';
import { AnimatedBackgroundText } from '../components/AnimatedElements';

// Importar iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GroupIcon from '@mui/icons-material/Group';

const DashboardPage = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const glassItems = [
    { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, color: 'blue' },
    { label: "Estudios Médicos", href: "/medical-studies", icon: <MedicalServicesIcon />, color: 'cyan' },
    { label: "Nutrición", href: "/nutrition", icon: <RestaurantIcon />, color: 'green' },
    { label: "Doctores", href: "/doctors", icon: <GroupIcon />, color: 'purple' },
    { label: "Mi Perfil", href: "/profile", icon: <AccountCircleIcon />, color: 'orange' },
    { label: "Configuración", href: "/settings", icon: <SettingsIcon />, color: 'indigo' },
  ];

  // Variantes de animación mejoradas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const titleVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const subtitleVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut", delay: 0.2 } },
  };

  const iconsContainerVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.4 } },
  };

  return (
    // <ClickSpark> // Temporalmente comentar ClickSpark si el CSS no funciona
      <Box sx={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
        {/* Fondo de Partículas */}
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 'z-index': 0 }}>
          <Particles 
            particleColors={[theme.palette.primary.main, theme.palette.secondary.main, '#ffffff']}
            particleCount={180}
            speed={0.06} 
            particleSpread={8}
            particleBaseSize={90}
            moveParticlesOnHover={true}
          />
        </Box>

        {/* Contenido Principal */}
        <Box sx={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />

          <Container 
            maxWidth="md" 
            component={motion.div}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              textAlign: 'center',
              py: { xs: 4, md: 6 },
              color: 'white',
              mt: '64px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <AnimatedBackgroundText text="DASHBOARD" />

            <motion.div variants={titleVariants}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 0 15px ${theme.palette.primary.main}40`,
                }}
              >
                Bienvenido a Doctorfy
              </Typography>
            </motion.div>

            <motion.div variants={subtitleVariants}>
              <Typography variant="h5" sx={{ mb: 6, opacity: 0.8 }}>
                {user ? user.name : 'Usuario'}, accede rápidamente a las secciones principales:
              </Typography>
            </motion.div>

            <motion.div 
              variants={iconsContainerVariants} 
              style={{ width: '100%', position: 'relative', zIndex: 2 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <GlassIcons items={glassItems} />
            </motion.div>
          </Container>
        </Box>
      </Box>
    // </ClickSpark> // Temporalmente comentar ClickSpark si el CSS no funciona
  );
};

export default DashboardPage; 