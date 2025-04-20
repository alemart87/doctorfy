import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme,
  MenuItem,
  ListItemIcon,
  Menu,
  Tooltip,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  RestaurantMenu as RestaurantMenuIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Chat as ChatIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  CreditCard as CreditIcon,
  Dashboard as DashboardIcon,
  Psychology as PsychologyIcon,
  MonitorWeight as MonitorWeightIcon,
  Article as ArticleIcon,
  MenuBook as MenuBookIcon,
  Group as GroupIcon,
  ExitToApp as ExitToAppIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [credits, setCredits] = useState(null);

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Definir items de navegación según el estado de autenticación
  const navItems = [
    // Sección Médica
    { 
      text: 'Estudios Médicos', 
      path: '/medical-studies',
      icon: <MedicalServicesIcon />,
      requireAuth: true
    },
    { 
      text: 'Directorio Médico', 
      path: '/doctors',
      icon: <LocalHospitalIcon />,
      requireAuth: false
    },
    {
      text: 'Psicólogo Virtual',
      path: '/tixae-chatbot',
      icon: <PsychologyIcon />,
      requireAuth: true
    },

    // Sección Nutrición
    { 
      text: 'Nutrición', 
      path: '/nutrition',
      icon: <RestaurantMenuIcon />,
      requireAuth: true
    },
    {
      text: 'Dashboard Nutrición',
      path: '/nutrition-dashboard',
      icon: <MonitorWeightIcon />,
      requireAuth: true
    },

    // Sección Blog y Guías
    {
      text: 'Blog',
      path: '/blog',
      icon: <ArticleIcon />,
      requireAuth: false
    },
    {
      text: 'Guía',
      path: '/guide',
      icon: <MenuBookIcon />,
      requireAuth: false
    },

    // Paneles Administrativos
    ...(isAdmin() ? [{
      text: 'Panel Admin',
      path: '/admin/dashboard',
      icon: <AdminPanelSettingsIcon />,
      requireAuth: true,
      adminOnly: true
    },
    {
      text: 'Gestión Usuarios',
      path: '/admin/users',
      icon: <GroupIcon />,
      requireAuth: true,
      adminOnly: true
    },
    {
      text: 'Gestión Créditos',
      path: '/admin/credits',
      icon: <AccountBalanceWalletIcon />,
      requireAuth: true,
      adminOnly: true
    }] : []),

    // Panel Doctor
    ...(user?.is_doctor ? [{
      text: 'Panel Doctor',
      path: '/doctor/dashboard',
      icon: <LocalHospitalIcon />,
      requireAuth: true,
      doctorOnly: true
    }] : [])
  ];

  // Filtrar items según autenticación
  const filteredNavItems = navItems.filter(item => {
    if (!user && item.requireAuth) return false;
    if (!isAdmin() && item.adminOnly) return false;
    if (!user?.is_doctor && item.doctorOnly) return false;
    return true;
  });

  useEffect(() => {
    const fetchCredits = async () => {
      if (user) {
        try {
          const response = await axios.get('/api/credits/balance');
          setCredits(response.data.credits);
        } catch (error) {
          console.error('Error fetching credits:', error);
        }
      }
    };
    
    fetchCredits();
  }, [user]);

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate(user?.is_doctor ? '/doctor/profile' : '/profile');
  };

  // Agrupar items por categorías para móvil
  const menuCategories = [
    {
      title: "Principal",
      items: navItems.filter(item => 
        !item.adminOnly && !item.doctorOnly && 
        ['/tixae-chatbot'].includes(item.path)
      )
    },
    {
      title: "Servicios Médicos",
      items: navItems.filter(item => 
        ['/medical-studies', '/doctors', '/nutrition', '/nutrition-dashboard'].includes(item.path)
      )
    },
    {
      title: "Información",
      items: navItems.filter(item => 
        ['/blog', '/guide'].includes(item.path)
      )
    },
    ...(isAdmin() ? [{
      title: "Administración",
      items: navItems.filter(item => item.adminOnly)
    }] : []),
    ...(user?.is_doctor ? [{
      title: "Panel Médico",
      items: navItems.filter(item => item.doctorOnly)
    }] : [])
  ];

  // Estilos para mejorar legibilidad
  const mobileStyles = {
    menuItem: {
      fontSize: '1.1rem',  // Aumentar tamaño de fuente en menú
      padding: '12px 16px', // Más espacio para touch
    },
    categoryTitle: {
      fontSize: '0.9rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    },
    drawerHeader: {
      padding: '20px',
      fontSize: '1.3rem'
    },
    navButton: {
      fontSize: '1rem',
      padding: '10px 16px'
    }
  };

  // Drawer content optimizado para móvil
  const drawer = (
    <Box sx={{ 
      width: 280,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header del Drawer con Logo */}
      <Box 
        sx={{ 
          p: 2,
          background: 'linear-gradient(45deg, #00bcd4, #2196f3)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          textDecoration: 'none'
        }}
        component={RouterLink}
        to="/"
        onClick={() => setDrawerOpen(false)}
      >
        <LocalHospitalIcon sx={{ fontSize: '2rem' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Doctorfy
        </Typography>
      </Box>

      {/* Perfil del Usuario */}
      {user && (
        <Box 
          sx={{ 
            p: 2,
            bgcolor: 'rgba(0, 188, 212, 0.1)',
            borderBottom: '1px solid rgba(0, 188, 212, 0.2)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 60, 
                height: 60,
                bgcolor: 'primary.main',
                fontSize: '1.5rem'
              }}
            >
              {user.name?.[0] || user.email?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {user.name || user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.is_doctor ? 'Doctor' : 'Paciente'}
              </Typography>
            </Box>
          </Box>

          {/* Créditos */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/credits-info')}
            startIcon={<AccountBalanceWalletIcon sx={{ color: '#00bcd4' }} />}
            sx={{
              mb: 1,
              borderColor: '#00bcd4',
              color: '#00bcd4',
              p: 1.5,
              justifyContent: 'flex-start',
              '& .MuiButton-startIcon': {
                fontSize: '1.5rem'
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Créditos disponibles
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {credits?.toFixed(1) || '0'}
              </Typography>
            </Box>
          </Button>

          {/* Botón de Perfil */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleProfile}
            startIcon={<PersonIcon />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              p: 1.5,
              justifyContent: 'flex-start'
            }}
          >
            Mi Perfil
          </Button>
        </Box>
      )}

      {/* Menú Principal */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {menuCategories.map((category, index) => (
          category.items.length > 0 && (
            <React.Fragment key={category.title}>
              <Typography
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'primary.main',
                  bgcolor: 'rgba(0, 188, 212, 0.05)'
                }}
              >
                {category.title}
              </Typography>
              <List dense>
                {category.items.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton 
                      component={RouterLink} 
                      to={item.path}
                      selected={location.pathname === item.path}
                      onClick={() => setDrawerOpen(false)}
                      sx={{
                        py: 2,
                        px: 3,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'white',
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '1rem',
                          fontWeight: 500
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </React.Fragment>
          )
        ))}
      </Box>

      {/* Footer con botón de cerrar sesión */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
        {user ? (
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
            sx={{
              py: 1.5,
              fontSize: '1rem'
            }}
          >
            Cerrar Sesión
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/login"
            startIcon={<LoginIcon />}
            sx={{
              py: 1.5,
              fontSize: '1rem'
            }}
          >
            Iniciar Sesión
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo en AppBar */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'white',
              '&:hover': { opacity: 0.9 }
            }}
          >
            <LocalHospitalIcon 
              sx={{ 
                mr: 1,
                color: '#00ffff',
                filter: 'drop-shadow(0 0 2px #00ffff)'
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Doctorfy
            </Typography>
          </Box>

          {/* Botones de Acción Rápida para Móvil */}
          {isMobile && user && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Reemplazar Chat Médico por Guía */}
              <Tooltip title="Guía de Salud">
                <IconButton
                  component={RouterLink}
                  to="/guide"
                  sx={{
                    color: '#00ffff',
                    '&:hover': { bgcolor: 'rgba(0, 255, 255, 0.1)' }
                  }}
                >
                  <MenuBookIcon />
                </IconButton>
              </Tooltip>

              {/* Botón de Créditos */}
              <Tooltip title="Mis Créditos">
                <Button
                  onClick={() => navigate('/credits-info')}
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    border: '1px solid rgba(0, 255, 255, 0.5)',
                    borderRadius: '20px',
                    color: '#00ffff',
                    '&:hover': { bgcolor: 'rgba(0, 255, 255, 0.1)' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {credits?.toFixed(1) || '0'}
                  </Typography>
                </Button>
              </Tooltip>

              {/* Menú Hamburguesa */}
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ 
                  ml: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Navegación Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Créditos para Desktop */}
              {user && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/credits-info')}
                  startIcon={<AccountBalanceWalletIcon sx={{ color: '#00ffff' }} />}
                  sx={{
                    borderColor: 'rgba(0, 255, 255, 0.5)',
                    color: '#00ffff',
                    px: 2,
                    '&:hover': {
                      borderColor: '#00ffff',
                      bgcolor: 'rgba(0, 255, 255, 0.1)'
                    }
                  }}
                >
                  {credits?.toFixed(1) || '0'} créditos
                </Button>
              )}

              {/* Botones de Navegación */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {filteredNavItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: 'white',
                      px: 2,
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                      ...(location.pathname === item.path && {
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                      })
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>

              {/* Perfil/Login */}
              {user ? (
                <IconButton
                  onClick={handleProfile}
                  sx={{ 
                    ml: 1,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <PersonIcon />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/login"
                  sx={{ ml: 1 }}
                >
                  Iniciar Sesión
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Espaciador para compensar el AppBar fixed */}
      <Toolbar />

      {/* Drawer mejorado */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          right: drawerOpen ? 0 : '-100%',
          width: '320px',
          height: '100%',
          bgcolor: '#000000',
          transition: 'right 0.3s ease',
          zIndex: theme.zIndex.appBar + 1,
          boxShadow: '-4px 0 10px rgba(0,0,0,0.5)',
        }}
      >
        {drawer}
      </Box>

      {/* Overlay para cerrar el drawer al hacer click fuera */}
      {drawerOpen && (
        <Box
          onClick={() => setDrawerOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: theme.zIndex.appBar,
          }}
        />
      )}
    </>
  );
};

export default Navbar; 