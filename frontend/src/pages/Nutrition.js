import React, { useState } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress, Alert, Grid, Card, CardContent } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { nutritionService } from '../services/api';

const Nutrition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    onDrop: acceptedFiles => {
      handleAnalyzeFood(acceptedFiles[0]);
    },
  });

  const handleAnalyzeFood = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setAnalysisResult(null);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await nutritionService.analyzeFood(formData);
      setAnalysisResult(response.data);
    } catch (err) {
      console.error('Error analyzing food:', err);
      setError('Error al analizar la imagen de alimentos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Análisis Nutricional
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Analizar Alimentos
          </Typography>
          
          <Box {...getRootProps()} sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}>
            <input {...getInputProps()} />
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Typography>
                  Arrastra y suelta una imagen de alimentos aquí, o haz clic para seleccionar una imagen
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Formatos aceptados: JPG, PNG
                </Typography>
              </>
            )}
          </Box>
        </Paper>
        
        {analysisResult && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Resultados del Análisis
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información Nutricional
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Calorías:</strong> {analysisResult.nutritional_data.calories} kcal
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Proteínas:</strong> {analysisResult.nutritional_data.proteins}g
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Carbohidratos:</strong> {analysisResult.nutritional_data.carbs}g
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Grasas:</strong> {analysisResult.nutritional_data.fats}g
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Análisis Detallado
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {analysisResult.analysis}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Nutrition; 