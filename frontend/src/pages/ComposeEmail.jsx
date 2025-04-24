import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send as SendIcon } from '@mui/icons-material';

const ComposeEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const to = searchParams.get('to') || '';
  
  const [formData, setFormData] = useState({
    to,
    subject: '',
    body: ''
  });
  
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSending(true);
      setError(null);
      
      // Aquí implementarías la lógica para enviar el correo
      // Por ejemplo, usando una API de tu backend
      
      // Simulamos una respuesta exitosa
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error al enviar correo:', err);
      setError('Error al enviar el correo. Por favor, intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Nuevo Mensaje
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success ? (
          <Alert severity="success">
            Mensaje enviado correctamente. Redirigiendo...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Para"
              name="to"
              value={formData.to}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Asunto"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Mensaje"
              name="body"
              value={formData.body}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={6}
              required
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={sending}
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default ComposeEmail; 