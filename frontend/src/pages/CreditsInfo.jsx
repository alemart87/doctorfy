import React from 'react';
import { Container, Typography, Paper, Box, Grid, Divider } from '@mui/material';
import { LocalHospital, Restaurant, Info, AccountBalanceWallet } from '@mui/icons-material';

const CreditsInfo = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
        Sistema de Créditos
      </Typography>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            ¿Cómo funcionan los créditos?
          </Typography>
          <Typography variant="body1" paragraph>
            Los créditos son la moneda del sistema que te permite realizar análisis de estudios médicos y alimentos. 
            Cada tipo de análisis consume una cantidad específica de créditos.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 2,
              bgcolor: 'primary.dark',
              color: 'white'
            }}>
              <LocalHospital sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>Análisis Médico</Typography>
              <Typography variant="h3" sx={{ mb: 2, color: '#00ffff' }}>
                5 créditos
              </Typography>
              <Typography>
                Por cada análisis de estudio médico (radiografías, resonancias, etc.)
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 2,
              bgcolor: 'secondary.dark',
              color: 'white'
            }}>
              <Restaurant sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>Análisis Nutricional</Typography>
              <Typography variant="h3" sx={{ mb: 2, color: '#00ffff' }}>
                1 crédito
              </Typography>
              <Typography>
                Por cada análisis de alimentos y contenido nutricional
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Información Importante
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" sx={{ mb: 1 }}>
              Recibes <strong>15 créditos gratis</strong> al registrarte
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              Los créditos no expiran y puedes acumularlos
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              Solo se consumen créditos cuando el análisis es exitoso
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              Puedes ver tu balance de créditos en la barra superior
            </Typography>
            <Typography component="li">
              Los créditos son no reembolsables una vez consumidos
            </Typography>
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'info.main', p: 3, borderRadius: 2, color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            Consejo
          </Typography>
          <Typography>
            Usa tus créditos sabiamente. Asegúrate de tener buenas imágenes antes de realizar los análisis 
            para obtener los mejores resultados.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreditsInfo; 