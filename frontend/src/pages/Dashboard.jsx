import React from 'react';
import { Container, Typography, Grid, Paper, Box, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import WelcomeBanner from '../components/WelcomeBanner';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // Opciones de navegación con iconos y colores
  const navOptions = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon sx={{ fontSize: 60 }} />, // Tamaño mucho más grande
      path: '/dashboard',
      color: theme.palette.primary.main
    },
    {
      title: 'Estudios Médicos',
      icon: <LocalHospitalIcon sx={{ fontSize: 60 }} />, // Tamaño mucho más grande
      path: '/medical-studies',
      color: theme.palette.secondary.main
    },
    {
      title: 'Nutrición',
      icon: <RestaurantIcon sx={{ fontSize: 60 }} />, // Tamaño mucho más grande
      path: '/nutrition',
      color: '#4CAF50' // Verde
    },
    {
      title: 'Doctores',
      icon: <PeopleIcon sx={{ fontSize: 60 }} />, // Tamaño mucho más grande
      path: '/doctors',
      color: '#9C27B0' // Púrpura
    },
    {
      title: 'Mi Perfil',
      icon: <AccountCircleIcon sx={{ fontSize: 60 }} />, // Tamaño mucho más grande
      path: '/profile',
      color: '#FF9800' // Naranja
    },
    {
      title: 'Configuración',
      icon: <SettingsIcon sx={{ fontSize: 60 }} />, // Tamaño mucho más grande
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
    </Container>
  );
};

export default Dashboard; 