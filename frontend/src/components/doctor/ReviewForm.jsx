import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const ReviewForm = ({ doctorId, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor, selecciona una calificación');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/doctors/${doctorId}/reviews`, {
        rating,
        comment
      });
      
      setSuccess(true);
      setRating(0);
      setComment('');
      
      // Notificar al componente padre que se ha enviado una reseña
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error al enviar reseña:', err);
      setError('No se pudo enviar la reseña. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Alert severity="info">
          Debes iniciar sesión para dejar una reseña.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Deja tu opinión
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>¡Reseña enviada con éxito!</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend">Calificación</Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            precision={0.5}
            size="large"
          />
        </Box>
        
        <TextField
          fullWidth
          label="Comentario"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          margin="normal"
          placeholder="Comparte tu experiencia con este médico..."
        />
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enviar Reseña'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ReviewForm; 