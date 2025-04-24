import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress, Alert, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { medicalStudiesService } from '../services/api';

const StudyDetails = () => {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudyDetails();
  }, [studyId]);

  const loadStudyDetails = async () => {
    try {
      setLoading(true);
      const response = await medicalStudiesService.getStudyDetails(studyId);
      setStudy(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading study details:', err);
      setError('Error al cargar los detalles del estudio');
    } finally {
      setLoading(false);
    }
  };

  const handleInterpret = async () => {
    try {
      setInterpretLoading(true);
      const response = await medicalStudiesService.interpretStudy(studyId);
      setStudy({ ...study, interpretation: response.data.interpretation });
      setError(null);
    } catch (err) {
      console.error('Error interpreting study:', err);
      setError('Error al interpretar el estudio');
    } finally {
      setInterpretLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!study) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">No se encontró el estudio</Alert>
        <Button variant="contained" onClick={() => navigate('/medical-studies')} sx={{ mt: 2 }}>
          Volver a Estudios
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/medical-studies')} sx={{ mb: 2 }}>
          Volver a Estudios
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Detalles del Estudio
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Información General
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>Tipo de estudio:</strong> {study.study_type}
            </Typography>
            <Typography variant="body1">
              <strong>Fecha:</strong> {new Date(study.created_at).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Interpretación
          </Typography>
          
          {study.interpretation ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {study.interpretation}
            </Typography>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Este estudio aún no ha sido interpretado
              </Alert>
              <Button 
                variant="contained" 
                onClick={handleInterpret}
                disabled={interpretLoading}
              >
                {interpretLoading ? 'Interpretando...' : 'Interpretar Estudio'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default StudyDetails; 