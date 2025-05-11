import React, { useState } from 'react';
import { Button, Box, Typography, TextField, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Este es un componente placeholder.
// Necesitarás implementar la lógica real de subida de archivos aquí.
const FileUploadComponent = ({ onUploadSuccess, onUploadError, token }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [studyName, setStudyName] = useState('');
  const [fileError, setFileError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    if (event.target.files[0]) {
      setStudyName(event.target.files[0].name.split('.')[0]); // Nombre por defecto sin extensión
    }
    setFileError('');
  };

  const handleStudyNameChange = (event) => {
    setStudyName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setFileError('Por favor, selecciona un archivo.');
      return;
    }
    if (!studyName.trim()) {
      setFileError('Por favor, ingresa un nombre para el estudio.');
      return;
    }

    // Aquí iría tu lógica para subir el archivo al backend
    // Ejemplo:
    // const formData = new FormData();
    // formData.append('file', selectedFile);
    // formData.append('study_name', studyName);
    // try {
    //   const response = await api.post('/medical_studies/upload', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //       'Authorization': `Bearer ${token}` // Si necesitas autenticación
    //     },
    //   });
    //   onUploadSuccess(response.data.message || 'Archivo subido con éxito.');
    //   setSelectedFile(null);
    //   setStudyName('');
    // } catch (error) {
    //   onUploadError(error.response?.data?.error || 'Error al subir el archivo.');
    // }

    // Por ahora, simulamos una subida exitosa
    console.log('Simulando subida de archivo:', selectedFile.name, 'Nombre del estudio:', studyName);
    onUploadSuccess(`Simulación: "${studyName}" subido con éxito.`);
    setSelectedFile(null);
    setStudyName('');
    // O puedes llamar a onUploadError para probar el flujo de error:
    // onUploadError('Simulación: Error al subir el archivo.');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        label="Nombre del Estudio"
        variant="outlined"
        value={studyName}
        onChange={handleStudyNameChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
        sx={{ mb: 1 }}
      >
        Seleccionar Archivo
        <input
          type="file"
          hidden
          onChange={handleFileChange}
          // accept=".pdf,.png,.jpg,.jpeg,.dcm" // Puedes definir los tipos de archivo aceptados
        />
      </Button>
      {selectedFile && <Typography sx={{mb:1, fontStyle: 'italic'}}>{selectedFile.name}</Typography>}
      {fileError && <Alert severity="error" sx={{mb:2}}>{fileError}</Alert>}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!selectedFile || !studyName.trim()}
        sx={{ display: 'block' }}
      >
        Subir Estudio
      </Button>
    </Box>
  );
};

export default FileUploadComponent; 