import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OpenFileHandler = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handleFileOpen = async () => {
      try {
        // En un entorno real, aquí procesarías el archivo que se está abriendo
        // Esto depende de la implementación específica del File Handler API
        
        // Por ahora, simplemente redirigimos a la página adecuada
        const fileType = searchParams.get('type') || 'unknown';
        
        if (fileType.includes('dicom') || fileType.includes('csv')) {
          navigate('/medical-studies');
        } else if (fileType.includes('pdf') || fileType.includes('image')) {
          navigate('/medical-studies');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error al abrir archivo:', err);
        setError('Error al procesar el archivo');
      } finally {
        setLoading(false);
      }
    };
    
    handleFileOpen();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Abriendo archivo
          </Typography>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Ir al Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return null; // No renderizar nada si se está redirigiendo
};

export default OpenFileHandler; 