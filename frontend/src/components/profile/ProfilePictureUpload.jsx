import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };
  
  const handleSubmit = () => {
    if (!selectedFile) {
      setError('Por favor, selecciona una imagen');
      return;
    }
    
    setLoading(true);
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    onSave(formData)
      .finally(() => {
        setLoading(false);
        // Limpiar el estado al cerrar
        setSelectedFile(null);
        setPreview(null);
        setError(null);
      });
  };
  
  const handleClose = () => {
    // Limpiar el estado al cerrar
    setSelectedFile(null);
    setPreview(null);
    setError(null);
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
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!selectedFile || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfilePictureUpload; 