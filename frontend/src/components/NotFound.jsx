import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container
      sx={{
        minHeight: 'calc(100vh - 64px)', // Ajusta si tu Navbar tiene altura diferente
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.default', // Usa el color de fondo del tema
        color: 'text.primary',      // Usa el color de texto primario del tema
        pt: 8, // Padding top para separar del Navbar si existe
        pb: 8
      }}
    >
      {/* Número 404 */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
          fontWeight: 900,
          background: 'linear-gradient(45deg, #00bcd4, #2196f3)', // Colores del tema
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
          textShadow: '0 0 20px rgba(33, 150, 243, 0.3)'
        }}
      >
        404
      </Typography>

      {/* Mensaje principal */}
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 700
        }}
      >
        Página no encontrada
      </Typography>

      {/* Submensaje */}
      <Typography
        variant="h6"
        sx={{
          mb: 4,
          color: 'text.secondary', // Color secundario del tema
          maxWidth: '600px'
        }}
      >
        Lo sentimos, la página que buscas no existe o ha sido movida.
        Te invitamos a volver al inicio y explorar nuestros servicios de salud digital.
      </Typography>

      {/* Botón de regreso */}
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/')} // Navega a la ruta raíz
        startIcon={<HomeIcon />}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1.1rem',
          textTransform: 'none',
          background: 'linear-gradient(45deg, #00bcd4, #2196f3)', // Colores del tema
          boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00acc1, #1e88e5)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
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