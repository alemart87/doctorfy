import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import api from '../api/axios';

const NutritionAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [nutritionalData, setNutritionalData] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen (JPG, PNG)');
        return;
      }
      
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona una imagen');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      console.log('Enviando archivo:', selectedFile.name, selectedFile.type, selectedFile.size);
      
      // Hacer la petición
      const response = await api.post('/nutrition/analyze-food', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Respuesta recibida:', response.data);
      
      // Actualizar el estado con los resultados
      setAnalysis(response.data.analysis);
      setNutritionalData(response.data.nutritional_data);
    } catch (err) {
      console.error('Error al analizar la imagen:', err);
      setError('Error al analizar la imagen. Por favor, intenta con otra imagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analizador Nutricional
        </Typography>
        <Typography variant="body1" paragraph>
          Sube una imagen de alimentos y nuestro sistema de IA analizará su contenido nutricional.
        </Typography>
        
        <Box sx={{ mt: 3, mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="food-image-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="food-image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
            >
              Subir Imagen
            </Button>
          </label>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {preview && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Vista previa:
            </Typography>
            <Box
              component="img"
              src={preview}
              alt="Vista previa"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                objectFit: 'contain'
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analizar'}
            </Button>
          </Box>
        )}
        
        {analysis && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Resultados del Análisis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              {/* Columna Izquierda: Preview y Datos Extraídos */}
              <Grid item xs={12} md={5}>
                 {/* Mostrar preview de nuevo si se quiere */}
                 {preview && (
                   <Card sx={{ mb: 2 }}>
                     <CardContent>
                       <Typography variant="subtitle1" gutterBottom>Imagen Analizada</Typography>
                       <Box
                         component="img"
                         src={preview}
                         alt="Vista previa"
                         sx={{ maxWidth: '100%', maxHeight: 250, objectFit: 'contain', display: 'block', margin: 'auto' }}
                       />
                     </CardContent>
                   </Card>
                 )}
                 {/* Datos Nutricionales Extraídos */}
                 <Card>
                   <CardContent>
                     <Typography variant="h6" gutterBottom>
                       Información Nutricional Estimada
                     </Typography>
                     <Box sx={{ mt: 2 }}>
                       <Typography variant="body1">
                         <strong>Calorías:</strong> {nutritionalData?.calories ?? 'N/A'} kcal
                       </Typography>
                       <Typography variant="body1">
                         <strong>Proteínas:</strong> {nutritionalData?.proteins?.toFixed(1) ?? 'N/A'} g
                       </Typography>
                       <Typography variant="body1">
                         <strong>Carbohidratos:</strong> {nutritionalData?.carbs?.toFixed(1) ?? 'N/A'} g
                       </Typography>
                       <Typography variant="body1">
                         <strong>Grasas:</strong> {nutritionalData?.fats?.toFixed(1) ?? 'N/A'} g
                       </Typography>
                     </Box>
                   </CardContent>
                 </Card>
              </Grid>
              
              {/* Columna Derecha: Análisis Detallado */}
              <Grid item xs={12} md={7}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Análisis Detallado (IA)
                    </Typography>
                    {/* Usar pre-wrap para texto plano o ReactMarkdown */}
                    <Box sx={{ mt: 2, whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto' }}>
                       {analysis}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NutritionAnalyzer; 