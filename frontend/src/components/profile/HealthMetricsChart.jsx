import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const HealthMetricsChart = ({ healthProfile }) => {
  // Convertir el perfil de salud a datos para el gráfico radar
  const getRadarData = () => {
    if (!healthProfile) return [];
    
    const data = [
      {
        subject: 'Actividad Física',
        value: getActivityScore(healthProfile.activity_level),
        fullMark: 10
      },
      {
        subject: 'Sueño',
        value: getSleepScore(healthProfile.sleep_hours),
        fullMark: 10
      },
      {
        subject: 'Estrés',
        value: getStressScore(healthProfile.stress_level),
        fullMark: 10
      },
      {
        subject: 'Alimentación',
        value: getDietScore(healthProfile.diet_type),
        fullMark: 10
      },
      {
        subject: 'Hábitos',
        value: getHabitsScore(healthProfile.smoking, healthProfile.alcohol_consumption),
        fullMark: 10
      }
    ];
    
    return data;
  };
  
  // Funciones para calcular puntuaciones
  const getActivityScore = (activityLevel) => {
    switch (activityLevel) {
      case 'sedentary': return 2;
      case 'light': return 4;
      case 'moderate': return 6;
      case 'active': return 8;
      case 'very_active': return 10;
      default: return 5;
    }
  };
  
  const getSleepScore = (sleepHours) => {
    if (!sleepHours) return 5;
    if (sleepHours < 5) return 2;
    if (sleepHours < 6) return 4;
    if (sleepHours < 7) return 6;
    if (sleepHours < 8) return 8;
    if (sleepHours <= 9) return 10;
    return 7; // Más de 9 horas también puede ser subóptimo
  };
  
  const getStressScore = (stressLevel) => {
    if (!stressLevel) return 5;
    // Invertimos la escala porque menos estrés es mejor
    return 10 - stressLevel;
  };
  
  const getDietScore = (dietType) => {
    switch (dietType) {
      case 'balanced': return 10;
      case 'vegetarian': return 9;
      case 'vegan': return 8;
      case 'pescatarian': return 8;
      case 'keto': return 7;
      case 'paleo': return 7;
      case 'omnivore': return 6;
      case 'fast_food': return 2;
      default: return 5;
    }
  };
  
  const getHabitsScore = (smoking, alcoholConsumption) => {
    let score = 10;
    
    // Reducir puntuación por fumar
    if (smoking) {
      score -= 5;
    }
    
    // Reducir puntuación por consumo de alcohol
    switch (alcoholConsumption) {
      case 'none': score -= 0; break;
      case 'occasional': score -= 1; break;
      case 'moderate': score -= 2; break;
      case 'frequent': score -= 4; break;
      default: score -= 0;
    }
    
    return Math.max(1, score); // Mínimo 1 punto
  };
  
  const radarData = getRadarData();
  
  // Calcular puntuación general de salud
  const calculateHealthScore = () => {
    if (!healthProfile) return { score: 0, category: 'Sin datos' };
    
    const scores = radarData.map(item => item.value);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    let category;
    if (avgScore >= 8) {
      category = 'Muy Saludable';
    } else if (avgScore >= 6) {
      category = 'Saludable';
    } else if (avgScore >= 4) {
      category = 'Medianamente Saludable';
    } else if (avgScore >= 2) {
      category = 'Poco Saludable';
    } else {
      category = 'No Saludable';
    }
    
    return { score: avgScore.toFixed(1), category };
  };
  
  const healthScore = calculateHealthScore();
  
  return (
    <Box>
      {!healthProfile ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No tienes un perfil de salud registrado.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Puntuación de Salud
                </Typography>
                <Typography 
                  variant="h2" 
                  color={
                    healthScore.score >= 8 ? 'success.main' : 
                    healthScore.score >= 6 ? 'info.main' : 
                    healthScore.score >= 4 ? 'warning.main' : 'error.main'
                  }
                >
                  {healthScore.score}
                </Typography>
                <Typography variant="subtitle1">
                  {healthScore.category}
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Detalles del Perfil:
              </Typography>
              
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Nivel de Actividad:</strong> {' '}
                  {healthProfile.activity_level === 'sedentary' && 'Sedentario'}
                  {healthProfile.activity_level === 'light' && 'Ligero'}
                  {healthProfile.activity_level === 'moderate' && 'Moderado'}
                  {healthProfile.activity_level === 'active' && 'Activo'}
                  {healthProfile.activity_level === 'very_active' && 'Muy Activo'}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Horas de Sueño:</strong> {healthProfile.sleep_hours} horas
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Nivel de Estrés:</strong> {healthProfile.stress_level}/10
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Fumador:</strong> {healthProfile.smoking ? 'Sí' : 'No'}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Consumo de Alcohol:</strong> {' '}
                  {healthProfile.alcohol_consumption === 'none' && 'Ninguno'}
                  {healthProfile.alcohol_consumption === 'occasional' && 'Ocasional'}
                  {healthProfile.alcohol_consumption === 'moderate' && 'Moderado'}
                  {healthProfile.alcohol_consumption === 'frequent' && 'Frecuente'}
                </Typography>
                
                {healthProfile.preexisting_conditions && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Condiciones Preexistentes:</strong> {healthProfile.preexisting_conditions}
                  </Typography>
                )}
                
                {healthProfile.allergies && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Alergias:</strong> {healthProfile.allergies}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom textAlign="center">
                Gráfico de Métricas de Salud
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar
                      name="Puntuación"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default HealthMetricsChart; 