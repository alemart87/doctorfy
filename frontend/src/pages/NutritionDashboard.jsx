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
  LinearProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
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
  ArrowForward as ArrowForwardIcon,
  Share as ShareIcon,
  Download as DownloadIcon
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
  Area,
  LabelList
} from 'recharts';
import Aurora from '../components/Aurora';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';

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
const NutrientCard = ({ title, value, unit, icon, color, rdi }) => {
  const theme = useTheme();
  const percentage = Math.round((value / rdi) * 100);
  const barColor = percentage > 120 ? theme.palette.error.main
                   : percentage < 60 ? theme.palette.warning.main
                   : color;
  
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
        <Typography variant="h4" sx={{ fontWeight: 700, color: barColor }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
          {unit}
            </Typography>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={Math.min(100, percentage)}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: alpha(barColor, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: barColor,
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

// NUEVA función de extracción
const extractNutritionData = (analysisText) => {
  if (!analysisText) return { calories:0, proteins:0, carbs:0, fats:0, fiber:0, sugars:0, sodium:0 };

  // 1. Intentar parsear JSON
  try {
    const jsonStart = analysisText.indexOf('{');
    const jsonEnd   = analysisText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const json = JSON.parse(analysisText.substring(jsonStart, jsonEnd+1));
      return {
        calories: json.calories || 0,
        proteins: json.protein_g || 0,
        carbs   : json.carbs_g   || 0,
        fats    : json.fat_g     || 0,
        fiber   : json.fiber_g   || 0,
        sugars  : json.sugars_g  || 0,
        sodium  : json.sodium_mg || 0
      };
    }
  } catch(e){ /* cae al modo regex */ }

  // 2. Modo regex (fallback) – los antiguos patrones
  const num = (p,txt) => (txt.match(p)||[0,0])[1]*1;
  return {
    calories: num(/(?:calor[ií]as|kcal)[^0-9]*(\d+)/i, analysisText),
    proteins: num(/prote[ií]nas[^0-9]*(\d+)/i, analysisText),
    carbs   : num(/carbohidratos|hidratos[^0-9]*(\d+)/i, analysisText),
    fats    : num(/grasas|l[ií]pidos[^0-9]*(\d+)/i, analysisText),
    fiber   : num(/fibra[^0-9]*(\d+)/i, analysisText),
    sugars  : num(/az[úu]cares?[^0-9]*(\d+)/i, analysisText),
    sodium  : num(/sodio[^0-9]*(\d+)/i, analysisText),
  };
};

// Añadir selector de fechas
const DateRangeSelector = ({
  dateRange, setDateRange, rangePreset, setRangePreset
}) => {
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
  
  const applyPreset = (preset)=>{
    const today = new Date();
    switch(preset){
      case 'day':
        setDateRange({startDate:today,endDate:today});break;
      case 'month':
        setDateRange({
          startDate:new Date(today.getFullYear(),today.getMonth(),1),
          endDate:today
        });break;
      case 'week':
        setDateRange({startDate:subDays(today,6),endDate:today});
        break;
      case 'custom':
      default:
        // no tocamos las fechas; el usuario las elegirá
        break;
    }
    setRangePreset(preset);
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
        <FormControl size="small" sx={{mr:1,minWidth:120}}>
          <InputLabel>Rango</InputLabel>
          <Select value={rangePreset} label="Rango"
                  onChange={e=>applyPreset(e.target.value)}>
            <MenuItem value="day">Hoy</MenuItem>
            <MenuItem value="week">Esta semana</MenuItem>
            <MenuItem value="month">Este mes</MenuItem>
            <MenuItem value="custom">Personalizado</MenuItem>
          </Select>
        </FormControl>
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

      {/* Cuando el usuario elige "Personalizado" mostramos las cajas de fecha */}
      {rangePreset==='custom' && (
        <Box sx={{ ml: 2, display:'flex', gap:1 }}>
          <TextField
            type="date"
            size="small"
            value={format(dateRange.startDate,'yyyy-MM-dd')}
            onChange={e=>setDateRange({...dateRange, startDate:new Date(e.target.value)})}
          />
          <TextField
            type="date"
            size="small"
            value={format(dateRange.endDate,'yyyy-MM-dd')}
            onChange={e=>setDateRange({...dateRange, endDate:new Date(e.target.value)})}
          />
        </Box>
      )}
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
    startDate: subDays(new Date(),6),
    endDate  : new Date()
  });
  const [calorieAlert, setCalorieAlert] = useState(false);
  const [advices, setAdvices] = useState([]);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [rangePreset,setRangePreset] = useState('week');
  const [motivation,setMotivation] = useState('');
  
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

  // 👉 1.  Ingestas diarias recomendadas (adulto medio – puedes ajustar)
  const RDI = {
    calories : 2000,   // este valor solo se usa para % global
    protein_g: 75,
    carbs_g  : 275,
    fat_g    : 70,
    fiber_g  : 25,
    sugars_g : 50,
    sodium_mg: 2300
  };

  // paleta coherente
  const COLOR_MAP = {
    protein_g : '#4a90e2',   // azul
    carbs_g   : '#f5a623',   // naranja
    fat_g     : '#e74c3c'    // rojo
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
        
        // Añadir color a cada día
        const dailyCaloriesArrayWithColor = dailyCaloriesArray.map(day => {
          const pct = day.calories / day.goal;
        return {
            ...day,
            barColor:
              pct < 0.8 ? '#f5a623'       // Amarillo
              : pct <= 1.1 ? '#43a047'    // Verde
              : '#e74c3c'                 // Rojo
        };
      });
      
        setDailyCalories(dailyCaloriesArrayWithColor);
        
        // Calcular totales de nutrientes para el período seleccionado
        const filteredNutritionData = nutritionData.filter(item => {
          return item.date >= startDate && item.date <= endDate;
        });
        
        const totalProteins = filteredNutritionData.reduce((sum, item) => sum + item.proteins, 0);
        const totalCarbs = filteredNutritionData.reduce((sum, item) => sum + item.carbs, 0);
        const totalFats = filteredNutritionData.reduce((sum, item) => sum + item.fats, 0);
        const totalFiber  = filteredNutritionData.reduce((s,i)=>s+i.fiber ,0);
        const totalSugars = filteredNutritionData.reduce((s,i)=>s+i.sugars,0);
        const totalSodium = filteredNutritionData.reduce((s,i)=>s+i.sodium,0);
        
        const newNuts = [
          { key:'protein_g', name:'Proteínas',    value:totalProteins, color:'#4a90e2', rdi:RDI.protein_g,  unit:'g'  },
          { key:'carbs_g',   name:'Carbohidratos', value:totalCarbs,   color:'#f39c12', rdi:RDI.carbs_g,   unit:'g'  },
          { key:'fat_g',     name:'Grasas',       value:totalFats,    color:'#e74c3c', rdi:RDI.fat_g,     unit:'g'  },
          { key:'fiber_g',   name:'Fibra',         value:totalFiber,   color:'#8d6e63', rdi:RDI.fiber_g,   unit:'g'  },
          { key:'sugars_g',  name:'Azúcares',      value:totalSugars,  color:'#ff7043', rdi:RDI.sugars_g,  unit:'g'  },
          { key:'sodium_mg', name:'Sodio',         value:totalSodium,  color:'#90caf9', rdi:RDI.sodium_mg, unit:'mg' }
        ];
        
        setNutrients(newNuts);
        
        // Calcular streak y points
        const sorted = [...dailyCaloriesArray].sort((a,b)=> new Date(a.date)-new Date(b.date));
        let tmpStreak=0, maxStreak=0, tmpPoints=0;
        sorted.forEach(d=>{
          const inRange = d.calories>=d.goal*0.8 && d.calories<=d.goal*1.2;
          if (inRange){
             tmpPoints += 10;
             tmpStreak += 1;
             maxStreak = Math.max(maxStreak,tmpStreak);
          }else{
             tmpStreak = 0;
             tmpPoints += 2;
          }
        });
        setStreak(maxStreak);
        setPoints(tmpPoints);

        // Calcular si se supera la meta calórica para la fecha final del rango
        const todayStr = format(dateRange.endDate,'yyyy-MM-dd');
        const todayEntry = dailyCaloriesArray.find(d=>d.date===todayStr);
        setCalorieAlert(todayEntry && todayEntry.calories > todayEntry.goal);

        // Generar recomendaciones:
        const msgs = [];
        if (todayEntry && todayEntry.calories > todayEntry.goal){
          msgs.push('⚠️ Has superado tu meta calórica, procura reducir raciones.');
        }
        if(maxStreak>=7) msgs.unshift('🏅 ¡Felicidades! Has logrado 7 días seguidos dentro de rango.');
        newNuts.forEach(n=>{
          const pct = (n.value / n.rdi) * 100;
          if (pct > 120) msgs.push(`Reduce tu ingesta de ${n.name.toLowerCase()} (hoy llevas ${pct.toFixed(0)} % del recomendado).`);
          else if (pct < 60) msgs.push(`Aumenta tu ingesta de ${n.name.toLowerCase()} (solo ${pct.toFixed(0)} % del recomendado).`);
        });
        setAdvices(msgs.slice(0,5));  // máx. 5 sugerencias

        // mensaje motivacional extra
        let mot = '';
        if (maxStreak>=7) mot = '🚀 ¡Racha estupenda! Sigue así.';
        else if (todayEntry && todayEntry.calories>todayEntry.goal)
          mot = '⚠️  Intenta reducir calorías mañana.';
        else
          mot = '💪 ¡Buen trabajo, continúa!';
        setMotivation(mot);
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

  const handleShare = async ()=>{
    try{
      const node = document.getElementById('dashboard-root');   // ← captura todo
      const canvas = await html2canvas(node,{backgroundColor:null});
      const blob   = await new Promise(r=>canvas.toBlob(r,'image/png'));
      const file   = new File([blob],'progreso.png',{type:'image/png'});

      if(navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({
          title:'Mi progreso nutricional',
          text :'¡Mira cómo voy!',
          files:[file]
        });
      }else{
        // fallback: descarga
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href=url; a.download='progreso.png'; a.click();
        URL.revokeObjectURL(url);
      }
    }catch(e){ console.error(e); }
  };

  /* ---------- descarga segura de imagen ---------- */
  const handleDownloadImage = (analysisId) => {
    window.open(`/api/nutrition/analyses/${analysisId}/image`, '_blank');
  };

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
            <DateRangeSelector
              dateRange={dateRange}
              setDateRange={setDateRange}
              rangePreset={rangePreset}
              setRangePreset={setRangePreset}
            />
          </motion.div>
          
          {calorieAlert && (
            <Alert severity="error" sx={{ mb:3 }}>
              ¡Has superado tu objetivo calórico para hoy!
            </Alert>
          )}
          
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
                          >
                            {dailyCalories.map((d,i)=>(
                              <Cell key={i} fill={d.barColor}/>
                            ))}
                            <LabelList dataKey="calories" position="top" formatter={(v)=>`${v} kcal`} />
                          </Bar>
                            <Bar 
                              dataKey="goal" 
                              name="Objetivo" 
                            fill="#455a64" 
                              radius={[4, 4, 0, 0]} 
                            />
                          <Legend />
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
                            data={nutrients.filter(n=>['protein_g','carbs_g','fat_g'].includes(n.key))}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                            paddingAngle={3}
                              dataKey="value"
                            >
                            {nutrients.filter(n=>['protein_g','carbs_g','fat_g'].includes(n.key))
                                      .map((entry,idx)=>(<Cell key={idx} fill={COLOR_MAP[entry.key]} />))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(v,n)=>[`${v} g`, n]}/>
                            <Legend verticalAlign="bottom" height={24}/>
                          </PieChart>
                        </ResponsiveContainer>
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
                    
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Calorías</TableCell>
                            <TableCell>Proteínas</TableCell>
                            <TableCell>Grasas</TableCell>
                            <TableCell>Azúcares</TableCell>
                            <TableCell align="center">Resumen</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analyses.slice(0,8).map(a=>{
                            const n = extractNutritionData(a.analysis);
                            const resumen =
                              n.fat_g>RDI.fat_g*1.2 ? 'Alto en grasa' :
                              n.sugars_g>RDI.sugars_g*1.2 ? 'Alto en azúcares' :
                              'Saludable';
                            return (
                              <TableRow key={a.id} hover>
                                <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{n.calories||0}</TableCell>
                                <TableCell>{n.proteins||0}g</TableCell>
                                <TableCell>{n.fats||0}g</TableCell>
                                <TableCell>{n.sugars||0}g</TableCell>
                                <TableCell align="center">{resumen}</TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    title="Descargar imagen"
                                    onClick={()=>handleDownloadImage(a.id)}>
                                    <DownloadIcon fontSize="small"/>
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    title="Ver detalles"
                                    onClick={()=>navigate(`/nutrition/analysis/${a.id}`)}>
                                    <ArrowForwardIcon fontSize="small"/>
                                  </IconButton>
                                </TableCell>
                              </TableRow>);
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
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

              {/* Tarjetas de nutrientes */}
              <Grid container spacing={3} sx={{ mb:4 }}>
                {nutrients.map((n,idx)=>(
                  <Grid item xs={12} sm={6} md={4} key={n.key}>
                    <NutrientCard
                      title={n.name} value={n.value} unit={n.unit}
                      icon={
                        n.name==='Proteínas'?<FitnessCenterIcon/>:
                        n.name==='Grasas'?<OpacityIcon/>:
                        n.name==='Carbohidratos'?<FastfoodIcon/>:
                        n.name==='Fibra'?<LocalDiningIcon/>:
                        n.name==='Azúcares'?<TrendingUpIcon/>:
                        <WarningIcon/>
                      }
                      color={n.color}
                      rdi={n.rdi}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Recomendaciones */}
              {advices.length>0 && (
                <Paper
                  elevation={3}
                  sx={{
                    p:3, borderRadius:3, mb:4,
                    background:`linear-gradient(135deg, ${alpha('#009688',0.1)} 0%, ${alpha('#009688',0.2)} 100%)`,
                    border:`1px solid ${alpha('#009688',0.3)}`
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight:700, mb:2 }}>
                    Recomendaciones
                  </Typography>
                  <ul style={{ margin:0, paddingLeft:'1.2rem' }}>
                    {advices.map((msg,i)=>(<li key={i}><Typography variant="body2">{msg}</Typography></li>))}
                  </ul>
                </Paper>
              )}

              {/* Streak y puntos */}
              <Grid container spacing={3} sx={{ mb:1 }} id="nutri-share-block">
                <Grid item xs={6} sm={3}>
                  <Paper sx={{p:2,bgcolor:'#1e88e5'}}>
                    <Typography variant="h6" color="white">🔥 Streak</Typography>
                    <Typography variant="h3" color="white" sx={{fontWeight:700}}>
                       {streak}
                    </Typography>
                    <Typography variant="body2" color="white">días seguidos</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{p:2,bgcolor:'#43a047'}}>
                    <Typography variant="h6" color="white">⭐ Puntos</Typography>
                    <Typography variant="h3" color="white" sx={{fontWeight:700}}>
                       {points}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Typography variant="caption" sx={{mb:3,display:'block',opacity:0.7}}>
                Streak = nº de días seguidos cumpliendo entre 80 y 120 % de tu meta calórica.
                Ganas 10 puntos por día en rango y 2 puntos si te sales. ¡Comparte tu progreso!
              </Typography>

              <Typography variant="caption" sx={{mb:3,display:'block',opacity:0.7}}>
                {motivation}
              </Typography>

              <Button variant="outlined" startIcon={<ShareIcon/>}
                      onClick={handleShare} sx={{mb:4}}>
                Compartir dashboard
              </Button>
            </>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default NutritionDashboard; 