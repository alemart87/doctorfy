import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

// Lista de ejercicios con calorías quemadas por minuto (estimaciones aproximadas)
// Puedes expandir esta lista o incluso cargarla desde el backend
const exercises = [
  { name: 'Caminata (moderada)', caloriesPerMinute: 4.5 },
  { name: 'Correr (moderado)', caloriesPerMinute: 10 },
  { name: 'Ciclismo (moderado)', caloriesPerMinute: 8 },
  { name: 'Natación (moderada)', caloriesPerMinute: 7 },
  { name: 'Entrenamiento de fuerza', caloriesPerMinute: 5 },
  { name: 'Yoga', caloriesPerMinute: 3 },
  { name: 'Baile', caloriesPerMinute: 6 },
  { name: 'Otro (introducir manualmente)', caloriesPerMinute: 0 }, // Opción manual
];

const ExerciseLogModal = ({ open, onClose, date, onActivityLogged }) => {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [duration, setDuration] = useState(''); // Duración en minutos
  const [manualCalories, setManualCalories] = useState(''); // Para la opción 'Otro'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedExerciseData = exercises.find(ex => ex.name === selectedExercise);
  const estimatedCalories = selectedExerciseData && selectedExerciseData.caloriesPerMinute > 0 && duration
    ? (selectedExerciseData.caloriesPerMinute * parseInt(duration)).toFixed(1)
    : 0;

  const handleLogExercise = async () => {
    setError(null);
    const durationMinutes = parseInt(duration);
    let caloriesToLog;

    if (selectedExercise === 'Otro (introducir manualmente)') {
        caloriesToLog = parseFloat(manualCalories);
        if (isNaN(caloriesToLog) || caloriesToLog <= 0) {
            setError('Ingresa un valor válido de calorías quemadas.');
            return;
        }
    } else {
        caloriesToLog = parseFloat(estimatedCalories);
    }


    if (!selectedExercise || isNaN(durationMinutes) || durationMinutes <= 0 || isNaN(caloriesToLog) || caloriesToLog <= 0) {
      setError('Por favor, completa todos los campos correctamente.');
      return;
    }

    setLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const response = await axios.post('/api/calories/log-activity', {
        activity_type: selectedExercise,
        duration: durationMinutes,
        calories_burned: caloriesToLog,
        date: formattedDate,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      onActivityLogged(date); // Llama a la función para refrescar datos en la página principal
      handleClose(); // Cierra el modal
    } catch (err) {
      console.error("Error logging exercise:", err);
      setError(err.response?.data?.error || 'Error al registrar la actividad.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedExercise('');
    setDuration('');
    setManualCalories('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Registrar Actividad Física</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth margin="normal">
          <InputLabel id="exercise-select-label">Ejercicio</InputLabel>
          <Select
            labelId="exercise-select-label"
            value={selectedExercise}
            label="Ejercicio"
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {exercises.map((ex) => (
              <MenuItem key={ex.name} value={ex.name}>
                {ex.name} {ex.caloriesPerMinute > 0 ? `(~${ex.caloriesPerMinute} kcal/min)` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          label="Duración (minutos)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          inputProps={{ min: "1" }}
        />

        {selectedExercise === 'Otro (introducir manualmente)' && (
            <TextField
                fullWidth
                margin="normal"
                label="Calorías Quemadas (Manual)"
                type="number"
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                inputProps={{ min: "1", step: "0.1" }}
            />
        )}

        {selectedExercise && selectedExercise !== 'Otro (introducir manualmente)' && duration > 0 && (
          <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontWeight: 'bold' }}>
            Calorías quemadas estimadas: {estimatedCalories} kcal
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="secondary">Cancelar</Button>
        <Button
          onClick={handleLogExercise}
          variant="contained"
          disabled={loading || !selectedExercise || !duration || (selectedExercise === 'Otro (introducir manualmente)' && !manualCalories)}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseLogModal; 