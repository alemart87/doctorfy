import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  Divider, 
  Chip, 
  Avatar, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { 
  Phone as PhoneIcon, 
  Email as EmailIcon, 
  LocationOn as LocationIcon, 
  Language as LanguageIcon,
  School as SchoolIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ReviewForm from '../components/doctor/ReviewForm';

const DoctorProfileView = () => {
  const { doctorId } = useParams();
  console.log("Doctor ID recibido:", doctorId);
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definir la función fetchDoctorProfile dentro del componente
  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      console.log("Solicitando datos del doctor con ID:", doctorId);
      const response = await api.get(`/doctors/${doctorId}`);
      console.log("Respuesta de la API:", response.data);
      setDoctor(response.data);
    } catch (err) {
      console.error('Error al cargar perfil del médico:', err);
      setError('No se pudo cargar la información del médico. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchDoctorProfile();
    }
  }, [doctorId]);

  // Renderizar estrellas para la calificación
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} color="primary" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} color="primary" sx={{ opacity: 0.5 }} />);
      } else {
        stars.push(<StarBorderIcon key={i} color="primary" />);
      }
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {stars}
        <Typography variant="body2" sx={{ ml: 1 }}>
          ({rating.toFixed(1)})
        </Typography>
      </Box>
    );
  };

  // Función para recargar los datos del doctor después de enviar una reseña
  const handleReviewSubmitted = () => {
    // Recargar los datos del doctor para mostrar la nueva reseña
    fetchDoctorProfile();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/doctors')} 
          sx={{ mt: 2 }}
        >
          Volver al Directorio
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {doctor && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Dr. {doctor.name}
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/doctors')}>
              Volver al Directorio
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Información principal */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    src={doctor.profile_picture} 
                    alt={doctor.name}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    Dr. {doctor.name}
                  </Typography>
                  <Chip label={doctor.specialty} color="primary" sx={{ mb: 1 }} />
                  {doctor.average_rating && (
                    <Box sx={{ mt: 1 }}>
                      {renderRating(doctor.average_rating)}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <List>
                  {doctor.office_phone && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Teléfono" 
                        secondary={doctor.office_phone} 
                      />
                    </ListItem>
                  )}
                  {doctor.email && (
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={doctor.email} 
                      />
                    </ListItem>
                  )}
                  {doctor.office_address && (
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Dirección" 
                        secondary={doctor.office_address} 
                      />
                    </ListItem>
                  )}
                  {doctor.languages && doctor.languages.length > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <LanguageIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Idiomas" 
                        secondary={doctor.languages.join(', ')} 
                      />
                    </ListItem>
                  )}
                </List>

                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => navigate(`/doctors/${doctorId}/appointment`)}
                  >
                    Solicitar Cita
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Información detallada */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Acerca del Doctor
                </Typography>
                <Typography paragraph>
                  {doctor.description || 'No hay información disponible.'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Educación y Formación
                </Typography>
                <Typography paragraph>
                  {doctor.education || 'No hay información disponible.'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Experiencia
                </Typography>
                <Typography paragraph>
                  {doctor.experience_years ? `${doctor.experience_years} años de experiencia` : 'No hay información disponible.'}
                </Typography>
              </Paper>

              {/* Credenciales */}
              {doctor.credentials && doctor.credentials.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Credenciales
                  </Typography>
                  <List>
                    {doctor.credentials.map((credential, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SchoolIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={credential.title} 
                          secondary={`${credential.institution}, ${credential.year}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {/* Reseñas */}
              {doctor.reviews && doctor.reviews.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Reseñas de Pacientes
                  </Typography>
                  <Grid container spacing={2}>
                    {doctor.reviews.map((review, index) => (
                      <Grid item xs={12} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle1">
                                {review.user_name}
                              </Typography>
                              <Box>
                                {renderRating(review.rating)}
                              </Box>
                            </Box>
                            <Typography variant="body2">
                              {review.comment}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {new Date(review.created_at).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </Grid>
          </Grid>

          {/* Añadir el formulario de reseñas al final */}
          <ReviewForm 
            doctorId={doctorId} 
            onReviewSubmitted={handleReviewSubmitted} 
          />
        </>
      )}
    </Container>
  );
};

export default DoctorProfileView; 