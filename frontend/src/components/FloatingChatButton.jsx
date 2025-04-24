import React, { useState } from 'react';
import { 
  Box, 
  Fab, 
  useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PsychologyIcon from '@mui/icons-material/Psychology';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Fab
        color="secondary"
        aria-label="Psicólogo y Doctor Virtual"
        onClick={() => navigate('/tixae-chatbot')}
        sx={{
          bgcolor: theme.palette.secondary.main,
          '&:hover': {
            bgcolor: theme.palette.secondary.dark,
            transform: 'translateY(-5px)',
            boxShadow: `0 10px 20px ${theme.palette.secondary.main}40`,
          },
          transition: 'all 0.3s ease',
        }}
      >
        <PsychologyIcon />
      </Fab>
    </Box>
  );
};

export default FloatingChatButton; 