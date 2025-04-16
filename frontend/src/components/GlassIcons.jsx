import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import "./GlassIcons.css";

// Mapeo de colores a clases CSS
const colorClassMap = {
  blue: "bg-blue",
  cyan: "bg-cyan",
  green: "bg-green",
  purple: "bg-purple",
  orange: "bg-orange",
  indigo: "bg-indigo",
};

// Componente de partículas para efectos visuales
const Particles = ({ count = 10, isMobile }) => {
  // Reducir partículas en móviles
  const actualCount = isMobile ? Math.min(count, 5) : count;
  
  const particles = Array.from({ length: actualCount }).map((_, i) => {
    const size = Math.random() * 4 + 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 2;
    
    return (
      <div
        key={i}
        className="particle"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${x}%`,
          top: `${y}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });
  
  return <div className="particles">{particles}</div>;
};

// Variantes de animación para los elementos
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

const GlassIcons = ({ items = [], iconSize = "medium", scale = 1, className = "" }) => {
  // Estado para controlar el hover
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Estado para detectar si es móvil
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  
  // Referencia al contenedor para medir su ancho
  const containerRef = useRef(null);
  
  // Efecto para detectar si es móvil
  useEffect(() => {
    const checkDeviceSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };
    
    // Comprobar inicialmente
    checkDeviceSize();
    
    // Comprobar en cada cambio de tamaño
    window.addEventListener('resize', checkDeviceSize);
    
    // Limpiar
    return () => window.removeEventListener('resize', checkDeviceSize);
  }, []);
  
  // Determinar la clase CSS para el tamaño de icono
  const getIconSizeClass = () => {
    // Si es un móvil pequeño, reducir un nivel el tamaño del icono
    if (isSmallMobile) {
      switch (iconSize) {
        case 'small': return 'icon-size-small';
        case 'medium': return 'icon-size-small';
        case 'large': return 'icon-size-medium';
        case 'xlarge': return 'icon-size-large';
        default: return 'icon-size-small';
      }
    }
    return `icon-size-${iconSize}`;
  };

  // Calcular el scale efectivo (reducir en móviles)
  const effectiveScale = isSmallMobile ? Math.min(scale, 0.9) : scale;

  return (
    <motion.div
      ref={containerRef}
      className={`icon-btns ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.label || index}
          variants={itemVariants}
          whileHover={isSmallMobile ? {} : { scale: isMobile ? 1.02 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => !isSmallMobile && setHoveredIndex(index)}
          onHoverEnd={() => !isSmallMobile && setHoveredIndex(null)}
        >
          <Link to={item.href || "#"} style={{ textDecoration: 'none' }}>
            <div className="glass-icon">
              <div className={`glass-card ${colorClassMap[item.color] || colorClassMap.blue}`}>
                <div className="icon-container">
                  <div className={`icon-wrapper ${getIconSizeClass()}`}>
                    {item.icon || '?'}
                  </div>
                </div>
                <Typography 
                  className="icon-label" 
                  style={{ 
                    fontSize: isSmallMobile ? '0.85rem' : (item.labelSize || undefined),
                    marginTop: isSmallMobile ? '0.5rem' : undefined
                  }}
                >
                  {item.label || 'No Label'}
                </Typography>
                
                {/* Efecto de partículas solo en desktop */}
                {!isMobile && hoveredIndex === index && <Particles count={15} isMobile={isMobile} />}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GlassIcons; 