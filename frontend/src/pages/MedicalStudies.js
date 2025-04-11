import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Paper, Grid, Card, CardContent, CardActions, CircularProgress, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { medicalStudiesService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MedicalStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    onDrop: acceptedFiles => {
      handleUpload(acceptedFiles[0]);
    },
  });

  useEffect(() => {
    loadStudies();
  }, []);

  const loadStudies = async () => {
    try {
      setLoading(true);
      const response = await medicalStudiesService.getStudies();
      setStudies(response.data.studies);
      setError(null);
    } catch (err) {
      console.error('Error loading studies:', err);
      setError('Error al cargar los estudios médicos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('study_type', 'general');

      const response = await medicalStudiesService.uploadStudy(formData);
      setUploadSuccess(true);
      
      // Recargar la lista de estudios
      loadStudies();
      
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error uploading study:', err);
      setError('Error al subir el estudio médico');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewStudy = (studyId) => {
    navigate(`/medical-studies/${studyId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Estudios Médicos
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {uploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>Estudio subido exitosamente</Alert>}
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Subir Nuevo Estudio
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
            {uploadLoading ? (
              <CircularProgress />
            ) : (
              <>
                <Typography>
                  Arrastra y suelta un archivo aquí, o haz clic para seleccionar un archivo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Formatos aceptados: JPG, PNG, TXT, PDF
                </Typography>
              </>
            )}
          </Box>
        </Paper>
        
        <Typography variant="h5" gutterBottom>
          Mis Estudios
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : studies.length === 0 ? (
          <Alert severity="info">No tienes estudios médicos subidos</Alert>
        ) : (
          <Grid container spacing={3}>
            {studies.map((study) => (
              <Grid item xs={12} sm={6} md={4} key={study.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {study.study_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha: {new Date(study.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estado: {study.has_interpretation ? 'Interpretado' : 'Pendiente de interpretación'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleViewStudy(study.id)}>
                      Ver Detalles
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default MedicalStudies; 