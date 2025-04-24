import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import './ActionButton.css';

const ActionButton = ({ icon, label, onClick, color = 'primary', disabled = false, speed = 3 }) => {
  return (
    <Tooltip title={label} placement="top">
      <span className="action-button-wrapper">
        <IconButton
          className={`action-button ${color} ${disabled ? 'disabled' : ''}`}
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

export default ActionButton; 