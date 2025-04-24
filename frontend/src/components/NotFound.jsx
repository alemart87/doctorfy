import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, ErrorOutline as ErrorIcon } from '@mui/icons-material'; // Importamos un icono de error también

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm" // Limita el ancho para mejor legibilidad en pantallas grandes
      sx={{
        minHeight: 'calc(100vh - 64px)', // Ajusta 64px si tu Navbar tiene otra altura
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        py: { xs: 4, sm: 8 }, // Padding vertical responsivo
        px: 2, // Padding horizontal
      }}
    >
      <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />

      <Typography
        variant="h1"
        component="h1" // Mejor semántica
        sx={{
          fontSize: { xs: '4rem', sm: '6rem' },
          fontWeight: 700,
          color: 'text.primary',
          mb: 1,
        }}
      >
        404
      </Typography>

      <Typography
        variant="h5"
        component="h2" // Mejor semántica
        sx={{
          mb: 2,
          fontWeight: 500,
          color: 'text.secondary'
        }}
      >
        ¡Ups! Página No Encontrada
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 4,
          color: 'text.secondary',
          maxWidth: '500px'
        }}
      >
        Lo sentimos, la página que estás buscando no existe, ha sido eliminada o la dirección es incorrecta.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/')} // Navega a la ruta raíz
        startIcon={<HomeIcon />}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: '50px', // Botón más redondeado
          textTransform: 'none',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
          transition: 'all 0.3s ease'
        }}
      >
        Volver al Inicio
      </Button>
    </Container>
  );
};

export default NotFound; 