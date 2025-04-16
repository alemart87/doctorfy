import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RotatingText from './RotatingText';
import './ActionButton.css';

const ActionButton = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  // Función para manejar el clic y navegar a la página de guía
  const handleClick = () => {
    navigate('/guide');
    console.log('Navegando a la página de guía');
  };
  
  return (
    <div className="action-button-container">
      {/* Indicador de clic arriba del botón */}
      <motion.div 
        className="click-indicator click-indicator-top"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.5, 1, 0.5], 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut"
        }}
      >
        CLICK AQUÍ
      </motion.div>
      
      <motion.button
        className="action-button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 15 
        }}
      >
        <div className="action-button-content">
          <span className="action-button-prefix">GUIA DE</span>
          <RotatingText
            texts={['NUEVA VIDA', 'FELICIDAD', 'IA', "+ SALUD"]}
            mainClassName="action-button-rotating-text"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="action-button-split-level"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </div>
      </motion.button>
    </div>
  );
};

export default ActionButton; 