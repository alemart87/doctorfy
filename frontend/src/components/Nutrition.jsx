import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress, 
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { nutritionService } from '../services/api';

const Nutrition = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [nutritionalData, setNutritionalData] = useState({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Por favor, selecciona una imagen primero');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await nutritionService.analyzeFood(formData);
      console.log('Respuesta del análisis:', response.data);
      
      setAnalysis(response.data.analysis);
      
      // Asegurarse de que nutritionalData existe antes de acceder a sus propiedades
      if (response.data.nutritionalData) {
        setNutritionalData(response.data.nutritionalData);
      } else {
        console.warn('No se recibieron datos nutricionales en la respuesta');
        // Mantener los valores por defecto
      }
    } catch (err) {
      console.error('Error al analizar imagen:', err);
      setError('Error al analizar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Análisis Nutricional
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sube una imagen de tu comida para analizarla
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="food-image-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="food-image-upload">
            <Button variant="contained" component="span">
              Seleccionar Imagen
            </Button>
          </label>
          
          {preview && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img 
                src={preview} 
                alt="Vista previa" 
                style={{ maxWidth: '100%', maxHeight: '300px' }} 
              />
            </Box>
          )}
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAnalyze}
          disabled={!file || loading}
          sx={{ mb: 3 }}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Analizando...
            </>
          ) : 'Analizar'}
        </Button>
        
        {analysis && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información Nutricional
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Calorías:</Typography>
                    <Typography><strong>{nutritionalData?.calories || 0} kcal</strong></Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Proteínas:</Typography>
                    <Typography><strong>{nutritionalData?.proteins || 0} g</strong></Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Carbohidratos:</Typography>
                    <Typography><strong>{nutritionalData?.carbs || 0} g</strong></Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Grasas:</Typography>
                    <Typography><strong>{nutritionalData?.fats || 0} g</strong></Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Análisis Detallado
                  </Typography>
                  <Typography variant="body2" component="div">
                    {analysis.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Nutrition; 