import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import Ballpit from './Ballpit';

const WelcomePage = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mostrar el mensaje de "Toca para continuar" después de 3 segundos
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      navigate('/');
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000',
            zIndex: 9999,
            overflow: 'hidden',
            cursor: showContinue ? 'pointer' : 'default'
          }}
          onClick={showContinue ? handleContinue : undefined}
        >
          {/* Configuración ajustada para que se vea como en la imagen */}
          <Ballpit
            config={{
              count: 170,              // Ball Count: 170
              gravity: 0.7,            // Gravity: 0.7
              friction: 0.9975,        // Friction: 0.9975
              wallBounce: 0.95,        // Wall Bounce: 0.95
              followCursor: false,     // Display Cursor: false
              colors: ['#ffffff'],     // Color blanco/gris
              maxVelocity: 0.15,
              velocityScale: 0.1,
              minSize: 0.5,
              maxSize: 2,
              opacity: 0.2,
              damping: 0.98
            }}
          />

          {/* Contenido centrado con mejor espaciado */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 2
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: '4rem',
                  fontWeight: 700,
                  background: 'linear-gradient(to right, #2ecc71, #3498db)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                MARKET LABS
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: '3rem',
                  color: '#3498db',
                  marginTop: 2
                }}
              >
                PARAGUAY
              </Typography>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1 }}
                style={{
                  height: '2px',
                  background: 'linear-gradient(90deg, #2ecc71, #3498db)',
                  margin: '20px auto',
                  width: '300px',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: 2
                }}
              >
                Innovación en Tecnología Médica
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePage; 