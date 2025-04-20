import React, { useState } from 'react';
import { Box, Container, Typography, Grid, useTheme, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Card, CardContent } from '@mui/material';
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
import EmailCampaigns from '../components/EmailCampaigns';

// Importar iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const DashboardPage = () => {
  const theme = useTheme();
  const { user, token: ctxToken, credits } = useAuth();
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

            {/* Sección de Créditos - Fuera del condicional de admin */}
            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(45deg, #00E5FF 30%, #00B8D4 90%)',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 0 30px rgba(0, 229, 255, 0.5)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate('/credits-info')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" sx={{ textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
                        Créditos Disponibles
                      </Typography>
                      <AccountBalanceWalletIcon sx={{ 
                        fontSize: 40,
                        filter: 'drop-shadow(0 0 5px rgba(0, 229, 255, 0.5))'
                      }} />
                    </Box>
                    <Typography variant="h3" sx={{ 
                      mb: 2,
                      textShadow: '0 0 20px rgba(0, 229, 255, 0.7)',
                      fontWeight: 'bold'
                    }}>
                      {credits?.toFixed(1) || '0'}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 2,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        }
                      }}
                    >
                      Ver Planes y Precios
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Panel de Admin y otros componentes */}
            {user && user.email === 'alemart87@gmail.com' && (
              <>
                <Paper 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                    Panel de Administración
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/admin/users"
                      startIcon={<PeopleIcon />}
                    >
                      Gestionar Usuarios
                    </Button>

                    <Button
                      variant="contained"
                      color="secondary"
                      component={Link}
                      to="/admin/credits"
                      startIcon={<AccountBalanceWalletIcon />}
                    >
                      Administrar Créditos
                    </Button>

                    <Button
                      variant="outlined"
                      color="info"
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
                      Verificar Suscripciones
                    </Button>

                    <Button 
                      variant="contained" 
                      color="success"
                      onClick={() => setOpenBlog(true)}
                    >
                      Crear artículo de Blog
                    </Button>
                  </Box>
                </Paper>

                <EmailCampaigns />

                <Container maxWidth="lg">
                  <Grid container spacing={3}>
                    {/* Otras tarjetas del dashboard */}
                    
                    {/* Tarjeta de Créditos */}
                    <Grid item xs={12} md={4}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'linear-gradient(45deg, #00E5FF 30%, #00B8D4 90%)',
                          color: 'white',
                          cursor: 'pointer',
                          boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 0 30px rgba(0, 229, 255, 0.5)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => navigate('/credits-info')}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="div" sx={{ textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
                              Créditos Disponibles
                            </Typography>
                            <AccountBalanceWalletIcon 
                              sx={{ 
                                fontSize: 40,
                                filter: 'drop-shadow(0 0 5px rgba(0, 229, 255, 0.5))'
                              }} 
                            />
                          </Box>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              mb: 2,
                              textShadow: '0 0 20px rgba(0, 229, 255, 0.7)',
                              fontWeight: 'bold'
                            }}
                          >
                            {credits?.toFixed(1) || '0'}
                          </Typography>
                          <Button
                            variant="contained"
                            fullWidth
                            sx={{
                              mt: 2,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(8px)',
                              textTransform: 'none',
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.3)',
                              }
                            }}
                          >
                            Ver Planes y Precios
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Container>
              </>
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