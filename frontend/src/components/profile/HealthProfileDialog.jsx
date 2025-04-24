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
  FormControlLabel,
  Switch,
  Slider,
  Typography
} from '@mui/material';

const HealthProfileDialog = ({ open, onClose, onSave, healthProfile }) => {
  const [formData, setFormData] = useState({
    activity_level: '',
    preexisting_conditions: '',
    allergies: '',
    smoking: false,
    alcohol_consumption: '',
    sleep_hours: 7,
    stress_level: 5,
    diet_type: ''
  });
  
  useEffect(() => {
    if (healthProfile) {
      setFormData({
        activity_level: healthProfile.activity_level || '',
        preexisting_conditions: healthProfile.preexisting_conditions || '',
        allergies: healthProfile.allergies || '',
        smoking: healthProfile.smoking || false,
        alcohol_consumption: healthProfile.alcohol_consumption || '',
        sleep_hours: healthProfile.sleep_hours || 7,
        stress_level: healthProfile.stress_level || 5,
        diet_type: healthProfile.diet_type || ''
      });
    }
  }, [healthProfile, open]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleSliderChange = (name) => (e, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = () => {
    onSave(formData);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Perfil de Salud</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Nivel de Actividad</InputLabel>
              <Select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
                label="Nivel de Actividad"
              >
                <MenuItem value="sedentary">Sedentario</MenuItem>
                <MenuItem value="light">Actividad Ligera</MenuItem>
                <MenuItem value="moderate">Actividad Moderada</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="very_active">Muy Activo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Dieta</InputLabel>
              <Select
                name="diet_type"
                value={formData.diet_type}
                onChange={handleChange}
                label="Tipo de Dieta"
              >
                <MenuItem value="omnivore">Omnívora</MenuItem>
                <MenuItem value="vegetarian">Vegetariana</MenuItem>
                <MenuItem value="vegan">Vegana</MenuItem>
                <MenuItem value="pescatarian">Pescetariana</MenuItem>
                <MenuItem value="keto">Cetogénica</MenuItem>
                <MenuItem value="paleo">Paleo</MenuItem>
                <MenuItem value="other">Otra</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Condiciones Preexistentes"
              name="preexisting_conditions"
              value={formData.preexisting_conditions}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              helperText="Diabetes, hipertensión, asma, etc. (separadas por comas)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Alergias"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              helperText="Medicamentos, alimentos, etc. (separadas por comas)"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.smoking}
                  onChange={handleSwitchChange}
                  name="smoking"
                  color="primary"
                />
              }
              label="Fumador"
              sx={{ mt: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Consumo de Alcohol</InputLabel>
              <Select
                name="alcohol_consumption"
                value={formData.alcohol_consumption}
                onChange={handleChange}
                label="Consumo de Alcohol"
              >
                <MenuItem value="none">Ninguno</MenuItem>
                <MenuItem value="occasional">Ocasional</MenuItem>
                <MenuItem value="moderate">Moderado</MenuItem>
                <MenuItem value="frequent">Frecuente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>
              Horas de Sueño Diarias: {formData.sleep_hours}
            </Typography>
            <Slider
              value={formData.sleep_hours}
              onChange={handleSliderChange('sleep_hours')}
              min={4}
              max={12}
              step={0.5}
              marks={[
                { value: 4, label: '4h' },
                { value: 8, label: '8h' },
                { value: 12, label: '12h' }
              ]}
              valueLabelDisplay="auto"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>
              Nivel de Estrés: {formData.stress_level} / 10
            </Typography>
            <Slider
              value={formData.stress_level}
              onChange={handleSliderChange('stress_level')}
              min={1}
              max={10}
              step={1}
              marks={[
                { value: 1, label: 'Bajo' },
                { value: 5, label: 'Medio' },
                { value: 10, label: 'Alto' }
              ]}
              valueLabelDisplay="auto"
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

export default HealthProfileDialog; 