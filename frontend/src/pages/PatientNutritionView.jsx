import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent,
  Divider,
  Button,
  TextField,
  MenuItem,
  LinearProgress,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Componente para mostrar macros
const MacroDisplay = ({ label, value, unit = 'g', color = 'primary.main' }) => (
  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="h5" sx={{ color }}>{value?.toFixed(1) ?? '0.0'}{unit}</Typography>
  </Box>
);

const PatientNutritionView = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Cargar datos del paciente
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/doctors/patients/${patientId}`);
        setPatient(response.data);
      } catch (err) {
        console.error('Error al cargar datos del paciente:', err);
        setError('No se pudieron cargar los datos del paciente.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.is_doctor && patientId) {
      fetchPatientData();
    }
  }, [patientId, user]);

  // Cargar resumen diario
  useEffect(() => {
    const fetchDailySummary = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await api.get(`/doctors/patients/${patientId}/nutrition/summary/${formattedDate}`);
        setDailySummary(response.data);
      } catch (err) {
        console.error('Error al cargar resumen diario:', err);
        setError('No se pudo cargar el resumen nutricional diario.');
      } finally {
        setLoading(false);
      }
    };

    fetchDailySummary();
  }, [patientId, selectedDate]);

  // Cargar datos para el gráfico según el rango de fechas
  useEffect(() => {
    const fetchChartData = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        let startDate, endDate;
        
        switch (dateRange) {
          case 'week':
            startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
            endDate = format(new Date(), 'yyyy-MM-dd');
            break;
          case 'month':
            startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
            endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
            break;
          case 'custom':
            // Usar fechas personalizadas si se implementa
            break;
          default:
            startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
            endDate = format(new Date(), 'yyyy-MM-dd');
        }
        
        const response = await api.get(`/doctors/patients/${patientId}/nutrition/logs`, {
          params: { startDate, endDate }
        });
        
        setNutritionLogs(response.data);
        
        // Preparar datos para el gráfico
        const chartData = response.data.map(log => ({
          date: format(new Date(log.log_date), 'dd/MM'),
          calories: log.calories,
          proteins: log.proteins,
          carbs: log.carbs,
          fats: log.fats
        }));
        
        setChartData(chartData);
      } catch (err) {
        console.error('Error al cargar datos para el gráfico:', err);
        setError('No se pudieron cargar los datos nutricionales históricos.');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [patientId, dateRange]);

  // Calcular progreso calórico
  const calorieProgress = dailySummary?.calories && dailySummary?.daily_calorie_goal
    ? (dailySummary.calories / dailySummary.daily_calorie_goal) * 100
    : 0;

  if (loading && !patient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {patient && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">
                Análisis Nutricional: {patient.first_name} {patient.last_name}
              </Typography>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Volver
              </Button>
            </Box>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Información del Paciente</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography><strong>Email:</strong> {patient.email}</Typography>
                    <Typography><strong>Edad:</strong> {patient.age || 'No disponible'}</Typography>
                    <Typography><strong>Género:</strong> {patient.gender || 'No disponible'}</Typography>
                    <Typography><strong>Altura:</strong> {patient.height ? `${patient.height} cm` : 'No disponible'}</Typography>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>Objetivo Calórico</Typography>
                  <Typography variant="h4">{dailySummary?.daily_calorie_goal || 2000} kcal/día</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Estadísticas Generales</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography><strong>Registros Nutricionales:</strong> {nutritionLogs.length}</Typography>
                    <Typography><strong>Último Registro:</strong> {nutritionLogs.length > 0 ? format(new Date(nutritionLogs[0].log_date), 'dd/MM/yyyy') : 'No hay registros'}</Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={calorieProgress > 100 ? 'Exceso Calórico' : 'Dentro del Objetivo'} 
                      color={calorieProgress > 100 ? 'error' : 'success'} 
                      sx={{ mr: 1 }}
                    />
                    {dailySummary?.proteins > 0 && (
                      <Chip 
                        label="Consumo de Proteínas" 
                        color="primary" 
                        sx={{ mr: 1 }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Selector de Fecha y Rango */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Seleccionar Fecha</Typography>
                  <DatePicker
                    label="Fecha"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue || new Date())}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    maxDate={new Date()}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Rango para Gráficos</Typography>
                  <TextField
                    select
                    fullWidth
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    label="Seleccionar Rango"
                  >
                    <MenuItem value="week">Última Semana</MenuItem>
                    <MenuItem value="month">Este Mes</MenuItem>
                    <MenuItem value="custom">Personalizado</MenuItem>
                  </TextField>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Resumen Diario */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Resumen del {format(selectedDate, 'dd/MM/yyyy')}
              </Typography>
              
              {loading && <CircularProgress size={24} sx={{ mb: 2 }} />}
              
              {dailySummary && (
                <Box sx={{ mt: 2 }}>
                  {/* Progreso Calórico */}
                  <Typography variant="h6">Calorías Consumidas</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(calorieProgress, 100)}
                      sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                      color={calorieProgress > 100 ? "error" : "primary"}
                    />
                    <Typography variant="body1">
                      {dailySummary.calories} / {dailySummary.daily_calorie_goal} kcal ({calorieProgress.toFixed(0)}%)
                    </Typography>
                  </Box>
                  
                  {calorieProgress > 100 && (
                    <Alert severity="warning" sx={{mb: 2}}>
                      El paciente ha superado su objetivo calórico diario.
                    </Alert>
                  )}

                  {/* Macros */}
                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Macronutrientes</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <MacroDisplay label="Proteínas" value={dailySummary.proteins} color="primary.main" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <MacroDisplay label="Carbohidratos" value={dailySummary.carbs} color="secondary.main" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <MacroDisplay label="Grasas" value={dailySummary.fats} color="warning.main" />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {!dailySummary && !loading && (
                <Alert severity="info">
                  No hay datos nutricionales para esta fecha.
                </Alert>
              )}
            </Paper>
            
            {/* Gráficos */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Tendencias Nutricionales</Typography>
              
              {chartData.length > 0 ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Calorías Diarias</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="calories" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                            name="Calorías"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Macronutrientes</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="proteins" fill="#8884d8" name="Proteínas" />
                          <Bar dataKey="carbs" fill="#82ca9d" name="Carbohidratos" />
                          <Bar dataKey="fats" fill="#ffc658" name="Grasas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  No hay suficientes datos para mostrar gráficos en el rango seleccionado.
                </Alert>
              )}
            </Paper>
          </>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default PatientNutritionView; 