import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import './ShinyButton.css';

const ShinyButton = ({ icon, label, onClick, color = 'primary', disabled = false, speed = 3 }) => {
  // Determinar si estamos en un dispositivo móvil
  const isMobile = window.innerWidth <= 600;
  
  return (
    <Tooltip 
      title={label} 
      placement="top"
      arrow
      enterTouchDelay={0}
      leaveTouchDelay={1500}
    >
      <span className="shiny-button-wrapper">
        <IconButton
          className={`shiny-button ${color} ${disabled ? 'disabled' : ''}`}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          style={{ 
            '--animation-speed': `${speed}s`,
            // Asegurar visibilidad en móviles
            opacity: 1,
            visibility: 'visible'
          }}
          size={isMobile ? "small" : "medium"}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default ShinyButton; 