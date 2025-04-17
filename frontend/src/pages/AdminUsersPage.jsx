import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estado para los usuarios y paginación
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Estado para filtros
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Estado para diálogo de confirmación
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  
  // Verificar si el usuario tiene permisos
  useEffect(() => {
    if (user && user.email !== 'alemart87@gmail.com' && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/users', {
        params: {
          page: page + 1, // API usa paginación basada en 1
          per_page: rowsPerPage,
          email: emailFilter || undefined,
          status: statusFilter || undefined
        }
      });
      
      setUsers(response.data.users);
      setTotalUsers(response.data.pagination.total);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar la lista de usuarios. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };
  
  // Cargar usuarios al montar el componente o cambiar filtros/paginación
  useEffect(() => {
    if (user && (user.email === 'alemart87@gmail.com' || user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
      fetchUsers();
    }
  }, [page, rowsPerPage, user]);
  
  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Aplicar filtros
  const handleApplyFilters = () => {
    setPage(0); // Resetear a la primera página
    fetchUsers();
  };
  
  // Resetear filtros
  const handleResetFilters = () => {
    setEmailFilter('');
    setStatusFilter('');
    setPage(0);
    fetchUsers();
  };
  
  // Abrir diálogo de confirmación
  const handleOpenDialog = (user, newActiveStatus) => {
    setSelectedUser(user);
    setNewStatus(newActiveStatus);
    setDialogOpen(true);
  };
  
  // Cerrar diálogo
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Actualizar estado de suscripción
  const handleUpdateSubscription = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await axios.put(`/api/admin/users/${selectedUser.id}/subscription`, {
        active: newStatus
      });
      
      // Actualizar la lista de usuarios
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, subscription_active: newStatus, subscription: { ...u.subscription, status: newStatus ? 'active' : 'inactive' } } 
          : u
      ));
      
      setActionSuccess(`La suscripción de ${selectedUser.email} ha sido ${newStatus ? 'activada' : 'desactivada'} correctamente.`);
      
      // Cerrar el diálogo
      handleCloseDialog();
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setActionSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error('Error al actualizar suscripción:', err);
      setError('Error al actualizar la suscripción. Por favor, intenta de nuevo.');
      handleCloseDialog();
    }
  };
  
  // Añadir esta función para verificar suscripciones
  const handleVerifyStripeSubscriptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/admin/verify-subscriptions');
      
      if (response.data.success) {
        setActionSuccess(`Se han verificado ${response.data.updated} suscripciones en Stripe.`);
        // Recargar la lista de usuarios
        fetchUsers();
      } else {
        setError('Error al verificar suscripciones: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error al verificar suscripciones:', err);
      setError('Error al verificar suscripciones. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Añadir la función para reiniciar el período de prueba
  const handleResetTrial = async (userId) => {
    try {
      const response = await axios.post(`/api/debug/force-trial/${userId}`);
      if (response.data.success) {
        setActionSuccess(`Período de prueba reiniciado para el usuario ID: ${userId}`);
        fetchUsers(); // Recargar la lista de usuarios
      } else {
        setError('Error al reiniciar el período de prueba');
      }
    } catch (error) {
      console.error('Error al reiniciar período de prueba:', error);
      setError('Error al reiniciar el período de prueba');
    }
  };
  
  // Si el usuario no tiene permisos, no renderizar nada
  if (!user || (user.email !== 'alemart87@gmail.com' && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return null;
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Administración de Usuarios
        </Typography>
        
        <Button
          variant="contained"
          color="secondary"
          onClick={handleVerifyStripeSubscriptions}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Verificar Suscripciones en Stripe
        </Button>
      </Box>
      
      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Filtrar por email"
              variant="outlined"
              fullWidth
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Estado de suscripción</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado de suscripción"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleApplyFilters}
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetFilters}
              >
                Resetear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Mensajes de éxito o error */}
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {actionSuccess}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabla de usuarios */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha de registro</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_doctor ? (
                        <Chip label="Médico" color="primary" size="small" />
                      ) : (
                        <Chip label="Paciente" color="secondary" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscription_active ? (
                        <Chip 
                          icon={<CheckCircleIcon />} 
                          label="Activo" 
                          color="success" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          icon={<CancelIcon />} 
                          label="Inactivo" 
                          color="error" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.subscription_active}
                            onChange={() => handleOpenDialog(user, !user.subscription_active)}
                            color="primary"
                          />
                        }
                        label={user.subscription_active ? "Desactivar" : "Activar"}
                      />
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleResetTrial(user.id)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        Reiniciar Prueba
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
      
      {/* Diálogo de confirmación */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {newStatus ? "Activar suscripción" : "Desactivar suscripción"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {newStatus 
              ? `¿Estás seguro de que deseas activar la suscripción para ${selectedUser?.email}?`
              : `¿Estás seguro de que deseas desactivar la suscripción para ${selectedUser?.email}?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateSubscription} 
            color={newStatus ? "success" : "error"}
            variant="contained"
          >
            {newStatus ? "Activar" : "Desactivar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage; 