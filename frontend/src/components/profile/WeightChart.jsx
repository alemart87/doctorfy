import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WeightChart = ({ weightRecords, height }) => {
  // Ordenar registros por fecha
  const sortedRecords = useMemo(() => {
    return [...weightRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [weightRecords]);
  
  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    return sortedRecords.map(record => ({
      date: new Date(record.date).toLocaleDateString(),
      weight: record.weight,
      bmi: height ? calculateBMI(record.weight, height) : null
    }));
  }, [sortedRecords, height]);
  
  // Calcular estadísticas
  const stats = useMemo(() => {
    if (weightRecords.length === 0) return { current: 0, min: 0, max: 0, avg: 0, change: 0 };
    
    const weights = weightRecords.map(r => r.weight);
    const current = weightRecords[weightRecords.length - 1].weight;
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    
    let change = 0;
    if (weightRecords.length > 1) {
      const first = sortedRecords[0].weight;
      const last = sortedRecords[sortedRecords.length - 1].weight;
      change = last - first;
    }
    
    return { current, min, max, avg: avg.toFixed(1), change: change.toFixed(1) };
  }, [weightRecords, sortedRecords]);
  
  // Calcular IMC
  function calculateBMI(weight, height) {
    if (!height || height <= 0) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  
  // Obtener categoría de IMC
  function getBMICategory(bmi) {
    if (bmi < 18.5) return { text: 'Bajo peso', color: '#FFC107' };
    if (bmi < 25) return { text: 'Peso normal', color: '#4CAF50' };
    if (bmi < 30) return { text: 'Sobrepeso', color: '#FF9800' };
    return { text: 'Obesidad', color: '#F44336' };
  }
  
  // Calcular IMC actual
  const currentBMI = useMemo(() => {
    if (!height || weightRecords.length === 0) return null;
    return calculateBMI(stats.current, height);
  }, [height, stats.current, weightRecords.length]);
  
  // Obtener categoría de IMC actual
  const bmiCategory = useMemo(() => {
    if (!currentBMI) return null;
    return getBMICategory(currentBMI);
  }, [currentBMI]);
  
  return (
    <Box>
      {weightRecords.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No tienes registros de peso.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Estadísticas de peso */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Peso Actual
                  </Typography>
                  <Typography variant="h4">
                    {stats.current} kg
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Cambio
                  </Typography>
                  <Typography 
                    variant="h4" 
                    color={stats.change > 0 ? 'error' : stats.change < 0 ? 'success' : 'text.primary'}
                  >
                    {stats.change > 0 ? '+' : ''}{stats.change} kg
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {currentBMI && (
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      IMC
                    </Typography>
                    <Typography variant="h4">
                      {currentBMI}
                    </Typography>
                    <Typography variant="caption" sx={{ color: bmiCategory.color }}>
                      {bmiCategory.text}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Promedio
                  </Typography>
                  <Typography variant="h4">
                    {stats.avg} kg
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Gráfico de peso */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evolución del Peso
            </Typography>
            
            <Box sx={{ height: 300, mt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    name="Peso (kg)"
                    stroke="#2196F3" 
                    activeDot={{ r: 8 }} 
                  />
                  {height && (
                    <Line 
                      type="monotone" 
                      dataKey="bmi" 
                      name="IMC"
                      stroke="#FF9800" 
                      strokeDasharray="5 5"
                    />
                  )}
                  {height && (
                    <>
                      <ReferenceLine y={18.5} stroke="#FFC107" strokeDasharray="3 3" />
                      <ReferenceLine y={25} stroke="#4CAF50" strokeDasharray="3 3" />
                      <ReferenceLine y={30} stroke="#F44336" strokeDasharray="3 3" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
            
            {height && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#FFC107', mr: 1 }} />
                  <Typography variant="caption">Bajo peso (&lt;18.5)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#4CAF50', mr: 1 }} />
                  <Typography variant="caption">Normal (18.5-24.9)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#FF9800', mr: 1 }} />
                  <Typography variant="caption">Sobrepeso (25-29.9)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#F44336', mr: 1 }} />
                  <Typography variant="caption">Obesidad (≥30)</Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default WeightChart; 