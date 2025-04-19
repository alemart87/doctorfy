import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaUtensils, FaSearch, FaFilter, FaTimes, FaEye, FaDownload, FaArrowLeft } from 'react-icons/fa';
import AnimatedList from '../components/AnimatedList';
import '../components/AnimatedList.css';
import '../components/NutritionStyles.css';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import Aurora from '../components/Aurora';
import { 
  CircularProgress, Typography, LinearProgress, Backdrop, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, IconButton, Grid, Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Nutrition = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [nutritionAnalyses, setNutritionAnalyses] = useState([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  
  // Estados para el buscador
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Añadir nuevo estado para el modal de análisis
  const [analysisModal, setAnalysisModal] = useState({
    open: false,
    status: 'idle', // 'idle' | 'confirm' | 'loading' | 'done' | 'error'
    analysisId: null,
    errorMessage: null
  });

  // Función para formatear fechas
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

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'info') => {
    setNotification({ open: true, message, type });
    setTimeout(() => {
      setNotification({ open: false, message: '', type: 'info' });
    }, 5000);
  };

  const handleCloseNotification = () => {
    setNotification({ open: false, message: '', type: 'info' });
  };

  // Cargar análisis nutricionales previos
  const fetchNutritionAnalyses = useCallback(async () => {
    try {
      setLoadingAnalyses(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/nutrition/analyses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNutritionAnalyses(response.data.analyses || []);
    } catch (err) {
      console.error('Error al obtener análisis nutricionales:', err);
      setError('No se pudieron cargar los análisis nutricionales. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoadingAnalyses(false);
    }
  }, []);

  useEffect(() => {
    fetchNutritionAnalyses();
  }, [fetchNutritionAnalyses]);

  // Filtrar análisis según criterios de búsqueda
  const filteredAnalyses = useMemo(() => {
    if (!nutritionAnalyses.length) return [];
    
    return nutritionAnalyses.filter(analysis => {
      // Filtrar por término de búsqueda
      const searchMatch = searchTerm === '' || 
        (analysis.analysis && analysis.analysis.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrar por rango de fechas
      let dateMatch = true;
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        const analysisDate = new Date(analysis.created_at);
        dateMatch = dateMatch && analysisDate >= fromDate;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59); // Establecer al final del día
        const analysisDate = new Date(analysis.created_at);
        dateMatch = dateMatch && analysisDate <= toDate;
      }
      
      return searchMatch && dateMatch;
    });
  }, [nutritionAnalyses, searchTerm, dateRange]);

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
  };

  // Manejo de archivos
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

  // Primero añadimos el timeout global de axios
  useEffect(() => {
    // Configurar timeout global de axios
    axios.defaults.timeout = 15000; // 15 segundos por defecto
  }, []);

  // Modificar la función handleAnalyzeFood
  const handleAnalyzeFood = async () => {
    if (!selectedFile) return;

    try {
      console.log("🚀 Iniciando análisis...");
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Mostrar modal de análisis
      setAnalysisModal({ 
        open: true, 
        status: 'loading',
        message: 'Subiendo imagen y analizando...' 
      });
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      const token = localStorage.getItem('token');
      
      // Subir y analizar
      const response = await axios.post('/api/nutrition/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      console.log("✅ Análisis completado:", response.data);

      // Actualizar estados
      setAnalysisResult(response.data);
      setSelectedAnalysis(response.data);
      await fetchNutritionAnalyses();

      // Mostrar éxito
      setAnalysisModal({ 
        open: false, 
        status: 'idle' 
      });
      showNotification('Análisis completado con éxito', 'success');
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError("Error al analizar la imagen. Por favor, intenta de nuevo.");
      showNotification('Error al analizar la imagen', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
    }
  };

  // Ver detalles de un análisis
  const handleViewAnalysis = (analysis) => {
    setSelectedAnalysis(analysis);
  };

  // Descargar imagen de un análisis
  const handleDownloadImage = async (analysis, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/nutrition/analyses/${analysis.id}/image`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extraer el nombre del archivo de la ruta o usar un nombre genérico
      const fileName = analysis.file_path ? analysis.file_path.split('/').pop() : `alimento_${analysis.id}.jpg`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      showNotification('Imagen descargada correctamente', 'success');
    } catch (err) {
      console.error('Error al descargar la imagen:', err);
      showNotification('Error al descargar la imagen', 'error');
    }
  };

  // Renderizar un elemento de análisis en la lista
  const renderAnalysisItem = (analysis, index, isSelected) => {
    const date = formatDate(analysis.created_at);
    
    const extractNutritionalInfo = (analysisText) => {
      try {
        // Primero intentar parsear directamente el texto como JSON
        const data = JSON.parse(analysisText);
      return {
          calories: data.calories || 0,
          proteins: data.protein_g || 0,
          carbs: data.carbs_g || 0,
          fats: data.fat_g || 0,
          quality: data.quality || 'N/A',
          foods: data.food || []
        };
      } catch (e) {
        // Si falla, buscar el JSON dentro del texto
        try {
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
              calories: data.calories || 0,
              proteins: data.protein_g || 0,
              carbs: data.carbs_g || 0,
              fats: data.fat_g || 0,
              quality: data.quality || 'N/A',
              foods: data.food || []
            };
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
      return {
        calories: 0,
        proteins: 0,
        carbs: 0,
        fats: 0,
        quality: 'N/A',
        foods: []
      };
    };
    
    const nutritionalInfo = extractNutritionalInfo(analysis.analysis);

    return (
      <Box 
        className={`analysis-item ${isSelected ? 'selected' : ''}`}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '16px',
          padding: '24px',
          color: '#fff',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          margin: '20px 0'
        }}
      >
        <Typography variant="h4" sx={{ 
          color: '#fff',
          fontWeight: 700,
          mb: 3,
          fontSize: { xs: '1.5rem', md: '2rem' }
        }}>
          Análisis Nutricional
        </Typography>

        {/* Grid de información nutricional */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{
              backgroundColor: 'rgba(0, 191, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid rgba(0, 191, 255, 0.2)'
            }}>
              <Typography sx={{ 
                color: '#00bfff',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                fontWeight: 800,
                lineHeight: 1
              }}>
                {nutritionalInfo?.calories || 0}
              </Typography>
              <Typography sx={{ color: '#888', mt: 1 }}>Calorías</Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{
              backgroundColor: 'rgba(46, 213, 115, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid rgba(46, 213, 115, 0.2)'
            }}>
              <Typography sx={{ 
                color: '#2ed573',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                fontWeight: 800,
                lineHeight: 1
              }}>
                {nutritionalInfo?.proteins || 0}g
              </Typography>
              <Typography sx={{ color: '#888', mt: 1 }}>Proteínas</Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{
              backgroundColor: 'rgba(255, 159, 67, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid rgba(255, 159, 67, 0.2)'
            }}>
              <Typography sx={{ 
                color: '#ff9f43',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                fontWeight: 800,
                lineHeight: 1
              }}>
                {nutritionalInfo?.carbs || 0}g
              </Typography>
              <Typography sx={{ color: '#888', mt: 1 }}>Carbohidratos</Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{
              backgroundColor: 'rgba(255, 71, 87, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid rgba(255, 71, 87, 0.2)'
            }}>
              <Typography sx={{ 
                color: '#ff4757',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                fontWeight: 800,
                lineHeight: 1
              }}>
                {nutritionalInfo?.fats || 0}g
              </Typography>
              <Typography sx={{ color: '#888', mt: 1 }}>Grasas</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Calidad nutricional */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography sx={{ 
            color: nutritionalInfo?.quality === 'Muy mala' ? '#ff4757' : 
                   nutritionalInfo?.quality === 'Regular' ? '#ff9f43' : '#2ed573',
            fontSize: '1.2rem',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            Calidad nutricional: {nutritionalInfo?.quality || 'N/A'}
          </Typography>
        </Box>
        
        {/* BOTONES RESPONSIVOS */}
        <div className="analysis-item-actions" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '8px',
          position: 'relative',
          zIndex: 10, // Asegurar que esté por encima de otros elementos
          visibility: 'visible !important',
          opacity: 1
        }}>
          <button 
            className="mobile-visible-button view-button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewAnalysis(analysis);
            }}
            style={{
              minWidth: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 120, 255, 0.1)',
              border: '1px solid rgba(0, 120, 255, 0.3)',
              color: '#0078ff',
              cursor: 'pointer',
              padding: '0',
              margin: '0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              visibility: 'visible',
              opacity: 1
            }}
            aria-label="Ver análisis"
          >
            <FaEye style={{ fontSize: '16px' }} />
          </button>
          
          <button 
            className="mobile-visible-button download-button"
            onClick={(e) => handleDownloadImage(analysis, e)}
            style={{
              minWidth: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(46, 204, 113, 0.1)',
              border: '1px solid rgba(46, 204, 113, 0.3)',
              color: '#2ecc71',
              cursor: 'pointer',
              padding: '0',
              margin: '0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              visibility: 'visible',
              opacity: 1
            }}
            aria-label="Descargar imagen"
          >
            <FaDownload style={{ fontSize: '16px' }} />
          </button>
        </div>
      </Box>
    );
  };

  // Renderizar barra de búsqueda
  const renderSearchBar = () => {
    return (
      <div className="search-container">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar en análisis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <button 
            className={`filter-toggle-button ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros avanzados"
          >
            <FaFilter />
            {(dateRange.from || dateRange.to) && <span className="filter-badge"></span>}
          </button>
        </div>
        
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label htmlFor="date-range">Rango de fechas:</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  id="date-from"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="date-input"
                  placeholder="Desde"
                />
                <span>hasta</span>
                <input
                  type="date"
                  id="date-to"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="date-input"
                  placeholder="Hasta"
                />
              </div>
            </div>
            
            {(dateRange.from || dateRange.to) && (
              <button 
                className="clear-filters-button"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar la vista de detalle de un análisis
  const renderAnalysisDetail = () => {
    if (!selectedAnalysis) return null;

    // Extraer datos del JSON
    let nutritionalData;
    try {
      nutritionalData = JSON.parse(selectedAnalysis.analysis);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      // Intentar extraer el JSON del texto
      try {
        const jsonMatch = selectedAnalysis.analysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          nutritionalData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Error extracting JSON:', e);
        nutritionalData = {};
      }
    }
    
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          onClick={() => setSelectedAnalysis(null)}
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
          Análisis Nutricional - {formatDate(selectedAnalysis.created_at)}
        </Typography>

        <Grid container spacing={4}>
          {/* Imagen */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              mb: 2
            }}>
            <img 
              src={`/api/nutrition/analyses/${selectedAnalysis.id}/image`} 
              alt="Alimento analizado" 
                style={{ width: '100%', display: 'block' }}
            />
            </Box>
            <Button
              startIcon={<FaDownload />}
              onClick={() => handleDownloadImage(selectedAnalysis)}
              sx={{
                mt: 2,
                bgcolor: 'rgba(46, 204, 113, 0.2)',
                color: '#2ecc71',
                '&:hover': { bgcolor: 'rgba(46, 204, 113, 0.3)' }
              }}
            >
              Descargar imagen
            </Button>
          </Grid>

          {/* Análisis */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              bgcolor: 'rgba(0,0,0,0.3)',
              borderRadius: '16px',
              p: 3,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="h6" sx={{ color: '#00bfff', mb: 2 }}>
                Alimentos detectados:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {nutritionalData.food?.map((food, idx) => (
                  <Chip
                    key={idx}
                    label={food}
                    sx={{
                      bgcolor: 'rgba(0, 191, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(0, 191, 255, 0.2)'
                    }}
                  />
                ))}
              </Box>

              <Typography variant="h6" sx={{ color: '#00bfff', mb: 2 }}>
                Información nutricional:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                  { label: 'Calorías', value: `${nutritionalData.calories || 0} kcal`, color: '#00bfff' },
                  { label: 'Proteínas', value: `${nutritionalData.protein_g || 0}g`, color: '#2ecc71' },
                  { label: 'Carbohidratos', value: `${nutritionalData.carbs_g || 0}g`, color: '#f1c40f' },
                  { label: 'Grasas', value: `${nutritionalData.fat_g || 0}g`, color: '#e74c3c' }
                ].map((item, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Box sx={{
                      bgcolor: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                      borderRadius: '12px',
                      p: 2,
                      textAlign: 'center'
                    }}>
                      <Typography sx={{ color: item.color, fontSize: '1.5rem', fontWeight: 700 }}>
                        {item.value}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" sx={{ color: '#00bfff', mb: 2 }}>
                Recomendaciones:
              </Typography>
              <Typography sx={{ 
                color: 'white',
                lineHeight: 1.6,
                bgcolor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                p: 2
              }}>
                {nutritionalData.recommendations || 'No hay recomendaciones disponibles'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Añadir el Backdrop para el modal de análisis
  <Backdrop
    open={analysisModal.open}
    sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      color: '#fff',
      flexDirection: 'column',
      backgroundColor: 'rgba(0,0,0,0.85)'
    }}
  >
    <CircularProgress color="inherit" />
    <Typography sx={{ mt: 2 }}>
      {analysisModal.message || 'Analizando...'}
    </Typography>
    {uploadProgress > 0 && (
      <Box sx={{ width: '200px', mt: 2 }}>
        <LinearProgress variant="determinate" value={uploadProgress} />
        <Typography variant="caption" sx={{ mt: 1, color: 'gray' }}>
          {uploadProgress}%
        </Typography>
      </Box>
    )}
  </Backdrop>

  // NUEVA función de extracción copiada de NutritionDashboard
  const extractNutritionData = (analysisText) => {
    if (!analysisText) return { 
      calories: 0, proteins: 0, carbs: 0, fats: 0, 
      fiber: 0, sugars: 0, sodium: 0, quality: 'N/A' 
    };

    // Debug
    console.log('Texto a analizar:', analysisText);

    // 1. Intentar encontrar y parsear JSON dentro de bloques markdown
    try {
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        const data = JSON.parse(jsonMatch[1].trim());
        console.log('JSON encontrado en bloque markdown:', data);
        return {
          calories: data.calories || 0,
          proteins: data.protein_g || 0,
          carbs: data.carbs_g || 0,
          fats: data.fat_g || 0,
          fiber: data.fiber_g || 0,
          sugars: data.sugars_g || 0,
          sodium: data.sodium_mg || 0,
          quality: data.quality || 'N/A'
        };
      }
    } catch (e) {
      console.log('Error al parsear JSON en bloque markdown:', e);
    }

    // 2. Intentar encontrar JSON en cualquier parte del texto
    try {
      const jsonStart = analysisText.indexOf('{');
      const jsonEnd = analysisText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = analysisText.substring(jsonStart, jsonEnd + 1);
        const data = JSON.parse(jsonStr);
        console.log('JSON encontrado en texto:', data);
        return {
          calories: data.calories || 0,
          proteins: data.protein_g || 0,
          carbs: data.carbs_g || 0,
          fats: data.fat_g || 0,
          fiber: data.fiber_g || 0,
          sugars: data.sugars_g || 0,
          sodium: data.sodium_mg || 0,
          quality: data.quality || 'N/A'
        };
      }
    } catch (e) {
      console.log('Error al parsear JSON en texto:', e);
    }

    // 3. Modo regex mejorado como fallback
    console.log('Usando regex como fallback');
    const extractNumber = (patterns) => {
      for (const pattern of patterns) {
        const match = analysisText.match(pattern);
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
      }
      return 0;
    };

    // Patrones múltiples para cada nutriente
    const patterns = {
      calories: [
        /(?:calor[ií]as|kcal)[^\d]*(\d+)/i,
        /"calories":\s*(\d+)/i,
        /(\d+)\s*(?:calor[ií]as|kcal)/i
      ],
      proteins: [
        /(?:prote[ií]nas?|protein_g)[^\d]*(\d+)/i,
        /"protein_g":\s*(\d+)/i,
        /(\d+)\s*(?:g\s+de\s+)?prote[ií]nas?/i
      ],
      carbs: [
        /(?:carbohidratos?|carbs_g|hidratos?)[^\d]*(\d+)/i,
        /"carbs_g":\s*(\d+)/i,
        /(\d+)\s*(?:g\s+de\s+)?(?:carbohidratos?|hidratos?)/i
      ],
      fats: [
        /(?:grasas?|l[ií]pidos?|fat_g)[^\d]*(\d+)/i,
        /"fat_g":\s*(\d+)/i,
        /(\d+)\s*(?:g\s+de\s+)?grasas?/i
      ]
    };

    // Extraer calidad nutricional del texto
    const getQuality = (text) => {
      if (text.match(/(?:calidad|quality)[\s:]*buena/i)) return 'Buena';
      if (text.match(/(?:calidad|quality)[\s:]*regular/i)) return 'Regular';
      if (text.match(/(?:calidad|quality)[\s:]*mala/i)) return 'Mala';
      return 'N/A';
    };

    const result = {
      calories: extractNumber(patterns.calories),
      proteins: extractNumber(patterns.proteins),
      carbs: extractNumber(patterns.carbs),
      fats: extractNumber(patterns.fats),
      fiber: extractNumber([
        /fibra[^\d]*(\d+)/i,
        /"fiber_g":\s*(\d+)/i,
        /(\d+)\s*(?:g\s+de\s+)?fibra/i
      ]),
      sugars: extractNumber([
        /az[úu]cares?[^\d]*(\d+)/i,
        /"sugars_g":\s*(\d+)/i,
        /(\d+)\s*(?:g\s+de\s+)?az[úu]cares?/i
      ]),
      sodium: extractNumber([
        /sodio[^\d]*(\d+)/i,
        /"sodium_mg":\s*(\d+)/i,
        /(\d+)\s*(?:mg\s+de\s+)?sodio/i
      ]),
      quality: getQuality(analysisText)
    };

    console.log('Resultado final:', result);
    return result;
  };

  return (
    <div className="medical-studies-container nutrition-container">
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      
      <div className="medical-studies-header">
        <h1 className="medical-studies-title">Análisis Nutricional</h1>
        <p className="medical-studies-subtitle">
          Sube imágenes de alimentos y obtén un análisis detallado de su contenido nutricional
        </p>
      </div>
      
      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}
      
      {!selectedAnalysis && (
        <>
          <div 
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="upload-icon nutrition-icon">
              <FaUtensils />
            </div>
            <h3 className="upload-text">Arrastra y suelta una imagen de alimentos aquí, o haz clic para seleccionar una imagen</h3>
            <p className="upload-formats">Formatos aceptados: JPG, PNG</p>
            
            <input 
              type="file" 
              id="food-image-upload" 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              accept=".jpg,.jpeg,.png"
            />
            
            <label htmlFor="food-image-upload" className="upload-button">
              Seleccionar imagen
            </label>
            
            {selectedFile && (
              <div className="selected-file-container">
                <p className="selected-file-name">Imagen seleccionada: {selectedFile.name}</p>
                
                <button 
                  onClick={handleAnalyzeFood} 
                  className="upload-submit-button"
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="upload-progress-container">
                      <CircularProgress size={24} color="inherit" />
                      <Typography sx={{ mt: 2 }}>
                        Analizando imagen con IA...
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
                        variant="indeterminate"
                      />
                    </div>
                  ) : (
                    <>
                      <FaUtensils className="button-icon" />
                      <span>Analizar alimentos</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        
        {analysisResult && (
            <div className="analysis-result-container">
              <h2 className="analysis-result-title">Resultados del Análisis</h2>
              
              <div className="analysis-result-content">
                {analysisResult.image_url && (
                  <div className="analysis-image">
                    <img src={analysisResult.image_url} alt="Alimento analizado" />
                  </div>
                )}
                
                <div className="analysis-details">
                  <div className="analysis-markdown">
                    <ReactMarkdown>
                      {analysisResult.analysis}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="studies-section-header">
            <h2 className="studies-section-title">Mis Análisis Nutricionales</h2>
            {renderSearchBar()}
          </div>
          
          {loadingAnalyses ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando análisis...</p>
            </div>
          ) : filteredAnalyses.length > 0 ? (
            <>
              {(searchTerm || dateRange.from || dateRange.to) && (
                <div className="search-results-info">
                  Mostrando {filteredAnalyses.length} de {nutritionAnalyses.length} análisis
                  {searchTerm && <span> que contienen "{searchTerm}"</span>}
                  {(dateRange.from || dateRange.to) && (
                    <span> en el rango de fechas seleccionado</span>
                  )}
                </div>
              )}
              
              <TableContainer component={Paper}
                sx={{ bgcolor:'#0a0a0a', borderRadius:2, px:1, overflowX:'auto', mt: 4 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color:'#2ecc71', fontWeight:700 }}}>
                      <TableCell align="center">#</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>Calorías</TableCell>
                      <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>Proteínas</TableCell>
                      <TableCell sx={{ display:{ xs:'none', md:'table-cell' }}}>Carbos</TableCell>
                      <TableCell sx={{ display:{ xs:'none', md:'table-cell' }}}>Grasas</TableCell>
                      <TableCell>Calidad</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredAnalyses.map((analysis, idx) => {
                      const nutritionalInfo = extractNutritionData(analysis.analysis);
                      console.log('Info extraída:', nutritionalInfo); // Para debug
                      
                      return (
                        <TableRow key={analysis.id} hover sx={{ '&:hover': { backgroundColor:'#111' } }}>
                          <TableCell align="center">{idx + 1}</TableCell>
                          <TableCell>{formatDate(analysis.created_at)}</TableCell>
                          <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>
                            {nutritionalInfo.calories > 0 ? `${nutritionalInfo.calories} kcal` : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ display:{ xs:'none', sm:'table-cell' }}}>
                            {nutritionalInfo.proteins > 0 ? `${nutritionalInfo.proteins} g` : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ display:{ xs:'none', md:'table-cell' }}}>
                            {nutritionalInfo.carbs > 0 ? `${nutritionalInfo.carbs} g` : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ display:{ xs:'none', md:'table-cell' }}}>
                            {nutritionalInfo.fats > 0 ? `${nutritionalInfo.fats} g` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <span style={{ 
                              color: nutritionalInfo.quality === 'Buena' ? '#2ecc71' : 
                                     nutritionalInfo.quality === 'Regular' ? '#f39c12' : '#e74c3c'
                            }}>
                              {nutritionalInfo.quality || 'N/A'}
                            </span>
                          </TableCell>
                          {/* Acciones */}
                          <TableCell align="center">
                            <Box sx={{ display:'flex', justifyContent:'center', gap:1 }}>
                              <IconButton size="small" color="primary"
                                onClick={() => handleViewAnalysis(analysis)}
                                sx={{ bgcolor:'#2196f322' }} 
                                title="Ver análisis"
                              >
                                <FaEye style={{ color:'#2196f3' }}/>
                              </IconButton>

                              <IconButton size="small" color="success"
                                onClick={(e) => handleDownloadImage(analysis, e)}
                                sx={{ bgcolor:'#2ecc7130' }} 
                                title="Descargar imagen"
                              >
                                <FaDownload style={{ color:'#2ecc71' }}/>
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : nutritionAnalyses.length > 0 ? (
            <div className="no-results-message">
              <p>No se encontraron análisis que coincidan con los criterios de búsqueda.</p>
              <button className="clear-search-button" onClick={clearFilters}>
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="no-studies-message">
              <p>No hay análisis nutricionales disponibles. Analiza tu primer alimento.</p>
            </div>
          )}
        </>
      )}
      
      {selectedAnalysis && renderAnalysisDetail()}
      
      {notification.open && (
        <div className={`notification ${notification.type}`}>
          <p>{notification.message}</p>
          <button onClick={handleCloseNotification} className="notification-close">×</button>
        </div>
      )}
    </div>
  );
};

export default Nutrition; 