import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, Link } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email inválido').required('Email es requerido'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Llamar a la API para solicitar el restablecimiento de contraseña
        await api.post('/auth/forgot-password', { email: values.email });
        
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al procesar la solicitud');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Recuperar Contraseña
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Por favor, revisa tu bandeja de entrada y sigue las instrucciones del correo.
              </Typography>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="contained" 
                fullWidth
              >
                Volver a Iniciar Sesión
              </Button>
            </Box>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Ingresa tu dirección de correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </Typography>
              
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
              />
              
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Instrucciones'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2"
                  underline="hover"
                >
                  Volver a Iniciar Sesión
                </Link>
              </Box>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 