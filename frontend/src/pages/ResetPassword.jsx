import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Verificar si el token es válido
        await api.get(`/auth/reset-password/${token}/verify`);
        setTokenValid(true);
      } catch (err) {
        setError('El enlace de restablecimiento no es válido o ha expirado');
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('Token no proporcionado');
      setVerifying(false);
    }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('La contraseña es requerida'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
        .required('Confirmar contraseña es requerido'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Llamar a la API para restablecer la contraseña
        await api.post(`/auth/reset-password/${token}`, { 
          password: values.password 
        });
        
        setSuccess(true);
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al restablecer la contraseña');
      } finally {
        setLoading(false);
      }
    },
  });

  if (verifying) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Restablecer Contraseña
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Tu contraseña ha sido restablecida con éxito.
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Serás redirigido a la página de inicio de sesión en unos segundos...
              </Typography>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="contained" 
                fullWidth
              >
                Ir a Iniciar Sesión
              </Button>
            </Box>
          ) : tokenValid ? (
            <form onSubmit={formik.handleSubmit}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Ingresa tu nueva contraseña.
              </Typography>
              
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Nueva Contraseña"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
              />
              
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                {loading ? 'Procesando...' : 'Restablecer Contraseña'}
              </Button>
            </form>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Button 
                component={RouterLink} 
                to="/forgot-password" 
                variant="contained" 
                fullWidth
                sx={{ mt: 2 }}
              >
                Solicitar Nuevo Enlace
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 