import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, FormControlLabel, Checkbox, Grid, Divider } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Register = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      is_doctor: false,
      specialty: '',
      license_number: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email inválido').required('Email es requerido'),
      password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Contraseña es requerida'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
        .required('Confirmar contraseña es requerido'),
      specialty: Yup.string().when('is_doctor', {
        is: true,
        then: () => Yup.string().required('Especialidad es requerida para doctores'),
        otherwise: () => Yup.string()
      }),
      license_number: Yup.string().when('is_doctor', {
        is: true,
        then: () => Yup.string().required('Número de licencia es requerido para doctores'),
        otherwise: () => Yup.string()
      }),
    }),
    onSubmit: async (values) => {
      try {
        const userData = {
          email: values.email,
          password: values.password,
          is_doctor: values.is_doctor,
        };

        if (values.is_doctor) {
          userData.specialty = values.specialty;
          userData.license_number = values.license_number;
        }

        const result = await register(userData);
        
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Error al registrarse');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al registrarse');
      }
    },
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('/api/auth/google', {
        credential: credentialResponse.credential
      });
      
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al registrarse con Google');
      console.error('Error en registro con Google:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Registrarse
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={formik.handleSubmit}>
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
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Contraseña"
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
            
            <FormControlLabel
              control={
                <Checkbox
                  id="is_doctor"
                  name="is_doctor"
                  checked={formik.values.is_doctor}
                  onChange={formik.handleChange}
                />
              }
              label="Registrarme como médico"
              sx={{ mt: 2 }}
            />
            
            {formik.values.is_doctor && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="specialty"
                    name="specialty"
                    label="Especialidad"
                    value={formik.values.specialty}
                    onChange={formik.handleChange}
                    error={formik.touched.specialty && Boolean(formik.errors.specialty)}
                    helperText={formik.touched.specialty && formik.errors.specialty}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="license_number"
                    name="license_number"
                    label="Número de Licencia"
                    value={formik.values.license_number}
                    onChange={formik.handleChange}
                    error={formik.touched.license_number && Boolean(formik.errors.license_number)}
                    helperText={formik.touched.license_number && formik.errors.license_number}
                  />
                </Grid>
              </Grid>
            )}
            
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              sx={{ mt: 3, mb: 2 }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
          
          <Divider sx={{ my: 3 }}>O</Divider>

          {/* Botón de Google */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Error al registrarse con Google')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="continue_with"
              locale="es"
            />
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              ¿Ya tienes una cuenta?{' '}
              <RouterLink to="/login">Inicia sesión</RouterLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 