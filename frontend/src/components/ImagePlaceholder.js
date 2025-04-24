import React from 'react';
import { Box, Typography } from '@mui/material';

const ImagePlaceholder = ({ text, height = 200 }) => {
  return (
    <Box 
      sx={{ 
        height: height, 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '4px 4px 0 0'
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
};

export default ImagePlaceholder; 