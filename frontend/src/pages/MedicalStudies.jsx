import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Button, 
  TextField,
  InputAdornment,
  Fade,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import MedicalStudyUploader from '../components/MedicalStudyUploader';
import { medicalStudiesService } from '../services/api';
import config from '../config';
import './MedicalStudies.css'; // Asegúrate de crear este archivo

const MedicalStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [processingStudies, setProcessingStudies] = useState({});

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const response = await medicalStudiesService.getStudies();
      setStudies(response.data.studies);
    } catch (err) {
      setError('Error al cargar los estudios médicos');
      console.error('Error fetching studies:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudies = studies.filter(study => 
    (study.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    study.study_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadSuccess = (updatedStudy) => {
    setUploadDialogOpen(false);
    setSelectedStudy(null);
    if (updatedStudy.id) {
      setStudies(studies.map(study => 
        study.id === updatedStudy.id ? updatedStudy : study
      ));
    } else {
      setStudies([updatedStudy, ...studies]);
    }
  };

  const handleEdit = (study) => {
    setSelectedStudy(study);
    setUploadDialogOpen(true);
  };

  const handleView = (study) => {
    // Construir la URL completa del archivo
    const fileUrl = study.file_path 
      ? `${config.API_URL}/media/${study.file_path}`
      : null;
    
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      alert('No se puede visualizar este estudio. Archivo no disponible.');
    }
  };

  const handleDownload = (study) => {
    // Construir la URL completa del archivo
    const fileUrl = study.file_path 
      ? `${config.API_URL}/media/${study.file_path}`
      : null;
    
    if (fileUrl) {
      // Crear un enlace temporal y simular clic para descargar
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = study.name || `estudio-${study.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No se puede descargar este estudio. Archivo no disponible.');
    }
  };

  const handleAnalyze = async (study) => {
    if (!study.file_path || processingStudies[study.id]) {
      return; // No analizar si no hay archivo o ya está en proceso
    }

    try {
      // Marcar como procesando
      setProcessingStudies(prev => ({ ...prev, [study.id]: true }));
      
      // Actualizar el estudio en la UI para mostrar "procesando"
      setStudies(studies.map(s => 
        s.id === study.id ? { ...s, analysis_status: 'processing' } : s
      ));
      
      // Llamar a la API para analizar
      const response = await medicalStudiesService.analyzeStudy(study.id);
      
      // Actualizar el estudio con el resultado
      if (response.data && response.data.study) {
        setStudies(studies.map(s => 
          s.id === study.id ? response.data.study : s
        ));
      }
    } catch (err) {
      console.error('Error analyzing study:', err);
      // Restaurar el estado anterior en caso de error
      setStudies(studies.map(s => 
        s.id === study.id ? { ...s, analysis_status: 'failed' } : s
      ));
      alert('Error al analizar el estudio. Por favor, intente nuevamente.');
    } finally {
      // Quitar el estado de procesamiento
      setProcessingStudies(prev => {
        const newState = { ...prev };
        delete newState[study.id];
        return newState;
      });
    }
  };

  // Renderizar tarjeta de estudio directamente en este componente
  const renderStudyCard = (study) => {
    return (
      <div className="study-card">
        <div className="study-card-header">
          <h3>{study.name || `Estudio ${study.study_type}`}</h3>
          <span className="study-date">
            {new Date(study.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="study-card-content">
          <div className="study-type-badge">
            {study.study_type}
          </div>
          
          {study.interpretation && (
            <div className="study-status-badge interpreted">
              Interpretado
            </div>
          )}
        </div>
        
        {/* BOTONES RESPONSIVOS */}
        <div className="study-item-actions">
          <button 
            className="mobile-visible-button edit-button"
            onClick={() => handleEdit(study)}
            aria-label="Editar estudio"
          >
            <EditIcon fontSize="small" />
          </button>
          
          <button 
            className="mobile-visible-button view-button"
            onClick={() => handleView(study)}
            aria-label="Ver estudio"
          >
            <VisibilityIcon fontSize="small" />
          </button>
          
          <button 
            className="mobile-visible-button download-button"
            onClick={() => handleDownload(study)}
            aria-label="Descargar estudio"
          >
            <DownloadIcon fontSize="small" />
          </button>
          
          <button 
            className="mobile-visible-button analyze-button"
            onClick={() => handleAnalyze(study)}
            disabled={study.analysis_status === 'processing' || !study.file_path}
            aria-label="Analizar estudio"
          >
            <AnalyticsIcon fontSize="small" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Mis Estudios
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedStudy(null);
              setUploadDialogOpen(true);
            }}
          >
            Nuevo Estudio
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar estudios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredStudies.length > 0 ? (
        <div className="studies-grid">
          {filteredStudies.map((study) => (
            <Fade in timeout={300} key={study.id}>
              <div>
                {renderStudyCard(study)}
              </div>
            </Fade>
          ))}
        </div>
      ) : (
        <Alert severity="info">
          No se encontraron estudios médicos. 
          {searchTerm ? ' Intenta con otros términos de búsqueda.' : ''}
        </Alert>
      )}

      <MedicalStudyUploader
        open={uploadDialogOpen}
        onClose={() => {
          setUploadDialogOpen(false);
          setSelectedStudy(null);
        }}
        onSuccess={handleUploadSuccess}
        study={selectedStudy}
      />
    </Container>
  );
};

export default MedicalStudies; 