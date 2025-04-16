import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaUtensils, FaSearch, FaFilter, FaTimes, FaEye, FaDownload, FaArrowLeft } from 'react-icons/fa';
import AnimatedList from '../components/AnimatedList';
import '../components/AnimatedList.css';
import '../components/NutritionStyles.css';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

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

  // Analizar imagen de alimentos
  const handleAnalyzeFood = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      setAnalysisResult(null);
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('token');
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

      setAnalysisResult(response.data);
      showNotification('Análisis completado con éxito', 'success');
      
      // Actualizar la lista de análisis
      fetchNutritionAnalyses();
    } catch (err) {
      console.error('Error al analizar alimentos:', err);
      setError('Error al analizar la imagen. Por favor, intenta con otra imagen o más tarde.');
      showNotification('Error al analizar la imagen', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
    
    // Extraer información nutricional del análisis si está disponible
    const extractNutritionalInfo = (analysisText) => {
      if (!analysisText) return null;
      
      const caloriesMatch = analysisText.match(/calorías:?\s*(\d+)/i);
      const proteinsMatch = analysisText.match(/proteínas:?\s*(\d+)/i);
      const carbsMatch = analysisText.match(/carbohidratos:?\s*(\d+)/i);
      const fatsMatch = analysisText.match(/grasas:?\s*(\d+)/i);
      
      return {
        calories: caloriesMatch ? caloriesMatch[1] : 'N/A',
        proteins: proteinsMatch ? proteinsMatch[1] : 'N/A',
        carbs: carbsMatch ? carbsMatch[1] : 'N/A',
        fats: fatsMatch ? fatsMatch[1] : 'N/A'
      };
    };
    
    const nutritionalInfo = extractNutritionalInfo(analysis.analysis);

  return (
      <div className={`study-item nutrition-item ${isSelected ? 'selected' : ''}`}>
        <div className="study-info">
          <div className="study-type">
            <span className="study-type-icon">🍽️</span>
          Análisis Nutricional
          </div>
          <div className="study-date">{date}</div>
          
          {nutritionalInfo && (
            <div className="nutrition-preview">
              <div className="nutrition-data-grid">
                <div className="nutrition-data-item">
                  <span className="nutrition-label">Calorías:</span>
                  <span className="nutrition-value">{nutritionalInfo.calories} kcal</span>
                </div>
                <div className="nutrition-data-item">
                  <span className="nutrition-label">Proteínas:</span>
                  <span className="nutrition-value">{nutritionalInfo.proteins} g</span>
                </div>
                <div className="nutrition-data-item">
                  <span className="nutrition-label">Carbohidratos:</span>
                  <span className="nutrition-value">{nutritionalInfo.carbs} g</span>
                </div>
                <div className="nutrition-data-item">
                  <span className="nutrition-label">Grasas:</span>
                  <span className="nutrition-value">{nutritionalInfo.fats} g</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="study-actions">
          <button 
            className="action-button" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewAnalysis(analysis);
            }}
            title="Ver detalles"
          >
            <FaEye />
          </button>
          <button 
            className="action-button" 
            onClick={(e) => handleDownloadImage(analysis, e)}
            title="Descargar imagen"
          >
            <FaDownload />
          </button>
        </div>
      </div>
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
    
    return (
      <div className="analysis-result-container">
        <button 
          className="study-detail-back-button"
          onClick={() => setSelectedAnalysis(null)}
        >
          <FaArrowLeft /> Volver a la lista
        </button>
        
        <h2 className="analysis-result-title">
          Análisis Nutricional - {formatDate(selectedAnalysis.created_at)}
        </h2>
        
        <div className="analysis-result-content">
          <div className="analysis-image">
            <img 
              src={`/api/nutrition/analyses/${selectedAnalysis.id}/image`} 
              alt="Alimento analizado" 
            />
            <button 
              className="download-image-button"
              onClick={() => handleDownloadImage(selectedAnalysis)}
              title="Descargar imagen"
            >
              <FaDownload /> Descargar imagen
            </button>
          </div>
          
          <div className="analysis-details">
            <ReactMarkdown className="analysis-markdown">
              {selectedAnalysis.analysis}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="medical-studies-container nutrition-container">
      <div className="aurora-background"></div>
      
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
                    <div className="upload-progress">
                      <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                      <span className="upload-progress-text">{uploadProgress}%</span>
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
                  <ReactMarkdown className="analysis-markdown">
                      {analysisResult.analysis}
                  </ReactMarkdown>
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
              
              <AnimatedList
                items={filteredAnalyses}
                onItemSelect={handleViewAnalysis}
                showGradients={true}
                enableArrowNavigation={true}
                displayScrollbar={true}
                renderItem={renderAnalysisItem}
                className="studies-list"
              />
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