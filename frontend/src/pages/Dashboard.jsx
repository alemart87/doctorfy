import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import WelcomeBanner from '../components/WelcomeBanner';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <WelcomeBanner />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Resumen de Actividad
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1">
                Aquí se mostrará un resumen de tu actividad reciente.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Información de Perfil
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body2">
                <strong>Rol:</strong> {user?.is_doctor ? 'Doctor' : 'Paciente'}
              </Typography>
              <Typography variant="body2">
                <strong>Estado:</strong> Activo
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Próximas Funcionalidades
            </Typography>
            <Typography variant="body1">
              Estamos trabajando en nuevas características para mejorar tu experiencia en Doctorfy.
              ¡Mantente atento a las actualizaciones!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 