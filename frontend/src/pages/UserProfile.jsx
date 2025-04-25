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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  LocalHospital as MedicalIcon,
  DirectionsRun as ActivityIcon,
  MonitorWeight as WeightIcon,
  Medication as MedicationIcon,
  BloodtypeOutlined as BloodPressureIcon,
  Edit as EditIcon,
  Add as AddIcon,
  LocalHospital
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ProfileEditDialog from '../components/profile/ProfileEditDialog';
import HealthProfileDialog from '../components/profile/HealthProfileDialog';
import WeightDialog from '../components/profile/WeightDialog';
import MedicationDialog from '../components/profile/MedicationDialog';
import BloodPressureDialog from '../components/profile/BloodPressureDialog';
import ActivityDialog from '../components/profile/ActivityDialog';
import ProfilePictureUpload from '../components/profile/ProfilePictureUpload';
import HealthMetricsChart from '../components/profile/HealthMetricsChart';
import MedicationList from '../components/profile/MedicationList';
import ActivityList from '../components/profile/ActivityList';
import WeightChart from '../components/profile/WeightChart';
import BloodPressureChart from '../components/profile/BloodPressureChart';
import HealthAnalysis from '../components/profile/HealthAnalysis';

const UserProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para diálogos
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [healthProfileDialogOpen, setHealthProfileDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [bloodPressureDialogOpen, setBloodPressureDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  
  // Estados para datos de salud
  const [medications, setMedications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [bloodPressureRecords, setBloodPressureRecords] = useState([]);
  const [healthAnalysis, setHealthAnalysis] = useState(null);
  
  // Cargar datos del perfil
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile/me');
        setProfileData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del perfil:', err);
        setError('No se pudieron cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  
  // Cargar datos de salud cuando cambia la pestaña
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        switch (tabValue) {
          case 1: // Medicamentos
            const medResponse = await api.get('/profile/medications');
            setMedications(medResponse.data.medications);
            break;
          case 2: // Actividad física
            const actResponse = await api.get('/profile/physical-activities');
            setActivities(actResponse.data.activities);
            break;
          case 3: // Peso
            const weightResponse = await api.get('/profile/weight');
            setWeightRecords(weightResponse.data.weight_records);
            break;
          case 4: // Presión arterial
            const bpResponse = await api.get('/profile/blood-pressure');
            setBloodPressureRecords(bpResponse.data.blood_pressure_records);
            break;
          case 5: // Análisis de salud
            const analysisResponse = await api.get('/profile/health-analysis');
            setHealthAnalysis(analysisResponse.data);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Error al cargar datos de salud:', err);
      }
    };
    
    if (!loading && profileData) {
      fetchHealthData();
    }
  }, [tabValue, loading, profileData]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Actualizar Perfil (con manejo de carga/error)
  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await api.put('/profile/update', updatedData);
      setProfileData(response.data.user); // Actualizar estado local
      setProfileDialogOpen(false); // Cerrar diálogo
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      // Aquí podrías establecer un error general si quieres,
      // pero no se pasará al diálogo como antes.
      // setError('No se pudo actualizar el perfil.');
    }
  };
  
  const handleHealthProfileUpdate = async (healthData) => {
    try {
      const response = await api.post('/profile/health-profile', healthData);
      setProfileData({ ...profileData, health_profile: response.data.health_profile });
      setHealthProfileDialogOpen(false);
    } catch (err) { console.error('Error al actualizar perfil de salud:', err); }
  };
  
  const handleAddWeight = async (weightData) => {
    try {
      const response = await api.post('/profile/weight', weightData);
      setWeightRecords([response.data.weight_record, ...weightRecords]);
      setProfileData({ ...profileData, weight: response.data.weight_record.weight, bmi: response.data.bmi });
      setWeightDialogOpen(false);
    } catch (err) { console.error('Error al agregar peso:', err); }
  };
  
  const handleAddMedication = async (medicationData) => {
    try {
      const response = await api.post('/profile/medications', medicationData);
      setMedications([response.data.medication, ...medications]);
      setMedicationDialogOpen(false);
    } catch (err) { console.error('Error al agregar medicamento:', err); }
  };
  
  const handleAddBloodPressure = async (bpData) => {
    try {
      const response = await api.post('/profile/blood-pressure', bpData);
      setBloodPressureRecords([response.data.blood_pressure, ...bloodPressureRecords]);
      setBloodPressureDialogOpen(false);
    } catch (err) { console.error('Error al agregar presión arterial:', err); }
  };
  
  const handleAddActivity = async (activityData) => {
    try {
      const response = await api.post('/profile/physical-activities', activityData);
      setActivities([response.data.activity, ...activities]);
      setActivityDialogOpen(false);
    } catch (err) { console.error('Error al agregar actividad física:', err); }
  };
  
  // ─────────────────────  SUBIDA FOTO PERFIL  ────────────────────
  const uploadPicture = async (file) => {
    const fd = new FormData();
    fd.append('file', file, file.name);

    // usamos axios "crudo" para que no herede Content-Type:application/json
    const token = localStorage.getItem('token');
    return (await import('axios')).default.post(
      '/api/profile/upload-profile-picture',
      fd,
      { headers: { Authorization:`Bearer ${token}` } }
    );
  };

  const handleProfilePictureUpdate = async (file) => {
    try {
      const { data } = await uploadPicture(file);
      console.log("Respuesta de upload-profile-picture:", data);
      if (data && data.profile_picture) {
        setProfileData(prev => ({
          ...prev,
          profile_picture: data.profile_picture
        }));
        setPictureDialogOpen(false);
      } else {
        console.error("La respuesta de la API no contenía el nuevo nombre de archivo 'profile_picture'.");
      }
    } catch (err) {
      console.error('Error al actualizar imagen de perfil:', err);
    }
  };

  /*  El diálogo "Cambiar foto" usa este handler directo
      (same lógica que la función anterior)                       */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try{
      const { data } = await uploadPicture(file);
      setProfileData(prev => ({ ...prev, profile_picture:data.profile_picture }));
    }catch(err){
      console.error(err);
      alert('Error al subir la imagen');
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={profileData.profile_picture ? `/uploads/${profileData.profile_picture}?t=${Date.now()}` : null}
              alt={profileData.first_name || profileData.email}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={() => setPictureDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Cambiar foto
            </Button>
            <Typography variant="h5" gutterBottom>
              {profileData.first_name && profileData.last_name 
                ? `${profileData.first_name} ${profileData.last_name}`
                : profileData.email}
            </Typography>
            <Chip 
              label={profileData.is_doctor ? "Doctor" : "Paciente"} 
              color={profileData.is_doctor ? "primary" : "secondary"}
              sx={{ mb: 1 }}
            />
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4">Mi Perfil</Typography>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={() => setProfileDialogOpen(true)}
              >
                Editar Perfil
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Email</Typography>
                <Typography variant="body1">{profileData.email}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Edad</Typography>
                <Typography variant="body1">{profileData.age || 'No especificada'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Género</Typography>
                <Typography variant="body1">{profileData.gender || 'No especificado'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Altura</Typography>
                <Typography variant="body1">{profileData.height ? `${profileData.height} cm` : 'No especificada'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Peso actual</Typography>
                <Typography variant="body1">{profileData.weight ? `${profileData.weight} kg` : 'No especificado'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">IMC</Typography>
                <Typography variant="body1">{profileData.bmi ? profileData.bmi : 'No disponible'}</Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<FavoriteIcon />}
                onClick={() => setHealthProfileDialogOpen(true)}
                sx={{ mr: 2, mb: 1 }}
              >
                {profileData.health_profile ? 'Actualizar Perfil de Salud' : 'Crear Perfil de Salud'}
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary"
                startIcon={<WeightIcon />}
                onClick={() => setWeightDialogOpen(true)}
                sx={{ mr: 2, mb: 1 }}
              >
                Registrar Peso
              </Button>
              
              <Button 
                variant="outlined" 
                color="info"
                startIcon={<BloodPressureIcon />}
                onClick={() => setBloodPressureDialogOpen(true)}
                sx={{ mb: 1 }}
              >
                Registrar Presión Arterial
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<PersonIcon />} label="Resumen" />
            <Tab icon={<MedicationIcon />} label="Medicamentos" />
            <Tab icon={<ActivityIcon />} label="Actividad Física" />
            <Tab icon={<WeightIcon />} label="Peso" />
            <Tab icon={<BloodPressureIcon />} label="Presión Arterial" />
            <Tab icon={<FavoriteIcon />} label="Análisis de Salud" />
          </Tabs>
        </Box>
        
        {/* Contenido de las pestañas */}
        <Box sx={{ py: 3 }}>
          {/* Resumen */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Perfil de Salud
                    </Typography>
                    {profileData.health_profile ? (
                      <List>
                        <ListItem>
                          <ListItemIcon><FavoriteIcon /></ListItemIcon>
                          <ListItemText 
                            primary="Nivel de Actividad" 
                            secondary={profileData.health_profile.activity_level || 'No especificado'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><MedicalIcon /></ListItemIcon>
                          <ListItemText 
                            primary="Condiciones Preexistentes" 
                            secondary={profileData.health_profile.preexisting_conditions || 'Ninguna'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocalHospital /></ListItemIcon>
                          <ListItemText 
                            primary="Alergias" 
                            secondary={profileData.health_profile.allergies || 'Ninguna'} 
                          />
                        </ListItem>
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          No has creado tu perfil de salud
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={() => setHealthProfileDialogOpen(true)}
                          startIcon={<AddIcon />}
                        >
                          Crear Perfil de Salud
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Métricas Recientes
                    </Typography>
                    <HealthMetricsChart 
                      weight={weightRecords.length > 0 ? weightRecords[0].weight : null}
                      bmi={profileData.bmi}
                      bloodPressure={bloodPressureRecords.length > 0 ? {
                        systolic: bloodPressureRecords[0].systolic,
                        diastolic: bloodPressureRecords[0].diastolic
                      } : null}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Estudios Médicos Recientes
                    </Typography>
                    {/* Aquí iría un componente para mostrar los estudios médicos recientes */}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Medicamentos */}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Mis Medicamentos</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setMedicationDialogOpen(true)}
                >
                  Agregar Medicamento
                </Button>
              </Box>
              
              <MedicationList medications={medications} />
            </Box>
          )}
          
          {/* Actividad Física */}
          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Mi Actividad Física</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setActivityDialogOpen(true)}
                >
                  Registrar Actividad
                </Button>
              </Box>
              
              <ActivityList activities={activities} />
            </Box>
          )}
          
          {/* Peso */}
          {tabValue === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Mi Peso</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setWeightDialogOpen(true)}
                >
                  Registrar Peso
                </Button>
              </Box>
              
              <WeightChart weightRecords={weightRecords} height={profileData.height} />
            </Box>
          )}
          
          {/* Presión Arterial */}
          {tabValue === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Mi Presión Arterial</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setBloodPressureDialogOpen(true)}
                >
                  Registrar Presión
                </Button>
              </Box>
              
              <BloodPressureChart bloodPressureRecords={bloodPressureRecords} />
            </Box>
          )}
          
          {/* Análisis de Salud */}
          {tabValue === 5 && (
            <Box>
              <Typography variant="h5" gutterBottom>Análisis de Salud</Typography>
              
              {healthAnalysis ? (
                <HealthAnalysis analysis={healthAnalysis} />
              ) : (
                <Alert severity="info">
                  Completa tu perfil de salud y registra tus métricas para obtener un análisis personalizado.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Diálogos */}
      <ProfileEditDialog 
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        onSave={handleProfileUpdate}
        userData={profileData}
      />
      
      <HealthProfileDialog 
        open={healthProfileDialogOpen}
        onClose={() => setHealthProfileDialogOpen(false)}
        onSave={handleHealthProfileUpdate}
        healthProfile={profileData.health_profile}
      />
      
      <WeightDialog 
        open={weightDialogOpen}
        onClose={() => setWeightDialogOpen(false)}
        onSave={handleAddWeight}
      />
      
      <MedicationDialog 
        open={medicationDialogOpen}
        onClose={() => setMedicationDialogOpen(false)}
        onSave={handleAddMedication}
      />
      
      <BloodPressureDialog 
        open={bloodPressureDialogOpen}
        onClose={() => setBloodPressureDialogOpen(false)}
        onSave={handleAddBloodPressure}
      />
      
      <ActivityDialog 
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        onSave={handleAddActivity}
      />
      
      <ProfilePictureUpload 
        open={pictureDialogOpen}
        onClose={() => setPictureDialogOpen(false)}
        onSave={handleProfilePictureUpdate}
      />
    </Container>
  );
};

export default UserProfile; 