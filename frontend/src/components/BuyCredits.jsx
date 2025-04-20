import React from 'react';
import { Button, Typography, Box } from '@mui/material';

const BuyCredits = () => {
  const handleBuyCredits = (amount) => {
    // Redirigir directamente al link de pago de Stripe con la cantidad
    window.location.href = `https://buy.stripe.com/14k6oFfXf0xcc1i00x?quantity=${amount}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comprar Créditos
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => handleBuyCredits(10)}
          sx={{ 
            background: 'linear-gradient(45deg, #00bcd4 30%, #0097a7 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #0097a7 30%, #00838f 90%)',
            }
          }}
        >
          10 Créditos (5€)
        </Button>
        <Button 
          variant="contained"
          onClick={() => handleBuyCredits(50)}
          sx={{ 
            background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
            }
          }}
        >
          50 Créditos (25€)
        </Button>
        <Button 
          variant="contained"
          onClick={() => handleBuyCredits(100)}
          sx={{ 
            background: 'linear-gradient(45deg, #3f51b5 30%, #303f9f 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #303f9f 30%, #283593 90%)',
            }
          }}
        >
          100 Créditos (50€)
        </Button>
      </Box>
    </Box>
  );
};

export default BuyCredits; 