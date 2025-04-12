import React, { useState } from 'react';
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
  FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

const ActivityDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    activity_type: '',
    duration: '',
    intensity: '',
    calories_burned: '',
    date: new Date(),
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
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
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.activity_type) {
      newErrors.activity_type = 'El tipo de actividad es requerido';
    }
    
    if (!formData.duration) {
      newErrors.duration = 'La duración es requerida';
    } else if (isNaN(formData.duration) || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'La duración debe ser un número positivo';
    }
    
    if (!formData.intensity) {
      newErrors.intensity = 'La intensidad es requerida';
    }
    
    if (formData.calories_burned && (isNaN(formData.calories_burned) || parseInt(formData.calories_burned) < 0)) {
      newErrors.calories_burned = 'Las calorías quemadas deben ser un número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Formatear los datos para enviarlos al servidor
      const formattedData = {
        ...formData,
        duration: parseInt(formData.duration),
        calories_burned: formData.calories_burned ? parseInt(formData.calories_burned) : null,
        date: formData.date.toISOString().split('T')[0]
      };
      
      onSave(formattedData);
      
      // Resetear el formulario
      setFormData({
        activity_type: '',
        duration: '',
        intensity: '',
        calories_burned: '',
        date: new Date(),
        notes: ''
      });
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registrar Actividad Física</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tipo de Actividad"
              name="activity_type"
              value={formData.activity_type}
              onChange={handleChange}
              margin="normal"
              error={!!errors.activity_type}
              helperText={errors.activity_type}
              placeholder="Ej: Correr, Nadar, Ciclismo"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" error={!!errors.intensity}>
              <InputLabel>Intensidad</InputLabel>
              <Select
                name="intensity"
                value={formData.intensity}
                onChange={handleChange}
                label="Intensidad"
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="moderate">Moderada</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
              {errors.intensity && <FormHelperText>{errors.intensity}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duración (minutos)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              margin="normal"
              error={!!errors.duration}
              helperText={errors.duration}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Calorías Quemadas (opcional)"
              name="calories_burned"
              type="number"
              value={formData.calories_burned}
              onChange={handleChange}
              margin="normal"
              error={!!errors.calories_burned}
              helperText={errors.calories_burned}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                  />
                )}
                maxDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notas"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
            />
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

export default ActivityDialog; 