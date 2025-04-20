import React, { useState } from 'react';
import { Container, Typography, Button, Box, Fade } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowBack } from '@mui/icons-material';
import FuzzyText from './FuzzyText';

const NotFound = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setIsHovered(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  return (
    <Container 
      sx={{ 
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        py: 8,
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      <Box 
        sx={{ 
          mb: 4,
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          '&:hover': {
            transform: 'scale(1.1)'
          }
        }}
      >
        <FuzzyText
          baseIntensity={0.2}
          hoverIntensity={0.5}
          enableHover={true}
          fontSize="clamp(6rem, 15vw, 12rem)"
          fontWeight={900}
          color={isHovered ? '#2196f3' : 'primary.main'}
        >
          404
        </FuzzyText>
      </Box>

      <Fade in={!isHovered}>
        <Box 
          sx={{
            position: 'relative',
            mb: 6,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              bgcolor: 'primary.main',
              borderRadius: '2px'
            }
          }}
        >
          <Typography 
            variant="h2" 
            component="h1"
            sx={{ 
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 700,
              mb: 2
            }}
          >
            Página no encontrada
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}
          >
            Lo sentimos, la página que buscas no existe o ha sido movida.
            <br />
            <strong>Haz click en cualquier lugar para volver al inicio</strong>
          </Typography>
        </Box>
      </Fade>

      <Fade in={!isHovered}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            startIcon={<Home />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Inicio
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            variant="outlined"
            size="large"
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Volver
          </Button>
        </Box>
      </Fade>
    </Container>
  );
};

export default NotFound; 