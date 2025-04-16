import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaDownload, FaRobot, FaEdit } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import '../components/AnimatedList.css';

const StudyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchStudyDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/medical-studies/studies/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudy(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener detalles del estudio:', err);
        setError('No se pudo cargar el estudio. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudyDetails();
  }, [id]);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Realizar una solicitud para obtener el archivo
      const response = await axios.get(`/api/medical-studies/studies/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear un elemento <a> temporal
      const link = document.createElement('a');
      link.href = url;
      
      // Extraer el nombre del archivo de la ruta
      const fileName = study.file_path.split('/').pop() || `estudio_${id}`;
      link.setAttribute('download', fileName);
      
      // Añadir el enlace al documento
      document.body.appendChild(link);
      
      // Simular clic en el enlace
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el estudio:', error);
      
      // Intentar método alternativo si falla
      try {
        window.open(`/api/medical-studies/studies/${id}/download`, '_blank');
      } catch (fallbackError) {
        console.error('Error en método alternativo de descarga:', fallbackError);
      }
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/medical-studies/studies/${id}/analyze`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recargar los detalles del estudio
      const response = await axios.get(`/api/medical-studies/studies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudy(response.data);
    } catch (err) {
      console.error('Error al analizar estudio:', err);
      setError('Error al analizar el estudio. El servicio puede estar ocupado, por favor intenta más tarde.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Determinar el icono según el tipo de estudio
  const getStudyTypeIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'xray': return '🔬';
      case 'mri': return '🧠';
      case 'ct': return '🔄';
      case 'ultrasound': return '🔊';
      case 'bloodwork': return '🩸';
      default: return '📋';
    }
  };
  
  // Obtener un color según el tipo de estudio
  const getStudyTypeColor = (type) => {
    switch(type.toLowerCase()) {
      case 'xray': return '#3498db';
      case 'mri': return '#9b59b6';
      case 'ct': return '#e74c3c';
      case 'ultrasound': return '#2ecc71';
      case 'bloodwork': return '#e67e22';
      default: return '#4a90e2';
    }
  };
  
  // Traducir el tipo de estudio a español
  const getStudyTypeName = (type) => {
    switch(type.toLowerCase()) {
      case 'xray': return 'Radiografía';
      case 'mri': return 'Resonancia Magnética';
      case 'ct': return 'Tomografía Computarizada';
      case 'ultrasound': return 'Ecografía';
      case 'bloodwork': return 'Análisis de Sangre';
      default: return 'General';
    }
  };

  // Formatear fecha
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

  // Determinar si es una imagen
  const isImage = (filePath) => {
    if (!filePath) return false;
    const ext = filePath.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  if (loading) {
    return (
      <div className="study-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando detalles del estudio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="study-detail-container">
        <div className="error-alert">
          <p>{error}</p>
        </div>
        <button 
          className="study-detail-back-button"
          onClick={() => navigate('/medical-studies')}
        >
          <FaArrowLeft /> Volver a estudios
        </button>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="study-detail-container">
        <div className="error-alert">
          <p>No se encontró el estudio solicitado.</p>
        </div>
        <button 
          className="study-detail-back-button"
          onClick={() => navigate('/medical-studies')}
        >
          <FaArrowLeft /> Volver a estudios
        </button>
      </div>
    );
  }

  const isPending = !study.interpretation || study.interpretation.trim() === '';
  const studyTypeColor = getStudyTypeColor(study.study_type);

  return (
    <div className="study-detail-container">
      <button 
        className="study-detail-back-button"
        onClick={() => navigate('/medical-studies')}
      >
        <FaArrowLeft /> Volver a estudios
      </button>
      
      <div className="study-detail-header">
        <h1 className="study-detail-title">
          {getStudyTypeIcon(study.study_type)}
          {study.name || `Estudio #${study.id}`}
          <span 
            className="study-detail-type-badge" 
            style={{backgroundColor: studyTypeColor}}
          >
            {getStudyTypeName(study.study_type)}
          </span>
        </h1>
        
        <div className="study-detail-actions">
          <button 
            className="study-detail-action-button"
            onClick={handleDownload}
          >
            <FaDownload /> Descargar
          </button>
          
          {isPending && (
            <button 
              className="study-detail-action-button"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              <FaRobot /> {analyzing ? 'Analizando...' : 'Analizar con IA'}
            </button>
          )}
        </div>
      </div>
      
      <div className="study-detail-content">
        {isImage(study.file_path) ? (
          <div className="study-detail-image">
            <img 
              src={`/api/medical-studies/studies/${study.id}/image`} 
              alt="Estudio médico" 
            />
          </div>
        ) : (
          <div className="study-detail-metadata">
            <div className="study-detail-metadata-item">
              <div className="study-detail-metadata-label">Tipo:</div>
              <div className="study-detail-metadata-value">{getStudyTypeName(study.study_type)}</div>
            </div>
            <div className="study-detail-metadata-item">
              <div className="study-detail-metadata-label">Fecha:</div>
              <div className="study-detail-metadata-value">{formatDate(study.created_at)}</div>
            </div>
            <div className="study-detail-metadata-item">
              <div className="study-detail-metadata-label">Paciente:</div>
              <div className="study-detail-metadata-value">{study.patient_email || 'No disponible'}</div>
            </div>
            <div className="study-detail-metadata-item">
              <div className="study-detail-metadata-label">Estado:</div>
              <div className="study-detail-metadata-value">
                <span className={`study-status ${isPending ? 'status-pending' : 'status-completed'}`}>
                  {isPending ? 'Pendiente de interpretación' : 'Interpretado'}
                </span>
              </div>
            </div>
            <div className="study-detail-metadata-item">
              <div className="study-detail-metadata-label">Archivo:</div>
              <div className="study-detail-metadata-value">{study.file_path.split('/').pop() || 'No disponible'}</div>
            </div>
          </div>
        )}
        
        <div className="study-detail-interpretation">
          {isPending ? (
            <div className="study-pending-message">
              <p>Este estudio aún no ha sido interpretado.</p>
              <p>Puedes solicitar un análisis automático con IA utilizando el botón "Analizar con IA".</p>
            </div>
          ) : (
            <ReactMarkdown>{study.interpretation}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyDetail; 