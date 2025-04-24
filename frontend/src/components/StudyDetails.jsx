import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  TextField,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { medicalStudiesService } from '../services/api';

const StudyDetails = () => {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interpretation, setInterpretation] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Estados para el diálogo de renombrar
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [renamingStudy, setRenamingStudy] = useState(false);
  
  // Tipos de estudio disponibles
  const studyTypes = [
    { value: 'general', label: 'General' },
    { value: 'xray', label: 'Radiografía' },
    { value: 'mri', label: 'Resonancia Magnética' },
    { value: 'ct', label: 'Tomografía Computarizada' },
    { value: 'ultrasound', label: 'Ecografía' },
    { value: 'ekg', label: 'Electrocardiograma' },
    { value: 'lab', label: 'Análisis de Laboratorio' }
  ];
  
  const fetchStudyDetails = async () => {
    try {
      setLoading(true);
      const response = await medicalStudiesService.getStudyDetails(studyId);
      console.log('Detalles del estudio recibidos:', response.data);
      setStudy(response.data);
      if (response.data.interpretation) {
        setInterpretation(response.data.interpretation);
      }
      // Inicializar los valores para el renombrado
      setNewName(response.data.name || '');
      setNewType(response.data.study_type || 'general');
    } catch (err) {
      console.error('Error al cargar detalles del estudio:', err);
      setError('Error al cargar los detalles del estudio');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStudyDetails();
  }, [studyId]);
  
  const handleAnalyzeStudy = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      console.log('Solicitando análisis para el estudio:', studyId);
      const response = await medicalStudiesService.interpretStudy(studyId);
      console.log('Respuesta del análisis:', response.data);
      
      // Actualizar el estado con la nueva interpretación
      const newInterpretation = response.data.study.interpretation || 'No se pudo generar una interpretación automática.';
      setInterpretation(newInterpretation);
      
      // Actualizar el objeto study completo
      setStudy(prevStudy => ({
        ...prevStudy, 
        interpretation: newInterpretation
      }));
      
      setSuccess(true);
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al analizar estudio:', err);
      setError('Error al analizar el estudio médico: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(false);
    }
  };
  
  const handleSaveInterpretation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Guardando interpretación para el estudio:', studyId);
      const response = await medicalStudiesService.interpretStudy(studyId, interpretation);
      console.log('Respuesta al guardar interpretación:', response.data);
      
      setStudy({...study, interpretation: response.data.study.interpretation});
      setSuccess(true);
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar interpretación:', err);
      setError('Error al guardar la interpretación: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenRenameDialog = () => {
    setNewName(study.name || '');
    setNewType(study.study_type || 'general');
    setRenameDialogOpen(true);
  };
  
  const handleCloseRenameDialog = () => {
    setRenameDialogOpen(false);
    setError(null);
  };
  
  const handleRenameStudy = async () => {
    try {
      setRenamingStudy(true);
      setError(null);
      
      const response = await medicalStudiesService.renameStudy(studyId, {
        name: newName,
        study_type: newType
      });
      
      console.log('Estudio renombrado:', response.data);
      
      // Actualizar el estudio en el estado
      setStudy(response.data.study);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Cerrar el diálogo
      handleCloseRenameDialog();
    } catch (err) {
      console.error('Error al renombrar estudio:', err);
      setError('Error al renombrar el estudio: ' + (err.response?.data?.error || err.message));
    } finally {
      setRenamingStudy(false);
    }
  };
  
  if (loading && !study) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (!study) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Estudio no encontrado</Alert>
        <Button 
          variant="contained" 
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
        variant="outlined" 
        onClick={() => navigate('/medical-studies')}
        sx={{ mb: 2 }}
      >
        Volver a Estudios Médicos
      </Button>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Estudio actualizado con éxito</Alert>}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            {study.name || `Estudio ${study.study_type}`}
          </Typography>
          <IconButton 
            onClick={handleOpenRenameDialog}
            color="primary"
            title="Renombrar estudio"
          >
            <EditIcon />
          </IconButton>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Tipo: {studyTypes.find(t => t.value === study.study_type)?.label || study.study_type}
        </Typography>
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Fecha: {new Date(study.created_at).toLocaleDateString()}
        </Typography>
        
        {study.patient_email && (
          <Typography variant="subtitle1">
            <strong>Paciente:</strong> {study.patient_email}
          </Typography>
        )}
        
        <Card sx={{ mb: 3 }}>
          <CardMedia
            component="img"
            image={`/uploads/${study.file_path}`}
            alt="Imagen del estudio médico"
            sx={{ 
              maxHeight: '500px', 
              objectFit: 'contain',
              backgroundColor: '#f5f5f5'
            }}
          />
        </Card>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Interpretación
        </Typography>
        
        {user && user.is_doctor ? (
          <>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              placeholder="Escriba su interpretación del estudio..."
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleSaveInterpretation}
                disabled={loading}
              >
                Guardar Interpretación
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={handleAnalyzeStudy}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Analizando...
                  </>
                ) : 'Analizar con IA'}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', mb: 3 }}>
              {study.interpretation ? (
                <Typography 
                  variant="body1" 
                  component="div" 
                  sx={{ 
                    whiteSpace: 'pre-line',
                    '& p': { marginBottom: '0.5em' },
                    '& ol, & ul': { paddingLeft: '1.5em', marginBottom: '0.5em' }
                  }}
                >
                  {study.interpretation}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Pendiente de interpretación. Puedes solicitar un análisis automático con IA o buscar un médico para una interpretación profesional.
                </Typography>
              )}
            </Paper>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button 
                variant="contained" 
                onClick={handleAnalyzeStudy}
                disabled={analyzing}
                color="primary"
              >
                {analyzing ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Analizando...
                  </>
                ) : 'Analizar con IA'}
              </Button>
              
              <Button 
                variant="outlined"
                component={Link}
                to="/doctors"
                color="secondary"
              >
                Buscar un Médico
              </Button>
            </Box>
          </>
        )}
      </Paper>
      
      {/* Diálogo para renombrar el estudio */}
      <Dialog open={renameDialogOpen} onClose={handleCloseRenameDialog}>
        <DialogTitle>Renombrar Estudio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre del estudio"
            type="text"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel id="study-type-label">Tipo de Estudio</InputLabel>
            <Select
              labelId="study-type-label"
              id="study-type"
              value={newType}
              label="Tipo de Estudio"
              onChange={(e) => setNewType(e.target.value)}
            >
              {studyTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRenameDialog}>Cancelar</Button>
          <Button 
            onClick={handleRenameStudy} 
            disabled={renamingStudy}
            variant="contained"
          >
            {renamingStudy ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudyDetails; 