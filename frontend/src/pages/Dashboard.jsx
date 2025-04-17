import React from 'react';
import { Container, Typography, Grid, Paper, Box, useTheme, Card, CardContent, CardActions, Avatar, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import WelcomeBanner from '../components/WelcomeBanner';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  // Opciones de navegación con iconos y colores
  const navOptions = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon sx={{ fontSize: 60 }} />,
      path: '/dashboard',
      color: theme.palette.primary.main
    },
    {
      title: 'Estudios Médicos',
      icon: <LocalHospitalIcon sx={{ fontSize: 60 }} />,
      path: '/medical-studies',
      color: theme.palette.secondary.main
    },
    {
      title: 'Nutrición',
      icon: <RestaurantIcon sx={{ fontSize: 60 }} />,
      path: '/nutrition',
      color: '#4CAF50' // Verde
    },
    {
      title: 'Doctores',
      icon: <PeopleIcon sx={{ fontSize: 60 }} />,
      path: '/doctors',
      color: '#9C27B0' // Púrpura
    },
    {
      title: 'Psicólogo y Doctor Virtual',
      icon: <PsychologyIcon sx={{ fontSize: 60 }} />,
      path: '/tixae-chatbot',
      color: '#E91E63' // Rosa
    },
    {
      title: 'Mi Perfil',
      icon: <AccountCircleIcon sx={{ fontSize: 60 }} />,
      path: '/profile',
      color: '#FF9800' // Naranja
    },
    {
      title: 'Configuración',
      icon: <SettingsIcon sx={{ fontSize: 60 }} />,
      path: '/settings',
      color: '#2196F3' // Azul
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <WelcomeBanner />
      
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" // Usar h2 en lugar de h4
          sx={{ 
            fontSize: '3.5rem', // Mucho más grande
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Bienvenido a Doctorfy
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            fontSize: '1.8rem', // Más grande
            opacity: 0.8,
            mb: 4
          }}
        >
          Accede rápidamente a las secciones principales:
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          mt: 4, 
          mb: 6,
          p: 3, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            Consulta con nuestro Asistente Médico IA
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
            Resuelve tus dudas médicas al instante con nuestro asistente virtual. Disponible 24/7 para consultas sobre medicina general, nutrición, psicología y más.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ChatIcon />}
              onClick={() => navigate('/medical-chat')}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                backgroundColor: 'white',
                color: '#1a237e',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 20px rgba(255,255,255,0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Iniciar Chat Médico
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {/* Aquí puedes añadir una función para mostrar más información */}}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Más Información
            </Button>
          </Box>
        </Box>
        <Box 
          sx={{ 
            width: { xs: '100%', md: '300px' },
            height: { xs: '200px', md: '200px' },
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut"
            }}
            style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                backgroundColor: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <ChatIcon sx={{ fontSize: 60, color: '#1a237e' }} />
            </Avatar>
          </motion.div>
        </Box>
      </Box>
      
      <Grid container spacing={4}>
        {navOptions.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.title}>
            <Paper
              component={Link}
              to={option.path}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem', // Más padding
                height: '220px', // Más alto
                backgroundColor: option.color,
                color: 'white',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                borderRadius: '16px', // Bordes más redondeados
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-10px) scale(1.05)',
                  boxShadow: `0 16px 32px ${option.color}80`
                }
              }}
            >
              <Box sx={{ mb: 3 }}>
                {option.icon}
              </Box>
              <Typography 
                variant="h5" // h5 en lugar de h6
                sx={{ 
                  fontSize: '2rem', // Mucho más grande
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {option.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          startIcon={<PsychologyIcon />}
          onClick={() => navigate('/tixae-chatbot')}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1.1rem',
            boxShadow: '0 4px 20px rgba(156, 39, 176, 0.4)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 25px rgba(156, 39, 176, 0.6)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Consultar con Psicólogo y Doctor Virtual
        </Button>
      </Box>
      
      <Grid container spacing={4} sx={{ mt: 6 }}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4, // Más padding
              display: 'flex',
              flexDirection: 'column',
              height: 280, // Más alto
              borderRadius: '16px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            }}
          >
            <Typography 
              variant="h4" // h4 en lugar de h5
              sx={{ 
                fontSize: '2.2rem', // Mucho más grande
                fontWeight: 'bold',
                mb: 3
              }}
            >
              Resumen de Actividad
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography 
                variant="h6" // h6 en lugar de body1
                sx={{ fontSize: '1.5rem' }} // Más grande
              >
                Aquí se mostrará un resumen de tu actividad reciente.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4, // Más padding
              display: 'flex',
              flexDirection: 'column',
              height: 280, // Más alto
              borderRadius: '16px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            }}
          >
            <Typography 
              variant="h4" // h4 en lugar de h5
              sx={{ 
                fontSize: '2.2rem', // Mucho más grande
                fontWeight: 'bold',
                mb: 3
              }}
            >
              Información de Perfil
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography 
                variant="h6" // h6 en lugar de body1
                sx={{ fontSize: '1.5rem' }} // Más grande
              >
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography 
                variant="h6" // h6 en lugar de body1
                sx={{ fontSize: '1.5rem' }} // Más grande
              >
                <strong>Rol:</strong> {user?.is_doctor ? 'Doctor' : 'Paciente'}
              </Typography>
              <Typography 
                variant="h6" // h6 en lugar de body1
                sx={{ fontSize: '1.5rem' }} // Más grande
              >
                <strong>Estado:</strong> Activo
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 6, mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #673AB7 30%, #9C27B0 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ¡Nuevo! Chat Médico con IA
        </Typography>
        
        <Paper
          sx={{
            p: 4,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #673AB7 0%, #9C27B0 100%)',
            boxShadow: '0 10px 30px rgba(103, 58, 183, 0.3)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 4
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Box 
              component="img"
              src="/images/chat-medical-ai.png" // Asegúrate de tener esta imagen o usa otra
              alt="Chat Médico IA"
              sx={{ 
                maxWidth: '100%', 
                height: 'auto',
                maxHeight: '300px',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1, color: 'white' }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
              Consulta con nuestro Asistente Médico IA
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
              Resuelve tus dudas médicas al instante con nuestro asistente virtual. Disponible 24/7 para consultas sobre:
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalHospitalIcon sx={{ mr: 1 }} />
                <Typography variant="body1">Medicina General</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RestaurantIcon sx={{ mr: 1 }} />
                <Typography variant="body1">Nutrición y Alimentación</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PsychologyIcon sx={{ mr: 1 }} />
                <Typography variant="body1">Psicología y Bienestar</Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/medical-chat')}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                backgroundColor: 'white',
                color: '#673AB7',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Iniciar Chat Ahora
            </Button>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ¿No puedes acceder al Chat Médico? Prueba este enlace directo:
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          component={Link}
          to="/medical-chat"
          sx={{ px: 4, py: 1.5 }}
        >
          Ir al Chat Médico (Enlace Directo)
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard; 