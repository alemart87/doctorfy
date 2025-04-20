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
  Tooltip
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
    // Sección Principal
    { 
      text: 'Dashboard', 
      path: '/dashboard',
      icon: <DashboardIcon />,
      requireAuth: true
    },

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
      text: 'Chat Médico IA',
      path: '/medical-chat',
      icon: <ChatIcon />,
      requireAuth: true
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
        ['/dashboard', '/medical-chat', '/tixae-chatbot'].includes(item.path)
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

  // Drawer content optimizado para móvil
  const drawer = (
    <Box sx={{ width: 280 }}>
      {/* Header del Drawer */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        <LocalHospitalIcon sx={{ mr: 1 }} />
        <Typography variant="h6">
          Doctorfy
        </Typography>
      </Box>

      {/* Información del Usuario */}
      {user && (
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {user.name || user.email}
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/credits-info')}
            startIcon={<AccountBalanceWalletIcon />}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              justifyContent: 'flex-start',
              mb: 1
            }}
          >
            {credits?.toFixed(1) || '0'} créditos
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleProfile}
            startIcon={<PersonIcon />}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              justifyContent: 'flex-start'
            }}
          >
            Mi Perfil
          </Button>
        </Box>
      )}

      <Divider />

      {/* Menú Categorizado */}
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {menuCategories.map((category, index) => (
          category.items.length > 0 && (
            <React.Fragment key={category.title}>
              <Typography
                variant="overline"
                sx={{
                  px: 2,
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  bgcolor: 'background.paper'
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
                        pl: 3,
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
                          fontSize: '0.9rem'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {index < menuCategories.length - 1 && <Divider />}
            </React.Fragment>
          )
        ))}
      </Box>

      {/* Footer del Drawer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {user ? (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
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
            onClick={() => setDrawerOpen(false)}
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
          {/* Logo */}
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
              {/* Botón de Chat Médico */}
              <Tooltip title="Chat Médico">
                <IconButton
                  component={RouterLink}
                  to="/medical-chat"
                  sx={{
                    color: '#00ffff',
                    '&:hover': { bgcolor: 'rgba(0, 255, 255, 0.1)' }
                  }}
                >
                  <ChatIcon />
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
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 320,
            bgcolor: 'background.default',
            backgroundImage: 'none'
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 