import React, { useState, useRef } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { medicalStudiesService } from '../services/api';

const MedicalStudyUploader = ({ open, onClose, onSuccess, study = null }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [studyName, setStudyName] = useState(study?.name || '');
  const [studyType, setStudyType] = useState(study?.study_type || 'general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const studyTypes = [
    { value: 'general', label: 'General' },
    { value: 'xray', label: 'Radiografía' },
    { value: 'mri', label: 'Resonancia Magnética' },
    { value: 'ct', label: 'Tomografía' },
    { value: 'ultrasound', label: 'Ecografía' },
    { value: 'ekg', label: 'Electrocardiograma' },
    { value: 'lab', label: 'Análisis' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
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
      setError('No se pudo acceder a la cámara');
      setCameraOpen(false);
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setFile(file);
        setPreview(URL.createObjectURL(blob));
        handleCloseCamera();
      }, 'image/jpeg');
    }
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!file && !study) {
        setError('Por favor seleccione un archivo');
        return;
      }

      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('study_type', studyType);
      formData.append('name', studyName);

      let response;
      if (study) {
        response = await medicalStudiesService.updateStudy(study.id, formData);
      } else {
        response = await medicalStudiesService.uploadStudy(formData);
      }

      onSuccess(response.data.study);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el estudio');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setStudyName('');
    setStudyType('general');
    setError(null);
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {study ? 'Editar Estudio' : 'Nuevo Estudio'}
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Nombre del estudio"
            value={studyName}
            onChange={(e) => setStudyName(e.target.value)}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de estudio</InputLabel>
            <Select
              value={studyType}
              onChange={(e) => setStudyType(e.target.value)}
              label="Tipo de estudio"
            >
              {studyTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!study && (
            <Box 
              sx={{ 
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box 
                sx={{ 
                  width: '100%',
                  height: 200,
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <Typography color="textSecondary">
                    Haga clic o arrastre un archivo aquí
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar archivo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CameraIcon />}
                  onClick={handleOpenCamera}
                >
                  Tomar foto
                </Button>
              </Box>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                style={{ display: 'none' }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Procesando...' : (study ? 'Guardar cambios' : 'Subir estudio')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cameraOpen} onClose={handleCloseCamera} maxWidth="md" fullWidth>
        <DialogTitle>
          Tomar foto
          <IconButton
            onClick={handleCloseCamera}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <video
            ref={videoRef}
            autoPlay
            style={{ width: '100%', maxHeight: '70vh' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCamera}>Cancelar</Button>
          <Button onClick={handleTakePhoto} variant="contained">
            Capturar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MedicalStudyUploader; 