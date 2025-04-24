import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Favorite as HeartIcon,
  MonitorWeight as WeightIcon,
  BloodtypeOutlined as BloodPressureIcon,
  LocalHospital as MedicalIcon,
  DirectionsRun as ActivityIcon,
  Nightlight as SleepIcon,
  SentimentSatisfied as StressIcon,
  Restaurant as DietIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const HealthAnalysis = ({ analysis }) => {
  const { user_info, health_metrics, recommendations } = analysis;
  
  // Función para determinar el color del chip según la categoría
  const getCategoryColor = (category, type) => {
    if (type === 'bmi') {
      switch (category) {
        case 'Bajo peso':
          return 'warning';
        case 'Peso normal':
          return 'success';
        case 'Sobrepeso':
          return 'warning';
        case 'Obesidad':
          return 'error';
        default:
          return 'default';
      }
    } else if (type === 'bp') {
      switch (category) {
        case 'Normal':
          return 'success';
        case 'Elevada':
          return 'warning';
        case 'Hipertensión Etapa 1':
          return 'error';
        case 'Hipertensión Etapa 2':
          return 'error';
        default:
          return 'default';
      }
    }
    return 'default';
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen de Salud
        </Typography>
        
        <Grid container spacing={3}>
          {/* IMC */}
          {health_metrics.bmi && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <WeightIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Índice de Masa Corporal
                </Typography>
                <Typography variant="h4" color="text.primary">
                  {health_metrics.bmi.value}
                </Typography>
                <Chip 
                  label={health_metrics.bmi.category} 
                  color={getCategoryColor(health_metrics.bmi.category, 'bmi')}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          )}
          
          {/* Presión Arterial */}
          {health_metrics.blood_pressure && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BloodPressureIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Presión Arterial
                </Typography>
                <Typography variant="h4" color="text.primary">
                  {health_metrics.blood_pressure.systolic}/{health_metrics.blood_pressure.diastolic}
                </Typography>
                <Chip 
                  label={health_metrics.blood_pressure.category} 
                  color={getCategoryColor(health_metrics.blood_pressure.category, 'bp')}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          )}
          
          {/* Nivel de Actividad */}
          {health_metrics.lifestyle && health_metrics.lifestyle.activity_level && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ActivityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Nivel de Actividad
                </Typography>
                <Typography variant="h6" color="text.primary">
                  {health_metrics.lifestyle.activity_level === 'sedentary' && 'Sedentario'}
                  {health_metrics.lifestyle.activity_level === 'light' && 'Ligero'}
                  {health_metrics.lifestyle.activity_level === 'moderate' && 'Moderado'}
                  {health_metrics.lifestyle.activity_level === 'active' && 'Activo'}
                  {health_metrics.lifestyle.activity_level === 'very_active' && 'Muy Activo'}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {/* Horas de Sueño */}
          {health_metrics.lifestyle && health_metrics.lifestyle.sleep_hours && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <SleepIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Horas de Sueño
                </Typography>
                <Typography variant="h4" color="text.primary">
                  {health_metrics.lifestyle.sleep_hours}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  horas por noche
                </Typography>
              </Box>
            </Grid>
          )}
          
          {/* Nivel de Estrés */}
          {health_metrics.lifestyle && health_metrics.lifestyle.stress_level && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <StressIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Nivel de Estrés
                </Typography>
                <Typography variant="h4" color="text.primary">
                  {health_metrics.lifestyle.stress_level}/10
                </Typography>
                <Chip 
                  label={health_metrics.lifestyle.stress_level <= 3 ? 'Bajo' : 
                         health_metrics.lifestyle.stress_level <= 7 ? 'Medio' : 'Alto'} 
                  color={health_metrics.lifestyle.stress_level <= 3 ? 'success' : 
                         health_metrics.lifestyle.stress_level <= 7 ? 'warning' : 'error'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          )}
          
          {/* Hábitos */}
          {health_metrics.lifestyle && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <HeartIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Hábitos
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {health_metrics.lifestyle.smoking && (
                    <Chip 
                      label="Fumador" 
                      color="error"
                      size="small"
                    />
                  )}
                  {health_metrics.lifestyle.alcohol_consumption && (
                    <Chip 
                      label={`Alcohol: ${health_metrics.lifestyle.alcohol_consumption}`} 
                      color={health_metrics.lifestyle.alcohol_consumption === 'none' ? 'success' : 
                             health_metrics.lifestyle.alcohol_consumption === 'occasional' ? 'success' : 
                             health_metrics.lifestyle.alcohol_consumption === 'moderate' ? 'warning' : 'error'}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Recomendaciones */}
      {recommendations && recommendations.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recomendaciones
          </Typography>
          
          <List>
            {recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default HealthAnalysis; 