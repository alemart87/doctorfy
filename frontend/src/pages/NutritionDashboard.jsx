import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Edit as EditIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
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

// En su lugar, crear una función que genere los datos de macronutrientes dinámicamente
const getMacroData = (nutritionData) => {
  if (!nutritionData) return [];
  
  return [
    { name: 'Proteínas', value: nutritionData.macros.protein.amount, color: '#4a90e2' },
    { name: 'Carbohidratos', value: nutritionData.macros.carbs.amount, color: '#f39c12' },
    { name: 'Grasas', value: nutritionData.macros.fat.amount, color: '#e74c3c' },
  ];
};

// Componente principal del Dashboard Nutricional
const NutritionDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)), // Una semana atrás
    endDate: new Date() // Hoy
  });
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(1800);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempCalorieGoal, setTempCalorieGoal] = useState(1800);
  
  // Datos de ejemplo para los gráficos
  const weeklyData = [
    { day: 'Lun', calories: 1950, goal: 1800 },
    { day: 'Mar', calories: 1750, goal: 1800 },
    { day: 'Mié', calories: 2100, goal: 1800 },
    { day: 'Jue', calories: 1850, goal: 1800 },
    { day: 'Vie', calories: 1600, goal: 1800 },
    { day: 'Sáb', calories: 2250, goal: 1800 },
    { day: 'Dom', calories: 1800, goal: 1800 },
  ];
  
  const mealData = [
    { name: 'Desayuno', calories: 450, protein: 20, carbs: 50, fat: 15 },
    { name: 'Almuerzo', calories: 750, protein: 40, carbs: 60, fat: 30 },
    { name: 'Merienda', calories: 300, protein: 15, carbs: 30, fat: 10 },
    { name: 'Cena', calories: 650, protein: 35, carbs: 45, fat: 25 },
    { name: 'Snacks', calories: 100, protein: 5, carbs: 10, fat: 4 },
  ];
  
  const waterIntake = [
    { time: '8:00', amount: 250 },
    { time: '10:00', amount: 200 },
    { time: '12:30', amount: 300 },
    { time: '15:00', amount: 250 },
    { time: '17:30', amount: 200 },
    { time: '20:00', amount: 300 },
  ];
  
  // Función para cargar datos nutricionales basados en el rango de fechas
  const fetchNutritionData = useCallback(async () => {
    setLoading(true);
    try {
      // Aquí normalmente harías una llamada a la API con el rango de fechas
      // Por ahora, simulamos una respuesta con datos más realistas
      
      // Formatear fechas para la API
      const startDateStr = format(dateRange.startDate, 'yyyy-MM-dd');
      const endDateStr = format(dateRange.endDate, 'yyyy-MM-dd');
      
      console.log(`Fetching nutrition data from ${startDateStr} to ${endDateStr}`);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar datos realistas basados en el rango de fechas
      const daysDiff = Math.round((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      // Generar datos diarios para el rango
      const dailyData = Array.from({ length: daysDiff }, (_, i) => {
        const currentDate = new Date(dateRange.startDate);
        currentDate.setDate(dateRange.startDate.getDate() + i);
        
        // Variación realista en los valores diarios
        const calorieVariation = Math.random() * 400 - 200; // -200 a +200
        const proteinVariation = Math.random() * 20 - 10; // -10 a +10
        const carbsVariation = Math.random() * 30 - 15; // -15 a +15
        const fatVariation = Math.random() * 15 - 7; // -7 a +7
        
        return {
          date: format(currentDate, 'yyyy-MM-dd'),
          calories: Math.round(1800 + calorieVariation),
          protein: Math.round(120 + proteinVariation),
          carbs: Math.round(170 + carbsVariation),
          fat: Math.round(60 + fatVariation),
          water: Math.round(1500 + Math.random() * 1000 - 500), // 1000 a 2000 ml
        };
      });
      
      // Calcular promedios y totales para el período
      const avgCalories = Math.round(dailyData.reduce((sum, day) => sum + day.calories, 0) / daysDiff);
      const avgProtein = Math.round(dailyData.reduce((sum, day) => sum + day.protein, 0) / daysDiff);
      const avgCarbs = Math.round(dailyData.reduce((sum, day) => sum + day.carbs, 0) / daysDiff);
      const avgFat = Math.round(dailyData.reduce((sum, day) => sum + day.fat, 0) / daysDiff);
      const avgWater = Math.round(dailyData.reduce((sum, day) => sum + day.water, 0) / daysDiff);
      
      // Datos para el dashboard
      const data = {
        calories: {
          amount: avgCalories,
          goal: 1800,
          percentage: Math.round((avgCalories / 1800) * 100)
        },
        macros: {
          protein: {
            amount: avgProtein,
            goal: 120,
            percentage: Math.round((avgProtein / 120) * 100)
          },
          carbs: {
            amount: avgCarbs,
            goal: 170,
            percentage: Math.round((avgCarbs / 170) * 100)
          },
          fat: {
            amount: avgFat,
            goal: 60,
            percentage: Math.round((avgFat / 60) * 100)
          }
        },
        water: {
          amount: avgWater,
          goal: 2000,
          percentage: Math.round((avgWater / 2000) * 100)
        },
        micronutrients: {
          vitaminC: {
            amount: Math.round(65 + Math.random() * 20 - 10),
            goal: 90,
            unit: 'mg'
          },
          calcium: {
            amount: Math.round(800 + Math.random() * 200 - 100),
            goal: 1000,
            unit: 'mg'
          },
          iron: {
            amount: Math.round(12 + Math.random() * 6 - 3),
            goal: 18,
            unit: 'mg'
          }
        },
        meals: {
          breakfast: Math.round(avgCalories * 0.25),
          lunch: Math.round(avgCalories * 0.35),
          dinner: Math.round(avgCalories * 0.30),
          snacks: Math.round(avgCalories * 0.10)
        },
        dailyData: dailyData,
        weeklyData: dailyData.map(day => ({
          day: format(new Date(day.date), 'EEE', { locale: es }),
          calories: day.calories,
          goal: 1800
        }))
      };
      
      setNutritionData(data);
      setCalorieGoal(data.calories.goal);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      // Mostrar mensaje de error
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchNutritionData();
  }, [fetchNutritionData]);

  // Función para actualizar el objetivo calórico
  const handleGoalUpdate = () => {
    if (tempCalorieGoal >= 500 && tempCalorieGoal <= 5000) {
      setCalorieGoal(tempCalorieGoal);
      setNutritionData(prev => ({
        ...prev,
        calories: {
          ...prev.calories,
          goal: tempCalorieGoal,
          percentage: Math.round((prev.calories.amount / tempCalorieGoal) * 100)
        }
      }));
      setEditingGoal(false);
    }
  };

  // Función para manejar cambios en el rango de fechas
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };
  
  const getCalorieStatus = () => {
    if (!nutritionData) return { color: theme.palette.info.main, status: 'Cargando...' };
    
    const { consumed, goal } = nutritionData.calories;
    const percentage = (consumed / goal) * 100;
    
    if (percentage > 110) {
      return { 
        color: theme.palette.error.main, 
        status: 'Meta excedida', 
        icon: <WarningIcon />,
        message: 'Has superado tu objetivo calórico en más del 10%.'
      };
    } else if (percentage > 100) {
      return { 
        color: theme.palette.warning.main, 
        status: 'Meta alcanzada', 
        icon: <WarningIcon />,
        message: 'Has alcanzado tu objetivo calórico diario.'
      };
    } else if (percentage > 80) {
      return { 
        color: theme.palette.success.main, 
        status: 'Buen progreso', 
        icon: <CheckCircleIcon />,
        message: 'Estás en buen camino para alcanzar tu objetivo diario.'
      };
    } else {
      return { 
        color: theme.palette.info.main, 
        status: 'En progreso', 
        icon: <TrendingUpIcon />,
        message: 'Aún tienes calorías disponibles para consumir hoy.'
      };
    }
  };
  
  const calorieStatus = getCalorieStatus();
  
  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      pt: 8, 
      pb: 6,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Fondo con Aurora */}
      <Aurora
        colorStops={["#3A29FF", "#4A90E2", "#2ECC71"]}
        blend={0.3}
        amplitude={0.8}
        speed={0.3}
      />
      
      <Container maxWidth="xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Encabezado */}
          <motion.div variants={itemVariants}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Dashboard Nutricional
          </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}>
                <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    size="small"
                    type="date"
                    value={format(dateRange.startDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        setDateRange(prev => ({
                          ...prev,
                          startDate: newDate
                        }));
                      }
                    }}
                    InputProps={{
                      sx: { 
                        fontSize: '0.875rem',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'transparent'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'transparent'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'transparent'
                        }
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ mx: 1 }}>a</Typography>
                  <TextField
                    size="small"
                    type="date"
                    value={format(dateRange.endDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        setDateRange(prev => ({
                          ...prev,
                          endDate: newDate
                        }));
                      }
                    }}
                    InputProps={{
                      sx: { 
                        fontSize: '0.875rem',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'transparent'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'transparent'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'transparent'
                        }
                      }
                    }}
                  />
                </Box>
                <Tooltip title="Actualizar datos">
                  <IconButton 
                    size="small" 
                    onClick={fetchNutritionData}
                    sx={{ ml: 1 }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<RestaurantIcon />}
                onClick={() => navigate('/nutrition')}
                sx={{ 
                  ml: 2,
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 2
                }}
              >
                Analizar Alimento
              </Button>
            </Box>
          </motion.div>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Resumen principal */}
              <motion.div variants={itemVariants}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {/* Calorías consumidas */}
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Calorías Consumidas
                        </Typography>
                        <Chip
                          icon={calorieStatus.icon}
                          label={calorieStatus.status}
                          color={calorieStatus.color === theme.palette.error.main ? 'error' : 
                                 calorieStatus.color === theme.palette.warning.main ? 'warning' : 
                                 calorieStatus.color === theme.palette.success.main ? 'success' : 'info'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <AnimatedCircularProgress
                          value={nutritionData.calories.amount}
                          maxValue={nutritionData.calories.goal}
                          color={calorieStatus.color}
                          size={180}
                          thickness={12}
                          label="calorías"
                          sublabel={`de ${nutritionData.calories.goal} kcal`}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                        {calorieStatus.message}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Objetivo diario:
                        </Typography>
                        
                        {editingGoal ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
             <TextField
                              size="small"
               type="number"
                              value={tempCalorieGoal}
                              onChange={(e) => setTempCalorieGoal(Number(e.target.value))}
                              sx={{ width: 100, mr: 1 }}
                              InputProps={{
                                endAdornment: <Typography variant="caption">kcal</Typography>,
                              }}
             />
             <Button
                              size="small" 
               variant="contained"
               onClick={handleGoalUpdate}
                              sx={{ minWidth: 'auto', p: '4px 8px' }}
             >
                              <CheckCircleIcon fontSize="small" />
             </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mr: 1 }}>
                              {nutritionData.calories.goal} kcal
                            </Typography>
                            <IconButton size="small" onClick={() => {
                              setTempCalorieGoal(nutritionData.calories.goal);
                              setEditingGoal(true);
                            }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
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
                              data={getMacroData(nutritionData)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              animationDuration={1000}
                            >
                              {getMacroData(nutritionData).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value, name) => [`${value}g`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                        {getMacroData(nutritionData).map((macro, index) => (
                          <Box key={index} sx={{ textAlign: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: macro.color,
                                display: 'inline-block',
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {macro.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {macro.value}g
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                  
                  {/* Tendencia semanal */}
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
                        Tendencia Semanal
                      </Typography>
                      
                      <Box sx={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={nutritionData.weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis domain={[0, 'dataMax + 200']} />
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
                              animationDuration={1000}
                            />
                            <Bar 
                              dataKey="goal" 
                              name="Objetivo" 
                              fill={alpha(theme.palette.primary.main, 0.3)} 
                              radius={[4, 4, 0, 0]} 
                              animationDuration={1000}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </motion.div>
              
              {/* Detalles nutricionales */}
              <motion.div variants={itemVariants}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {/* Tarjetas de nutrientes */}
                  <Grid item xs={12} md={3}>
                    <NutrientCard
                      title="Proteínas"
                      value={nutritionData.macros.protein.amount}
                      unit="g"
                      icon={<FitnessCenterIcon />}
                      color="#4a90e2"
                      percentage={(nutritionData.macros.protein.amount / nutritionData.macros.protein.goal) * 100}
                      trend="up"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <NutrientCard
                      title="Carbohidratos"
                      value={nutritionData.macros.carbs.amount}
                      unit="g"
                      icon={<FastfoodIcon />}
                      color="#f39c12"
                      percentage={(nutritionData.macros.carbs.amount / nutritionData.macros.carbs.goal) * 100}
                      trend="down"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <NutrientCard
                      title="Grasas"
                      value={nutritionData.macros.fat.amount}
                      unit="g"
                      icon={<LocalDiningIcon />}
                      color="#e74c3c"
                      percentage={(nutritionData.macros.fat.amount / nutritionData.macros.fat.goal) * 100}
                      trend="up"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <NutrientCard
                      title="Agua"
                      value={nutritionData.water.amount}
                      unit="ml"
                      icon={<OpacityIcon />}
                      color="#3498db"
                      percentage={(nutritionData.water.amount / nutritionData.water.goal) * 100}
                    />
                  </Grid>
                </Grid>
              </motion.div>
              
              {/* Gráficos detallados */}
              <motion.div variants={itemVariants}>
                <Grid container spacing={3}>
                  {/* Distribución de calorías por comida */}
                  <Grid item xs={12} md={6}>
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
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                        Distribución por Comidas
                      </Typography>
                      
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={nutritionData.dailyData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <RechartsTooltip
                              formatter={(value, name) => {
                                if (name === 'calories') return [`${value} kcal`, 'Calorías'];
                                if (name === 'protein') return [`${value}g`, 'Proteínas'];
                                if (name === 'carbs') return [`${value}g`, 'Carbohidratos'];
                                if (name === 'fat') return [`${value}g`, 'Grasas'];
                                return [value, name];
                              }}
                            />
                            <Bar dataKey="calories" name="Calorías" fill={theme.palette.primary.main} animationDuration={1000} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  {/* Micronutrientes */}
                  <Grid item xs={12} md={6}>
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
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                        Micronutrientes Clave
                      </Typography>
                      
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              {
                                name: 'Vitamina C',
                                value: (nutritionData.micronutrients.vitaminC.amount / nutritionData.micronutrients.vitaminC.goal) * 100,
                                amount: nutritionData.micronutrients.vitaminC.amount,
                                goal: nutritionData.micronutrients.vitaminC.goal,
                                unit: nutritionData.micronutrients.vitaminC.unit
                              },
                              {
                                name: 'Calcio',
                                value: (nutritionData.micronutrients.calcium.amount / nutritionData.micronutrients.calcium.goal) * 100,
                                amount: nutritionData.micronutrients.calcium.amount,
                                goal: nutritionData.micronutrients.calcium.goal,
                                unit: nutritionData.micronutrients.calcium.unit
                              },
                              {
                                name: 'Hierro',
                                value: (nutritionData.micronutrients.iron.amount / nutritionData.micronutrients.iron.goal) * 100,
                                amount: nutritionData.micronutrients.iron.amount,
                                goal: nutritionData.micronutrients.iron.goal,
                                unit: nutritionData.micronutrients.iron.unit
                              }
                            ]}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis 
                              domain={[0, 100]} 
                              tickFormatter={(value) => `${value}%`}
                              ticks={[0, 25, 50, 75, 100]}
                            />
                            <RechartsTooltip 
                              formatter={(value, name, props) => {
                                if (name === 'value') {
                                  return [
                                    `${props.payload.amount} ${props.payload.unit} (${value.toFixed(0)}%)`,
                                    `de ${props.payload.goal} ${props.payload.unit}`
                                  ];
                                }
                                return [value, name];
                              }}
                            />
                            <defs>
                              <linearGradient id="microGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke={theme.palette.secondary.main} 
                              fillOpacity={1} 
                              fill="url(#microGradient)" 
                              animationDuration={1000}
                            />
                            <RechartsTooltip />
                          </AreaChart>
                        </ResponsiveContainer>
           </Box>
        </Paper>
                  </Grid>
                </Grid>
              </motion.div>
              
              {/* Recomendaciones y consejos */}
              <motion.div variants={itemVariants}>
                <Box sx={{ mt: 4 }}>
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
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                      Recomendaciones Personalizadas
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card 
                          elevation={2}
                          sx={{ 
                            height: '100%',
                            borderRadius: 2,
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2
                                }}
                              >
                                <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Puntos Fuertes
                              </Typography>
                            </Box>
                            
                            {nutritionData.macros.protein.percentage >= 90 && (
                              <Typography variant="body2" paragraph>
                                <strong>Excelente consumo de proteínas:</strong> Has alcanzado el {nutritionData.macros.protein.percentage}% de tu objetivo diario ({nutritionData.macros.protein.amount}g de {nutritionData.macros.protein.goal}g), lo que ayuda a mantener la masa muscular y la saciedad.
                              </Typography>
                            )}
                            
                            {nutritionData.water.percentage >= 75 && (
                              <Typography variant="body2" paragraph>
                                <strong>Buena hidratación:</strong> Has consumido {nutritionData.water.amount}ml de agua, que es el {nutritionData.water.percentage}% de tu objetivo diario. Mantener una buena hidratación mejora el metabolismo y la función cognitiva.
                              </Typography>
                            )}
                            
                            {nutritionData.calories.percentage >= 90 && nutritionData.calories.percentage <= 110 && (
                              <Typography variant="body2">
                                <strong>Balance calórico adecuado:</strong> Tu ingesta calórica está muy cerca de tu objetivo, lo que es ideal para mantener un peso estable y una energía constante durante el día.
                              </Typography>
                            )}
                            
                            {nutritionData.micronutrients.calcium.amount >= nutritionData.micronutrients.calcium.goal * 0.8 && (
                              <Typography variant="body2">
                                <strong>Buen aporte de calcio:</strong> Has consumido {nutritionData.micronutrients.calcium.amount}{nutritionData.micronutrients.calcium.unit} de calcio, esencial para la salud ósea y muscular.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card 
                          elevation={2}
                          sx={{ 
                            height: '100%',
                            borderRadius: 2,
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2
                                }}
                              >
                                <WarningIcon sx={{ color: theme.palette.warning.main }} />
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Áreas de Mejora
                              </Typography>
                            </Box>
                            
                            {nutritionData.macros.fat.percentage > 110 && (
                              <Typography variant="body2" paragraph>
                                <strong>Consumo elevado de grasas:</strong> Has consumido {nutritionData.macros.fat.amount}g de grasas, que es un {nutritionData.macros.fat.percentage}% de tu objetivo. Intenta reducir las grasas saturadas y aumentar las grasas saludables como aguacate, frutos secos y aceite de oliva.
                              </Typography>
                            )}
                            
                            {nutritionData.micronutrients.iron.amount < nutritionData.micronutrients.iron.goal * 0.7 && (
                              <Typography variant="body2" paragraph>
                                <strong>Bajo nivel de hierro:</strong> Solo has alcanzado el {Math.round((nutritionData.micronutrients.iron.amount / nutritionData.micronutrients.iron.goal) * 100)}% de tu objetivo diario de hierro. Considera incluir más legumbres, carnes magras o espinacas en tu dieta.
                              </Typography>
                            )}
                            
                            {nutritionData.water.percentage < 75 && (
                              <Typography variant="body2">
                                <strong>Aumenta tu hidratación:</strong> Has consumido solo {nutritionData.water.amount}ml de agua ({nutritionData.water.percentage}% del objetivo). Intenta beber al menos 2 litros diarios para una hidratación óptima.
                              </Typography>
                            )}
                            
                            {nutritionData.calories.percentage > 110 && (
                              <Typography variant="body2">
                                <strong>Exceso calórico:</strong> Has consumido un {nutritionData.calories.percentage}% de tu objetivo calórico. Considera reducir ligeramente las porciones o aumentar tu actividad física.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card 
                          elevation={2}
                          sx={{ 
                            height: '100%',
                            borderRadius: 2,
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2
                                }}
                              >
                                <TrendingUpIcon sx={{ color: theme.palette.info.main }} />
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Sugerencias
                              </Typography>
                            </Box>
                            
                            {nutritionData.meals.dinner > nutritionData.calories.amount * 0.35 && (
                              <Typography variant="body2" paragraph>
                                <strong>Distribuye mejor tus comidas:</strong> Tu cena representa el {Math.round((nutritionData.meals.dinner / nutritionData.calories.amount) * 100)}% de tu ingesta diaria. Intenta distribuir mejor tus calorías a lo largo del día para mejorar tu metabolismo.
                              </Typography>
                            )}
                            
                            {nutritionData.micronutrients.vitaminC.amount < nutritionData.micronutrients.vitaminC.goal * 0.8 && (
                              <Typography variant="body2" paragraph>
                                <strong>Aumenta tu vitamina C:</strong> Solo has alcanzado el {Math.round((nutritionData.micronutrients.vitaminC.amount / nutritionData.micronutrients.vitaminC.goal) * 100)}% de tu objetivo. Considera añadir más cítricos, fresas o pimientos a tu dieta.
                              </Typography>
                            )}
                            
                            {nutritionData.macros.carbs.percentage < 80 && (
                              <Typography variant="body2">
                                <strong>Incrementa carbohidratos complejos:</strong> Tu ingesta de carbohidratos está por debajo del objetivo. Incluye más granos enteros, legumbres y vegetales ricos en almidón para mantener tus niveles de energía.
                              </Typography>
                            )}
                            
                            {nutritionData.calories.percentage < 90 && (
                              <Typography variant="body2">
                                <strong>Aumenta ligeramente tu ingesta:</strong> Estás consumiendo menos calorías de las recomendadas. Considera añadir snacks saludables entre comidas para alcanzar tu objetivo energético.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
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
                <Tooltip title="Añadir comida">
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
                </Tooltip>
              </motion.div>
            </>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default NutritionDashboard; 