import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requireSubscription = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mientras se verifica el estado de autenticación, mostrar un indicador de carga
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#000'
      }}>
        <CircularProgress color="primary" />
        <Typography color="white" sx={{ mt: 2 }}>
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Si el usuario no está autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si el usuario está autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute; 