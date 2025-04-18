import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, useTheme, useMediaQuery
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload, FaEye, FaRobot, FaDownload, FaCloudUploadAlt, FaSearch, FaFilter, FaTimes, FaFileAlt } from 'react-icons/fa';
import '../components/AnimatedList.css';

// Añadir esta función fuera del componente para que esté disponible en todo el archivo
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

// Devuelve la URL completa (backend sirve en /api/media/uploads/<nombre>)
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (process.env.NODE_ENV === 'development') {
    return `/api/media/uploads/medical_studies/${imagePath}`;
  }
  return `${process.env.REACT_APP_API_URL}/api/media/uploads/medical_studies/${imagePath}`;
};

const MedicalStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [studyType, setStudyType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const navigate = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('sm'));   //  ≤ 600 px

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    onDrop: acceptedFiles => {
      // Solo las 4 primeras imágenes (descarta el resto)
      setSelectedFiles(prev =>
        [...prev, ...acceptedFiles]
          .slice(0, 4));      // máximo 4
    },
    maxFiles: 4,
    multiple: true,
  });

  const fetchStudies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Verificar si el token existe
      if (!token) {
        console.error('No hay token de autenticación');
        setError('No has iniciado sesión o tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }
      
      console.log('Obteniendo estudios con token:', token.substring(0, 15) + '...');
      
      const response = await axios.get('/api/medical-studies/studies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Respuesta de estudios:', response.data);
      setStudies(response.data.studies);
      setError(null);
    } catch (err) {
      console.error('Error al obtener estudios:', err);
      
      // Mostrar información más detallada del error
      if (err.response) {
        console.error('Respuesta del servidor:', err.response.status, err.response.data);
        
        if (err.response.status === 401) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
        } else if (err.response.status === 404) {
          setError('No se pudo conectar con el servidor de estudios médicos. La ruta no existe.');
        } else {
          setError(`Error del servidor: ${err.response.status}. Por favor, intenta de nuevo más tarde.`);
        }
      } else if (err.request) {
        console.error('No se recibió respuesta del servidor');
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        setError('Error al procesar la solicitud. Por favor, intenta de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mobile-visible-button {
        visibility: visible !important;
        opacity: 1 !important;
        display: flex !important;
        z-index: 100 !important;
        position: relative !important;
      }
      
      .study-item-actions {
        visibility: visible !important;
        opacity: 1 !important;
        display: flex !important;
        z-index: 100 !important;
        animation: pulse-border 2s infinite;
        position: absolute !important;
        bottom: 12px !important;
        right: 12px !important;
        background: rgba(0, 0, 0, 0.7) !important;
        border-radius: 20px !important;
        padding: 6px 10px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
      }
      
      /* Asegurar que el contenido del estudio no se superponga con los botones */
      .study-info {
        padding-bottom: 50px !important; /* Espacio para los botones */
        position: relative !important;
      }
      
      /* Mejorar la visibilidad de los botones */
      .mobile-visible-button {
        min-width: 38px !important;
        height: 38px !important;
        margin: 0 3px !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3) !important;
        border: 2px solid rgba(255, 255, 255, 0.2) !important;
      }
      
      @keyframes pulse-border {
        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
        70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }
      
      /* Ajustes específicos para móviles */
      @media (max-width: 768px) {
        .mobile-visible-button {
          min-width: 36px !important;
          height: 36px !important;
        }
        
        .mobile-visible-button svg {
          font-size: 16px !important;
        }
        
        .study-item-actions {
          bottom: 10px !important;
          right: 10px !important;
        }
      }
      
      /* Ajustes para pantallas muy pequeñas */
      @media (max-width: 360px) {
        .mobile-visible-button {
          min-width: 32px !important;
          height: 32px !important;
          margin: 0 2px !important;
        }
        
        .mobile-visible-button svg {
          font-size: 14px !important;
        }
        
        .study-item-actions {
          padding: 4px 6px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const filesArr = Array.from(e.target.files);
    setSelectedFiles(prev =>
      [...prev, ...filesArr]
        .slice(0, 4));   // máximo 4
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(prev => [...prev, e.dataTransfer.files[0]]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    const formData = new FormData();
    selectedFiles.forEach((f) => formData.append('files', f));
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

      setSelectedFiles([]);
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
      
      await fetchStudies();
      showNotification('Estudio analizado correctamente', 'success');
      
      navigate(`/medical-studies/${study.id}`);
    } catch (err) {
      console.error('Error al analizar estudio:', err);
      setError('Error al analizar el estudio. El servicio puede estar ocupado, por favor intenta más tarde.');
      showNotification('Error al analizar el estudio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStudy = async (study, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/medical-studies/studies/${study.id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const disposition = response.headers['content-disposition'] || '';
      let fileName = `estudio_${study.id}`;
      const match = disposition.match(/filename="?([^"]+)"?/i);
      if (match) fileName = decodeURIComponent(match[1]);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Descarga falló:', err);
      showNotification('Error al descargar', 'error');
    }
  };

  const handleDownloadInterpretation = async (study, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/medical-studies/studies/${study.id}/interpretation/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interpretacion_estudio_${study.id}.txt`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar interpretación:', err);
      showNotification('Error al descargar interpretación', 'error');
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

  const filteredStudies = useMemo(() => {
    if (!studies.length) return [];
    
    return studies.filter(study => {
      const searchMatch = searchTerm === '' || 
        (study.name && study.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (study.interpretation && study.interpretation.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const typeMatch = filterType === 'all' || study.study_type === filterType;
      
      let dateMatch = true;
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        const studyDate = new Date(study.created_at);
        dateMatch = dateMatch && studyDate >= fromDate;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59);
        const studyDate = new Date(study.created_at);
        dateMatch = dateMatch && studyDate <= toDate;
      }
      
      return searchMatch && typeMatch && dateMatch;
    });
  }, [studies, searchTerm, filterType, dateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setDateRange({ from: '', to: '' });
  };

  const renderSearchBar = () => (
    <div className="search-container">
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar estudios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="search-clear-button" 
            onClick={() => setSearchTerm('')}
            title="Limpiar búsqueda"
          >
            <FaTimes />
          </button>
        )}
      </div>
      
      <button 
        className={`filter-toggle-button ${showFilters ? 'active' : ''}`} 
        onClick={() => setShowFilters(!showFilters)}
        title="Mostrar/ocultar filtros"
      >
        <FaFilter />
        {filterType !== 'all' || dateRange.from || dateRange.to ? <span className="filter-badge"></span> : null}
      </button>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Tipo de estudio:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value="general">General</option>
              <option value="xray">Radiografía</option>
              <option value="mri">Resonancia Magnética</option>
              <option value="ct">Tomografía Computarizada</option>
              <option value="ultrasound">Ecografía</option>
              <option value="bloodwork">Análisis de Sangre</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Rango de fechas:</label>
            <div className="date-range-inputs">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="date-input"
                placeholder="Desde"
              />
              <span>hasta</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="date-input"
                placeholder="Hasta"
              />
            </div>
          </div>
          
          <button 
            className="clear-filters-button" 
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );

  studies.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));

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
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".jpg,.jpeg,.png"
        />
        
        <label htmlFor="file-upload" className="upload-button">
          Seleccionar archivo
        </label>
        
        {selectedFiles.length > 0 && (
          <div className="selected-file-container">
             <p className="selected-file-name">
                {selectedFiles.length} archivo(s) seleccionado(s)
                {selectedFiles.length > 1 && ' (máx. 4)'}
             </p>
            
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

      <div className="studies-section-header">
        <h2 className="studies-section-title">Mis Estudios</h2>
        {renderSearchBar()}
      </div>
        
        {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando estudios...</p>
        </div>
      ) : filteredStudies.length > 0 ? (
        <>
          {(searchTerm || filterType !== 'all' || dateRange.from || dateRange.to) && (
            <div className="search-results-info">
              Mostrando {filteredStudies.length} de {studies.length} estudios
              {searchTerm && <span> que contienen "{searchTerm}"</span>}
              {filterType !== 'all' && (
                <span> de tipo "{getStudyTypeName(filterType)}"</span>
              )}
              {(dateRange.from || dateRange.to) && (
                <span> en el rango de fechas seleccionado</span>
              )}
            </div>
          )}
          
          <TableContainer component={Paper}
            sx={{ bgcolor:'#0a0a0a', borderRadius:2, px:1, overflowX:'auto' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color:'#00bfff', fontWeight:700 }}}>
                  <TableCell align="center">#</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>Interpretación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredStudies.map((study, idx) => (
                  <TableRow key={study.id} hover
                    sx={{ '&:hover': { backgroundColor:'#111' } }}
                  >
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell>{getStudyTypeName(study.study_type)}</TableCell>
                    <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>
                      {formatDate(study.created_at)}
                    </TableCell>
                    <TableCell>
                      {study.interpretation ? (
                        <span style={{ color:'#2ecc71', fontWeight:600 }}>Interpretado</span>
                      ) : (
                        <span style={{ color:'#f39c12', fontWeight:600 }}>Pendiente</span>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth:250, display:{ xs:'none', sm:'table-cell' }}}>
                      {study.interpretation
                        ? study.interpretation.slice(0, 60) + '…'
                        : '—'}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell align="center">
                      <Box sx={{ display:'flex', justifyContent:'center', gap:1 }}>
                        <IconButton size="small" color="primary"
                          onClick={(e)=>{e.stopPropagation(); handleViewStudy(study);} }
                          sx={{ bgcolor:'#2196f322' }} title="Ver estudio">
                          <FaEye style={{ color:'#2196f3' }}/>
                        </IconButton>

                        <IconButton size="small" color="success"
                          onClick={(e)=>handleDownloadStudy(study,e)}
                          sx={{ bgcolor:'#4caf5030' }} title="Descargar estudio">
                          <FaDownload style={{ color:'#4caf50' }}/>
                        </IconButton>

                        <IconButton size="small"
                          onClick={(e)=>{e.stopPropagation(); handleAnalyzeStudy(study);} }
                          sx={{ bgcolor:'#9c27b030' }} title="Analizar con IA">
                          <FaRobot style={{ color:'#9c27b0' }}/>
                        </IconButton>

                        {study.interpretation && (
                          <IconButton size="small"
                            onClick={(e)=>handleDownloadInterpretation(study,e)}
                            sx={{ bgcolor:'#ffc10733' }} title="Descargar interpretación">
                            <FaFileAlt style={{ color:'#ffc107' }}/>
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : studies.length > 0 ? (
        <div className="no-results-message">
          <p>No se encontraron estudios que coincidan con los criterios de búsqueda.</p>
          <button className="clear-search-button" onClick={clearFilters}>
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="no-studies-message">
          <p>No hay estudios médicos disponibles. Sube tu primer estudio.</p>
        </div>
      )}
      
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