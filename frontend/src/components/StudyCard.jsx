import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  CardActions,
  Tooltip,
  Fade
} from '@mui/material';
import { 
  Edit as EditIcon,
  Search as SearchIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ShinyButton from './ShinyButton';

const StudyCard = ({ study, onEdit, onView, onDownload, onAnalyze }) => {
  const navigate = useNavigate();

  // Mapeo de tipos de estudio a colores y etiquetas
  const studyTypeConfig = {
    general: { color: 'default', label: 'General' },
    xray: { color: 'primary', label: 'Radiografía' },
    mri: { color: 'secondary', label: 'Resonancia Magnética' },
    ct: { color: 'info', label: 'Tomografía' },
    ultrasound: { color: 'success', label: 'Ecografía' },
    ekg: { color: 'warning', label: 'Electrocardiograma' },
    lab: { color: 'error', label: 'Análisis' }
  };

  const getStatusIcon = () => {
    if (study.interpretation) {
      return (
        <Tooltip title="Interpretado" TransitionComponent={Fade} arrow>
          <CheckCircleIcon color="success" />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Pendiente de interpretación" TransitionComponent={Fade} arrow>
        <PendingIcon color="warning" />
      </Tooltip>
    );
  };

  // Usar las funciones pasadas como props o definir funciones vacías si no se proporcionan
  const handleView = onView || (() => {});
  const handleDownload = onDownload || (() => {});
  const handleAnalyze = onAnalyze || (() => {});

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        position: 'relative' // Importante para posicionamiento absoluto
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={study.thumbnail_path ? `/api/media/${study.thumbnail_path}` : '/images/placeholder-study.png'}
        alt={study.name || "Estudio médico"}
        sx={{ 
          objectFit: 'cover',
          backgroundColor: '#f5f5f5'
        }}
        onError={(e) => { e.target.src = '/images/placeholder-study.png'; }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" noWrap>
            {study.name || `Estudio ${study.study_type}`}
          </Typography>
          {getStatusIcon()}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {new Date(study.created_at).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            size="small"
            label={studyTypeConfig[study.study_type]?.label || study.study_type}
            color={studyTypeConfig[study.study_type]?.color || 'default'}
          />
          {study.interpretation && (
            <Chip
              size="small"
              icon={<HospitalIcon />}
              label="Interpretado"
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
        <Tooltip title="Editar estudio" arrow>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(study);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver detalles" arrow>
          <IconButton 
            size="small"
            onClick={() => navigate(`/medical-studies/${study.id}`)}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>

      {/* BOTONES RESPONSIVOS - Mismo enfoque que en Nutrition */}
      <div className="study-item-actions" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        padding: '8px',
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        zIndex: 10,
        visibility: 'visible',
        opacity: 1,
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '20px'
      }}>
        <button 
          className="mobile-visible-button view-button"
          onClick={() => handleView(study)}
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
          aria-label="Ver estudio"
        >
          <VisibilityIcon style={{ fontSize: '16px' }} />
        </button>
        
        <button 
          className="mobile-visible-button download-button"
          onClick={() => handleDownload(study)}
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
          aria-label="Descargar estudio"
        >
          <DownloadIcon style={{ fontSize: '16px' }} />
        </button>
        
        <button 
          className="mobile-visible-button analyze-button"
          onClick={() => handleAnalyze(study)}
          disabled={study.analysis_status === 'processing' || !study.file_path}
          style={{
            minWidth: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 183, 77, 0.1)',
            border: '1px solid rgba(255, 183, 77, 0.3)',
            color: '#ffb74d',
            cursor: study.analysis_status === 'processing' ? 'not-allowed' : 'pointer',
            padding: '0',
            margin: '0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            visibility: 'visible',
            opacity: study.analysis_status === 'processing' ? 0.5 : 1,
            animation: study.analysis_status === 'processing' ? 'pulse-border 1.5s infinite' : 'none'
          }}
          aria-label="Analizar estudio"
        >
          <AnalyticsIcon style={{ fontSize: '16px' }} />
        </button>
      </div>
    </Card>
  );
};

export default StudyCard; 