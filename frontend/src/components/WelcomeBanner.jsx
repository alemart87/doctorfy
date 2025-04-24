import React from 'react';
import { Box, Typography, Paper, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const WelcomeBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Determinar el saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 18) return "¡Buenas tardes";
    return "¡Buenas noches";
  };
  
  // Determinar el mensaje según el tipo de usuario
  const getMessage = () => {
    if (!user) return "";
    
    if (user.is_doctor) {
      return "Gracias por tu dedicación a la salud de tus pacientes. Hoy puedes hacer la diferencia en la vida de alguien.";
    } else {
      return "Tu salud es nuestra prioridad. Explora todas las herramientas que tenemos para ti.";
    }
  };
  
  // Determinar las acciones rápidas según el tipo de usuario
  const getQuickActions = () => {
    if (!user) return [];
    
    if (user.is_doctor) {
      return [
        { label: "Ver Pacientes", action: () => navigate("/doctor/patients") },
        { label: "Interpretar Estudios", action: () => navigate("/medical-studies") }
      ];
    } else {
      return [
        { label: "Subir Estudio", action: () => navigate("/medical-studies") },
        { label: "Análisis Nutricional", action: () => navigate("/nutrition") }
      ];
    }
  };
  
  if (!user) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: user.is_doctor 
            ? 'linear-gradient(135deg, #4a6bff 0%, #3a56cc 100%)' 
            : 'linear-gradient(135deg, #6bffb8 0%, #4a9e80 100%)',
          color: user.is_doctor ? 'white' : '#1a1a2e'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={user.profile_pic || ""} 
            alt={user.name || user.email}
            sx={{ width: 60, height: 60, mr: 2, border: '2px solid white' }}
          />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {getGreeting()}, {user.name || user.email.split('@')[0]}!
            </Typography>
            <Typography variant="subtitle1">
              {user.is_doctor ? "Doctor en Doctorfy" : "Bienvenido a tu espacio de salud"}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          {getMessage()}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {getQuickActions().map((action, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="contained" 
                onClick={action.action}
                sx={{ 
                  bgcolor: user.is_doctor ? 'rgba(255,255,255,0.2)' : 'rgba(26,26,46,0.2)',
                  color: user.is_doctor ? 'white' : '#1a1a2e',
                  '&:hover': {
                    bgcolor: user.is_doctor ? 'rgba(255,255,255,0.3)' : 'rgba(26,26,46,0.3)',
                  }
                }}
              >
                {action.label}
              </Button>
            </motion.div>
          ))}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default WelcomeBanner; 