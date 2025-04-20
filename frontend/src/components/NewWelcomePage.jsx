import React, { useEffect } from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
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
            speed: 3,
            connectParticles: true,
            particleCount: 100,
            size: 2,
            maxDistance: 160,
            lineWidth: 1,
            directionX: 1,
            directionY: -1,
            responsive: [
              {
                breakpoint: 768,
                options: {
                  particleCount: 50,
                  maxDistance: 120
                }
              }
            ]
          }}
        />
      </Box>

      {/* Contenedor principal centrado */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        {/* Imagen del doctor animada - Tamaño reducido */}
        <motion.img
          src="/doctor.png"
          alt="Doctor Doctorfy"
          initial={{ 
            opacity: 0,
            scale: 0.4,
            z: -100
          }}
          animate={{ 
            opacity: 0.98,
            scale: 0.56, // Reducido un 30% del valor anterior (0.8)
            z: 0,
            transition: {
              duration: 2,
              ease: [0.19, 0.33, 0.14, 0.98],
              opacity: { 
                duration: 2.5,
                ease: [0.25, 0.1, 0.25, 1]
              }
            }
          }}
          style={{
            height: { xs: '35vh', sm: '38vh', md: '42vh' }, // Reducido un 30%
            maxHeight: '420px', // Reducido un 30%
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 10px rgba(0,191,255,0.25))',
            marginBottom: '3vh',
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        />

        {/* Texto centrado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 1.5,
            delay: 0.8,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          style={{ 
            textAlign: 'center',
            width: '100%',
            padding: '0 20px'
          }}
        >
          <Typography
            variant="h1"
            sx={{
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textShadow: '0 0 15px rgba(255,20,147,0.4), 0 0 30px rgba(0,191,255,0.4)',
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' },
              fontFamily: 'monospace',
              textAlign: 'center',
              maxWidth: '1000px',
              mx: 'auto'
            }}
          >
            MARKET LABS PARAGUAY
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.6rem' },
              fontWeight: 300,
              letterSpacing: '0.08em',
              textShadow: '0 0 8px rgba(255,20,147,0.3), 0 0 15px rgba(0,191,255,0.3)',
              maxWidth: '600px',
              mx: 'auto',
              opacity: 0.9,
              mb: 4
            }}
          >
            Un Highway hacia la Innovación en SALUD con IA
          </Typography>
          
          {/* Powered by logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ 
              duration: 1,
              delay: 1.2,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#fff',
                opacity: 0.7,
                mb: 2,
                fontSize: { xs: '0.7rem', md: '0.8rem' },
                letterSpacing: '0.05em'
              }}
            >
              POWERED BY
            </Typography>
            
            <Stack 
              direction="column" 
              spacing={3} 
              justifyContent="center" 
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <img 
                src="/Anthropic.png" 
                alt="Anthropic" 
                style={{ 
                  height: '35px',
                  width: 'auto',
                  opacity: 0.9,
                  filter: 'brightness(0) invert(1)'
                }} 
              />
              <img 
                src="/OpenAI.png" 
                alt="OpenAI" 
                style={{ 
                  height: '40px',
                  width: 'auto',
                  opacity: 0.9,
                  filter: 'brightness(0) invert(1)'
                }} 
              />
            </Stack>
          </motion.div>
        </motion.div>

        {/* Logos en la parte inferior */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '20px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 2.5,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px'
            }}
          >
            <img 
              src="/ANT.png" 
              alt="Anthropic" 
              style={{ 
                height: '28px',
                width: 'auto',
                opacity: 0.85
              }} 
            />
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.7)', 
                height: '20px',
                width: '1px'
              }} 
            />
            <img 
              src="/OpenAI-white-monoblossom.png" 
              alt="OpenAI" 
              style={{ 
                height: '28px',
                width: 'auto',
                opacity: 0.85
              }} 
            />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default NewWelcomePage; 