import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

const BloodPressureDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    measured_at: new Date(),
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
  
  const handleDateTimeChange = (dateTime) => {
    setFormData({
      ...formData,
      measured_at: dateTime
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.systolic) {
      newErrors.systolic = 'La presión sistólica es requerida';
    } else if (isNaN(formData.systolic) || parseInt(formData.systolic) <= 0) {
      newErrors.systolic = 'La presión sistólica debe ser un número positivo';
    }
    
    if (!formData.diastolic) {
      newErrors.diastolic = 'La presión diastólica es requerida';
    } else if (isNaN(formData.diastolic) || parseInt(formData.diastolic) <= 0) {
      newErrors.diastolic = 'La presión diastólica debe ser un número positivo';
    }
    
    if (formData.pulse && (isNaN(formData.pulse) || parseInt(formData.pulse) <= 0)) {
      newErrors.pulse = 'El pulso debe ser un número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Formatear los datos para enviarlos al servidor
      const formattedData = {
        ...formData,
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        pulse: formData.pulse ? parseInt(formData.pulse) : null,
        measured_at: formData.measured_at.toISOString()
      };
      
      onSave(formattedData);
      
      // Resetear el formulario
      setFormData({
        systolic: '',
        diastolic: '',
        pulse: '',
        measured_at: new Date(),
        notes: ''
      });
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Presión Arterial</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sistólica (mmHg)"
              name="systolic"
              type="number"
              value={formData.systolic}
              onChange={handleChange}
              margin="normal"
              error={!!errors.systolic}
              helperText={errors.systolic}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Diastólica (mmHg)"
              name="diastolic"
              type="number"
              value={formData.diastolic}
              onChange={handleChange}
              margin="normal"
              error={!!errors.diastolic}
              helperText={errors.diastolic}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pulso (lpm)"
              name="pulse"
              type="number"
              value={formData.pulse}
              onChange={handleChange}
              margin="normal"
              error={!!errors.pulse}
              helperText={errors.pulse}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DateTimePicker
                label="Fecha y Hora"
                value={formData.measured_at}
                onChange={handleDateTimeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                  />
                )}
                maxDateTime={new Date()}
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

export default BloodPressureDialog; 