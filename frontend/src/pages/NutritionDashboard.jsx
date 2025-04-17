import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  alpha,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Restaurant as RestaurantIcon,
  LocalDining as LocalDiningIcon,
  Opacity as OpacityIcon,
  FitnessCenter as FitnessCenterIcon,
  Fastfood as FastfoodIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import Aurora from '../components/Aurora';
import { useAuth } from '../context/AuthContext';

// Componente de gráfico circular con animación
const AnimatedCircularProgress = ({ value, maxValue, color, size = 120, thickness = 8, label, sublabel }) => {
  const theme = useTheme();
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const circumference = 2 * Math.PI * ((size - thickness) / 2);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const progressRef = useRef(null);
  
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.strokeDashoffset = strokeDashoffset;
    }
  }, [strokeDashoffset]);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, margin: 'auto' }}>
      {/* Círculo de fondo */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - thickness) / 2}
          fill="none"
          stroke={alpha(color, 0.2)}
          strokeWidth={thickness}
        />
        {/* Círculo de progreso */}
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={(size - thickness) / 2}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
          }}
        />
      </svg>
      
      {/* Texto central */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', opacity: 0.7 }}>
            {sublabel}
          </Typography>
        )}
      </Box>
  </Box>
);
};

// Componente de tarjeta de nutriente
const NutrientCard = ({ title, value, unit, icon, color, percentage, trend }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.15)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 8px 20px ${alpha(color, 0.3)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: alpha(color, 0.2),
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
          {unit}
        </Typography>
        
        {trend && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            {trend === 'up' ? (
              <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: '1rem' }} />
            ) : (
              <ArrowDownwardIcon sx={{ color: theme.palette.error.main, fontSize: '1rem' }} />
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600
              }}
            >
              {percentage}%
            </Typography>
          </Box>
        )}
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: alpha(color, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: color,
          },
        }}
      />
    </Paper>
  );
};

// Reemplazar completamente la función getMacroData
const getMacroData = () => {
  // Datos de ejemplo fijos para evitar errores
  return [
    {
      name: 'Proteínas',
      value: 124,
      color: '#4a90e2',
      amount: 124,
      unit: 'g'
    },
    {
      name: 'Carbohidratos',
      value: 171,
      color: '#f39c12',
      amount: 171,
      unit: 'g'
    },
    {
      name: 'Grasas',
      value: 61,
      color: '#e74c3c',
      amount: 61,
      unit: 'g'
    }
  ];
};

// Función mejorada para extraer datos nutricionales
const extractNutritionData = (analysisText) => {
  if (!analysisText) return { calories: 0, proteins: 0, carbs: 0, fats: 0 };
  
  // Patrones más flexibles
  const caloriesPattern = /(?:calorías|calor[ií]as|kcal|calorias|energía|energia)[^0-9]*(\d+)/i;
  const proteinsPattern = /(?:proteínas|proteinas)[^0-9]*(\d+)/i;
  const carbsPattern = /(?:carbohidratos|hidratos|carbos)[^0-9]*(\d+)/i;
  const fatsPattern = /(?:grasas|lípidos|lipidos)[^0-9]*(\d+)/i;

  console.log("Analizando texto:", analysisText.substring(0, 300) + "...");

  // Extraer valores
  const caloriesMatch = analysisText.match(caloriesPattern);
  const proteinsMatch = analysisText.match(proteinsPattern);
  const carbsMatch = analysisText.match(carbsPattern);
  const fatsMatch = analysisText.match(fatsPattern);

  // Valores extraídos
  const result = {
    calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
    proteins: proteinsMatch ? parseInt(proteinsMatch[1]) : 0,
    carbs: carbsMatch ? parseInt(carbsMatch[1]) : 0,
    fats: fatsMatch ? parseInt(fatsMatch[1]) : 0
  };

  console.log("Datos extraídos:", result);
  return result;
};

// Añadir selector de fechas
const DateRangeSelector = ({ dateRange, setDateRange }) => {
  const theme = useTheme();
  
  const handlePreviousWeek = () => {
    setDateRange({
      startDate: subDays(dateRange.startDate, 7),
      endDate: subDays(dateRange.endDate, 7)
    });
  };
  
  const handleNextWeek = () => {
    const today = new Date();
    const newEndDate = addDays(dateRange.endDate, 7);
    
    // No permitir fechas futuras
    if (newEndDate > today) {
      setDateRange({
        startDate: subDays(today, 6),
        endDate: today
      });
    } else {
      setDateRange({
        startDate: addDays(dateRange.startDate, 7),
        endDate: newEndDate
      });
    }
  };
  
  const handleToday = () => {
    const today = new Date();
    setDateRange({
      startDate: subDays(today, 6),
      endDate: today
    });
  };
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <IconButton onClick={handlePreviousWeek}>
        <ArrowBackIcon />
      </IconButton>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {format(dateRange.startDate, 'dd MMM', { locale: es })} - {format(dateRange.endDate, 'dd MMM yyyy', { locale: es })}
        </Typography>
      </Box>
      
      <Box>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={handleToday}
          sx={{ mr: 1 }}
        >
          Hoy
        </Button>
        <IconButton onClick={handleNextWeek} disabled={dateRange.endDate >= new Date()}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

// Componente principal del Dashboard Nutricional
const NutritionDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);
  const [dailyCalories, setDailyCalories] = useState([]);
  const [nutrients, setNutrients] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempCalorieGoal, setTempCalorieGoal] = useState(2000);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date()
  });
  
  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  // Cargar los análisis nutricionales
  const fetchNutritionData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError('No hay usuario autenticado');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      
      // Obtener los análisis nutricionales con el token
      const response = await axios.get('/api/nutrition/analyses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.analyses && response.data.analyses.length > 0) {
        console.log('Análisis nutricionales recibidos:', response.data);
        
        // Guardar los análisis
        const allAnalyses = response.data.analyses;
        
        // Filtrar análisis por rango de fechas
        const startDate = new Date(dateRange.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        const filteredAnalyses = allAnalyses.filter(analysis => {
          const analysisDate = new Date(analysis.created_at);
          return analysisDate >= startDate && analysisDate <= endDate;
        });
        
        setAnalyses(filteredAnalyses);
        
        // Extraer datos nutricionales de cada análisis
        const nutritionData = [];
        
        for (const analysis of allAnalyses) {
          const extractedData = extractNutritionData(analysis.analysis);
          nutritionData.push({
            id: analysis.id,
            date: new Date(analysis.created_at),
            ...extractedData
          });
        }
        
        console.log("Datos nutricionales extraídos:", nutritionData);
        
        // Agrupar por día para calorías diarias
        const dailyData = {};
        nutritionData.forEach(item => {
          const dateStr = format(item.date, 'yyyy-MM-dd');
          if (!dailyData[dateStr]) {
            dailyData[dateStr] = {
              date: dateStr,
              day: format(item.date, 'EEE', { locale: es }),
              calories: 0,
              goal: calorieGoal
            };
          }
          dailyData[dateStr].calories += item.calories;
        });
        
        // Convertir a array y ordenar por fecha
        const dailyCaloriesArray = Object.values(dailyData)
          .filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= startDate && dayDate <= endDate;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setDailyCalories(dailyCaloriesArray);
        
        // Calcular totales de nutrientes para el período seleccionado
        const filteredNutritionData = nutritionData.filter(item => {
          return item.date >= startDate && item.date <= endDate;
        });
        
        const totalProteins = filteredNutritionData.reduce((sum, item) => sum + item.proteins, 0);
        const totalCarbs = filteredNutritionData.reduce((sum, item) => sum + item.carbs, 0);
        const totalFats = filteredNutritionData.reduce((sum, item) => sum + item.fats, 0);
        
        setNutrients([
          { name: 'Proteínas', value: totalProteins, color: '#4a90e2' },
          { name: 'Carbohidratos', value: totalCarbs, color: '#f39c12' },
          { name: 'Grasas', value: totalFats, color: '#e74c3c' }
        ]);
        
      } else {
        setError('No hay análisis nutricionales disponibles');
      }
    } catch (error) {
      console.error('Error al obtener análisis nutricionales:', error);
      setError('No se pudieron cargar los análisis nutricionales');
    } finally {
      setLoading(false);
    }
  }, [user, calorieGoal, dateRange]);
  
  // Actualizar objetivo calórico
  const handleGoalUpdate = () => {
    if (tempCalorieGoal >= 500 && tempCalorieGoal <= 5000) {
      setCalorieGoal(tempCalorieGoal);
      setEditingGoal(false);
      
      // Actualizar el objetivo en los datos diarios
      const updatedDailyCalories = dailyCalories.map(day => ({
        ...day,
        goal: tempCalorieGoal
      }));
      
      setDailyCalories(updatedDailyCalories);
    }
  };
  
  // Cargar datos al montar el componente
  useEffect(() => {
    fetchNutritionData();
  }, [fetchNutritionData]);

  // Si no hay usuario autenticado, mostrar mensaje
  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: '#000'
      }}>
        <Typography variant="h5" color="error">
          Debes iniciar sesión para ver esta página
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: '#000' }}>
      <Aurora />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                mb: 4, 
                color: theme.palette.primary.main,
                textAlign: 'center'
              }}
            >
              Dashboard Nutricional
            </Typography>
          </motion.div>
          
          {/* Añadir el selector de fechas aquí */}
          <motion.div variants={itemVariants}>
            <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
          </motion.div>
          
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '50vh' 
            }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'white' 
            }}>
              <Typography variant="h6" color="error" gutterBottom>
                {error}
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={fetchNutritionData}
                sx={{ mt: 2, mr: 2 }}
              >
                Reintentar
              </Button>
              <Button 
                variant="contained" 
                color="secondary"
                onClick={() => navigate('/nutrition')}
                startIcon={<RestaurantIcon />}
                sx={{ mt: 2 }}
              >
                Analizar Alimento
              </Button>
            </Box>
          ) : analyses.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'white' 
            }}>
              <Typography variant="h6" gutterBottom>
                No hay análisis nutricionales disponibles
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/nutrition')}
                startIcon={<RestaurantIcon />}
                sx={{ mt: 2 }}
              >
                Analizar Alimento
              </Button>
            </Box>
          ) : (
            <>
              {/* Gráficos y estadísticas */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Calorías diarias */}
                <Grid item xs={12} md={8}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Calorías Diarias
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Objetivo diario:
                        </Typography>
                        
                        {editingGoal ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                              size="small"
                              type="number"
                              value={tempCalorieGoal}
                              onChange={(e) => setTempCalorieGoal(parseInt(e.target.value) || 0)}
                              sx={{ width: 100, mr: 1 }}
                            />
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={handleGoalUpdate}
                            >
                              Guardar
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {calorieGoal} kcal
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setTempCalorieGoal(calorieGoal);
                                setEditingGoal(true);
                              }}
                              sx={{ ml: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dailyCalories}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <RechartsTooltip 
                            formatter={(value, name) => [
                              `${value} kcal`, 
                              name === 'calories' ? 'Consumidas' : 'Objetivo'
                            ]} 
                          />
                          <Bar 
                            dataKey="calories" 
                            name="Consumidas" 
                            fill={theme.palette.primary.main} 
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            dataKey="goal" 
                            name="Objetivo" 
                            fill={alpha(theme.palette.primary.main, 0.3)} 
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Distribución de macronutrientes */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      Macronutrientes
                    </Typography>
                    
                    <Box sx={{ height: 220, mb: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={nutrients}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {nutrients.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value, name) => [`${value}g`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                      {nutrients.map((nutrient, index) => (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: nutrient.color,
                              display: 'inline-block',
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {nutrient.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {nutrient.value}g
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Análisis nutricionales recientes */}
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    mb: 4
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                    Análisis Nutricionales Recientes
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {analyses.slice(0, 4).map((analysis) => (
                      <Grid item xs={12} md={6} key={analysis.id}>
                        <Card 
                          sx={{ 
                            display: 'flex', 
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: 6
                            }
                          }}
                          onClick={() => navigate(`/nutrition/analysis/${analysis.id}`)}
                        >
                          <Box sx={{ width: 120, flexShrink: 0 }}>
                            <img 
                              src={`/api/nutrition/analyses/${analysis.id}/image`}
                              alt="Alimento analizado" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Análisis del {new Date(analysis.created_at).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                              {analysis.analysis.substring(0, 150)}...
                            </Typography>
                            <Button 
                              size="small" 
                              sx={{ alignSelf: 'flex-start', mt: 'auto' }}
                              onClick={(e) => {
                                e.stopPropagation(); // Evitar que se propague al Card
                                navigate(`/nutrition/analysis/${analysis.id}`);
                              }}
                            >
                              Ver detalles
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {analyses.length > 4 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button 
                        variant="outlined"
                        onClick={() => navigate('/nutrition/analyses')}
                      >
                        Ver todos los análisis
                      </Button>
                    </Box>
                  )}
                </Paper>
              </motion.div>
              
              {/* Botón para añadir comida */}
              <motion.div 
                variants={itemVariants}
                style={{ 
                  position: 'fixed', 
                  bottom: 30, 
                  right: 30, 
                  zIndex: 10 
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/nutrition')}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.5)}`,
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <RestaurantIcon fontSize="large" />
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default NutritionDashboard; 