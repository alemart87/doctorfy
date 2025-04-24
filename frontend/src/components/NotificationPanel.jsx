import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const NotificationPanel = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasTokens, setHasTokens] = useState(false);

  // Verificar si hay tokens disponibles
  useEffect(() => {
    const checkTokens = async () => {
      try {
        const response = await axios.get('/api/notifications/check-tokens', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setHasTokens(response.data.hasTokens);
      } catch (err) {
        console.error('Error al verificar tokens:', err);
      }
    };

    checkTokens();
  }, []);

  const handleSendNotification = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/notifications/send', {
        title,
        body
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setStatus({
        type: 'success',
        message: `Notificación enviada a ${response.data.sent} usuarios`
      });
      setTitle('');
      setBody('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Error al enviar notificación'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom color="primary">
        Enviar Notificación Push
      </Typography>

      {!hasTokens && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Aún no hay usuarios suscritos a las notificaciones. 
          Los usuarios recibirán una solicitud para activar las notificaciones al iniciar sesión.
        </Alert>
      )}
      
      <TextField
        fullWidth
        label="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        disabled={!hasTokens}
      />
      
      <TextField
        fullWidth
        label="Mensaje"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        margin="normal"
        multiline
        rows={4}
        disabled={!hasTokens}
      />
      
      <Button
        variant="contained"
        onClick={handleSendNotification}
        disabled={!hasTokens || !title || !body || loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Enviar Notificación'}
      </Button>

      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>
          {status.message}
        </Alert>
      )}
    </Paper>
  );
};

export default NotificationPanel; 