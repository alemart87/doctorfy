import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShareTarget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const processSharedData = async () => {
      try {
        setLoading(true);
        
        // Obtener los datos del formulario
        const formData = new FormData(document.forms.namedItem('share-target'));
        
        // Verificar si hay archivos
        const files = formData.getAll('medicalFiles');
        if (files.length > 0) {
          // Procesar los archivos (por ejemplo, subirlos al servidor)
          const response = await axios.post('/api/shared-files', formData);
          
          if (response.data.success) {
            setSuccess(true);
            
            // Redirigir a la página adecuada según el tipo de archivo
            setTimeout(() => {
              const fileType = response.data.fileType;
              if (fileType === 'medical') {
                navigate('/medical-studies');
              } else if (fileType === 'nutrition') {
                navigate('/nutrition');
              } else {
                navigate('/dashboard');
              }
            }, 2000);
          } else {
            setError('No se pudo procesar el archivo compartido');
          }
        } else {
          // Procesar texto o URL compartidos
          const text = formData.get('text');
          const url = formData.get('url');
          const title = formData.get('title');
          
          if (text || url) {
            // Aquí puedes manejar el texto o URL compartido
            setSuccess(true);
            
            // Redirigir al chat médico con el texto como consulta inicial
            setTimeout(() => {
              navigate('/medical-chat', { 
                state: { initialQuery: text || url, title }
              });
            }, 2000);
          } else {
            setError('No se recibieron datos para compartir');
          }
        }
      } catch (err) {
        console.error('Error al procesar datos compartidos:', err);
        setError('Error al procesar los datos compartidos');
      } finally {
        setLoading(false);
      }
    };
    
    // Verificar si la página se cargó como resultado de una acción de compartir
    if (window.location.pathname === '/share-target') {
      processSharedData();
    } else {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Procesando contenido compartido
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => navigate('/dashboard')}
            >
              Ir al Dashboard
            </Button>
          </>
        )}
        
        {success && (
          <Alert severity="success">
            Contenido recibido correctamente. Redirigiendo...
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default ShareTarget; 