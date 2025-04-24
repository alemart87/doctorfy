import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, isLoading, checkSubscription } = useAuth();
  const [hasSubscription, setHasSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  
  useEffect(() => {
    const verifySubscription = async () => {
      if (user) {
        // Si el usuario es alemart87@gmail.com, no verificar suscripción
        if (user.email === 'alemart87@gmail.com') {
          setHasSubscription(true);
          setCheckingSubscription(false);
          return;
        }
        
        try {
          const isActive = await checkSubscription();
          setHasSubscription(isActive);
        } catch (err) {
          console.error('Error al verificar suscripción:', err);
          setHasSubscription(false);
        } finally {
          setCheckingSubscription(false);
        }
      }
    };
    
    if (!isLoading) {
      verifySubscription();
    }
  }, [user, isLoading, checkSubscription]);
  
  if (isLoading || checkingSubscription) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (!hasSubscription && user.email !== 'alemart87@gmail.com') {
    return <Navigate to="/subscription" replace />;
  }
  
  return children;
};

export default PrivateRoute; 