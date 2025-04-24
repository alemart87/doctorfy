import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

const BloodPressureChart = ({ bloodPressureRecords }) => {
  // Ordenar registros por fecha
  const sortedRecords = useMemo(() => {
    return [...bloodPressureRecords].sort((a, b) => new Date(a.measured_at) - new Date(b.measured_at));
  }, [bloodPressureRecords]);
  
  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    return sortedRecords.map(record => ({
      date: new Date(record.measured_at).toLocaleString(),
      systolic: record.systolic,
      diastolic: record.diastolic,
      pulse: record.pulse
    }));
  }, [sortedRecords]);
  
  // Calcular estadísticas
  const stats = useMemo(() => {
    if (bloodPressureRecords.length === 0) return { 
      current: { systolic: 0, diastolic: 0, pulse: 0 },
      avg: { systolic: 0, diastolic: 0, pulse: 0 }
    };
    
    const current = bloodPressureRecords[bloodPressureRecords.length - 1];
    
    const avgSystolic = bloodPressureRecords.reduce((sum, r) => sum + r.systolic, 0) / bloodPressureRecords.length;
    const avgDiastolic = bloodPressureRecords.reduce((sum, r) => sum + r.diastolic, 0) / bloodPressureRecords.length;
    
    let avgPulse = 0;
    const recordsWithPulse = bloodPressureRecords.filter(r => r.pulse);
    if (recordsWithPulse.length > 0) {
      avgPulse = recordsWithPulse.reduce((sum, r) => sum + r.pulse, 0) / recordsWithPulse.length;
    }
    
    return { 
      current: { 
        systolic: current.systolic, 
        diastolic: current.diastolic, 
        pulse: current.pulse || 0 
      },
      avg: { 
        systolic: avgSystolic.toFixed(0), 
        diastolic: avgDiastolic.toFixed(0), 
        pulse: avgPulse.toFixed(0) 
      }
    };
  }, [bloodPressureRecords]);
  
  // Obtener categoría de presión arterial
  function getBPCategory(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) {
      return { text: 'Normal', color: '#4CAF50' };
    } else if (systolic < 130 && diastolic < 80) {
      return { text: 'Elevada', color: '#FFC107' };
    } else if (systolic < 140 || diastolic < 90) {
      return { text: 'Hipertensión Etapa 1', color: '#FF9800' };
    } else {
      return { text: 'Hipertensión Etapa 2', color: '#F44336' };
    }
  }
  
  // Obtener categoría actual
  const currentCategory = useMemo(() => {
    if (bloodPressureRecords.length === 0) return null;
    return getBPCategory(stats.current.systolic, stats.current.diastolic);
  }, [stats.current.systolic, stats.current.diastolic, bloodPressureRecords.length]);
  
  return (
    <Box>
      {bloodPressureRecords.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No tienes registros de presión arterial.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Estadísticas de presión arterial */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Presión Actual
                  </Typography>
                  <Typography variant="h4">
                    {stats.current.systolic}/{stats.current.diastolic}
                  </Typography>
                  {currentCategory && (
                    <Typography variant="caption" sx={{ color: currentCategory.color }}>
                      {currentCategory.text}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Promedio
                  </Typography>
                  <Typography variant="h4">
                    {stats.avg.systolic}/{stats.avg.diastolic}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Pulso Promedio
                  </Typography>
                  <Typography variant="h4">
                    {stats.avg.pulse}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    lpm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Gráfico de presión arterial */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evolución de la Presión Arterial
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
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    name="Sistólica"
                    stroke="#F44336" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    name="Diastólica"
                    stroke="#2196F3" 
                    activeDot={{ r: 8 }} 
                  />
                  {chartData.some(d => d.pulse) && (
                    <Line 
                      type="monotone" 
                      dataKey="pulse" 
                      name="Pulso"
                      stroke="#4CAF50" 
                      strokeDasharray="5 5"
                    />
                  )}
                  
                  {/* Referencias para categorías */}
                  <ReferenceLine y={120} stroke="#4CAF50" strokeDasharray="3 3" />
                  <ReferenceLine y={130} stroke="#FFC107" strokeDasharray="3 3" />
                  <ReferenceLine y={140} stroke="#F44336" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#4CAF50', mr: 1 }} />
                <Typography variant="caption">Normal (&lt;120/80)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#FFC107', mr: 1 }} />
                <Typography variant="caption">Elevada (120-129/&lt;80)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#FF9800', mr: 1 }} />
                <Typography variant="caption">Hipertensión 1 (130-139/80-89)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#F44336', mr: 1 }} />
                <Typography variant="caption">Hipertensión 2 (≥140/≥90)</Typography>
              </Box>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default BloodPressureChart; 