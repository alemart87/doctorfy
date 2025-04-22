import React, { useState, useEffect, memo } from 'react';
import { 
  AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem,
  ListItemIcon, ListItemText, Divider, Box, useTheme, useMediaQuery, Menu, MenuItem, Tooltip, Chip, Avatar,
  ListItemButton, ListSubheader, CircularProgress,
  Badge,
  InputBase
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BookIcon from '@mui/icons-material/Book';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import GetAppIcon from '@mui/icons-material/GetApp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const drawerWidth = 260;
const brightCyan = '#00ffff';
const NAVBAR_HEIGHT_XS = 56;
const NAVBAR_HEIGHT_SM = 64;
const TRANSITION_DURATION = '0.3s';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = () => {
  const { user, logout, isAdmin, isDoctor } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = React.useState(null);
  const [credits, setCredits] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!window.matchMedia('(display-mode: standalone)').matches) {
         setShowInstallButton(true);
      }
      console.log('beforeinstallprompt event fired');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('PWA instalada');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') console.log('Usuario aceptó la instalación');
      else console.log('Usuario rechazó la instalación');
      setDeferredPrompt(null);
      setShowInstallButton(false);
    });
  };

  useEffect(() => {
    const fetchCredits = async () => {
      if (user) {
        console.log(`Navbar: Intentando obtener créditos para el usuario logueado.`);
        setCreditsLoading(true);
        setCredits(null);
        try {
          const response = await axios.get(`/api/credits/balance`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          console.log("Navbar: Créditos recibidos:", response.data);
          setCredits(response.data.credits);
        } catch (error) {
          console.error('Navbar: Error fetching credits:', error.response || error.message || error);
          setCredits('Error');
        } finally {
          setCreditsLoading(false);
        }
      } else {
        console.log("Navbar: No hay usuario logueado, no se buscan créditos.");
        setCredits(null);
        setCreditsLoading(false);
      }
    };
    fetchCredits();
  }, [user]);

  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    setDrawerOpen(false);
    navigate('/');
  };

  const handleNavigate = (path) => {
    handleClose();
    setDrawerOpen(false);
    navigate(path);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeToggle = () => {
    console.log("TODO: Implementar cambio de tema (light/dark)");
  };

  const handleNotificationsClick = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorElNotifications(null);
  };

  const handleMarkAsRead = (notificationId) => {
    console.log("TODO: Marcar notificación como leída:", notificationId);
    handleNotificationsClose();
  };

  const mockNotifications = [
      { id: 1, text: "Nuevo mensaje de Dr. Pérez", timestamp: "Hace 5 min", read: false, link: "/chat/dr-perez" },
      { id: 2, text: "Tu análisis médico está listo", timestamp: "Hace 1 hora", read: false, link: "/medical-studies/123" },
      { id: 3, text: "Recordatorio: Cita mañana 10:00 AM", timestamp: "Ayer", read: true, link: "/appointments" },
      { id: 4, text: "Consejo de nutrición semanal", timestamp: "Hace 2 días", read: true, link: "/blog/consejo-semanal" },
  ];
  const unreadNotificationsCount = mockNotifications.filter(n => !n.read).length;

  const commonNavItems = [
    { text: 'Inicio', path: '/', icon: <HomeIcon /> },
    { text: 'Chat Médico IA', path: '/tixae-chatbot', icon: <ChatIcon /> },
    { text: 'Estudios Médicos', path: '/medical-studies', icon: <DescriptionIcon /> },
    { text: 'Nutrición', path: '/nutrition', icon: <RestaurantIcon /> },
    { text: 'Dashboard Nutrición', path: '/nutrition-dashboard', icon: <AssessmentIcon /> },
    { text: 'Directorio Médico', path: '/doctors', icon: <MedicalServicesIcon /> },
    { text: 'Blog', path: '/blog', icon: <BookIcon /> },
    { text: 'Guía', path: '/guide', icon: <HelpOutlineIcon /> },
  ];

  const adminNavItems = [
    { text: 'Panel Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> },
    { text: 'Gestionar Usuarios', path: '/admin/users', icon: <PeopleIcon /> },
    { text: 'Gestionar Créditos', path: '/admin/credits', icon: <CreditCardIcon /> },
  ];

  const doctorNavItems = [
    { text: 'Dashboard Médico', path: '/doctor/dashboard', icon: <DashboardIcon /> },
    { text: 'Mi Perfil Médico', path: '/doctor/profile', icon: <PersonIcon /> },
  ];

  const authItems = [
    { text: 'Iniciar Sesión', path: '/login', icon: <LoginIcon /> },
    { text: 'Registrarse', path: '/register', icon: <AppRegistrationIcon /> },
  ];

  const userAccountItems = [
    { text: 'Mi Perfil', path: '/profile', icon: <PersonIcon /> },
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  ];

  const activeStyle = {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  };

  const drawer = (
    <Box sx={{ width: drawerWidth }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
         <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Doctorfy
        </Typography>
      </Box>

      {user && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Avatar
            alt={user.name || 'Usuario'}
            src={user.profilePicture || undefined}
            sx={{ width: 40, height: 40, mr: 1.5, bgcolor: 'primary.main' }}
          >
            {!user.profilePicture && user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
              {user.name || 'Usuario'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      )}

      <List onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)} sx={{ pt: 0, color: 'common.white', '& .MuiListItemIcon-root': { color: brightCyan, minWidth: 'auto', marginRight: 1.5 } }}>
        {user && (
          <>
            <ListItem disablePadding sx={{ my: 0.5 }}>
              <ListItemButton component={RouterLink} to="/credits-info" sx={{ py: 0.8 }}>
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, color: brightCyan }}>
                  {creditsLoading ? <CircularProgress size={20} sx={{ color: brightCyan }}/> : <AccountBalanceWalletIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    creditsLoading ? "Cargando..." :
                    (credits !== null && credits !== 'Error'
                      ? `${credits.toFixed(1)} Créditos`
                      : (credits === 'Error' ? 'Error al cargar' : '-- Créditos')
                    )
                  }
                  primaryTypographyProps={{
                    fontWeight: 'bold',
                    color: brightCyan,
                    sx: { textShadow: `0 0 5px ${alpha(brightCyan, 0.7)}` }
                  }}
                  secondary="Ver planes y detalles"
                  secondaryTypographyProps={{fontSize: '0.8rem'}}
                />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ mb: 1 }} />
          </>
        )}

        {(showInstallButton || !isOnline) && (
          <>
            <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '36px', color: alpha(theme.palette.common.white, 0.7) }}>Aplicación</ListSubheader>
            {!isOnline && (
              <ListItem disablePadding sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                <ListItemButton sx={{ py: 0.8 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, color: 'warning.main' }}>
                    <WifiOffIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sin conexión" primaryTypographyProps={{ color: 'warning.main', fontWeight: 'medium' }} />
                </ListItemButton>
              </ListItem>
            )}
            {showInstallButton && (
              <ListItem disablePadding>
                <ListItemButton onClick={handleInstallClick} sx={{ py: 0.8 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, color: 'primary.main' }}>
                    <GetAppIcon />
                  </ListItemIcon>
                  <ListItemText primary="Instalar App" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '36px', color: alpha(theme.palette.common.white, 0.7) }}>Navegación</ListSubheader>
        {commonNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path} 
              sx={location.pathname === item.path 
                ? {
                    ...activeStyle,
                    py: 0.8, 
                    backgroundColor: alpha(brightCyan, 0.15),
                    '& .MuiListItemIcon-root': { color: brightCyan },
                    '& .MuiListItemText-primary': { color: brightCyan, fontWeight: 'bold' }
                  } 
                : { 
                    py: 0.8, 
                    '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) }
                  }
              }
            >
              <ListItemIcon> 
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {isAdmin && (
          <>
            <Divider sx={{ my: 1, borderColor: alpha(theme.palette.common.white, 0.2) }} />
            <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '36px', color: alpha(theme.palette.common.white, 0.7) }}>Admin</ListSubheader>
            {adminNavItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={RouterLink} to={item.path} sx={location.pathname === item.path ? {...activeStyle, py: 0.8} : { py: 0.8 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
        {isDoctor && !isAdmin && (
          <>
            <Divider sx={{ my: 1, borderColor: alpha(theme.palette.common.white, 0.2) }} />
            <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '36px', color: alpha(theme.palette.common.white, 0.7) }}>Doctor</ListSubheader>
            {doctorNavItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={RouterLink} to={item.path} sx={location.pathname === item.path ? {...activeStyle, py: 0.8} : { py: 0.8 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}

        <Divider sx={{ my: 1, borderColor: alpha(theme.palette.common.white, 0.2) }} />
        <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '36px', color: alpha(theme.palette.common.white, 0.7) }}>{user ? 'Mi Cuenta' : 'Acceso'}</ListSubheader>
        {user ? (
          <>
            {userAccountItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={RouterLink} to={item.path} sx={location.pathname === item.path ? {...activeStyle, py: 0.8} : { py: 0.8 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ py: 0.8, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) } }}>
                <ListItemIcon sx={{ color: theme.palette.error.light }}>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Cerrar Sesión" sx={{ color: theme.palette.error.light }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          authItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={RouterLink} to={item.path} sx={location.pathname === item.path ? {...activeStyle, py: 0.8} : { py: 0.8 }}>
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: NAVBAR_HEIGHT_XS, sm: NAVBAR_HEIGHT_SM } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
                component="div"
            sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
            }}
          >
            Doctorfy
          </Typography>
            </RouterLink>
          </Box>

          {!isMobile && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center', px: 2 }}>
              {commonNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                <Button
                    key={item.text}
                    color="inherit"
                    component={RouterLink}
                    to={item.path}
                  sx={{
                      mx: 0.5,
                      px: 1.5,
                      py: 0.5,
                      textTransform: 'none',
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: `color ${TRANSITION_DURATION} ease-out`,
                    '&:hover': {
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        width: '0%',
                        height: '2px',
                        backgroundColor: 'primary.main',
                        transition: `all ${TRANSITION_DURATION} ease-out`,
                        transform: 'translateX(-50%)',
                      },
                      ...(isActive && {
                        '&::after': {
                          width: '60%',
                        },
                      }),
                      '&:hover::after': {
                         width: '40%',
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                );
              })}
            </Box>
          )}
          {!isMobile && !user && <Box sx={{ flexGrow: 1 }} />}

          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {!isMobile && (
              <>
                <Tooltip title="Buscar">
                   <IconButton
                     color="inherit"
                     sx={{ mr: 0.5 }}
                     onClick={() => navigate('/search')}
                     aria-label="Ir a la página de búsqueda"
                   >
                       <SearchIcon />
                   </IconButton>
                </Tooltip>

                <Tooltip title="Cambiar tema (Claro/Oscuro)">
                  <IconButton sx={{ mr: 0.5 }} onClick={handleThemeToggle} color="inherit" aria-label="Cambiar tema">
                    {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Notificaciones">
                  <IconButton
                      color="inherit"
                      sx={{ mr: 0.5 }}
                      onClick={handleNotificationsClick}
                      aria-label={`Mostrar ${unreadNotificationsCount} notificaciones nuevas`}
                      aria-controls={Boolean(anchorElNotifications) ? 'notifications-menu' : undefined}
                      aria-haspopup="true"
                  >
                      <Badge badgeContent={unreadNotificationsCount} color="error">
                          <NotificationsIcon />
                      </Badge>
                  </IconButton>
                </Tooltip>

                {!isMobile && !isOnline && (
                  <Tooltip title="Estás desconectado">
                    <Chip
                      icon={<WifiOffIcon fontSize="small" />}
                      label="Offline"
                      color="warning"
                      size="small"
                      sx={{ mr: 1.5 }}
                    />
                  </Tooltip>
                )}
                {!isMobile && showInstallButton && (
                  <Tooltip title="Instalar Doctorfy App">
                    <IconButton
                      color="primary"
                      onClick={handleInstallClick}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <GetAppIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {!isMobile && user && (
                  <Tooltip title={
                    creditsLoading ? "Cargando créditos..." :
                    (credits === 'Error' ? "Error al cargar créditos. Click para más info." :
                    (credits !== null ? `Tienes ${credits.toFixed(1)} créditos disponibles` : "Créditos no disponibles"))
                  }>
                    <span>
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={
                          creditsLoading ? <CircularProgress size={20} color="inherit" /> :
                          <AccountBalanceWalletIcon sx={{ color: 'common.black' }}/>
                        }
                        onClick={() => {
                            console.log("Navbar: Click en botón créditos, navegando a /credits-info");
                            navigate('/credits-info');
                        }}
                      sx={{ 
                          mr: 1.5,
                          borderRadius: '20px',
                          textTransform: 'none',
                          fontWeight: 'bold',
                          px: 2.5,
                          py: 0.8,
                          backgroundColor: brightCyan,
                          color: 'common.black',
                          boxShadow: `0 0 8px ${alpha(brightCyan, 0.6)}, 0 0 12px ${alpha(brightCyan, 0.4)}`,
                          '&:hover': {
                            backgroundColor: alpha(brightCyan, 0.85),
                            boxShadow: `0 0 12px ${alpha(brightCyan, 0.8)}, 0 0 16px ${alpha(brightCyan, 0.6)}`,
                          },
                          '& .MuiButton-startIcon': { marginRight: '6px' },
                          ...(credits === 'Error' && {
                            backgroundColor: 'error.main',
                            color: 'error.contrastText',
                            boxShadow: 'none',
                             '& .MuiButton-startIcon>*:nth-of-type(1)': {
                               color: 'error.contrastText',
                             },
                            '&:hover': {
                               backgroundColor: 'error.dark',
                            }
                          }),
                          transition: `background-color ${TRANSITION_DURATION} ease, box-shadow ${TRANSITION_DURATION} ease, transform ${TRANSITION_DURATION} ease`,
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        { creditsLoading ? "Cargando..." :
                          (credits !== null && credits !== 'Error'
                            ? `${credits.toFixed(1)} Créditos`
                            : (credits === 'Error' ? 'Error' : '-- Créditos')
                          )
                        }
                </Button>
                    </span>
              </Tooltip>
          )}
          
                {!isMobile && (
                  <>
                    {user ? (
                      <Tooltip title="Mi Cuenta">
            <IconButton
                          size="medium"
                          onClick={handleMenu}
              color="inherit"
                          aria-label="Menú de usuario"
                          sx={{
                            transition: `transform ${TRANSITION_DURATION} ease`,
                            '&:hover': {
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <Avatar
                            alt={user.name || 'Usuario'}
                            src={user.profilePicture || undefined}
                            sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                          >
                             {!user.profilePicture && user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                          </Avatar>
            </IconButton>
                      </Tooltip>
          ) : (
                      authItems.map((item) => (
                <Button 
                  key={item.text}
                          color="primary"
                          variant={item.text === 'Registrarse' ? 'contained' : 'outlined'}
                  component={RouterLink} 
                  to={item.path}
                          size="small"
                          sx={{ mx: 0.5, textTransform: 'none', borderRadius: '20px', transition: `background-color ${TRANSITION_DURATION} ease, border-color ${TRANSITION_DURATION} ease, color ${TRANSITION_DURATION} ease` }}
                >
                  {item.text}
                </Button>
                      ))
                    )}
                  </>
                )}
              </>
            )}

            {isMobile && (
              <>
                {!isOnline && (
                  <Tooltip title="Sin conexión">
                    <IconButton color="warning" size="small" sx={{ mr: 0.5 }} aria-label="Estás desconectado">
                      <WifiOffIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  color="inherit"
                  aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
                  edge="end"
                  onClick={toggleDrawer(!drawerOpen)}
                  sx={{ ml: 0.5 }}
                >
                  <MenuIcon />
                </IconButton>
              </>
            )}
            </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: alpha(theme.palette.common.black, 0.85),
            backdropFilter: 'blur(8px)',
            borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            color: theme.palette.common.white,
          },
        }}
      >
          {drawer}
      </Drawer>

      {user && (
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
          MenuListProps={{ 'aria-labelledby': 'basic-button' }}
          slotProps={{ paper: { elevation: 3, sx: { mt: 1.5, minWidth: 180 } } }}
        >
          <MenuItem disabled sx={{ '&.Mui-disabled': { opacity: 1 } }}>
             <ListItemIcon>
                <Avatar
                  alt={user.name || 'Usuario'}
                  src={user.profilePicture || undefined}
                  sx={{ width: 28, height: 28, mr: 0, bgcolor: 'secondary.main' }}
                >
                   {!user.profilePicture && user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="small"/>}
                </Avatar>
             </ListItemIcon>
             <ListItemText
                primary={user.name || 'Usuario'}
                secondary={user.email}
                primaryTypographyProps={{ fontWeight: 'medium' }}
                secondaryTypographyProps={{ fontSize: '0.8rem' }}
             />
          </MenuItem>
          <Divider />

          {userAccountItems.map((item) => (
            <MenuItem key={item.text} onClick={() => handleNavigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          ))}

          {(isAdmin || isDoctor) && <Divider />}
          {isAdmin && adminNavItems.map((item) => (
            <MenuItem key={item.text} onClick={() => handleNavigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          ))}
          {isDoctor && !isAdmin && doctorNavItems.map((item) => (
            <MenuItem key={item.text} onClick={() => handleNavigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          ))}

          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            Cerrar Sesión
          </MenuItem>
        </Menu>
      )}

      <Menu
        id="notifications-menu"
        anchorEl={anchorElNotifications}
        open={Boolean(anchorElNotifications)}
        onClose={handleNotificationsClose}
        MenuListProps={{ 'aria-labelledby': 'notifications-button' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: {
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 300,
              maxWidth: 350,
              maxHeight: 400,
              overflow: 'auto',
            },
        }}}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Notificaciones</Typography>
        </Box>
        <Divider />
        {mockNotifications.length === 0 ? (
            <MenuItem disabled>No tienes notificaciones</MenuItem>
        ) : (
            mockNotifications.map((notification) => (
            <MenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{
                    bgcolor: !notification.read ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    whiteSpace: 'normal',
                    alignItems: 'flex-start',
                    py: 1.5
                }}
            >
                <ListItemText
                primary={notification.text}
                secondary={notification.timestamp}
                primaryTypographyProps={{ fontWeight: !notification.read ? 'bold' : 'normal' }}
                />
            </MenuItem>
            ))
        )}
        <Divider />
        <MenuItem onClick={handleNotificationsClose} sx={{ justifyContent: 'center', py: 1 }}>
            <Typography variant="caption" color="primary">Ver todas</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default memo(Navbar); 