import React from 'react';
import { Container, Typography, Paper, Box, Grid, Button, Alert } from '@mui/material';
import { 
  LocalHospital, 
  Restaurant, 
  Info, 
  Email,
  CheckCircle,
  ShoppingCart
} from '@mui/icons-material';

const CreditsInfo = () => {
  const handleBuyCredits = () => {
    window.location.href = 'https://buy.stripe.com/14k6oFfXf0xcc1i00x';
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
        Sistema de Créditos
      </Typography>

      {/* Alerta importante */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          <strong>¡Importante!</strong> Para la compra de créditos, asegúrate de usar el mismo correo electrónico 
          con el que te registraste en Doctorfy <Email sx={{ verticalAlign: 'middle', ml: 1 }} />
        </Typography>
      </Alert>

      {/* Compra de Créditos */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <Box sx={{
          p: 4,
          border: '2px solid #00ffff',
          borderRadius: 2,
          textAlign: 'center',
          background: 'rgba(0,255,255,0.1)',
          position: 'relative',
        }}>
          <Typography variant="h4" sx={{ color: '#00ffff', mb: 3 }}>
            Compra de Créditos Flexible
          </Typography>
          
          <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
            20 créditos por $12 USD
          </Typography>

          <Typography sx={{ color: 'white', mb: 4 }}>
            En la ventana de pago podrás elegir la cantidad de créditos que necesites.
            Puedes comprar desde 20 créditos en adelante.
          </Typography>

          <Button 
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={handleBuyCredits}
            sx={{
              background: 'linear-gradient(45deg, #00E5FF 30%, #00B8D4 90%)',
              color: 'white',
              px: 4,
              py: 2,
              fontSize: '1.2rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #00B8D4 30%, #00E5FF 90%)',
              }
            }}
          >
            Comprar Créditos
          </Button>
        </Box>
      </Paper>

      {/* Cómo funcionan los créditos */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#00ffff', mb: 3 }}>
          ¿Cómo funcionan los créditos?
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 2,
              bgcolor: 'rgba(0,255,255,0.1)',
              border: '1px solid rgba(0,255,255,0.2)',
              height: '100%'
            }}>
              <LocalHospital sx={{ fontSize: 60, mb: 2, color: '#00ffff' }} />
              <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                Análisis Médico
              </Typography>
              <Typography variant="h3" sx={{ mb: 2, color: '#00ffff' }}>
                5 créditos
              </Typography>
              <Typography sx={{ color: 'white' }}>
                Por cada análisis de estudio médico (radiografías, resonancias, etc.)
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 2,
              bgcolor: 'rgba(0,255,255,0.1)',
              border: '1px solid rgba(0,255,255,0.2)',
              height: '100%'
            }}>
              <Restaurant sx={{ fontSize: 60, mb: 2, color: '#00ffff' }} />
              <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                Análisis Nutricional
              </Typography>
              <Typography variant="h3" sx={{ mb: 2, color: '#00ffff' }}>
                1 crédito
              </Typography>
              <Typography sx={{ color: 'white' }}>
                Por cada análisis de alimentos y contenido nutricional
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: 'rgba(0,255,255,0.05)' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#00ffff' }}>
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            Ventajas del sistema
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography sx={{ color: 'white', mb: 1 }}>
                ✓ Sin suscripción mensual - Pagas solo por los créditos que necesites
              </Typography>
              <Typography sx={{ color: 'white', mb: 1 }}>
                ✓ Recibes 15 créditos gratis al registrarte
              </Typography>
              <Typography sx={{ color: 'white', mb: 1 }}>
                ✓ Los créditos no expiran y puedes acumularlos
              </Typography>
              <Typography sx={{ color: 'white', mb: 1 }}>
                ✓ Solo se consumen créditos cuando el análisis es exitoso
              </Typography>
              <Typography sx={{ color: 'white', mb: 1 }}>
                ✓ Flexibilidad para comprar la cantidad que necesites
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Consejo */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2, 
        bgcolor: 'rgba(0,255,255,0.1)',
        border: '1px solid rgba(0,255,255,0.2)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#00ffff' }}>
          <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
          Consejo
        </Typography>
        <Typography sx={{ color: 'white' }}>
          Asegúrate de tener buenas imágenes antes de realizar los análisis 
          para obtener los mejores resultados y aprovechar al máximo tus créditos.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CreditsInfo; 