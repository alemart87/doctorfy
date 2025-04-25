import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, Link } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  const from = location.state?.from || '/calorie-tracker';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email inválido').required('Email es requerido'),
      password: Yup.string().required('Contraseña es requerida'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      setSubmitting(true);
      try {
        const result = await login(values);
        if (result.success) {
          navigate(from, { replace: true });
        } else {
          setError(result.error || 'Email o contraseña incorrectos');
        }
      } catch (err) {
        console.error("Login error:", err);
        setError(err.response?.data?.error || 'Error al iniciar sesión. Inténtalo de nuevo.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Iniciar Sesión
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
              onBlur={formik.handleBlur}
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
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              margin="normal"
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                variant="body2"
                underline="hover"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>
            
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              sx={{ mt: 1, mb: 2 }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              ¿No tienes una cuenta?{' '}
              <RouterLink to="/register">Regístrate</RouterLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 