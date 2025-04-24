import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import './SimpleStudyButton.css';

const SimpleStudyButton = ({ icon, label, onClick, color = 'primary', disabled = false, processing = false }) => {
  // Mapeo de colores a valores hexadecimales para iconos simples
  const colorMap = {
    primary: '#64b5f6',
    success: '#81c784',
    warning: '#ffb74d',
    error: '#e57373',
    info: '#06b6d4'
  };
  
  const buttonColor = colorMap[color] || colorMap.primary;
  
  return (
    <Tooltip 
      title={label} 
      placement="top" 
      arrow
    >
      <span>
        <IconButton
          className={`simple-study-button ${processing ? 'processing' : ''}`}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          sx={{
            color: buttonColor,
            opacity: disabled ? 0.5 : 1,
            '&:hover': {
              backgroundColor: `${buttonColor}20` // Color con 20% de opacidad
            }
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default SimpleStudyButton; 