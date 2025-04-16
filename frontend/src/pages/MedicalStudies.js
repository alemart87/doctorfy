import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Button, Box, Paper, Grid, Card, CardContent, CardActions, CircularProgress, Alert, TextField, MenuItem, Snackbar } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedList from '../components/AnimatedList';
import { FaUpload, FaEye, FaRobot, FaDownload, FaCloudUploadAlt } from 'react-icons/fa';
import '../components/AnimatedList.css';

const MedicalStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [studyType, setStudyType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
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
      showNotification('Estudio subido con éxito', 'success');
    } catch (err) {
      console.error('Error al subir estudio:', err);
      setError('Error al subir el estudio. Por favor, intenta de nuevo.');
      showNotification('Error al subir el estudio', 'error');
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
      showNotification('Analizando estudio con IA...', 'info');
      
      const token = localStorage.getItem('token');
      await axios.post(`/api/medical-studies/studies/${study.id}/analyze`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchStudies();
      showNotification('Estudio analizado correctamente', 'success');
    } catch (err) {
      console.error('Error al analizar estudio:', err);
      setError('Error al analizar el estudio. El servicio puede estar ocupado, por favor intenta más tarde.');
      showNotification('Error al analizar el estudio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStudy = async (study, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      
      // Realizar una solicitud para obtener el archivo
      const response = await axios.get(`/api/medical-studies/studies/${study.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Importante para recibir datos binarios
      });
      
      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear un elemento <a> temporal
      const link = document.createElement('a');
      link.href = url;
      
      // Extraer el nombre del archivo de la ruta
      const fileName = study.file_path.split('/').pop() || `estudio_${study.id}`;
      link.setAttribute('download', fileName);
      
      // Añadir el enlace al documento
      document.body.appendChild(link);
      
      // Simular clic en el enlace
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      showNotification('Descarga iniciada', 'success');
    } catch (error) {
      console.error('Error al descargar el estudio:', error);
      showNotification('Error al descargar el estudio', 'error');
      
      // Intentar método alternativo si falla
      try {
        window.open(`/api/medical-studies/studies/${study.id}/download`, '_blank');
      } catch (fallbackError) {
        console.error('Error en método alternativo de descarga:', fallbackError);
      }
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

  const showNotification = (message, type = 'info') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
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
            onClick={(e) => handleDownloadStudy(study, e)}
            title="Descargar"
          >
            <FaDownload />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="medical-studies-container">
      <div className="medical-studies-header">
        <h1 className="medical-studies-title">Estudios Médicos</h1>
        <p className="medical-studies-subtitle">
          Sube, visualiza y analiza tus estudios médicos
        </p>
      </div>
      
      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}
      
      <div 
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-icon">
          <FaCloudUploadAlt />
        </div>
        <h3 className="upload-text">Arrastra y suelta un archivo aquí, o haz clic para seleccionar un archivo</h3>
        <p className="upload-formats">Formatos aceptados: JPG, PNG, TXT, PDF</p>
        
        <input 
          type="file" 
          id="file-upload" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
          accept=".jpg,.jpeg,.png,.pdf,.txt"
        />
        
        <label htmlFor="file-upload" className="upload-button">
          Seleccionar archivo
        </label>
        
        {selectedFile && (
          <div className="selected-file-container">
            <p className="selected-file-name">Archivo seleccionado: {selectedFile.name}</p>
            
            <div className="study-type-selector">
              <label htmlFor="study-type">
                Tipo de estudio:
              </label>
              <select 
                id="study-type" 
                value={studyType} 
                onChange={(e) => setStudyType(e.target.value)}
                className="study-type-select"
              >
                <option value="general">General</option>
                <option value="xray">Radiografía</option>
                <option value="mri">Resonancia Magnética</option>
                <option value="ct">Tomografía Computarizada</option>
                <option value="ultrasound">Ecografía</option>
                <option value="bloodwork">Análisis de Sangre</option>
              </select>
            </div>
            
            <button 
              onClick={handleUpload} 
              className="upload-submit-button"
              disabled={uploading}
            >
              {uploading ? (
                <div className="upload-progress">
                  <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  <span className="upload-progress-text">{uploadProgress}%</span>
                </div>
              ) : (
                <>
                  <FaUpload className="button-icon" />
                  <span>Subir estudio</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <h2 className="studies-section-title">Mis Estudios</h2>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando estudios...</p>
        </div>
      ) : studies.length > 0 ? (
        <AnimatedList
          items={studies}
          onItemSelect={handleViewStudy}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
          renderItem={renderStudyItem}
          className="studies-list"
        />
      ) : (
        <div className="no-studies-message">
          <p>No hay estudios médicos disponibles. Sube tu primer estudio.</p>
        </div>
      )}
      
      {/* Notificación */}
      {notification.open && (
        <div className={`notification ${notification.type}`}>
          <p>{notification.message}</p>
          <button onClick={handleCloseNotification} className="notification-close">×</button>
        </div>
      )}
    </div>
  );
};

export default MedicalStudies; 