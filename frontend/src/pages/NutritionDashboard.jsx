import React, { useState, useEffect, useCallback } from 'react';
import { Container, Paper, Typography, Box, Grid, CircularProgress, Alert, TextField, Button, LinearProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns'; // Para formatear fechas
import api from '../api/axios';

// Componente simple para mostrar macros
const MacroDisplay = ({ label, value, unit = 'g' }) => (
  <Box sx={{ textAlign: 'center', p: 1, border: '1px solid lightgray', borderRadius: 1 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="h6">{value?.toFixed(1) ?? '0.0'}{unit}</Typography>
  </Box>
);

const NutritionDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyData, setDailyData] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [goalLoading, setGoalLoading] = useState(false);

  // Función para cargar datos diarios
  const fetchDailyData = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    const formattedDate = format(date, 'yyyy-MM-dd');
    try {
      const response = await api.get(`/nutrition/summary/${formattedDate}`);
      setDailyData(response.data);
      setCalorieGoal(response.data.daily_calorie_goal || 2000); // Actualizar desde la respuesta
      setNewGoal(response.data.daily_calorie_goal || 2000); // Sincronizar input
    } catch (err) {
      console.error("Error fetching daily summary:", err);
      setError("No se pudo cargar el resumen diario.");
      setDailyData(null); // Resetear datos en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar y cuando cambia la fecha
  useEffect(() => {
    fetchDailyData(selectedDate);
  }, [selectedDate, fetchDailyData]);

  // Manejar cambio de objetivo
  const handleGoalUpdate = async () => {
    if (!newGoal || isNaN(parseInt(newGoal)) || parseInt(newGoal) <= 0) {
      setError("Introduce un objetivo calórico válido.");
      return;
    }
    setGoalLoading(true);
    setError(null);
    try {
      const response = await api.put('/nutrition/goal', { daily_calorie_goal: parseInt(newGoal) });
      setCalorieGoal(response.data.daily_calorie_goal);
      // Opcional: Recargar datos diarios si la meta afecta la visualización
      // fetchDailyData(selectedDate);
    } catch (err) {
      console.error("Error updating goal:", err);
      setError("No se pudo actualizar el objetivo.");
    } finally {
      setGoalLoading(false);
    }
  };

  // Calcular progreso
  const calorieProgress = dailyData?.calories && calorieGoal > 0
    ? (dailyData.calories / calorieGoal) * 100
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Dashboard Nutricional</Typography>

        {/* Selector de Fecha */}
        <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>Selecciona Fecha:</Typography>
          <DatePicker
            label="Fecha"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue || new Date())}
            renderInput={(params) => <TextField {...params} size="small" />}
            maxDate={new Date()} // No permitir fechas futuras
          />
        </Paper>

        {/* Resumen Diario */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Resumen del {format(selectedDate, 'dd/MM/yyyy')}
          </Typography>
          {loading && <CircularProgress />}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {!loading && dailyData && (
            <Box sx={{ mt: 2 }}>
              {/* Progreso Calórico */}
              <Typography variant="h6">Calorías Consumidas</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(calorieProgress, 100)} // No pasar de 100% visualmente
                  sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                  color={calorieProgress > 100 ? "error" : "primary"}
                />
                <Typography variant="body1">
                  {dailyData.calories} / {calorieGoal} kcal ({calorieProgress.toFixed(0)}%)
                </Typography>
              </Box>
               {calorieProgress > 100 && (
                 <Alert severity="warning" sx={{mb: 2}}>Has superado tu objetivo calórico.</Alert>
               )}

              {/* Macros */}
              <Typography variant="h6" sx={{ mt: 3 }}>Macronutrientes</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}><MacroDisplay label="Proteínas" value={dailyData.proteins} /></Grid>
                <Grid item xs={6} sm={3}><MacroDisplay label="Carbohidratos" value={dailyData.carbs} /></Grid>
                <Grid item xs={6} sm={3}><MacroDisplay label="Grasas" value={dailyData.fats} /></Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Configuración de Objetivo */}
        <Paper sx={{ p: 2 }}>
           <Typography variant="h6" gutterBottom>Objetivo Calórico Diario</Typography>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <TextField
               label="Kcal diarias"
               type="number"
               size="small"
               value={newGoal}
               onChange={(e) => setNewGoal(e.target.value)}
               InputProps={{ inputProps: { min: 1 } }}
             />
             <Button
               variant="contained"
               onClick={handleGoalUpdate}
               disabled={goalLoading}
             >
               {goalLoading ? <CircularProgress size={24} /> : 'Actualizar'}
             </Button>
           </Box>
        </Paper>

         {/* TODO: Añadir historial mensual o lista de entradas del día */}

      </Container>
    </LocalizationProvider>
  );
};

export default NutritionDashboard; 