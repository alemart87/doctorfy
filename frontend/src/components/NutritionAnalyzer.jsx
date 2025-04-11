import React, { useState, useRef } from 'react';
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
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { nutritionService } from '../services/api';

const NutritionAnalyzer = () => {
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
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleOpenCamera = async () => {
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      setCameraOpen(false);
    }
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convertir a blob
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        setFile(file);
        setPreview(URL.createObjectURL(blob));
        setAnalysis(null);
        setError(null);
        handleCloseCamera();
      }, 'image/jpeg', 0.95);
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
      
      console.log('Enviando imagen para análisis...');
      const response = await nutritionService.analyzeFood(formData);
      console.log('Respuesta del análisis:', response.data);
      
      setAnalysis(response.data.analysis);
      
      // Asegurarse de que nutritionalData existe antes de acceder a sus propiedades
      if (response.data.nutritionalData) {
        console.log('Datos nutricionales recibidos:', response.data.nutritionalData);
        setNutritionalData({
          calories: response.data.nutritionalData.calories || 0,
          proteins: response.data.nutritionalData.proteins || 0,
          carbs: response.data.nutritionalData.carbs || 0,
          fats: response.data.nutritionalData.fats || 0
        });
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
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
          
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<PhotoCamera />}
            onClick={handleOpenCamera}
          >
            Tomar Foto
          </Button>
          
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
                    <Typography><strong>{nutritionalData.calories} kcal</strong></Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Proteínas:</Typography>
                    <Typography><strong>{nutritionalData.proteins} g</strong></Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Carbohidratos:</Typography>
                    <Typography><strong>{nutritionalData.carbs} g</strong></Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Grasas:</Typography>
                    <Typography><strong>{nutritionalData.fats} g</strong></Typography>
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
      
      {/* Diálogo para la cámara */}
      <Dialog 
        open={cameraOpen} 
        onClose={handleCloseCamera}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton 
            onClick={handleCloseCamera}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <Close />
          </IconButton>
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: 'auto', maxHeight: '70vh' }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleTakePhoto}
            startIcon={<PhotoCamera />}
          >
            Capturar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NutritionAnalyzer; 