import React from 'react';
import { Box } from '@mui/material';

const OptimizedImage = ({ src, alt, width, height, ...props }) => {
  return (
    <Box component="picture" {...props}>
      {/* WebP version for modern browsers */}
      <source 
        srcSet={src.replace(/\.(jpg|png)$/, '.webp')} 
        type="image/webp" 
      />
      {/* Fallback for browsers that don't support WebP */}
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height} 
        loading="lazy"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </Box>
  );
};

export default OptimizedImage; 