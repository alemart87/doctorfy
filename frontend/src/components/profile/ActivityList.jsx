import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  DirectionsRun as RunIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Whatshot as CaloriesIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const ActivityList = ({ activities, onEdit, onDelete }) => {
  // Función para formatear la fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };
  
  // Función para obtener el color según la intensidad
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'low':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Función para obtener el texto de la intensidad
  const getIntensityText = (intensity) => {
    switch (intensity) {
      case 'low':
        return 'Baja';
      case 'moderate':
        return 'Moderada';
      case 'high':
        return 'Alta';
      default:
        return intensity;
    }
  };
  
  // Agrupar actividades por mes
  const groupByMonth = (acts) => {
    const grouped = {};
    
    acts.forEach(act => {
      try {
        const date = new Date(act.date);
        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
        
        if (!grouped[monthYear]) {
          grouped[monthYear] = {
            label: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('es', { month: 'long', year: 'numeric' }),
            activities: []
          };
        }
        
        grouped[monthYear].activities.push(act);
      } catch (e) {
        console.error('Error al agrupar actividad:', e);
      }
    });
    
    // Ordenar por fecha (más reciente primero)
    Object.keys(grouped).forEach(key => {
      grouped[key].activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return grouped;
  };
  
  const groupedActivities = groupByMonth(activities);
  
  return (
    <Box>
      {activities.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No tienes actividades físicas registradas.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Resumen de actividades */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Actividad
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total de Actividades
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {activities.length}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Minutos Totales
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {activities.reduce((total, act) => total + (act.duration || 0), 0)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Calorías Quemadas
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {activities.reduce((total, act) => total + (act.calories_burned || 0), 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Lista de actividades por mes */}
          {Object.keys(groupedActivities).sort().reverse().map(monthYear => (
            <Paper sx={{ p: 3, mb: 3 }} key={monthYear}>
              <Typography variant="h6" gutterBottom>
                {groupedActivities[monthYear].label}
              </Typography>
              
              <List>
                {groupedActivities[monthYear].activities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        <RunIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {activity.activity_type}
                            <Chip 
                              label={getIntensityText(activity.intensity)} 
                              color={getIntensityColor(activity.intensity)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body2" component="span">
                                  {activity.duration} min
                                </Typography>
                              </Box>
                              
                              {activity.calories_burned && (
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                  <CaloriesIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  <Typography variant="body2" component="span">
                                    {activity.calories_burned} cal
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(activity.date)}
                            </Typography>
                            
                            {activity.notes && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {activity.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        {onEdit && (
                          <IconButton edge="end" aria-label="edit" onClick={() => onEdit(activity)}>
                            <EditIcon />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton edge="end" aria-label="delete" onClick={() => onDelete(activity.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          ))}
        </>
      )}
    </Box>
  );
};

export default ActivityList; 