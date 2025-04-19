import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Particles from './Particles';

const NewWelcomePage = ({ onComplete }) => {
  useEffect(() => {
    // Auto completar después de 5 segundos
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Fondo con Particles */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to bottom, #000000, #1a1a1a)'
      }}>
        <Particles 
          options={{
            color: ['#ff1493', '#00bfff'], // Rosa y azul neón
            speed: 4,
            connectParticles: true,
            particleCount: 150,
            size: 2.5,
            maxDistance: 180,
            lineWidth: 1.5,
            directionX: 2,
            directionY: -2,
            responsive: [
              {
                breakpoint: 768,
                options: {
                  particleCount: 80,
                  maxDistance: 140
                }
              }
            ]
          }}
        />
      </Box>

      {/* Texto superpuesto */}
      <Box sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <Typography
            variant="h1"
            sx={{
              color: '#fff',
              fontWeight: 900,
              letterSpacing: '0.2em',
              textShadow: '0 0 20px rgba(255,20,147,0.5), 0 0 40px rgba(0,191,255,0.5)',
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              fontFamily: 'monospace',
            }}
          >
            MARKET LABS PARAGUAY
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' },
              fontWeight: 300,
              letterSpacing: '0.1em',
              textShadow: '0 0 10px rgba(255,20,147,0.3), 0 0 20px rgba(0,191,255,0.3)',
              maxWidth: '800px',
              mx: 'auto',
              px: 2
            }}
          >
            Un Highway hacia la Innovación en SALUD con IA
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};

export default NewWelcomePage; 