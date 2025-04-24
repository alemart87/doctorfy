import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Componente para el panel de filtros
const FilterPanel = ({ filters, setFilters, applyFilters }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Filtros</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Nombre del paciente"
            variant="outlined"
            size="small"
            value={filters.name}
            onChange={(e) => setFilters({...filters, name: e.target.value})}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            size="small"
            value={filters.email}
            onChange={(e) => setFilters({...filters, email: e.target.value})}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Tipo de estudio"
            variant="outlined"
            size="small"
            value={filters.studyType}
            onChange={(e) => setFilters({...filters, studyType: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={applyFilters}
              startIcon={<SearchIcon />}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Componente principal del panel de médicos
const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    studyType: ''
  });

  // Cargar pacientes al iniciar
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await api.get('/doctors/patients');
        setPatients(response.data);
        setFilteredPatients(response.data);
      } catch (err) {
        console.error('Error al cargar pacientes:', err);
        setError('No se pudieron cargar los pacientes. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.is_doctor) {
      fetchPatients();
    }
  }, [user]);

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = [...patients];
    
    if (filters.name) {
      filtered = filtered.filter(patient => 
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    if (filters.email) {
      filtered = filtered.filter(patient => 
        patient.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    setFilteredPatients(filtered);
  };

  // Cargar estudios de un paciente
  const loadPatientStudies = async (patientId) => {
    setLoading(true);
    try {
      const response = await api.get(`/doctors/patients/${patientId}/studies`);
      setStudies(response.data);
      setTabValue(1); // Cambiar a la pestaña de estudios
    } catch (err) {
      console.error('Error al cargar estudios:', err);
      setError('No se pudieron cargar los estudios del paciente.');
    } finally {
      setLoading(false);
    }
  };

  // Ver detalles de un estudio
  const viewStudyDetails = (studyId) => {
    navigate(`/medical-studies/${studyId}`);
  };

  // Ver análisis nutricional
  const viewNutritionAnalysis = (patientId) => {
    navigate(`/doctor/patient/${patientId}/nutrition`);
  };

  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejar cambio de pestaña
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Panel de Médico</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <FilterPanel 
        filters={filters} 
        setFilters={setFilters} 
        applyFilters={applyFilters} 
      />
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChangeTab} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Mis Pacientes" />
          <Tab label="Estudios" disabled={studies.length === 0} />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabValue === 0 && (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Edad</TableCell>
                        <TableCell>Género</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPatients
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>{`${patient.first_name} ${patient.last_name}`}</TableCell>
                            <TableCell>{patient.email}</TableCell>
                            <TableCell>{patient.age || 'N/A'}</TableCell>
                            <TableCell>{patient.gender || 'N/A'}</TableCell>
                            <TableCell>
                              <IconButton 
                                color="primary" 
                                onClick={() => loadPatientStudies(patient.id)}
                                title="Ver estudios"
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => viewNutritionAnalysis(patient.id)}
                                sx={{ ml: 1 }}
                              >
                                Nutrición
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredPatients.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
            
            {tabValue === 1 && (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studies
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((study) => (
                          <TableRow key={study.id}>
                            <TableCell>{study.type}</TableCell>
                            <TableCell>{new Date(study.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={study.status} 
                                color={study.status === 'completed' ? 'success' : 'warning'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => viewStudyDetails(study.id)}
                              >
                                Ver Detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={studies.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </>
        )}
      </Paper>
      
      {/* Resumen de estadísticas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total de Pacientes</Typography>
              <Typography variant="h3">{patients.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Estudios Pendientes</Typography>
              <Typography variant="h3">
                {studies.filter(s => s.status !== 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Consultas Recientes</Typography>
              <Typography variant="h3">0</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorDashboard; 