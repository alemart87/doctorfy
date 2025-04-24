import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ProtocolHandler = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    const handleProtocol = () => {
      try {
        if (!type) {
          setError('Tipo de protocolo no especificado');
          return;
        }
        
        // Decodificar el parámetro
        const decodedType = decodeURIComponent(type);
        
        // Manejar diferentes tipos de protocolos
        if (decodedType.startsWith('chat:')) {
          // Formato: chat:specialty:query
          const parts = decodedType.split(':');
          if (parts.length >= 3) {
            const specialty = parts[1];
            const query = parts.slice(2).join(':');
            
            // Redirigir al chat médico con la especialidad y consulta
            navigate('/medical-chat', { 
              state: { 
                initialSpecialty: specialty, 
                initialQuery: query 
              }
            });
          } else {
            navigate('/medical-chat');
          }
        } else if (decodedType.startsWith('study:')) {
          // Formato: study:id
          const studyId = decodedType.split(':')[1];
          navigate(`/medical-studies/${studyId}`);
        } else if (decodedType.startsWith('nutrition:')) {
          // Formato: nutrition:action
          navigate('/nutrition');
        } else if (decodedType.startsWith('profile:')) {
          // Formato: profile:section
          const section = decodedType.split(':')[1];
          navigate(`/profile${section ? `?section=${section}` : ''}`);
        } else {
          // Protocolo desconocido, ir al dashboard
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error al manejar protocolo:', err);
        setError('Error al procesar el protocolo');
      } finally {
        setLoading(false);
      }
    };
    
    handleProtocol();
  }, [type, navigate]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Procesando protocolo
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

export default ProtocolHandler; 