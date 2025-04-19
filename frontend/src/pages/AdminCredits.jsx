import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminCredits = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(Array.isArray(response.data) ? response.data : response.data.users || []);
    } catch (error) {
      setError('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === 'alemart87@gmail.com') {
      fetchUsers();
    }
  }, [user]);

  const handleAssignCredits = async (userId, amount) => {
    try {
      await axios.post('/api/credits/assign', {
        user_id: userId,
        credits: parseFloat(amount)
      });
      
      // Actualizar la lista de usuarios
      fetchUsers();
      
      // Limpiar el formulario
      setSelectedUser(null);
      setCreditsToAdd(0);
      
    } catch (error) {
      setError('Error al asignar créditos');
      console.error(error);
    }
  };

  if (user?.email !== 'alemart87@gmail.com') {
    return (
      <Container>
        <Alert severity="error">No tienes acceso a esta página</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Administración de Créditos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Formulario de asignación */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ID de Usuario"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Cantidad de Créditos"
              value={creditsToAdd}
              onChange={(e) => setCreditsToAdd(e.target.value)}
              inputProps={{ step: "0.1" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={() => handleAssignCredits(selectedUser, creditsToAdd)}
              startIcon={<AddIcon />}
              disabled={!selectedUser || !creditsToAdd}
            >
              Asignar Créditos
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de usuarios y sus créditos */}
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Usuarios y Créditos</Typography>
          <IconButton onClick={fetchUsers} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Créditos</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Cargando...</TableCell>
              </TableRow>
            ) : Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.credits?.toFixed(1)}</TableCell>
                  <TableCell>{user.is_doctor ? 'Médico' : 'Paciente'}</TableCell>
                  <TableCell>
                    <Tooltip title="Asignar créditos">
                      <IconButton onClick={() => setSelectedUser(user.id)}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay usuarios para mostrar</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminCredits; 