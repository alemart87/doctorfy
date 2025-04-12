import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  FormHelperText
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const MedicationDialog = ({ open, onClose, onSave, medication }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    days_of_week: [],
    reminders: [{ reminder_time: new Date() }]
  });
  
  const [errors, setErrors] = useState({});
  
  // Resetear el formulario cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      if (medication) {
        // Si estamos editando un medicamento existente
        setFormData({
          name: medication.name || '',
          dosage: medication.dosage || '',
          frequency: medication.frequency || '',
          instructions: medication.instructions || '',
          days_of_week: medication.days_of_week || [],
          reminders: medication.reminders && medication.reminders.length > 0 
            ? medication.reminders.map(r => ({
                reminder_time: r.reminder_time ? new Date(`2000-01-01T${r.reminder_time}`) : new Date()
              }))
            : [{ reminder_time: new Date() }]
        });
      } else {
        // Si estamos creando un nuevo medicamento
        setFormData({
          name: '',
          dosage: '',
          frequency: '',
          instructions: '',
          days_of_week: [],
          reminders: [{ reminder_time: new Date() }]
        });
      }
      setErrors({});
    }
  }, [open, medication]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario corrige el campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleTimeChange = (index, time) => {
    const newReminders = [...formData.reminders];
    newReminders[index] = { reminder_time: time };
    setFormData({
      ...formData,
      reminders: newReminders
    });
  };
  
  const addReminder = () => {
    setFormData({
      ...formData,
      reminders: [...formData.reminders, { reminder_time: new Date() }]
    });
  };
  
  const removeReminder = (index) => {
    const newReminders = [...formData.reminders];
    newReminders.splice(index, 1);
    setFormData({
      ...formData,
      reminders: newReminders.length > 0 ? newReminders : [{ reminder_time: new Date() }]
    });
  };
  
  const handleDaysChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      days_of_week: value
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'El nombre del medicamento es requerido';
    }
    
    if (!formData.dosage) {
      newErrors.dosage = 'La dosis es requerida';
    }
    
    if (!formData.frequency) {
      newErrors.frequency = 'La frecuencia es requerida';
    }
    
    if (formData.days_of_week.length === 0) {
      newErrors.days_of_week = 'Selecciona al menos un día de la semana';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Formatear los datos para enviarlos al servidor
      const formattedData = {
        ...formData,
        reminders: formData.reminders.map(r => ({
          reminder_time: r.reminder_time.toTimeString().substring(0, 5)
        }))
      };
      
      onSave(formattedData);
    }
  };
  
  // Días de la semana en español
  const daysOfWeek = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{medication ? 'Editar Medicamento' : 'Agregar Medicamento'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre del Medicamento"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dosis"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              margin="normal"
              error={!!errors.dosage}
              helperText={errors.dosage}
              placeholder="Ej: 1 pastilla, 5ml, etc."
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Frecuencia"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              margin="normal"
              error={!!errors.frequency}
              helperText={errors.frequency}
              placeholder="Ej: Cada 8 horas, 2 veces al día, etc."
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" error={!!errors.days_of_week}>
              <InputLabel>Días de la Semana</InputLabel>
              <Select
                multiple
                name="days_of_week"
                value={formData.days_of_week}
                onChange={handleDaysChange}
                label="Días de la Semana"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={daysOfWeek.find(day => day.value === value)?.label} 
                        size="small" 
                      />
                    ))}
                  </Box>
                )}
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.days_of_week && <FormHelperText>{errors.days_of_week}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Instrucciones"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              placeholder="Ej: Tomar con comida, antes de dormir, etc."
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recordatorios
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                {formData.reminders.map((reminder, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimePicker
                      label={`Recordatorio ${index + 1}`}
                      value={reminder.reminder_time}
                      onChange={(time) => handleTimeChange(index, time)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          margin="normal"
                        />
                      )}
                    />
                    
                    <IconButton 
                      color="error" 
                      onClick={() => removeReminder(index)}
                      disabled={formData.reminders.length <= 1}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </LocalizationProvider>
              
              <Button
                startIcon={<AddIcon />}
                onClick={addReminder}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Agregar Recordatorio
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicationDialog; 