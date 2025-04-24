import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Divider } from '@mui/material';
import { MedicalServices, Restaurant, Info } from '@mui/icons-material';
import BuyCredits from './BuyCredits';

const CreditsInfo = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h2" gutterBottom align="center" sx={{ mb: 5 }}>
        Sistema de Créditos
      </Typography>

      {/* Sección de Cómo Funcionan los Créditos */}
      <Typography variant="h5" color="primary" gutterBottom>
        ¿Cómo funcionan los créditos?
      </Typography>
      <Typography paragraph>
        Los créditos son la moneda del sistema que te permite realizar análisis de estudios médicos y alimentos.
        Cada tipo de análisis consume una cantidad específica de créditos.
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <MedicalServices sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6">Análisis Médico</Typography>
              <Typography variant="h3" sx={{ my: 2 }}>5 créditos</Typography>
              <Typography>Por cada análisis de estudio médico (radiografías, resonancias, etc.)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Restaurant sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6">Análisis Nutricional</Typography>
              <Typography variant="h3" sx={{ my: 2 }}>1 crédito</Typography>
              <Typography>Por cada análisis de alimentos y contenido nutricional</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección de Planes de Créditos */}
      <Typography variant="h5" color="primary" gutterBottom sx={{ mt: 6 }}>
        Planes de Créditos
      </Typography>
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Plan Básico</Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>10 créditos</Typography>
              <Typography variant="h4" color="primary" sx={{ mb: 3 }}>5€</Typography>
              <Typography>Ideal para comenzar</Typography>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => window.location.href = 'https://buy.stripe.com/14k6oFfXf0xcc1i00x?quantity=10'}
              >
                Comprar
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', position: 'relative', bgcolor: 'primary.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Plan Popular</Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>50 créditos</Typography>
              <Typography variant="h4" color="primary" sx={{ mb: 3 }}>25€</Typography>
              <Typography>El más elegido</Typography>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => window.location.href = 'https://buy.stripe.com/14k6oFfXf0xcc1i00x?quantity=50'}
              >
                Comprar
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Plan Premium</Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>100 créditos</Typography>
              <Typography variant="h4" color="primary" sx={{ mb: 3 }}>50€</Typography>
              <Typography>Mejor valor</Typography>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => window.location.href = 'https://buy.stripe.com/14k6oFfXf0xcc1i00x?quantity=100'}
              >
                Comprar
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Información Importante */}
      <Box sx={{ mt: 6, bgcolor: 'grey.100', p: 3, borderRadius: 2 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          <Info /> Información Importante
        </Typography>
        <ul>
          <li>Recibes 15 créditos gratis al registrarte</li>
          <li>Los créditos no expiran y puedes acumularlos</li>
          <li>Solo se consumen créditos cuando el análisis es exitoso</li>
          <li>Puedes ver tu balance de créditos en la barra superior</li>
          <li>Los créditos son no reembolsables una vez consumidos</li>
        </ul>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Consejo
        </Typography>
        <Typography>
          Usa tus créditos sabiamente. Asegúrate de tener buenas imágenes antes de realizar los análisis para obtener los mejores resultados.
        </Typography>
      </Box>
    </Box>
  );
};

export default CreditsInfo; 