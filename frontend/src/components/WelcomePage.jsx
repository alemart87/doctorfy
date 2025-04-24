import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import Waves from './Waves';

const WelcomePage = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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
          onClick={showContinue ? () => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          } : undefined}
        >
          <Waves
            lineColor="rgba(255, 255, 255, 0.15)"
            backgroundColor="transparent"
            waveSpeedX={0.015}
            waveSpeedY={0.01}
            waveAmpX={25}
            waveAmpY={15}
            xGap={8}
            yGap={48}
          />

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
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(to right, #00ffff, #40E0D0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
                  letterSpacing: '2px'
                }}
              >
                MARKET LABS
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3.5rem' },
                  color: '#ffffff',
                  marginTop: 2,
                  textShadow: '0 0 30px rgba(0, 255, 255, 0.6)',
                  letterSpacing: '4px',
                  fontWeight: 600
                }}
              >
                PARAGUAY
              </Typography>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  height: '3px',
                  background: 'linear-gradient(90deg, #00ffff, #ffffff)',
                  margin: '20px auto',
                  width: '250px',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)'
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  marginTop: 2,
                  fontSize: { xs: '1rem', md: '1.5rem' },
                  letterSpacing: '1px',
                  textShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
                  fontWeight: 400
                }}
              >
                Innovación en Tecnología Médica
              </Typography>

              {showContinue && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      mt: 4,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Toca para continuar
                  </Typography>
                </motion.div>
              )}
            </motion.div>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePage; 