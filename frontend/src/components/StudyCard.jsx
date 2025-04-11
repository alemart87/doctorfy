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
  Pending as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StudyCard = ({ study, onEdit }) => {
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
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={`/uploads/${study.file_path}`}
        alt={study.name || "Estudio médico"}
        sx={{ 
          objectFit: 'cover',
          backgroundColor: '#f5f5f5'
        }}
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

      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Tooltip title="Editar estudio" arrow>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(study);
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver detalles" arrow>
          <IconButton 
            size="small"
            onClick={() => navigate(`/medical-studies/${study.id}`)}
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default StudyCard; 