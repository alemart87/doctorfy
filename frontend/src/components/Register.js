import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  Grid
} from '@mui/material';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDoctor, setIsDoctor] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      console.log('Datos enviados en registro:', {
        email,
        password,
        is_doctor: isDoctor,
        specialty: isDoctor ? specialty : null,
        license_number: isDoctor ? licenseNumber : null
      });
      
      const result = await register({
        email,
        password,
        is_doctor: isDoctor,
        specialty: isDoctor ? specialty : null,
        license_number: isDoctor ? licenseNumber : null
      });
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    }
  };
  
  // Resto del componente...
};

export default Register; 