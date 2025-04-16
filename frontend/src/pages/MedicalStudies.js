import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Button, Box, Paper, Grid, Card, CardContent, CardActions, CircularProgress, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { medicalStudiesService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedList from '../components/AnimatedList';
import { FaUpload, FaEye, FaRobot, FaDownload } from 'react-icons/fa';
import '../components/AnimatedList.css';

const MedicalStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [studyType, setStudyType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    onDrop: acceptedFiles => {
      setSelectedFile(acceptedFiles[0]);
    },
  });

  const fetchStudies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/medical-studies/studies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudies(response.data.studies);
      setError(null);
    } catch (err) {
      console.error('Error al obtener estudios:', err);
      setError('No se pudieron cargar los estudios médicos. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('study_type', studyType);

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const token = localStorage.getItem('token');
      await axios.post('/api/medical-studies/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setSelectedFile(null);
      setStudyType('general');
      fetchStudies();
    } catch (err) {
      console.error('Error al subir estudio:', err);
      setError('Error al subir el estudio. Por favor, intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewStudy = (study) => {
    navigate(`/medical-studies/${study.id}`);
  };

  const handleAnalyzeStudy = async (study) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/medical-studies/studies/${study.id}/analyze`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudies();
    } catch (err) {
      console.error('Error al analizar estudio:', err);
      setError('Error al analizar el estudio. El servicio puede estar ocupado, por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStudyItem = (study, index, isSelected) => {
    const isPending = !study.interpretation || study.interpretation.trim() === '';
    
    return (
      <div className="study-item">
        <div className="study-info">
          <div className="study-type">{study.study_type}</div>
          <div className="study-date">{formatDate(study.created_at)}</div>
          <div className={`study-status ${isPending ? 'status-pending' : 'status-completed'}`}>
            {isPending ? 'Pendiente de interpretación' : 'Interpretado'}
          </div>
        </div>
        <div className="study-actions">
          <button 
            className="action-button" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewStudy(study);
            }}
            title="Ver detalles"
          >
            <FaEye />
          </button>
          {isPending && (
            <button 
              className="action-button" 
              onClick={(e) => {
                e.stopPropagation();
                handleAnalyzeStudy(study);
              }}
              title="Analizar con IA"
            >
              <FaRobot />
            </button>
          )}
          <button 
            className="action-button" 
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/api/medical-studies/download/${study.id}`, '_blank');
            }}
            title="Descargar"
          >
            <FaDownload />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Estudios Médicos
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
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
            {selectedFile ? (
              <Typography>
                Archivo seleccionado: {selectedFile.name}
              </Typography>
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
          <AnimatedList
            items={studies}
            onItemSelect={handleViewStudy}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={true}
            renderItem={renderStudyItem}
            className="studies-list"
          />
        )}
      </Box>
    </Container>
  );
};

export default MedicalStudies; 