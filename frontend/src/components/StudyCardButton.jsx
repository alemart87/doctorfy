import React, { useState } from 'react';
import { Tooltip, Box } from '@mui/material';
import './StudyCardButton.css';

const StudyCardButton = ({ icon, label, onClick, color = 'primary', disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Mapeo de colores a valores hexadecimales
  const colorMap = {
    primary: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5', glow: 'rgba(100, 181, 246, 0.5)' },
    success: { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a', glow: 'rgba(129, 199, 132, 0.5)' },
    warning: { main: '#ffb74d', light: '#ffcc80', dark: '#ffa726', glow: 'rgba(255, 183, 77, 0.5)' },
    error: { main: '#e57373', light: '#ef9a9a', dark: '#ef5350', glow: 'rgba(229, 115, 115, 0.5)' },
    info: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5', glow: 'rgba(100, 181, 246, 0.5)' }
  };
  
  const currentColor = colorMap[color] || colorMap.primary;
  
  return (
    <Tooltip 
      title={label} 
      placement="top" 
      arrow
      enterDelay={500}
      leaveDelay={200}
    >
      <Box 
        className={`neobutton-container ${disabled ? 'disabled' : ''}`}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          // Colores dinámicos basados en la prop color
          '--main-color': currentColor.main,
          '--light-color': currentColor.light,
          '--dark-color': currentColor.dark,
          '--glow-color': currentColor.glow,
          // Efecto de elevación en hover
          transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered && !disabled 
            ? `0 4px 12px ${currentColor.glow}, 0 0 0 1px ${currentColor.main}` 
            : `0 2px 5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <div className="neobutton-icon">
          {React.cloneElement(icon, { 
            style: { 
              color: disabled ? 'rgba(255, 255, 255, 0.3)' : currentColor.main,
              fontSize: '1.3rem' 
            } 
          })}
          
          {/* Efecto de resplandor detrás del icono */}
          {!disabled && (
            <div 
              className="neobutton-glow" 
              style={{ 
                opacity: isHovered ? 0.8 : 0.3,
                background: `radial-gradient(circle, ${currentColor.glow} 0%, transparent 70%)`
              }}
            />
          )}
        </div>
        
        {/* Indicador de etiqueta que aparece en hover */}
        <div 
          className="neobutton-label" 
          style={{ 
            opacity: isHovered && !disabled ? 1 : 0,
            transform: isHovered && !disabled ? 'translateY(0)' : 'translateY(5px)',
            color: currentColor.main
          }}
        >
          {label}
        </div>
      </Box>
    </Tooltip>
  );
};

export default StudyCardButton; 