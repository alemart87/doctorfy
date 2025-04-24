import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const CredentialDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    institution: '',
    year: '',
    description: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar que sea un archivo permitido
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Por favor, selecciona un archivo de imagen (JPG, PNG, GIF) o PDF');
        return;
      }
      
      setSelectedFile(file);
      
      // Crear vista previa si es una imagen
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
      
      setError(null);
    }
  };
  
  const validateForm = () => {
    if (!formData.title) {
      setError('El título es requerido');
      return false;
    }
    
    if (!formData.institution) {
      setError('La institución es requerida');
      return false;
    }
    
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      setLoading(true);
      
      // Crear FormData para enviar el archivo y los datos
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('title', formData.title);
      data.append('institution', formData.institution);
      
      if (formData.year) {
        data.append('year', formData.year);
      }
      
      if (formData.description) {
        data.append('description', formData.description);
      }
      
      onSave(data)
        .catch(err => {
          console.error('Error al guardar credencial:', err);
          setError('Error al guardar la credencial');
          setLoading(false);
        });
    }
  };
  
  const handleClose = () => {
    // Limpiar el estado al cerrar
    setFormData({
      title: '',
      institution: '',
      year: '',
      description: ''
    });
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Agregar Credencial</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="Ej: Título de Médico, Especialización en Cardiología"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Institución"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="Ej: Universidad Nacional de Asunción"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Año"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              margin="normal"
              placeholder="Ej: 2015"
              InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Descripción adicional sobre esta credencial..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ border: '1px dashed #ccc', p: 3, borderRadius: 1, textAlign: 'center' }}>
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id="credential-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="credential-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Subir Documento
                </Button>
              </label>
              
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Formatos aceptados: JPG, PNG, GIF, PDF
              </Typography>
              
              {selectedFile && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Archivo seleccionado: {selectedFile.name}
                  </Typography>
                  
                  {preview && (
                    <Box sx={{ mt: 2, maxWidth: '100%', maxHeight: 200, overflow: 'hidden' }}>
                      <img 
                        src={preview} 
                        alt="Vista previa" 
                        style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} 
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CredentialDialog; 