import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, useTheme, useMediaQuery, Alert,
  TextField, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Stack, Chip, Backdrop, LinearProgress, Grid, Card, CardActions
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload, FaEye, FaRobot, FaDownload, FaCloudUploadAlt, FaSearch, FaTimes, FaFileAlt, FaArrowLeft } from 'react-icons/fa';
import '../components/AnimatedList.css';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns }                          from '@mui/x-date-pickers/AdapterDateFns';
import { es }                                      from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';   // ✔️ icono éxito
import SmartToyIcon from '@mui/icons-material/SmartToy';

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

// Primero, añadamos una animación keyframe en la parte superior del archivo (después de los imports)
// Esto creará un efecto de brillo/pulsación

<style jsx global>{`
  @keyframes pulse-glow {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
      transform: scale(1.05);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
      transform: scale(1);
    }
  }

  @keyframes shine {
    0% {
      background-position: -100px;
    }
    40%, 100% {
      background-position: 300px;
    }
  }
`}</style>

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
  
  const [selectedStudy, setSelectedStudy] = useState(null);
  
  const navigate = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('sm'));   //  ≤ 600 px

  const { getRootProps, getInputProps } = useDropzone({
    // En lugar de usar 'accept', podemos validar manualmente
    accept: {},
    onDrop: acceptedFiles => {
      // Validar y procesar los archivos manualmente
      const validFiles = acceptedFiles.filter(file => {
        // Verificar tamaño máximo (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setNotification({
            open: true,
            message: `El archivo ${file.name} excede el tamaño máximo de 10MB`,
            type: 'error'
          });
          return false;
        }
        
        // Verificar tipo de archivo por extensión
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'].includes(fileExt)) {
          setNotification({
            open: true,
            message: `El archivo ${file.name} no es de un formato soportado`,
            type: 'error'
          });
          return false;
        }
        
        return true;
      });
      
      // Solo las 4 primeras imágenes (descarta el resto)
      setSelectedFiles(prev =>
        [...prev, ...validFiles]
          .slice(0, 4));      // máximo 4
    },
    maxFiles: 4,
    multiple: true,
  });

  const [userCredits, setUserCredits] = useState(null);

  const fetchUserCredits = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/me');
      setUserCredits(response.data.credits);
    } catch (error) {
      console.error('Error al obtener créditos del usuario:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserCredits();
  }, [fetchUserCredits]);

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
    setSelectedStudy(study);
  };

  const handleAnalyzeStudy = async (study) => {
    // Verificar si el usuario tiene suficientes créditos
    if (userCredits !== null && userCredits < 5) {
      setNotification({
        open: true,
        message: `No tienes suficientes créditos para analizar este estudio. Necesitas 5 créditos, pero solo tienes ${userCredits}.`,
        type: 'error'
      });
      return;
    }

      setAnalysisModal({ 
        open: true, 
      status: 'loading',
        studyId: study.id 
      });

    try {
      // Configurar axios con un timeout mucho más largo (5 minutos = 300000ms)
      const response = await axios.post(
        `/api/medical-studies/studies/${study.id}/analyze`,
        {},
        {
          timeout: 300000 // 5 minutos en milisegundos
        }
      );
      
      // Actualizar los créditos del usuario después del análisis exitoso
      if (response.data.credits_remaining !== undefined) {
        setUserCredits(response.data.credits_remaining);
      } else {
        // Si el backend no devuelve los créditos restantes, actualizar manualmente
        setUserCredits(prev => prev !== null ? prev - 5 : null);
      }
      
      setAnalysisModal({
        open: true,
        status: 'done',
        studyId: study.id,
        result: response.data.analysis
      });
      
      // Actualizar la lista de estudios para reflejar el nuevo estado
      fetchStudies();
      
    } catch (error) {
      console.error('Error al analizar estudio:', error);
      
      let errorMessage = 'Error al analizar el estudio. Por favor, inténtalo de nuevo más tarde.';
      
      // Manejar errores específicos
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'El análisis está tomando más tiempo del esperado. Por favor, verifica el estado del estudio en unos minutos.';
      } else if (error.response) {
        if (error.response.status === 402) {
          errorMessage = `No tienes suficientes créditos para analizar este estudio. Necesitas 5 créditos.`;
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setAnalysisModal({ 
        open: true, 
        status: 'error', 
        studyId: study.id,
        error: errorMessage
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

  const renderStudyDetail = (study) => {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          onClick={() => setSelectedStudy(null)}
          startIcon={<FaArrowLeft />}
          sx={{ mb: 3, color: 'white' }}
        >
          Volver a la lista
        </Button>

        <Typography variant="h4" sx={{ 
          color: '#00bfff',
          mb: 4,
          fontWeight: 700 
        }}>
          {getStudyTypeName(study.study_type)} - {formatDate(study.created_at)}
        </Typography>

        <Box sx={{
          bgcolor: 'rgba(0,0,0,0.3)',
          borderRadius: '16px',
          p: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          minHeight: '500px'
        }}>
          {/* Detalles del estudio */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { 
                label: 'Tipo de estudio', 
                value: getStudyTypeName(study.study_type),
                color: '#00bfff',
                icon: '🔍'
              },
              { 
                label: 'Estado actual', 
                value: study.interpretation ? 'Interpretado' : 'Pendiente',
                color: study.interpretation ? '#2ecc71' : '#f1c40f',
                icon: study.interpretation ? '✅' : '⏳'
              },
              { 
                label: 'Fecha de carga', 
                value: formatDate(study.created_at),
                color: '#9b59b6',
                icon: '📅'
              }
            ].map((item, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Box sx={{
                  bgcolor: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  borderRadius: '12px',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>{item.icon}</Typography>
                  <Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: item.color, fontSize: '1.2rem', fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Interpretación */}
          {study.interpretation ? (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 3,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                pb: 2
              }}>
                <FaRobot style={{ fontSize: 24, color: '#00bfff' }} />
                <Typography variant="h5" sx={{ color: '#00bfff', fontWeight: 600 }}>
                  Interpretación IA
                </Typography>
              </Box>

              <Box sx={{ 
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                p: 4,
                whiteSpace: 'pre-wrap',
                fontFamily: 'system-ui',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                '& h1, & h2, & h3': {
                  color: '#00bfff',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                },
                '& ul, & ol': {
                  paddingLeft: '1.5rem',
                  marginBottom: '1rem'
                },
                '& li': {
                  marginBottom: '0.5rem'
                },
                '& strong': {
                  color: '#2ecc71',
                  fontWeight: 600
                }
              }}>
                {study.interpretation.split('\n').map((line, idx) => (
                  <Typography key={idx} paragraph>
                    {line}
                  </Typography>
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              py: 8
            }}>
              <Typography sx={{ color: '#f39c12', fontSize: '1.2rem' }}>
                Este estudio aún no ha sido interpretado
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
                  Créditos disponibles:
                </Typography>
                <Chip 
                  label={userCredits !== null ? userCredits : '...'}
                  color={userCredits !== null && userCredits >= 5 ? 'success' : 'warning'}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SmartToyIcon />}
                onClick={() => handleAnalyzeStudy(study)}
                sx={{
                  minWidth: '120px',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  '@media (max-width: 600px)': {
                    minWidth: '100%',
                    marginTop: '8px',
                    marginBottom: '8px',
                  }
                }}
              >
                Analizar
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // Añadir una función para mostrar una vista previa de los archivos seleccionados
  const renderFilePreview = (file) => {
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
      // Vista previa de imagen
      return (
        <div className="file-preview-item image-preview">
          <img src={URL.createObjectURL(file)} alt={file.name} />
          <div className="file-name">{file.name}</div>
        </div>
      );
    } else if (fileExt === 'pdf') {
      // Vista previa de PDF (icono)
      return (
        <div className="file-preview-item pdf-preview">
          <div className="pdf-icon">PDF</div>
          <div className="file-name">{file.name}</div>
        </div>
      );
    } else {
      // Vista previa de otros archivos
      return (
        <div className="file-preview-item other-preview">
          <div className="file-icon">📄</div>
          <div className="file-name">{file.name}</div>
        </div>
      );
    }
  };

  const renderFileContent = (filePath) => {
    const fileExt = filePath.split('.').pop().toLowerCase();
    const fileUrl = getImageUrl(filePath);
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
      // Mostrar imagen
      return (
        <div className="study-image-container">
          <img 
            src={fileUrl} 
            alt="Imagen del estudio" 
            className="study-image"
            onClick={() => window.open(fileUrl, '_blank')}
          />
        </div>
      );
    } else if (fileExt === 'pdf') {
      // Mostrar un visor de PDF o un enlace para abrirlo
      return (
        <div className="study-pdf-container">
          <div className="pdf-preview-box">
            <div className="pdf-icon">PDF</div>
            <div className="pdf-filename">{filePath.split('/').pop()}</div>
          </div>
          <Button
            variant="outlined"
            startIcon={<FaEye />}
            onClick={() => window.open(fileUrl, '_blank')}
            sx={{ mt: 1 }}
          >
            Ver PDF
          </Button>
        </div>
      );
    } else {
      // Otros tipos de archivo
      return (
        <div className="study-file-container">
          <div className="file-icon">📄</div>
          <div className="file-name">{filePath.split('/').pop()}</div>
          <Button
            variant="outlined"
            startIcon={<FaDownload />}
            onClick={() => window.open(fileUrl, '_blank')}
            sx={{ mt: 1 }}
          >
            Descargar
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="medical-studies-container">
      {selectedStudy ? (
        renderStudyDetail(selectedStudy)
      ) : (
        <>
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
          
          <div className="upload-section">
            <div 
              {...getRootProps()} 
              className="dropzone-container"
              style={{
                border: '2px dashed #2196f3',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '20px'
              }}
            >
              <input {...getInputProps()} />
              <FaCloudUploadAlt style={{ fontSize: '48px', color: '#2196f3', marginBottom: '10px' }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                Arrastra y suelta archivos aquí, o haz clic para seleccionar
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Formatos aceptados: JPG, PNG, GIF, PDF, TXT (máx. 10MB)
              </Typography>
            </div>

            {selectedFiles.length > 0 && (
              <div className="selected-files-section" style={{ marginBottom: '20px' }}>
                <div className="file-preview-container" style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-preview-wrapper" style={{
                      position: 'relative',
                      width: '100px',
                      height: '100px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: '1px solid #333',
                      backgroundColor: '#1a1a1a'
                    }}>
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : file.name.endsWith('.pdf') ? (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          height: '100%'
                        }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff5722' }}>PDF</div>
                        </div>
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          height: '100%'
                        }}>
                          <div style={{ fontSize: '24px' }}>📄</div>
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 4px',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {file.name}
                      </div>
                      <button 
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          backgroundColor: 'rgba(255,0,0,0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div className="study-type-selector" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                    Tipo de estudio:
                    </Typography>
                    <Select
                    value={studyType} 
                    onChange={(e) => setStudyType(e.target.value)}
                      size="small"
                      sx={{
                        minWidth: '120px',
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
                      }}
                    >
                      <MenuItem value="general">General</MenuItem>
                    </Select>
                </div>
                
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaUpload />}
                  onClick={handleUpload} 
                  disabled={uploading}
                    sx={{
                      minWidth: '150px',
                      backgroundColor: '#4caf50',
                      '&:hover': { backgroundColor: '#388e3c' },
                      '&:disabled': { backgroundColor: '#1c3c1d' }
                    }}
                >
                  {uploading ? (
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress} 
                          sx={{ 
                            flexGrow: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 'white'
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'white', minWidth: '40px' }}>
                          {uploadProgress}%
                        </Typography>
                      </Box>
                    ) : (
                      "Subir estudio"
                    )}
                  </Button>
                </div>
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
              
              <TableContainer 
                component={Paper} 
                sx={{ 
                  overflowX: 'auto',
                  '& .MuiTable-root': {
                    minWidth: { xs: 'auto', sm: 650 },
                  },
                  '& .MuiTableCell-root': {
                    '@media (max-width: 600px)': {
                      padding: '6px 4px',
                      fontSize: '0.75rem',
                    }
                  }
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color:'#00bfff', fontWeight:700 }}}>
                      <TableCell align="center" sx={{ 
                        width: { xs: '30px', sm: 'auto' },
                        padding: { xs: '6px 2px', sm: '6px' } 
                      }}>#</TableCell>
                      <TableCell sx={{ 
                        width: { xs: '60px', sm: 'auto' },
                        padding: { xs: '6px 2px', sm: '6px' } 
                      }}>Tipo</TableCell>
                      <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>Fecha</TableCell>
                      <TableCell sx={{ 
                        width: { xs: '70px', sm: 'auto' },
                        padding: { xs: '6px 2px', sm: '6px' } 
                      }}>Estado</TableCell>
                      <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>Interpretación</TableCell>
                      <TableCell align="center" sx={{ 
                        width: { xs: 'auto', sm: 'auto' },
                        padding: { xs: '6px 2px', sm: '6px' } 
                      }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedStudies.map((study, idx) => (
                      <TableRow key={study.id} hover
                        sx={{ '&:hover': { backgroundColor:'#111' } }}
                      >
                        <TableCell align="center" sx={{ 
                          padding: { xs: '6px 2px', sm: '6px' } 
                        }}>{idx + 1}</TableCell>
                        <TableCell sx={{ 
                          padding: { xs: '6px 2px', sm: '6px' },
                          fontSize: { xs: '0.7rem', sm: 'inherit' }
                        }}>{getStudyTypeName(study.study_type)}</TableCell>
                        <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>
                          {formatDate(study.created_at)}
                        </TableCell>
                        <TableCell sx={{ 
                          padding: { xs: '6px 2px', sm: '6px' },
                          fontSize: { xs: '0.7rem', sm: 'inherit' }
                        }}>
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

                        {/* Acciones - Modificar para móviles */}
                        <TableCell align="center" sx={{ 
                          padding: { xs: '6px 2px', sm: '6px' } 
                        }}>
                          <Box sx={{ 
                            display:'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent:'center', 
                            gap: { xs: 0.5, sm: 1 }
                          }}>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<FaEye />}
                              onClick={() => handleViewStudy(study)}
                              sx={{
                                minWidth: { xs: '70px', sm: '100px' },
                                fontSize: { xs: '0.7rem', sm: '0.9rem' },
                                padding: { xs: '4px 8px', sm: '8px 12px' },
                                backgroundColor: '#2196f3',
                                '&:hover': { backgroundColor: '#1976d2' },
                              }}
                            >
                              Ver
                            </Button>
                            
                            {!study.interpretation && (
                              <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<SmartToyIcon />}
                                onClick={() => handleAnalyzeStudy(study)}
                                sx={{
                                  minWidth: { xs: '70px', sm: '120px' },
                                  fontSize: { xs: '0.7rem', sm: '0.9rem' },
                                  padding: { xs: '4px 8px', sm: '8px 12px' },
                                  backgroundColor: '#ff9800',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&:hover': { 
                                    backgroundColor: '#f57c00',
                                  },
                                  // Efecto de pulsación
                                  animation: 'pulse 2s infinite',
                                  '@keyframes pulse': {
                                    '0%': {
                                      boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.7)',
                                      transform: 'scale(1)',
                                    },
                                    '50%': {
                                      boxShadow: '0 0 0 10px rgba(255, 152, 0, 0)',
                                      transform: 'scale(1.05)',
                                    },
                                    '100%': {
                                      boxShadow: '0 0 0 0 rgba(255, 152, 0, 0)',
                                      transform: 'scale(1)',
                                    },
                                  },
                                  // Efecto de brillo
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '-50%',
                                    left: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                                    transform: 'rotate(30deg)',
                                    animation: 'shine 3s infinite',
                                  },
                                  '@keyframes shine': {
                                    '0%': {
                                      transform: 'translateX(-100%) rotate(30deg)',
                                    },
                                    '100%': {
                                      transform: 'translateX(100%) rotate(30deg)',
                                    },
                                  },
                                }}
                              >
                                Analizar
                              </Button>
                            )}
                            
                            {/* Botón de descarga más pequeño en móviles */}
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadStudy(study.id)}
                              title="Descargar estudio"
                              sx={{
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
                                padding: { xs: '4px', sm: '8px' },
                                display: { xs: 'none', sm: 'inline-flex' },
                              }}
                            >
                              <FaDownload />
                            </IconButton>
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
                    onClick={() => handleAnalyzeStudy(selectedStudy)}
                  >
                    Analizar ahora
                  </Button>
                </Box>
              </>
            )}
            
            {analysisModal.status === 'loading' && (
              <>
                <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                  Analizando estudio con IA...
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', maxWidth: 500 }}>
                  Este proceso puede tardar hasta 5 minutos dependiendo de la complejidad del estudio y las imágenes.
                  Por favor, no cierres esta ventana.
                </Typography>
                <LinearProgress 
                  sx={{ 
                    width: '80%', 
                    maxWidth: '400px',
                    height: 10,
                    borderRadius: 5,
                    mb: 2
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
                  {analysisModal.error}
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
        </>
      )}
    </div>
  );
};

export default MedicalStudies; 