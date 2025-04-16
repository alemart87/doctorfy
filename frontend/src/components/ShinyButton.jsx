import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import './ShinyButton.css';

const ShinyButton = ({ icon, label, onClick, color = 'primary', disabled = false, speed = 3 }) => {
  return (
    <Tooltip title={label} placement="top">
      <span className="shiny-button-wrapper">
        <IconButton
          className={`shiny-button ${color} ${disabled ? 'disabled' : ''}`}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          style={{ '--animation-speed': `${speed}s` }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default ShinyButton; 