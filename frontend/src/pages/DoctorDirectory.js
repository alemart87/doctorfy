import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, CircularProgress, Alert, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { doctorsService } from '../services/api';

const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorsService.getDirectory();
      setDoctors(response.data.doctors);
      setError(null);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Error al cargar el directorio de médicos');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Directorio de Médicos
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre o especialidad"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredDoctors.length === 0 ? (
          <Alert severity="info">No se encontraron médicos</Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Dr. {doctor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Especialidad: {doctor.specialty}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Licencia: {doctor.license_number}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Contactar</Button>
                    <Button size="small">Ver Perfil</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default DoctorDirectory; 