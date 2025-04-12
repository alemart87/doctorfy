import React, { useState } from 'react';
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
  Menu
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

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

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
  ];

  const authItems = user 
    ? [{ text: 'Cerrar Sesión', action: handleLogout }]
    : [
        { text: 'Iniciar Sesión', path: '/login' },
        { text: 'Registrarse', path: '/register' }
      ];

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
        {drawer}
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