import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import Waves from './Waves';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

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
            overflow: 'hidden'
          }}
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
              transition={{ delay: 0.5 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: '4.5rem',
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
                  fontSize: '3.5rem',
                  color: '#ffffff',
                  marginTop: 2,
                  textShadow: '0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.3)',
                  letterSpacing: '4px',
                  fontWeight: 600
                }}
              >
                PARAGUAY
              </Typography>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1 }}
                style={{
                  height: '3px',
                  background: 'linear-gradient(90deg, #00ffff, #ffffff)',
                  margin: '30px auto',
                  width: '300px',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)'
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  marginTop: 2,
                  fontSize: '1.5rem',
                  letterSpacing: '1px',
                  textShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
                  fontWeight: 400
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

export default SplashScreen; 