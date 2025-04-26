import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const ProfilePictureUpload = ({ open, onClose, onSave }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const fileInputRef = React.useRef(null);
  
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objUrl = URL.createObjectURL(selectedFile);
    setPreview(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [selectedFile]);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona una imagen');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Subir la imagen y cerrar inmediatamente
      await onSave(formData);
      handleClose();
      
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setError('Error al subir la imagen. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploadStatus('idle');
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cambiar Foto de Perfil</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {uploadStatus === 'uploading' && (
            <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
              Subiendo imagen...
            </Alert>
          )}
          
          {uploadStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              ¡Imagen actualizada con éxito!
            </Alert>
          )}
          
          {preview ? (
            <Box 
              sx={{ 
                width: 200, 
                height: 200, 
                borderRadius: '50%', 
                overflow: 'hidden',
                mb: 2,
                border: '1px solid #ccc'
              }}
            >
              <img 
                src={preview} 
                alt="Vista previa" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </Box>
          ) : (
            <Box 
              sx={{ 
                width: 200, 
                height: 200, 
                borderRadius: '50%', 
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                border: '1px solid #ccc'
              }}
            >
              <PhotoCamera sx={{ fontSize: 60, color: '#aaa' }} />
            </Box>
          )}
          
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current.click()}
            startIcon={<PhotoCamera />}
            sx={{ mt: 2 }}
          >
            Seleccionar Imagen
          </Button>
          
          <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
            Formatos aceptados: JPG, PNG, GIF
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={uploadStatus === 'uploading'}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!selectedFile || loading}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Subiendo...
            </Box>
          ) : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfilePictureUpload; 