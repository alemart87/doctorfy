import React, { useState } from 'react';
import { Box, Container, Typography, Grid, useTheme, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Particles from '../components/Particles';
import ClickSpark from '../components/ClickSpark';
import GlassIcons from '../components/GlassIcons';
import { AnimatedBackgroundText } from '../components/AnimatedElements';
import { Link, useNavigate } from 'react-router-dom';
import TrialBanner from '../components/TrialBanner';
import axios from 'axios';

// Importar iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';

const DashboardPage = () => {
  const theme = useTheme();
  const { user, token: ctxToken } = useAuth();
  const navigate = useNavigate();

  // Aumentar el tamaño de los iconos
  const largeIconStyle = { fontSize: '4rem' }; // Iconos mucho más grandes

  const glassItems = [
    { 
      label: "Dashboard", 
      href: "/dashboard", 
      icon: <DashboardIcon sx={largeIconStyle} />, 
      color: 'blue',
      labelSize: '1.8rem' // Texto más grande
    },
    { 
      label: "Estudios Médicos", 
      href: "/medical-studies", 
      icon: <MedicalServicesIcon sx={largeIconStyle} />, 
      color: 'cyan',
      labelSize: '1.8rem'
    },
    { 
      label: "Nutrición", 
      href: "/nutrition", 
      icon: <RestaurantIcon sx={largeIconStyle} />, 
      color: 'green',
      labelSize: '1.8rem'
    },
    { 
      label: "Doctores", 
      href: "/doctors", 
      icon: <GroupIcon sx={largeIconStyle} />, 
      color: 'purple',
      labelSize: '1.8rem'
    },
    { 
      label: "Mi Perfil", 
      href: "/profile", 
      icon: <AccountCircleIcon sx={largeIconStyle} />, 
      color: 'orange',
      labelSize: '1.8rem'
    },
    { 
      label: "Configuración", 
      href: "/settings", 
      icon: <SettingsIcon sx={largeIconStyle} />, 
      color: 'indigo',
      labelSize: '1.8rem'
    },
    { 
      label: "Psicólogo y Doctor Virtual", 
      href: "/tixae-chatbot", 
      icon: <ChatIcon sx={largeIconStyle} />, 
      color: 'pink',
      labelSize: '1.8rem'
    },
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

  const [openBlog, setOpenBlog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [errorBlog, setErrorBlog] = useState('');

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

            <Box sx={{ width: '100%', mb: 4 }}>
              <TrialBanner />
            </Box>

            <motion.div variants={titleVariants}>
              <Typography 
                variant="h1" // Cambiar a h1 para hacerlo más grande
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: '4.5rem', // Texto mucho más grande
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
              <Typography 
                variant="h4" // Cambiar a h4 para hacerlo más grande
                sx={{ 
                  mb: 6, 
                  opacity: 0.8,
                  fontSize: '2.2rem' // Texto más grande
                }}
              >
                {user ? user.name : 'Usuario'}, accede rápidamente a las secciones principales:
              </Typography>
            </motion.div>

            <motion.div 
              variants={iconsContainerVariants} 
              style={{ width: '100%', position: 'relative', zIndex: 2 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <GlassIcons 
                items={glassItems} 
                iconSize="large" // Añadir esta prop si GlassIcons la soporta
                scale={1.5} // Escala general para hacer todo más grande
              />
            </motion.div>

            {user && user.email === 'alemart87@gmail.com' && (
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h5" gutterBottom>
                  Administración
                </Typography>
                <Typography variant="body1" paragraph>
                  Como administrador, puedes gestionar las suscripciones de los usuarios.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/admin/users"
                  startIcon={<PeopleIcon />}
                >
                  Gestionar Usuarios
                </Button>
              </Paper>
            )}

            {user && user.email === 'alemart87@gmail.com' && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={async () => {
                    try {
                      const response = await axios.get('/api/debug/subscription-check');
                      console.log("Información de depuración:", response.data);
                      alert("Información de depuración registrada en la consola");
                    } catch (error) {
                      console.error("Error al obtener información de depuración:", error);
                      alert("Error al obtener información de depuración");
                    }
                  }}
                >
                  Verificar Estado de Suscripción
                </Button>
              </Box>
            )}

            {user && user.email === 'alemart87@gmail.com' && (
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenBlog(true)}>
                Crear artículo de Blog
              </Button>
            )}
          </Container>
        </Box>

        {/* Diálogo de creación */}
        <Dialog open={openBlog} onClose={() => setOpenBlog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Nuevo artículo de Blog</DialogTitle>
          <DialogContent>
            {errorBlog && <Alert severity="error" sx={{ mb: 2 }}>{errorBlog}</Alert>}
            <TextField
              label="Prompt / Tema"
              fullWidth
              multiline
              minRows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ pr: 3, pb: 2 }}>
            <Button onClick={() => setOpenBlog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={loadingBlog || !prompt.trim()}
              onClick={async () => {
                try {
                  setLoadingBlog(true);
                  setErrorBlog('');
                  console.log("Enviando solicitud para crear blog...");
                  const res = await axios.post(
                    '/api/blog',
                    { prompt },
                    {
                      headers: {
                        // Usar solo la clave de API para simplificar
                        'X-Admin-Key': 'doctorfy-admin-2024'
                      }
                    }
                  );
                  console.log("Respuesta recibida:", res.data);
                  const slug = res.data.slug;
                  setOpenBlog(false);
                  navigate(`/blog/${slug}`);
                } catch (err) {
                  console.error("Error al crear blog:", err);
                  setErrorBlog(err?.response?.data?.error || 'Error al crear');
                } finally {
                  setLoadingBlog(false);
                }
              }}
              startIcon={loadingBlog && <CircularProgress size={18} />}
            >
              {loadingBlog ? 'Generando...' : 'Publicar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    // </ClickSpark> // Temporalmente comentar ClickSpark si el CSS no funciona
  );
};

export default DashboardPage; 