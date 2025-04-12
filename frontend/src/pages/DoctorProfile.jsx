import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Button, 
  Tabs, 
  Tab, 
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DoctorProfileEditDialog from '../components/doctor/DoctorProfileEditDialog';
import CredentialDialog from '../components/doctor/CredentialDialog';
import ProfilePictureUpload from '../components/profile/ProfilePictureUpload';

const DoctorProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profileData, setProfileData] = useState({
    specialty: '',
    license_number: '',
    description: '',
    education: '',
    experience_years: '',
    consultation_fee: '',
    available_online: false,
    languages: [],
    office_address: '',
    office_phone: '',
    office_hours: '',
    website: '',
    social_media: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    credentials: []
  });
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para diálogos
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  
  // Cargar datos del perfil
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!user || !user.is_doctor) return;
      
      try {
        setLoading(true);
        const response = await api.get('/doctor-profile');
        
        if (response.data) {
          setProfileData({
            ...profileData,
            ...response.data,
            // Asegurarse de que todos los campos existan
            social_media: response.data.social_media || {
              facebook: '',
              twitter: '',
              instagram: '',
              linkedin: ''
            },
            credentials: response.data.credentials || []
          });
          
          if (response.data.profile_picture) {
            setProfilePicture(response.data.profile_picture);
          }
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        setError('No se pudo cargar la información del perfil. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  // Manejar cambios en campos booleanos
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: checked
    });
  };

  // Manejar cambios en campos anidados (social media)
  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      social_media: {
        ...profileData.social_media,
        [name]: value
      }
    });
  };

  // Manejar cambios en idiomas (array)
  const handleLanguagesChange = (e) => {
    setProfileData({
      ...profileData,
      languages: e.target.value
    });
  };

  // Añadir nueva credencial
  const addCredential = () => {
    setProfileData({
      ...profileData,
      credentials: [
        ...profileData.credentials,
        { title: '', institution: '', year: '', description: '' }
      ]
    });
  };

  // Actualizar credencial
  const updateCredential = (index, field, value) => {
    const updatedCredentials = [...profileData.credentials];
    updatedCredentials[index] = {
      ...updatedCredentials[index],
      [field]: value
    };
    
    setProfileData({
      ...profileData,
      credentials: updatedCredentials
    });
  };

  // Eliminar credencial
  const removeCredential = (index) => {
    const updatedCredentials = [...profileData.credentials];
    updatedCredentials.splice(index, 1);
    
    setProfileData({
      ...profileData,
      credentials: updatedCredentials
    });
  };

  // Manejar cambio de imagen de perfil
  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Guardar perfil
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const formData = new FormData();
      
      // Añadir datos del perfil
      formData.append('data', JSON.stringify(profileData));
      
      // Añadir imagen de perfil si existe
      if (profilePicture && profilePicture.startsWith('data:')) {
        // Convertir base64 a blob
        const response = await fetch(profilePicture);
        const blob = await response.blob();
        formData.append('profile_picture', blob, 'profile.jpg');
      }
      
      // Enviar datos
      await api.post('/doctor-profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Perfil actualizado correctamente');
      
      // Mostrar mensaje de éxito por 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      setError('No se pudo guardar la información del perfil. Por favor, intenta de nuevo más tarde.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Mi Perfil Médico
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Grid container spacing={3}>
        {/* Información básica */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información Básica
            </Typography>
            
            {/* Foto de perfil */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  mb: 2,
                  position: 'relative',
                  bgcolor: 'grey.200',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Foto de perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin foto
                  </Typography>
                )}
              </Box>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
              >
                Cambiar Foto
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </Button>
            </Box>
            
            <TextField
              fullWidth
              label="Especialidad"
              name="specialty"
              value={profileData.specialty}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Número de Licencia"
              name="license_number"
              value={profileData.license_number}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Años de Experiencia"
              name="experience_years"
              type="number"
              value={profileData.experience_years}
              onChange={handleChange}
              margin="normal"
              inputProps={{ min: 0 }}
            />
            
            <TextField
              fullWidth
              label="Tarifa de Consulta"
              name="consultation_fee"
              type="number"
              value={profileData.consultation_fee}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="languages-label">Idiomas</InputLabel>
              <Select
                labelId="languages-label"
                multiple
                name="languages"
                value={profileData.languages || []}
                onChange={handleLanguagesChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="Español">Español</MenuItem>
                <MenuItem value="Inglés">Inglés</MenuItem>
                <MenuItem value="Portugués">Portugués</MenuItem>
                <MenuItem value="Francés">Francés</MenuItem>
                <MenuItem value="Alemán">Alemán</MenuItem>
                <MenuItem value="Italiano">Italiano</MenuItem>
                <MenuItem value="Guaraní">Guaraní</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={profileData.available_online}
                  onChange={handleSwitchChange}
                  name="available_online"
                  color="primary"
                />
              }
              label="Disponible para consultas online"
              sx={{ mt: 2 }}
            />
          </Paper>
        </Grid>
        
        {/* Información de contacto y descripción */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información de Contacto
            </Typography>
            
            <TextField
              fullWidth
              label="Dirección del Consultorio"
              name="office_address"
              value={profileData.office_address}
              onChange={handleChange}
              margin="normal"
              placeholder="Ej: Av. España 123, Asunción"
            />
            
            <TextField
              fullWidth
              label="Teléfono del Consultorio"
              name="office_phone"
              value={profileData.office_phone}
              onChange={handleChange}
              margin="normal"
              placeholder="Ej: +595 21 123456"
            />
            
            <TextField
              fullWidth
              label="Horario de Atención"
              name="office_hours"
              value={profileData.office_hours}
              onChange={handleChange}
              margin="normal"
              placeholder="Ej: Lunes a Viernes de 8:00 a 17:00"
            />
            
            <TextField
              fullWidth
              label="Sitio Web"
              name="website"
              value={profileData.website}
              onChange={handleChange}
              margin="normal"
              placeholder="Ej: https://www.misitio.com"
            />
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Redes Sociales
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facebook"
                  name="facebook"
                  value={profileData.social_media?.facebook || ''}
                  onChange={handleSocialMediaChange}
                  margin="normal"
                  placeholder="Ej: https://facebook.com/miusuario"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Twitter"
                  name="twitter"
                  value={profileData.social_media?.twitter || ''}
                  onChange={handleSocialMediaChange}
                  margin="normal"
                  placeholder="Ej: https://twitter.com/miusuario"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  name="instagram"
                  value={profileData.social_media?.instagram || ''}
                  onChange={handleSocialMediaChange}
                  margin="normal"
                  placeholder="Ej: https://instagram.com/miusuario"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  name="linkedin"
                  value={profileData.social_media?.linkedin || ''}
                  onChange={handleSocialMediaChange}
                  margin="normal"
                  placeholder="Ej: https://linkedin.com/in/miusuario"
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Descripción Profesional
            </Typography>
            
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={profileData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              placeholder="Describe tu experiencia, especialización y enfoque profesional..."
            />
            
            <TextField
              fullWidth
              label="Educación y Formación"
              name="education"
              value={profileData.education}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              placeholder="Detalla tu formación académica, especializaciones, etc..."
            />
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Credenciales y Certificaciones
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={addCredential}
              >
                Añadir Credencial
              </Button>
            </Box>
            
            {profileData.credentials && profileData.credentials.length > 0 ? (
              profileData.credentials.map((credential, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardHeader
                    action={
                      <IconButton onClick={() => removeCredential(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                    title={`Credencial ${index + 1}`}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Título"
                          value={credential.title}
                          onChange={(e) => updateCredential(index, 'title', e.target.value)}
                          placeholder="Ej: Especialización en Cardiología"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Institución"
                          value={credential.institution}
                          onChange={(e) => updateCredential(index, 'institution', e.target.value)}
                          placeholder="Ej: Universidad Nacional de Asunción"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Año"
                          type="number"
                          value={credential.year}
                          onChange={(e) => updateCredential(index, 'year', e.target.value)}
                          placeholder="Ej: 2015"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Descripción"
                          multiline
                          rows={2}
                          value={credential.description}
                          onChange={(e) => updateCredential(index, 'description', e.target.value)}
                          placeholder="Breve descripción de la credencial..."
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert severity="info">
                No has añadido ninguna credencial. Haz clic en "Añadir Credencial" para comenzar.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Guardar Todos los Cambios'}
        </Button>
      </Box>
    </Container>
  );
};

export default DoctorProfile; 