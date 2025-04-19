import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, useTheme, useMediaQuery, Alert,
  TextField, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Stack, Chip, Backdrop, LinearProgress
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload, FaEye, FaRobot, FaDownload, FaCloudUploadAlt, FaSearch, FaTimes, FaFileAlt } from 'react-icons/fa';
import '../components/AnimatedList.css';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns }                          from '@mui/x-date-pickers/AdapterDateFns';
import { es }                                      from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';   // ✔️ icono éxito

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
  const [analysisModal, setAnalysisModal] = useState({
    open:   false,        // overlay visible
    status: 'idle',       // 'idle' | 'loading' | 'done'
    studyId: null
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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
      // 1. Mostrar modal de confirmación
      setAnalysisModal({ 
        open: true, 
        status: 'confirm',  // nuevo estado: 'confirm' | 'loading' | 'done' | 'error'
        studyId: study.id 
      });
    } catch (err) {
      console.error('Error al preparar análisis:', err);
      showNotification('Error al preparar el análisis', 'error');
    }
  };

  // Nueva función para ejecutar el análisis cuando el usuario confirma
  const executeAnalysis = async () => {
    try {
      const studyId = analysisModal.studyId;
      setAnalysisModal({ open: true, status: 'loading', studyId });
      const token = localStorage.getItem('token');

      // 1. Iniciar el análisis con timeout aumentado
      await axios.post(
        `/api/medical-studies/studies/${studyId}/analyze`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000 // 30 segundos para la llamada inicial
        }
      );

      // 2. Esperar 15 segundos antes del primer intento
      console.log("⏳ Esperando 15 segundos para el primer intento...");
      await new Promise(r => setTimeout(r, 15000));

      // 3. Verificar estado cada 10 segundos por hasta 5 minutos
      const MAX_ATTEMPTS = 30;
      let attempts = 0;
      
      while (attempts < MAX_ATTEMPTS) {
        console.log(`Verificando resultado (intento ${attempts + 1}/${MAX_ATTEMPTS})...`);
        
        const checkResponse = await axios.get(
          `/api/medical-studies/studies/${studyId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000 // 15 segundos para cada verificación
          }
        );

        // Si encontramos la interpretación o el estado "completed", terminamos
        if (checkResponse.data.interpretation || 
            checkResponse.data.status === 'completed' ||
            checkResponse.data.analysis_status === 'completed') {
          console.log("✅ Interpretación encontrada");
          await fetchStudies();
          setAnalysisModal({ open: true, status: 'done', studyId });
          return;
        }

        // Si hay un error específico del análisis, lo mostramos
        if (checkResponse.data.analysis_error) {
          throw new Error(checkResponse.data.analysis_error);
        }

        // Esperar 10 segundos antes del siguiente intento
        console.log("⏳ Esperando 10 segundos para el siguiente intento...");
        await new Promise(r => setTimeout(r, 10000));
        attempts++;
      }

      throw new Error("El análisis ha excedido el tiempo máximo de espera (5 minutos)");

    } catch (err) {
      console.error('Error en análisis:', err);
      let errorMessage = "Ha ocurrido un problema durante el análisis.";
      
      // Mejorar el mensaje de error para timeouts
      if (err.code === 'ECONNABORTED') {
        errorMessage = "La conexión tardó demasiado tiempo. Por favor, inténtalo de nuevo.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage, 'error');
      setAnalysisModal({ 
        open: true, 
        status: 'error', 
        studyId: analysisModal.studyId, 
        errorMessage 
      });
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
    <Paper elevation={3}
           sx={{ p: 2, backgroundColor: '#1e1e1e', borderRadius: 2, width: '100%' }}>
      {/* Fila principal */}
      <Stack direction={{ xs: 'column', md: 'row' }}
             spacing={2}
             alignItems="center">
        {/* ── Búsqueda por texto ───────────────────────── */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar nombre o interpretación…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch color="#888" />
              </InputAdornment>
            ),
            endAdornment: !!searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <FaTimes color="#888" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            flexGrow: 1,
            bgcolor: '#0d0d0d',
            '& .MuiInputBase-input': { color: 'white' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }
          }}
        />

        {/* ── Tipo de estudio ──────────────────────────── */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="type-select-label" sx={{ color: 'white' }}>
            Tipo
          </InputLabel>
          <Select
            labelId="type-select-label"
            value={filterType}
            label="Tipo"
            onChange={(e) => setFilterType(e.target.value)}
            sx={{
              color: 'white',
              bgcolor: '#0d0d0d',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }
            }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="xray">Radiografía</MenuItem>
            <MenuItem value="mri">Resonancia Magnética</MenuItem>
            <MenuItem value="ct">Tomografía Computarizada</MenuItem>
            <MenuItem value="ultrasound">Ecografía</MenuItem>
            <MenuItem value="bloodwork">Análisis de Sangre</MenuItem>
          </Select>
        </FormControl>

        {/* ── Fechas ───────────────────────────────────── */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label="Desde"
            value={dateRange.from ? new Date(dateRange.from) : null}
            onChange={(newVal) => {
              const v = newVal ? newVal.toISOString().split('T')[0] : '';
              setDateRange({ ...dateRange, from: v });
            }}
            renderInput={(params) => (
              <TextField {...params} size="small" sx={{
                width: 130,
                bgcolor: '#0d0d0d',
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }
              }} />
            )}
          />
          <DatePicker
            label="Hasta"
            value={dateRange.to ? new Date(dateRange.to) : null}
            onChange={(newVal) => {
              const v = newVal ? newVal.toISOString().split('T')[0] : '';
              setDateRange({ ...dateRange, to: v });
            }}
            renderInput={(params) => (
              <TextField {...params} size="small" sx={{
                width: 130,
                bgcolor: '#0d0d0d',
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }
              }} />
            )}
          />
        </LocalizationProvider>

        {/* ── Limpiar ──────────────────────────────────── */}
        <Button variant="outlined"
                color="error"
                size="small"
                onClick={clearFilters}>
          Limpiar
        </Button>
      </Stack>

      {/* Chips que muestran filtros activos */}
      {(filterType !== 'all' || dateRange.from || dateRange.to) && (
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {filterType !== 'all' && (
            <Chip label={getStudyTypeName(filterType)} color="primary" size="small" />
          )}
          {dateRange.from && <Chip label={`Desde ${dateRange.from}`} size="small" />}
          {dateRange.to   && <Chip label={`Hasta ${dateRange.to}`}  size="small" />}
        </Stack>
      )}
    </Paper>
  );

  const sortedStudies = useMemo(() => {
    if (!studies) return [];
    return [...studies].sort((a, b) => {
      // Convertir las fechas a objetos Date para comparación
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      // Ordenar descendente (b - a para más reciente primero)
      return dateB - dateA;
    });
  }, [studies]);

  /* Redirigir automáticamente cuando el informe esté listo */
  useEffect(() => {
    if (analysisModal.status === 'done') {
      const t = setTimeout(() => {
        navigate(`/medical-studies/${analysisModal.studyId}`);
        setAnalysisModal({ open: false, status: 'idle', studyId: null });
      }, 1500);                 // 1,5 s de pausa
      return () => clearTimeout(t);
    }
  }, [analysisModal, navigate]);

  useEffect(() => {
    // Configurar timeout global de axios
    axios.defaults.timeout = 15000; // 15 segundos por defecto
  }, []);

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
        <p className="upload-formats">
          Formatos aceptados: JPG, PNG, TXT, PDF
        </p>
        
        <Alert 
          severity="info" 
          sx={{ 
            bgcolor: 'rgba(33, 150, 243, 0.15)',        // color acorde al tema
            color:  'white',
            border: '1px solid #2196f3',
            backdropFilter: 'blur(6px)',
            mb: 2
          }}
        >
          Puedes seleccionar hasta 4 fotos al mismo tiempo, esto es útil para estudios de sangre.
        </Alert>
        
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
      ) : sortedStudies.length > 0 ? (
        <>
          {(searchTerm || filterType !== 'all' || dateRange.from || dateRange.to) && (
            <div className="search-results-info">
              Mostrando {sortedStudies.length} de {studies.length} estudios
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
                {sortedStudies.map((study, idx) => (
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

      <Backdrop
        open={analysisModal.open}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: '#fff',
          flexDirection: 'column',
          backgroundColor: 'rgba(0,0,0,0.85)'  // más oscuro para mejor contraste
        }}
      >
        {analysisModal.status === 'confirm' && (
          <>
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
              ¿Deseas analizar este estudio con IA?
            </Typography>
            <Typography sx={{ mb: 3, textAlign: 'center', maxWidth: 500 }}>
              El primer resultado puede tardar hasta 15 segundos en aparecer. 
              El análisis completo puede tomar hasta 5 minutos.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setAnalysisModal({ open: false, status: 'idle', studyId: null })}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={executeAnalysis}
              >
                Analizar ahora
              </Button>
            </Box>
          </>
        )}
        
        {analysisModal.status === 'loading' && (
          <>
            <CircularProgress color="inherit" />
            <Typography sx={{ mt: 2 }}>
              Analizando estudio con IA...
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, color: 'gray' }}>
              Este proceso puede tardar hasta 5 minutos
            </Typography>
            <LinearProgress 
              sx={{ 
                mt: 2, 
                width: '200px',
                borderRadius: 1
              }} 
            />
          </>
        )}
        
        {analysisModal.status === 'done' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 60, color: '#4caf50' }} />
            <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
              ¡Análisis completado!
            </Typography>
            <Typography sx={{ mb: 3, textAlign: 'center' }}>
              El informe está listo para ser consultado
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                navigate(`/medical-studies/${analysisModal.studyId}`);
                setAnalysisModal({ open: false, status: 'idle', studyId: null });
              }}
            >
              Ver informe
            </Button>
          </>
        )}
        
        {analysisModal.status === 'error' && (
          <>
            <Typography variant="h5" color="error" sx={{ mb: 2 }}>
              Error al analizar el estudio
            </Typography>
            <Typography sx={{ mb: 3, textAlign: 'center', maxWidth: 500 }}>
              {analysisModal.errorMessage || "Ha ocurrido un problema durante el análisis. Por favor, inténtalo más tarde."}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setAnalysisModal({ open: false, status: 'idle', studyId: null })}
              >
                Cerrar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Intentar ver el estudio de todos modos
                  navigate(`/medical-studies/${analysisModal.studyId}`);
                  setAnalysisModal({ open: false, status: 'idle', studyId: null });
                }}
              >
                Ver estudio de todos modos
              </Button>
            </Box>
          </>
        )}
      </Backdrop>
    </div>
  );
};

export default MedicalStudies; 