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
  FormControlLabel,
  Switch,
  Autocomplete,
  FormHelperText
} from '@mui/material';

// Lista de especialidades médicas
const medicalSpecialties = [
  'Alergología',
  'Anestesiología',
  'Cardiología',
  'Cirugía Cardiovascular',
  'Cirugía General',
  'Cirugía Plástica',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Geriatría',
  'Ginecología y Obstetricia',
  'Hematología',
  'Infectología',
  'Medicina Familiar',
  'Medicina Interna',
  'Nefrología',
  'Neumología',
  'Neurología',
  'Neurocirugía',
  'Oftalmología',
  'Oncología',
  'Ortopedia y Traumatología',
  'Otorrinolaringología',
  'Pediatría',
  'Psiquiatría',
  'Radiología',
  'Reumatología',
  'Urología',
  'Otro'
];

// Lista de idiomas
const languages = [
  'Español',
  'Inglés',
  'Portugués',
  'Francés',
  'Alemán',
  'Italiano',
  'Guaraní',
  'Chino',
  'Japonés',
  'Coreano',
  'Árabe',
  'Ruso',
  'Otro'
];

const DoctorProfileEditDialog = ({ open, onClose, onSave, doctorData }) => {
  const [formData, setFormData] = useState({
    specialty: '',
    license_number: '',
    description: '',
    education: '',
    experience_years: '',
    consultation_fee: '',
    available_online: false,
    languages: [],
    office_address: '',
    office_phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [otherSpecialty, setOtherSpecialty] = useState('');
  
  useEffect(() => {
    if (doctorData) {
      setFormData({
        specialty: doctorData.specialty || '',
        license_number: doctorData.license_number || '',
        description: doctorData.description || '',
        education: doctorData.education || '',
        experience_years: doctorData.experience_years || '',
        consultation_fee: doctorData.consultation_fee || '',
        available_online: doctorData.available_online || false,
        languages: doctorData.languages || [],
        office_address: doctorData.office_address || '',
        office_phone: doctorData.office_phone || ''
      });
      
      // Verificar si la especialidad está en la lista o es "Otro"
      if (doctorData.specialty && !medicalSpecialties.includes(doctorData.specialty)) {
        setOtherSpecialty(doctorData.specialty);
        setFormData(prev => ({ ...prev, specialty: 'Otro' }));
      }
    }
  }, [doctorData, open]);
  
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
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleLanguagesChange = (event, newValue) => {
    setFormData({
      ...formData,
      languages: newValue
    });
  };
  
  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      specialty: value
    });
    
    if (value !== 'Otro') {
      setOtherSpecialty('');
    }
    
    // Limpiar error cuando el usuario corrige el campo
    if (errors.specialty) {
      setErrors({
        ...errors,
        specialty: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.specialty) {
      newErrors.specialty = 'La especialidad es requerida';
    }
    
    if (formData.specialty === 'Otro' && !otherSpecialty) {
      newErrors.otherSpecialty = 'Por favor, especifica tu especialidad';
    }
    
    if (!formData.license_number) {
      newErrors.license_number = 'El número de licencia es requerido';
    }
    
    if (formData.experience_years && (isNaN(formData.experience_years) || parseInt(formData.experience_years) < 0)) {
      newErrors.experience_years = 'Los años de experiencia deben ser un número positivo';
    }
    
    if (formData.consultation_fee && (isNaN(formData.consultation_fee) || parseFloat(formData.consultation_fee) < 0)) {
      newErrors.consultation_fee = 'El costo de consulta debe ser un número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Preparar los datos para enviar
      const dataToSave = {
        ...formData,
        specialty: formData.specialty === 'Otro' ? otherSpecialty : formData.specialty,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null
      };
      
      onSave(dataToSave);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Perfil Profesional</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" error={!!errors.specialty}>
              <InputLabel>Especialidad</InputLabel>
              <Select
                name="specialty"
                value={formData.specialty}
                onChange={handleSpecialtyChange}
                label="Especialidad"
              >
                {medicalSpecialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </Select>
              {errors.specialty && <FormHelperText>{errors.specialty}</FormHelperText>}
            </FormControl>
            
            {formData.specialty === 'Otro' && (
              <TextField
                fullWidth
                label="Especificar especialidad"
                value={otherSpecialty}
                onChange={(e) => setOtherSpecialty(e.target.value)}
                margin="normal"
                error={!!errors.otherSpecialty}
                helperText={errors.otherSpecialty}
              />
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Número de Licencia"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              margin="normal"
              error={!!errors.license_number}
              helperText={errors.license_number}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Años de Experiencia"
              name="experience_years"
              type="number"
              value={formData.experience_years}
              onChange={handleChange}
              margin="normal"
              error={!!errors.experience_years}
              helperText={errors.experience_years}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Costo de Consulta ($)"
              name="consultation_fee"
              type="number"
              value={formData.consultation_fee}
              onChange={handleChange}
              margin="normal"
              error={!!errors.consultation_fee}
              helperText={errors.consultation_fee}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dirección del Consultorio"
              name="office_address"
              value={formData.office_address}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono del Consultorio"
              name="office_phone"
              value={formData.office_phone}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={languages}
              value={formData.languages}
              onChange={handleLanguagesChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Idiomas"
                  margin="normal"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.available_online}
                  onChange={handleSwitchChange}
                  name="available_online"
                  color="primary"
                />
              }
              label="Disponible para consultas en línea"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción Profesional"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              placeholder="Describe tu experiencia, enfoque médico y especialización..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Educación y Formación"
              name="education"
              value={formData.education}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              placeholder="Detalla tu formación académica, universidades, especializaciones..."
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

export default DoctorProfileEditDialog; 