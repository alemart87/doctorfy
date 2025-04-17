import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const CountdownTimer = ({ endDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      
      if (difference <= 0) {
        // La oferta ha expirado
        if (onComplete) {
          onComplete();
        }
        return {
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
      
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };
    
    // Calcular el tiempo restante inicialmente
    setTimeLeft(calculateTimeLeft());
    
    // Actualizar el tiempo restante cada segundo
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(timer);
  }, [endDate, onComplete]);
  
  // Formatear los números para que siempre tengan dos dígitos
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
          {formatNumber(timeLeft.hours)}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          horas
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>:</Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
          {formatNumber(timeLeft.minutes)}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          min
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>:</Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
          {formatNumber(timeLeft.seconds)}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          seg
        </Typography>
      </Box>
    </Box>
  );
};

export default CountdownTimer; 