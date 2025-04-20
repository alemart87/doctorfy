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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChatIcon from '@mui/icons-material/Chat';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { CreditCard as CreditIcon } from '@mui/icons-material';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [credits, setCredits] = useState(null);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    if (user?.is_doctor) {
      navigate('/doctor/profile');
    } else {
      navigate('/profile');
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    ...(isAdmin() ? [{ text: 'Panel de Admin', path: '/admin/dashboard' }] : []),
    ...(user?.is_doctor ? [{ text: 'Panel de Doctor', path: '/doctor/dashboard' }] : []),
    { text: 'Estudios Médicos', path: '/medical-studies' },
    { text: 'Nutrición', path: '/nutrition' },
    { text: 'Dashboard Nutrición', path: '/nutrition-dashboard' },
    { text: 'Directorio de Médicos', path: '/doctors' },
    { text: 'Chat Médico IA', path: '/medical-chat' },
    { text: 'Psicólogo y Doctor Virtual', path: '/tixae-chatbot' },
  ];

  const authItems = user 
    ? [{ text: 'Cerrar Sesión', action: handleLogout }]
    : [
        { text: 'Iniciar Sesión', path: '/login' },
        { text: 'Registrarse', path: '/register' }
      ];

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

  const drawer = (
    <Box onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          Doctorfy
        </Typography>
      </Box>
      <Divider />
      <List>
        {user && navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {authItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={item.path ? RouterLink : 'button'} 
              to={item.path} 
              onClick={item.action}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {user && (
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Mi Perfil" />
          </MenuItem>
        )}
        {user && user.is_doctor && (
          <MenuItem onClick={() => { handleLogout(); navigate('/doctor/profile'); }}>
            <ListItemIcon>
              <LocalHospitalIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Mi Perfil Médico" />
          </MenuItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Doctorfy
          </Typography>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Tooltip title="Ver planes y precios">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/credits-info')}
                  startIcon={<AccountBalanceWalletIcon sx={{ 
                    color: '#00ffff',
                    filter: 'drop-shadow(0 0 3px #00ffff)'
                  }} />}
                  sx={{
                    borderColor: '#00ffff',
                    color: '#00ffff',
                    background: 'rgba(0, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    textShadow: '0 0 10px #00ffff',
                    boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: '#00ffff',
                      background: 'rgba(0, 255, 255, 0.2)',
                      boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        mr: 1,
                        textShadow: '0 0 10px #00ffff'
                      }}
                    >
                      {credits?.toFixed(1) || '0'}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        opacity: 0.9,
                        textTransform: 'none'
                      }}
                    >
                      créditos
                    </Typography>
                  </Box>
                </Button>
              </Tooltip>
            </Box>
          )}
          
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex' }}>
              {user && navItems.map((item) => (
                <Button 
                  key={item.text}
                  color="inherit" 
                  component={RouterLink} 
                  to={item.path}
                  sx={{ mx: 0.5 }}
                >
                  {item.text}
                </Button>
              ))}
              
              {authItems.map((item) => (
                <Button 
                  key={item.text}
                  color="inherit" 
                  component={item.path ? RouterLink : 'button'} 
                  to={item.path}
                  onClick={item.action}
                  sx={{ mx: 0.5 }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          {user && (
            <ListItem 
              component={RouterLink} 
              to="/credits-info"
              sx={{
                bgcolor: 'rgba(0, 191, 255, 0.1)',
                my: 1
              }}
            >
              <ListItemIcon>
                <AccountBalanceWalletIcon />
              </ListItemIcon>
              <ListItemText 
                primary={`${credits?.toFixed(1) || '0'} créditos`}
                secondary="Click para más info"
              />
            </ListItem>
          )}
          {drawer}
        </Box>
      </Drawer>

      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleProfile}>Perfil</MenuItem>
        <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
      </Menu>
    </>
  );
};

export default Navbar; 