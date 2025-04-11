import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, Alert, CircularProgress, Grid, Card, CardContent, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { doctorsService } from '../services/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscribeUrl, setSubscribeUrl] = useState(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setSubscribeLoading(true);
      const response = await doctorsService.subscribe();
      setSubscribeUrl(response.data.checkout_url);
      setError(null);
    } catch (err) {
      console.error('Error subscribing:', err);
      setError('Error al procesar la suscripción');
    } finally {
      setSubscribeLoading(false);
    }
  };

  useEffect(() => {
    if (subscribeUrl) {
      window.location.href = subscribeUrl;
    }
  }, [subscribeUrl]);

  if (!user || !user.is_doctor) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          No tienes acceso a esta página
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Panel de Doctor
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Mi Perfil
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Especialidad:</strong> {user.specialty || 'No especificada'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Número de Licencia:</strong> {user.license_number || 'No especificado'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Estado de Suscripción:</strong> {user.subscription_active ? 'Activa' : 'Inactiva'}
              </Typography>
              
              {!user.subscription_active && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSubscribe}
                  disabled={subscribeLoading}
                  sx={{ mt: 2 }}
                >
                  {subscribeLoading ? 'Procesando...' : 'Suscribirse (250.000 Gs)'}
                </Button>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Estadísticas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    Estudios Interpretados
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ my: 2 }}>
                    0
                  </Typography>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    Consultas Pendientes
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ my: 2 }}>
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DoctorDashboard; 