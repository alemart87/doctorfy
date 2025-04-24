import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Box, Typography, useTheme } from '@mui/material';

// Componente para los Discos Flotantes
export const FloatingDisc = ({ 
  size = 200, 
  top, 
  left, 
  right, 
  bottom, 
  delay = 0, 
  duration = 20000,
  color,
  blur = 15,
  opacity = 0.4,
  rotation = 15
}) => {
  const theme = useTheme();

  // Animación mejorada con rotación y escala
  const styles = useSpring({
    loop: { reverse: true },
    from: { 
      transform: 'translateY(0px) rotate(0deg) scale(1)' 
    },
    to: { 
      transform: `translateY(20px) rotate(${rotation}deg) scale(1.05)` 
    },
    config: { 
      duration: duration, 
      tension: 10, 
      friction: 10 
    },
    delay: delay,
  });

  return (
    <animated.div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color || `radial-gradient(circle, rgba(255,255,255,0.1) 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.secondary.dark} 100%)`,
        opacity: opacity,
        filter: `blur(${blur}px)`,
        boxShadow: `0 0 30px 5px ${theme.palette.primary.main}33, 0 0 40px 10px ${theme.palette.secondary.main}22`,
        zIndex: 1,
        ...styles,
      }}
    />
  );
};

// Componente para el Texto Animado de Fondo
export const AnimatedBackgroundText = ({ 
  text, 
  top, 
  left, 
  right, 
  bottom, 
  delay = 0, 
  duration = 5000,
  fontSize,
  opacity = 0.15,
  gradient
}) => {
  const theme = useTheme();

  // Animación mejorada con múltiples propiedades
  const styles = useSpring({
    loop: { reverse: true },
    from: { 
      opacity: opacity * 0.7, 
      transform: 'translateY(10px) scale(0.98)', 
      filter: 'blur(8px)'
    },
    to: { 
      opacity: opacity, 
      transform: 'translateY(-10px) scale(1.02)', 
      filter: 'blur(5px)'
    },
    config: { 
      duration: duration,
      easing: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    },
    delay: delay,
  });

  return (
    <animated.div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        zIndex: 1,
        ...styles,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: fontSize || { xs: '4rem', md: '7rem', lg: '9rem' },
          lineHeight: 1,
          background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main} 10%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.light} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          userSelect: 'none',
          textAlign: left ? 'left' : right ? 'right' : 'center',
          letterSpacing: '-0.02em',
          filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))',
        }}
      >
        {text}
      </Typography>
    </animated.div>
  );
};

// Componente para texto rotativo que cambia entre diferentes frases
export const RotatingText = ({ phrases, color, fontSize, delay = 0 }) => {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  
  // Usar useEffect para manejar el temporizador de manera segura
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, 3000);
    
    // Limpiar el temporizador cuando el componente se desmonte
    return () => clearTimeout(timer);
  }, [index, phrases.length]); // Dependencias del efecto
  
  // Animación para el texto que se desplaza
  const props = useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(40px)',
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0px)',
    },
    reset: true,
    config: { 
      tension: 280, 
      friction: 60,
      duration: 800,
    },
    delay: delay,
  });

  return (
    <animated.div style={props}>
      <Typography
        variant="h2"
        sx={{
          fontWeight: 700,
          fontSize: fontSize || { xs: '2rem', md: '3rem', lg: '4rem' },
          lineHeight: 1.2,
          background: color || `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
          whiteSpace: 'nowrap',
          textShadow: '0 0 20px rgba(66, 133, 244, 0.3)',
        }}
      >
        {phrases[index]}
      </Typography>
    </animated.div>
  );
}; 