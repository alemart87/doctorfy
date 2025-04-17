import React from 'react';
import { Button } from '@mui/material';

const AccessibleButton = ({ children, ariaLabel, ...props }) => {
  return (
    <Button
      aria-label={ariaLabel}
      role="button"
      {...props}
    >
      {children}
    </Button>
  );
};

export default AccessibleButton; 