import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Grid,
  Fade,
  Zoom,
  Tooltip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale'; // Importar locale español
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // <--- Icono de trofeo/premio
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // <--- Icono de calendario
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // <--- Icono de información
import ShareIcon from '@mui/icons-material/Share'; // <--- Icono de compartir
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Asegúrate de tener axios instalado
import { useAuth } from '../context/AuthContext'; // Para obtener el user_id si es necesario
import ExerciseLogModal from '../components/ExerciseLogModal'; // <--- Importar el modal
import GaugeChart from 'react-gauge-chart'; // <--- IMPORTAR LIBRERÍA
import { alpha } from '@mui/material/styles'; // Para transparencias
import html2canvas from 'html2canvas'; // <--- Importar html2canvas

// --- Lista de Mensajes Motivadores ---
const motivationalMessages = [
  "¡Excelente trabajo! Sigue así. 💪",
  "¡Bien hecho! Cada paso cuenta. ✨",
  "¡Increíble! Estás invirtiendo en tu salud. ❤️",
  "¡Vas por buen camino! Reduce el riesgo de diabetes. 📉",
  "¡Fantástico! Tu corazón te lo agradece. ❤️‍🔥",
  "¡Sigue quemando calorías! 🔥",
  "¡Eres imparable! Continúa moviéndote. 🚀",
  "¡Actividad registrada! Tu cuerpo es tu templo. 🙏",
  "¡Muy bien! La constancia es la clave. 🔑",
  "¡Lo estás logrando! Pequeños cambios, grandes resultados. 🌱",
  "¡Qué energía! Sigue brillando. 🌟",
  "¡Perfecto! Un paso más cerca de tus metas. 🎯",
  "¡Maravilloso! La salud es riqueza. 💰",
  "¡Estás on fire! 🔥 Continúa con esa determinación.",
  "¡Buenísimo! Cuidar de ti es lo más importante. 🤗",
  "¡Así se hace! Tu esfuerzo vale la pena. 💯",
  "¡Impresionante! Sigue superando tus límites. 🧗",
  "¡Genial! Estás construyendo hábitos saludables. 🧱",
  "¡Bravo! Por un estilo de vida más activo. 🏃‍♀️",
  "¡Felicidades! Tu salud futura te lo agradecerá. ✨",
];

const CalorieTrackerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [burnedCalories, setBurnedCalories] = useState(0); // Añadido para quemar calorías
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // <--- Estado para el modal
  const [encouragementMessage, setEncouragementMessage] = useState(null); // <--- Estado para el mensaje
  const [isSharing, setIsSharing] = useState(false); // Estado para el botón de compartir
  const calorieCardRef = useRef(null); // Ref para el elemento a capturar

  // --- Función para obtener totales diarios (consumidas y quemadas) ---
  const fetchDailyTotals = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axios.get(`/api/calories/daily`, { // Llama a la ruta actualizada
        params: { date: formattedDate },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConsumedCalories(response.data.total_consumed || 0);
      setBurnedCalories(response.data.total_burned || 0); // <--- Actualizar calorías quemadas
    } catch (err) {
      console.error('Error fetching daily totals:', err);
      setError('No se pudieron cargar los datos diarios.');
      setConsumedCalories(0);
      setBurnedCalories(0);
    } finally {
      setLoading(false);
    }
  }, []); // No necesita dependencias si no usa estado/props que cambien

  useEffect(() => {
    fetchDailyTotals(selectedDate);
  }, [selectedDate, fetchDailyTotals]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate || new Date());
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Función que se pasa al modal para refrescar los datos después de registrar
  const handleActivityLogged = (date) => {
    fetchDailyTotals(date);
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    setEncouragementMessage(motivationalMessages[randomIndex]);
    setTimeout(() => setEncouragementMessage(null), 5000);
  };

  const netCalories = consumedCalories - burnedCalories;

  // --- Lógica para el porcentaje y colores del nuevo GaugeChart ---
  const gaugeLimit = 3000; // Establecer un límite visual un poco más alto
  const gaugePercent = Math.min(consumedCalories / gaugeLimit, 1); // Porcentaje para el gráfico

  // Definir los segmentos de color (verde, amarillo, rojo, lila)
  // Los valores son porcentajes del gaugeLimit (3000 kcal)
  const gaugeColors = ["#4CAF50", "#FFEB3B", "#F44336", "#9C27B0"]; // Verde, Amarillo, Rojo, Lila
  const gaugeArcs = [1900 / gaugeLimit, (2000 - 1900) / gaugeLimit, (2500 - 2000) / gaugeLimit, (gaugeLimit - 2500) / gaugeLimit];

  // --- Función para Compartir ---
  const handleShare = async () => {
    if (!calorieCardRef.current) {
      console.error("Error: No se encontró el elemento para compartir.");
      alert("Error al preparar la imagen para compartir.");
      return;
    }
    if (!navigator.share) {
      alert("Tu navegador no soporta la función de compartir nativa. Intenta hacer una captura de pantalla manualmente.");
      return;
    }

    setIsSharing(true);
    setError(null); // Limpiar errores previos

    try {
      // Ocultar temporalmente el botón de compartir para que no salga en la captura
      const shareButton = calorieCardRef.current.querySelector('#share-button-calories');
      if (shareButton) shareButton.style.display = 'none';

      const canvas = await html2canvas(calorieCardRef.current, {
          useCORS: true, // Necesario si hay imágenes de otros dominios (poco probable aquí)
          scale: 2, // Aumentar escala para mejor resolución
          backgroundColor: '#1e1e28', // Color de fondo similar al Paper (ajusta si es diferente)
          logging: false, // Desactivar logs de html2canvas en consola
      });

      // Volver a mostrar el botón
      if (shareButton) shareButton.style.display = 'inline-flex';

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("No se pudo generar la imagen (blob nulo).");
        }
        const file = new File([blob], `doctorfy_calorias_${selectedDate.toISOString().split('T')[0]}.png`, { type: 'image/png' });
        const shareData = {
          title: `Mi Resumen de Calorías - ${selectedDate.toLocaleDateString('es-ES')} | Doctorfy`,
          text: `¡Así va mi día! Consumidas: ${consumedCalories.toFixed(0)} kcal, Quemadas: ${burnedCalories.toFixed(0)} kcal. Balance: ${netCalories.toFixed(0)} kcal. #Doctorfy #Salud`,
          files: [file],
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            console.log('Contenido compartido exitosamente');
        } else {
            // Fallback si no se pueden compartir archivos (raro si navigator.share existe)
            console.warn("No se pueden compartir archivos, compartiendo solo texto.");
            await navigator.share({
                title: shareData.title,
                text: shareData.text,
                url: window.location.href // Opcional: compartir URL de la página
            });
        }

      }, 'image/png');

    } catch (err) {
      console.error('Error al compartir:', err);
      // Ignorar error si el usuario canceló la acción de compartir
      if (err.name !== 'AbortError') {
          setError('Ocurrió un error al intentar compartir.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="md" sx={{ py: 4, color: 'white', minHeight: '80vh' }}>
        <Paper ref={calorieCardRef} sx={{
          p: { xs: 2, sm: 4 },
          mb: 4,
          borderRadius: 3,
          background: 'rgba(30, 30, 40, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative', // Necesario para el botón de compartir absoluto
        }}>

          {/* --- Botón de Compartir (Posicionado arriba a la derecha) --- */}
          <Tooltip title="Compartir Resumen">
             {/* Usar IconButton para un look más limpio */}
             <IconButton
               id="share-button-calories" // ID para ocultarlo durante la captura
               onClick={handleShare}
               disabled={isSharing || loading}
               sx={{
                 position: 'absolute',
                 top: 16, // Ajustar posición
                 right: 16,
                 color: '#00e5ff', // Color cian
                 backgroundColor: alpha('#00e5ff', 0.1),
                 '&:hover': {
                   backgroundColor: alpha('#00e5ff', 0.2),
                 },
                 zIndex: 5 // Asegurar que esté visible
               }}
             >
               {isSharing ? <CircularProgress size={24} sx={{ color: '#00e5ff' }}/> : <ShareIcon />}
             </IconButton>
          </Tooltip>
          {/* --- Fin Botón Compartir --- */}

          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{
              mb: 3,
              fontWeight: 'bold',
              color: '#ffffff',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
            }}
          >
            {user && user.first_name ? (
              <>
                {/* Parte 1: Texto en blanco */}
                <Box component="span" sx={{ color: '#ffffff' }}>
                  Contador de Calorías de{' '} {/* Espacio al final */}
                </Box>
                {/* Parte 2: Nombre en cian */}
                <Box component="span" sx={{ color: '#00e5ff' }}>
                  {user.first_name}
                </Box>
              </>
            ) : (
              // Título por defecto si no hay usuario
              'Mi Contador de Calorías Diario'
            )}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <DatePicker
              label="Selecciona la fecha"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} sx={{
                '& .MuiInputBase-root': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '& .MuiSvgIcon-root': { color: 'white' }
              }} />}
              inputFormat="dd/MM/yyyy"
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress sx={{ color: '#00e5ff' }} />
            </Box>
          ) : (
            <>
              {/* Gauge Chart */}
              <Box sx={{ width: { xs: '90%', sm: '70%', md: '60%' }, maxWidth: '400px', mx: 'auto', mb: 2 }}>
                <GaugeChart
                  id="gauge-chart-calories"
                  nrOfLevels={gaugeArcs.length}
                  arcsLength={gaugeArcs}
                  colors={gaugeColors}
                  percent={gaugePercent}
                  arcPadding={0.02}
                  cornerRadius={3}
                  needleColor="#ffffff"
                  needleBaseColor="#ffffff"
                  textColor="#ffffff"
                  hideText={false}
                  animate={true}
                  animDelay={500}
                />
              </Box>

              {/* --- RENDERIZAR MENSAJE MOTIVADOR AQUÍ (DEBAJO DEL GAUGE) --- */}
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, minHeight: '60px' }}> {/* Contenedor para centrar y dar espacio */}
                <Zoom in={!!encouragementMessage} timeout={400}>
                  <Alert
                    icon={<EmojiEventsIcon fontSize="inherit" sx={{ color: '#FFD700' }} />}
                    severity="success"
                    sx={{
                      zIndex: 1, // Mantener por si acaso, pero probablemente no necesario
                      width: { xs: '95%', sm: '80%', md: '70%' }, // Ancho del alert
                      maxWidth: '500px', // Ancho máximo
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #66bb6a 30%, #43a047 90%)',
                      color: 'white',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      fontWeight: 'bold',
                      borderRadius: '15px',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)', // Sombra más sutil
                      py: 1.2,
                      alignItems: 'center', // Centrar icono y texto verticalmente
                      '.MuiAlert-message': {
                        width: '100%', padding: 0, overflow: 'visible',
                      },
                      '.MuiAlert-icon': {
                         paddingRight: '10px',
                      }
                    }}
                  >
                    {encouragementMessage || ''} {/* Añadir '' para evitar error si es null */}
                  </Alert>
                </Zoom>
              </Box>
              {/* --- FIN MENSAJE MOTIVADOR --- */}

              {/* Totales */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                 <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                   Consumidas: {consumedCalories.toFixed(1)} kcal
                 </Typography>
                 <Typography sx={{ color: '#ff9800' }}>
                   Quemadas: {burnedCalories.toFixed(1)} kcal
                 </Typography>
                 <Typography variant="h6" sx={{ fontWeight: 'bold', color: netCalories > 0 ? '#f44336' : '#4caf50', mt: 1 }}>
                   Balance Neto: {netCalories.toFixed(1)} kcal
                 </Typography>
              </Box>
            </>
          )}

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<CameraAltIcon />}
                onClick={() => navigate('/nutrition')}
                sx={{
                  py: 1.5, fontSize: '1rem',
                  background: 'linear-gradient(45deg, #00E5FF 30%, #00B8D4 90%)',
                  color: 'black', fontWeight: 'bold'
                }}
              >
                Medir Calorías (Foto)
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<LocalFireDepartmentIcon />}
                onClick={handleOpenModal}
                sx={{
                  py: 1.5, fontSize: '1rem',
                  background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                  color: 'white', fontWeight: 'bold'
                }}
              >
                Quemar Calorías (Ejercicio)
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)', pt: 4 }}>
            <Typography variant="h5" align="center" sx={{ mb: 4, color: '#00e5ff', fontWeight: 'bold' }}>
              ¡Simple en 3 Pasos!
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Paper elevation={4} sx={{
                  p: 2.5,
                  textAlign: 'center',
                  background: alpha('#00e5ff', 0.1),
                  border: '1px solid #00e5ff',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CameraAltIcon sx={{ fontSize: 40, color: '#00e5ff', mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'white' }}>
                    Mide con Foto
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Analiza tu comida.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={4} sx={{
                  p: 2.5,
                  textAlign: 'center',
                  background: alpha('#ff9800', 0.1),
                  border: '1px solid #ff9800',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LocalFireDepartmentIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'white' }}>
                    Registra Ejercicio
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Anota tus calorías quemadas.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={4} sx={{
                  p: 2.5,
                  textAlign: 'center',
                  background: alpha('#ffffff', 0.05),
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CalendarTodayIcon sx={{ fontSize: 40, color: '#00e5ff', mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'white' }}>
                    Controla por Fecha
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Revisa tu historial.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

        </Paper>
      </Container>

      {/* Modal */}
      <ExerciseLogModal
        open={isModalOpen}
        onClose={handleCloseModal}
        date={selectedDate}
        onActivityLogged={handleActivityLogged}
      />
    </LocalizationProvider>
  );
};

export default CalorieTrackerPage; 