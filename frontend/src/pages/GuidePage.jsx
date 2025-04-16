import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stepper, { Step } from '../components/Stepper';
import { Box, Typography, Container } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import Particles from '../components/Particles';
import './GuidePage.css';

const GuidePage = () => {
  const navigate = useNavigate();
  
  const handleGuideComplete = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="guide-container">
      <Stepper
        initialStep={1}
        onStepChange={(step) => {
          console.log(`Paso actual: ${step}`);
        }}
        onFinalStepCompleted={handleGuideComplete}
        backButtonText="Anterior"
        nextButtonText="Siguiente"
      >
        <Step>
          <div className="guide-step">
            <DashboardIcon className="guide-icon" />
            <h2>Paso 1: Ingresa al Dashboard</h2>
            <p>Tu panel principal te da acceso a todas las funcionalidades de Doctorfy. Desde aquí podrás navegar fácilmente a todas las secciones.</p>
            <img 
              src="/images/dashboard-preview.jpg" 
              alt="Dashboard de Doctorfy" 
              style={{ maxHeight: '200px', objectFit: 'cover' }}
              onError={(e) => {e.target.src = 'https://via.placeholder.com/600x200?text=Dashboard+de+Doctorfy'}}
            />
          </div>
        </Step>
        
        <Step>
          <div className="guide-step">
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <RestaurantIcon className="guide-icon" />
              <LocalHospitalIcon className="guide-icon" />
            </Box>
            <h2>Paso 2: Elige Análisis Nutricional o Estudios Médicos</h2>
            <p>Puedes subir imágenes de alimentos para análisis nutricional o tus estudios médicos para interpretación.</p>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#00d8ff', fontWeight: 'bold' }}>Análisis Nutricional</Typography>
                <img 
                  src="/images/nutrition-preview.jpg" 
                  alt="Análisis Nutricional" 
                  style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '10px' }}
                  onError={(e) => {e.target.src = 'https://via.placeholder.com/300x150?text=Análisis+Nutricional'}}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#00d8ff', fontWeight: 'bold' }}>Estudios Médicos</Typography>
                <img 
                  src="/images/medical-preview.jpg" 
                  alt="Estudios Médicos" 
                  style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '10px' }}
                  onError={(e) => {e.target.src = 'https://via.placeholder.com/300x150?text=Estudios+Médicos'}}
                />
              </Box>
            </Box>
          </div>
        </Step>
        
        <Step>
          <div className="guide-step">
            <AnalyticsIcon className="guide-icon" />
            <h2>Paso 3: Tus análisis serán procesados por nuestra IA</h2>
            <p>Nuestra avanzada inteligencia artificial analizará tus imágenes y te proporcionará resultados detallados en segundos.</p>
            <img 
              src="/images/ai-analysis.jpg" 
              alt="Análisis con IA" 
              style={{ maxHeight: '200px', objectFit: 'cover' }}
              onError={(e) => {e.target.src = 'https://via.placeholder.com/600x200?text=Análisis+con+IA'}}
            />
          </div>
        </Step>
        
        <Step>
          <div className="guide-step">
            <CheckCircleIcon className="guide-icon" />
            <h2>Paso 4: Revisa tus resultados... ¡Y LISTO!</h2>
            <p>Obtén información detallada y recomendaciones personalizadas basadas en tus análisis.</p>
            <Box sx={{ 
              backgroundColor: 'rgba(0, 216, 255, 0.1)', 
              p: 2, 
              borderRadius: '10px',
              border: '1px solid rgba(0, 216, 255, 0.3)',
              mb: 2
            }}>
              <Typography variant="h6" sx={{ color: '#00d8ff', fontWeight: 'bold', mb: 1 }}>
                ¡Puedes CONTAR CALORÍAS CON SOLO UNA FOTO!
              </Typography>
            </Box>
            <p>Ahora puedes registrar tus análisis médicos, hacer seguimiento de tu salud nutricional y estudios médicos.</p>
          </div>
        </Step>
        
        <Step>
          <div className="guide-step">
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <PeopleIcon className="guide-icon" />
              <PersonIcon className="guide-icon" />
            </Box>
            <h2>Funcionalidades adicionales</h2>
            <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ color: '#00d8ff', mr: 1 }} /> Accede a nuestra guía de médicos
              </li>
              <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ color: '#00d8ff', mr: 1 }} /> Personaliza tu perfil con todos tus datos de salud
              </li>
              <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ color: '#00d8ff', mr: 1 }} /> Lleva un registro completo de tu historial médico
              </li>
            </ul>
            <p className="final-message">LA SALUD NUNCA FUE MÁS ACCESIBLE y... ¡CON INTELIGENCIA ARTIFICIAL!</p>
          </div>
        </Step>
      </Stepper>
    </div>
  );
};

export default GuidePage; 