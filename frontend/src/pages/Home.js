import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImagePlaceholder from '../components/ImagePlaceholder';

const Home = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Bienvenido a Doctorfy
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Tu plataforma médica inteligente para interpretación de estudios y análisis nutricional
        </Typography>
        {!user && (
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" component={RouterLink} to="/register" sx={{ mx: 1, mb: 1 }}>
              Registrarse
            </Button>
            <Button variant="outlined" component={RouterLink} to="/login" sx={{ mx: 1, mb: 1 }}>
              Iniciar Sesión
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <ImagePlaceholder text="Estudios Médicos" />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Interpretación de Estudios Médicos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sube tus estudios médicos y obtén una interpretación detallada por nuestra IA avanzada.
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/medical-studies" 
                sx={{ mt: 2 }}
                fullWidth
              >
                Ver Más
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <ImagePlaceholder text="Análisis Nutricional" />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Análisis Nutricional
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toma una foto de tus alimentos y obtén información detallada sobre su valor nutricional.
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/nutrition" 
                sx={{ mt: 2 }}
                fullWidth
              >
                Ver Más
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <ImagePlaceholder text="Directorio de Médicos" />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Directorio de Médicos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Encuentra médicos especializados para consultas y seguimiento de tus estudios.
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/doctors" 
                sx={{ mt: 2 }}
                fullWidth
              >
                Ver Más
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 