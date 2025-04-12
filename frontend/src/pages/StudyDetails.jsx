import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../api/axios';

const StudyDetails = () => {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/medical-studies/${studyId}`);
        setStudy(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar el estudio:', err);
        setError('No se pudo cargar el estudio médico');
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [studyId]);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const response = await api.post(`/medical-studies/${studyId}/analyze`);
      setStudy(response.data);
    } catch (err) {
      console.error('Error al analizar el estudio:', err);
      setError('No se pudo analizar el estudio médico');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando estudio médico...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/medical-studies')}
          sx={{ mt: 2 }}
        >
          Volver a Estudios Médicos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/medical-studies')}
        sx={{ mb: 3 }}
      >
        Volver a Estudios Médicos
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {study.name || `Estudio de ${study.study_type}`}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              <strong>Tipo de estudio:</strong> {study.study_type}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Fecha:</strong> {new Date(study.created_at).toLocaleDateString()}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!study.interpretation && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? <CircularProgress size={24} /> : 'Analizar Estudio'}
              </Button>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          {/* Imagen del estudio */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Imagen del Estudio
                </Typography>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Box
                    component="img"
                    src={`/uploads/${study.file_path}`}
                    alt="Estudio médico"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 500,
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Interpretación */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interpretación
                </Typography>
                {study.interpretation ? (
                  <Box sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                    {study.interpretation}
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No hay interpretación disponible. Haz clic en "Analizar Estudio" para generar una interpretación automática.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudyDetails; 