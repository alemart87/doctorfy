import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  IconButton, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  CircularProgress,
  Chip,
  Drawer,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import { 
  Send as SendIcon, 
  Menu as MenuIcon,
  LocalHospital as DoctorIcon,
  Psychology as PsychologyIcon,
  Restaurant as NutritionIcon,
  Science as ClinicalIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Aurora from '../components/Aurora';
import { useAuth } from '../context/AuthContext';

// Componente principal del chat médico
const MedicalChat = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [specialty, setSpecialty] = useState('general');
  const [message, setMessage] = useState('');
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Especialidades disponibles
  const specialties = [
    { id: 'general', name: 'Medicina General', icon: <DoctorIcon />, color: theme.palette.primary.main },
    { id: 'nutrition', name: 'Nutrición', icon: <NutritionIcon />, color: '#4CAF50' },
    { id: 'psychology', name: 'Psicología', icon: <PsychologyIcon />, color: '#9C27B0' },
    { id: 'clinical', name: 'Medicina Clínica', icon: <ClinicalIcon />, color: '#FF9800' }
  ];
  
  // Cargar sesiones de chat al inicio
  useEffect(() => {
    fetchChatSessions();
  }, []);
  
  // Desplazarse al final de los mensajes cuando se añaden nuevos
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Cargar sesiones de chat
  const fetchChatSessions = async () => {
    try {
      const response = await axios.get('/api/chat/sessions');
      if (response.data.success) {
        setChatSessions(response.data.sessions);
        
        // Si hay sesiones, cargar la más reciente
        if (response.data.sessions.length > 0) {
          await loadChatSession(response.data.sessions[0].id);
        } else {
          setInitialLoading(false);
        }
      }
    } catch (error) {
      console.error('Error al cargar sesiones de chat:', error);
      setInitialLoading(false);
    }
  };
  
  // Cargar una sesión de chat específica
  const loadChatSession = async (sessionId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/chat/sessions/${sessionId}`);
      if (response.data.success) {
        setCurrentSession(response.data.session);
        setMessages(response.data.session.messages);
        setSpecialty(response.data.session.specialty);
      }
    } catch (error) {
      console.error('Error al cargar sesión de chat:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };
  
  // Crear una nueva sesión de chat
  const createNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setSpecialty('general');
    setDrawerOpen(false);
  };
  
  // Eliminar una sesión de chat
  const deleteSession = async (sessionId) => {
    try {
      const response = await axios.delete(`/api/chat/sessions/${sessionId}`);
      if (response.data.success) {
        setChatSessions(chatSessions.filter(session => session.id !== sessionId));
        
        // Si la sesión eliminada es la actual, crear una nueva
        if (currentSession && currentSession.id === sessionId) {
          createNewSession();
        }
      }
    } catch (error) {
      console.error('Error al eliminar sesión de chat:', error);
    }
  };
  
  // Enviar un mensaje
  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    // Añadir mensaje del usuario a la interfaz
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/chat/message', {
        message: userMessage.content,
        session_id: currentSession ? currentSession.id : null,
        specialty: specialty
      });
      
      if (response.data.success) {
        // Si es una nueva sesión, actualizar el estado
        if (!currentSession) {
          setCurrentSession({
            id: response.data.session_id,
            specialty: response.data.specialty,
            title: `Consulta de ${getSpecialtyLabel(response.data.specialty)} - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`
          });
          
          // Actualizar la lista de sesiones
          fetchChatSessions();
        }
        
        // Añadir respuesta de la IA
        const aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Mostrar mensaje de error
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo más tarde.',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener la etiqueta de la especialidad
  const getSpecialtyLabel = (specialtyId) => {
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty ? specialty.name : 'Médico General';
  };
  
  // Obtener el color de la especialidad
  const getSpecialtyColor = (specialtyId) => {
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty ? specialty.color : theme.palette.primary.main;
  };
  
  // Obtener el icono de la especialidad
  const getSpecialtyIcon = (specialtyId) => {
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty ? specialty.icon : <DoctorIcon />;
  };
  
  // Renderizar el avatar según el rol
  const renderAvatar = (role, specialtyId = specialty) => {
    if (role === 'user') {
      return (
        <Avatar 
          sx={{ 
            bgcolor: theme.palette.secondary.main,
            width: 40,
            height: 40
          }}
        >
          {user?.first_name?.charAt(0) || 'U'}
        </Avatar>
      );
    } else {
      return (
        <Avatar 
          sx={{ 
            bgcolor: getSpecialtyColor(specialtyId),
            width: 40,
            height: 40
          }}
        >
          {getSpecialtyIcon(specialtyId)}
        </Avatar>
      );
    }
  };
  
  // Renderizar el contenido del mensaje
  const renderMessageContent = (content, isError) => {
    return (
      <Box 
        sx={{ 
          p: 2,
          borderRadius: 2,
          backgroundColor: isError ? alpha(theme.palette.error.main, 0.1) : 'transparent',
          border: isError ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : 'none'
        }}
      >
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <Typography variant="body1" sx={{ mb: 1 }} {...props} />,
            h1: ({ node, ...props }) => <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 700 }} {...props} />,
            h2: ({ node, ...props }) => <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700 }} {...props} />,
            h3: ({ node, ...props }) => <Typography variant="subtitle1" sx={{ mt: 1.5, mb: 1, fontWeight: 700 }} {...props} />,
            ul: ({ node, ...props }) => <Box component="ul" sx={{ pl: 2, mb: 1 }} {...props} />,
            ol: ({ node, ...props }) => <Box component="ol" sx={{ pl: 2, mb: 1 }} {...props} />,
            li: ({ node, ...props }) => <Box component="li" sx={{ mb: 0.5 }} {...props} />,
            a: ({ node, ...props }) => <Box component="a" sx={{ color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }} {...props} />,
            code: ({ node, inline, ...props }) => 
              inline ? 
                <Box component="code" sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.5), p: 0.5, borderRadius: 1 }} {...props} /> : 
                <Box component="pre" sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.5), p: 1.5, borderRadius: 2, overflowX: 'auto' }}>
                  <Box component="code" {...props} />
                </Box>
          }}
        >
          {content}
        </ReactMarkdown>
      </Box>
    );
  };
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: theme.palette.background.default
      }}
    >
      <Aurora opacity={0.3} />
      
      {/* Barra superior */}
      <AppBar 
        position="static" 
        color="transparent" 
        elevation={0}
        sx={{ 
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: getSpecialtyColor(specialty),
                mr: 1
              }}
            >
              {getSpecialtyIcon(specialty)}
            </Avatar>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {currentSession ? currentSession.title : `Nueva consulta con ${getSpecialtyLabel(specialty)}`}
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button 
            color="inherit" 
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
          >
            Volver
          </Button>
        </Toolbar>
        
        {/* Pestañas de especialidades */}
        <Tabs
          value={specialty}
          onChange={(e, newValue) => setSpecialty(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            px: 2,
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2
            }
          }}
        >
          {specialties.map((spec) => (
            <Tab 
              key={spec.id}
              value={spec.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1, color: spec.color }}>{spec.icon}</Box>
                  {spec.name}
                </Box>
              }
            />
          ))}
        </Tabs>
      </AppBar>
      
      {/* Drawer para sesiones de chat */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 320, p: 2 }}
          role="presentation"
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mis Consultas
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            fullWidth
            onClick={createNewSession}
            sx={{ mb: 2 }}
          >
            Nueva Consulta
          </Button>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {chatSessions.map((session) => (
              <ListItem 
                key={session.id}
                button
                selected={currentSession && currentSession.id === session.id}
                onClick={() => {
                  loadChatSession(session.id);
                  setDrawerOpen(false);
                }}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getSpecialtyColor(session.specialty) }}>
                    {getSpecialtyIcon(session.specialty)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={session.title} 
                  secondary={format(new Date(session.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                />
              </ListItem>
            ))}
            
            {chatSessions.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No tienes consultas guardadas.
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Drawer>
      
      {/* Contenido principal */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: 2,
          height: 'calc(100vh - 112px)', // Altura de la pantalla menos la altura de la barra superior
        }}
      >
        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Área de mensajes */}
            <Paper 
              elevation={0}
              sx={{ 
                flexGrow: 1, 
                mb: 2, 
                p: 2, 
                overflowY: 'auto',
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              {messages.length === 0 ? (
                <Box 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mb: 2,
                      bgcolor: getSpecialtyColor(specialty)
                    }}
                  >
                    {getSpecialtyIcon(specialty)}
                  </Avatar>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                    Bienvenido al Chat Médico IA
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
                    Estoy aquí para responder tus consultas sobre salud, nutrición y bienestar. 
                    Recuerda que soy un asistente virtual y mis respuestas no sustituyen el consejo médico profesional.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selecciona una especialidad y comienza a chatear.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {messages.map((msg) => (
                    <Box 
                      key={msg.id}
                      sx={{ 
                        display: 'flex',
                        mb: 3,
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                      }}
                    >
                      <Box sx={{ mr: msg.role === 'user' ? 0 : 2, ml: msg.role === 'user' ? 2 : 0 }}>
                        {renderAvatar(msg.role)}
                      </Box>
                      <Box 
                        sx={{ 
                          maxWidth: '75%',
                          backgroundColor: msg.role === 'user' 
                            ? alpha(theme.palette.primary.main, 0.1)
                            : alpha(theme.palette.background.paper, 0.7),
                          borderRadius: 2,
                          p: 2,
                          boxShadow: msg.isError ? 'none' : `0 2px 10px ${alpha(theme.palette.common.black, 0.05)}`
                        }}
                      >
                        {renderMessageContent(msg.content, msg.isError)}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                          {format(new Date(msg.timestamp), 'HH:mm', { locale: es })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>
              )}
            </Paper>
            
            {/* Área de entrada de mensaje */}
            <Paper
              elevation={0}
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                p: 1,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder={`Escribe tu consulta médica para el ${getSpecialtyLabel(specialty).toLowerCase()}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                multiline
                maxRows={4}
                InputProps={{
                  sx: { 
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
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
              <Box sx={{ ml: 1 }}>
                <IconButton 
                  color="primary" 
                  type="submit"
                  disabled={!message.trim() || loading}
                  sx={{ 
                    p: 1.5,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark
                    },
                    '&.Mui-disabled': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.3),
                      color: 'white'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </IconButton>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MedicalChat; 