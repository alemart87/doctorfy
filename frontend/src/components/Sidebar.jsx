import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const Sidebar = () => {
  const { user } = useAuth();
  
  return (
    <List>
      <ListItem button component={RouterLink} to="/dashboard">
        <ListItemIcon><DashboardIcon /></ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      
      {/* Enlace al panel de médicos (solo visible para médicos) */}
      {user && user.is_doctor && (
        <ListItem button component={RouterLink} to="/doctor/dashboard">
          <ListItemIcon><LocalHospitalIcon /></ListItemIcon>
          <ListItemText primary="Panel de Médico" />
        </ListItem>
      )}
      
      <ListItem button component={RouterLink} to="/analyze-nutrition">
        <ListItemIcon><AssessmentIcon /></ListItemIcon>
        <ListItemText primary="Analizar Comida" />
      </ListItem>
      
      <ListItem button component={RouterLink} to="/nutrition-dashboard">
        <ListItemIcon><RestaurantMenuIcon /></ListItemIcon>
        <ListItemText primary="Dashboard Nutrición" />
      </ListItem>
      
      {/* ... otros enlaces ... */}
    </List>
  );
};

export default Sidebar; 