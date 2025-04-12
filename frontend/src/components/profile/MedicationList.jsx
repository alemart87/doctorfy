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
  Medication as MedicationIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Alarm as AlarmIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const MedicationList = ({ medications, onEdit, onDelete }) => {
  // Función para formatear la hora
  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch (e) {
      return timeString;
    }
  };
  
  // Agrupar medicamentos por día de la semana
  const groupByDays = (meds) => {
    const grouped = {};
    
    meds.forEach(med => {
      if (med.days_of_week) {
        med.days_of_week.forEach(day => {
          if (!grouped[day]) {
            grouped[day] = [];
          }
          grouped[day].push(med);
        });
      }
    });
    
    return grouped;
  };
  
  const groupedMedications = groupByDays(medications);
  
  // Días de la semana en español
  const daysOfWeek = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];
  
  return (
    <Box>
      {medications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No tienes medicamentos registrados.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Vista de lista de medicamentos */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Mis Medicamentos
            </Typography>
            
            <List>
              {medications.map((medication) => (
                <React.Fragment key={medication.id}>
                  <ListItem>
                    <ListItemIcon>
                      <MedicationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={medication.name}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {medication.dosage} - {medication.frequency}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {medication.instructions}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {onEdit && (
                        <IconButton edge="end" aria-label="edit" onClick={() => onEdit(medication)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton edge="end" aria-label="delete" onClick={() => onDelete(medication.id)}>
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
          
          {/* Vista de calendario semanal */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Calendario Semanal
            </Typography>
            
            <Grid container spacing={2}>
              {daysOfWeek.map((day, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {day}
                      </Typography>
                      
                      {groupedMedications[day.toLowerCase()] && groupedMedications[day.toLowerCase()].length > 0 ? (
                        <List dense>
                          {groupedMedications[day.toLowerCase()].map((med, medIndex) => (
                            <ListItem key={`${med.id}-${medIndex}`} disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <AlarmIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={med.name}
                                secondary={med.reminders.map(r => formatTime(r.reminder_time)).join(', ')}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No hay medicamentos para este día
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default MedicationList; 