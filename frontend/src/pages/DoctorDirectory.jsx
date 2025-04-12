import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  InputAdornment, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';

const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/doctors/directory');
        console.log("Respuesta de la API (directorio de médicos):", response.data);
        
        // Verificar que cada médico tenga un ID válido
        const doctorsWithValidIds = response.data.doctors.filter(doctor => doctor.id);
        if (doctorsWithValidIds.length !== response.data.doctors.length) {
          console.warn("Algunos médicos no tienen ID válido:", 
            response.data.doctors.filter(doctor => !doctor.id));
        }
        
        setDoctors(response.data.doctors);
        setFilteredDoctors(response.data.doctors);
      } catch (err) {
        console.error('Error al cargar directorio de médicos:', err);
        setError('No se pudo cargar el directorio de médicos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filtrar médicos según el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = doctors.filter(
        doctor => 
          doctor.name.toLowerCase().includes(term) || 
          doctor.specialty.toLowerCase().includes(term)
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Abrir diálogo de contacto
  const handleContactClick = (doctor) => {
    setSelectedDoctor(doctor);
    setContactDialogOpen(true);
  };

  // Cerrar diálogo de contacto
  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
  };

  // Ver perfil del médico
  const handleViewProfile = (doctorId) => {
    console.log("Navegando al perfil del médico:", doctorId);
    navigate(`/doctors/${doctorId}`);
  };

  // Enviar mensaje al médico (simulado por ahora)
  const handleSendMessage = async () => {
    // Aquí iría la lógica para enviar un mensaje al médico
    // Por ahora, solo cerramos el diálogo
    setContactDialogOpen(false);
    // Mostrar algún tipo de confirmación al usuario
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Directorio de Médicos
      </Typography>

      {/* Buscador */}
      <TextField
        fullWidth
        placeholder="Buscar por nombre o especialidad"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Dr. {doctor.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Especialidad: {doctor.specialty}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Licencia: {doctor.license_number}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => {
                          console.log("Doctor para contactar:", doctor);
                          handleContactClick(doctor);
                        }}
                      >
                        Contactar
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        component={RouterLink}
                        to={`/doctors/${doctor.id}`}
                        onClick={() => console.log("Navegando a perfil con ID:", doctor.id)}
                      >
                        Ver Perfil
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                No se encontraron médicos que coincidan con tu búsqueda.
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {/* Diálogo de contacto */}
      <Dialog open={contactDialogOpen} onClose={handleCloseContactDialog}>
        <DialogTitle>Contactar a Dr. {selectedDoctor?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para contactar al Dr. {selectedDoctor?.name}, puedes enviarle un mensaje directo o utilizar la información de contacto proporcionada.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Mensaje"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSendMessage} color="primary" variant="contained">
            Enviar Mensaje
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorDirectory; 