import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AnimatedList from '../components/AnimatedList';
import './MedicalStudies.css';

const MedicalStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/medical-studies/studies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudies(response.data.studies);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener estudios:', err);
      setError('No se pudieron cargar los estudios médicos');
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('study_type', 'general');

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/medical-studies/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      // Actualizar la lista de estudios después de subir uno nuevo
      fetchStudies();
      setIsUploading(false);
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError('Error al subir el archivo');
      setIsUploading(false);
    }
  };

  const handleStudySelect = (study) => {
    setSelectedStudy(study);
    navigate(`/medical-studies/${study.id}`);
  };

  const handleAnalyzeStudy = async (study, e) => {
    e.stopPropagation(); // Evitar que se active el onClick del item completo
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/medical-studies/studies/${study.id}/analyze`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Actualizar la lista de estudios después del análisis
      fetchStudies();
    } catch (err) {
      console.error('Error al analizar estudio:', err);
      setError('Error al analizar el estudio');
    }
  };

  const renderStudyItem = (study, index, isSelected) => {
    const hasInterpretation = study.interpretation && study.interpretation.trim() !== '';
    const formattedDate = study.created_at 
      ? format(new Date(study.created_at), 'dd MMM yyyy', { locale: es })
      : 'Fecha desconocida';
    
    return (
      <div className={`item medical-study-item ${isSelected ? 'selected' : ''}`}>
        <div className="medical-study-header">
          <span className="medical-study-type">{study.study_type}</span>
          <span className="medical-study-date">{formattedDate}</span>
        </div>
        
        <div className="medical-study-patient">
          {study.patient_email && <span>Paciente: {study.patient_email}</span>}
        </div>
        
        <span 
          className={`medical-study-status ${hasInterpretation ? 'status-completed' : 'status-pending'}`}
        >
          {hasInterpretation ? 'Interpretado' : 'Pendiente de interpretación'}
        </span>
        
        <div className="medical-study-actions">
          {!hasInterpretation && (
            <button 
              className="action-button primary"
              onClick={(e) => handleAnalyzeStudy(study, e)}
            >
              Analizar con IA
            </button>
          )}
          <button className="action-button">Ver detalles</button>
        </div>
      </div>
    );
  };

  return (
    <div className="medical-studies-container">
      <h1>Estudios Médicos</h1>
      
      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-button">
          Subir Nuevo Estudio
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
        {isUploading && (
          <div className="upload-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span>{uploadProgress}%</span>
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando estudios...</div>
      ) : studies.length > 0 ? (
        <AnimatedList
          items={studies}
          onItemSelect={handleStudySelect}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
          renderItem={renderStudyItem}
          className="medical-studies-list"
        />
      ) : (
        <div className="no-studies">
          <p>No tienes estudios médicos. Sube tu primer estudio para comenzar.</p>
        </div>
      )}
    </div>
  );
};

export default MedicalStudies; 