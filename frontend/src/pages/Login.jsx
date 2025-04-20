import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert
} from '@mui/material';

const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('/api/auth/google', {
        credential: credentialResponse.credential
      });
      
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login con Google:', error);
      setError('Error al iniciar sesión con Google');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          {/* Formulario de login normal */}
          <Box component="form" sx={{ mt: 1 }}>
            {/* ... campos existentes ... */}
          </Box>

          <Divider sx={{ my: 3, width: '100%' }}>O</Divider>

          {/* Botón de Google */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Error al iniciar sesión con Google')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="continue_with"
              locale="es"
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 