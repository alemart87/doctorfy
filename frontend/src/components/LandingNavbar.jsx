import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useScrollTrigger,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GooeyNav from './GooeyNav';

// Navbar con efecto glassmorphism cuando se hace scroll
const GlassNavbar = styled(AppBar)(({ theme, scrolled }) => ({
  background: scrolled 
    ? `rgba(13, 17, 23, 0.85)` // Fondo más oscuro y menos transparente al hacer scroll
    : `rgba(13, 17, 23, 0.65)`, // Más transparente al inicio
  backdropFilter: 'blur(12px) saturate(180%)', // Blur mejorado con saturación
  boxShadow: scrolled 
    ? '0 10px 30px -10px rgba(0, 0, 0, 0.3)' 
    : 'none',
  borderBottom: scrolled 
    ? `1px solid ${theme.palette.grey[800]}` 
    : 'none',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Transición más suave
  color: theme.palette.common.white,
}));

// Botón de navegación con efecto hover
const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  marginLeft: theme.spacing(2.5),
  textTransform: 'none',
  fontSize: '0.95rem',
  letterSpacing: '0.3px',
  fontWeight: 500,
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  position: 'relative',
  padding: theme.spacing(1, 1.5),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transform: 'translateY(3px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
    transform: 'translateY(0)',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)',
  },
}));

// Botón de acción principal (login/registro)
const ActionButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '8px',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  letterSpacing: '0.5px',
  boxShadow: variant === 'contained' ? '0 4px 14px rgba(0, 0, 0, 0.4)' : 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.2), rgba(255,255,255,0) 70%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: variant === 'contained' 
      ? `0 6px 20px ${theme.palette.primary.main}66` 
      : `0 6px 20px ${theme.palette.secondary.main}40`,
  },
  '&:hover::after': {
    transform: 'translateX(100%)',
  },
}));

// Componente para ocultar navbar al hacer scroll hacia abajo
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Detectar scroll para cambiar apariencia del navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Estudios Médicos", href: "/medical-studies" },
    { label: "Nutrición", href: "/nutrition" },
    { label: "Doctores", href: "/doctors" },
    { label: "Iniciar Sesión", href: "/login" },
  ];

  const drawer = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        background: theme.palette.grey[900],
        color: theme.palette.common.white,
        p: 2,
      }}
      role="presentation"
      onClick={handleDrawerToggle}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Doctorfy
        </Typography>
        <IconButton color="inherit" onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.name} 
            component={RouterLink} 
            to={item.path}
            sx={{ 
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {user ? (
          <>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => navigate('/dashboard')}
              sx={{ borderRadius: '30px' }}
            >
              Dashboard
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              fullWidth
              onClick={logout}
              sx={{ borderRadius: '30px' }}
            >
              Cerrar Sesión
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => navigate('/login')}
              sx={{ borderRadius: '30px' }}
            >
              Iniciar Sesión
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              fullWidth
              onClick={() => navigate('/register')}
              sx={{ borderRadius: '30px' }}
            >
              Registrarse
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <GlassNavbar position="fixed" scrolled={scrolled ? 1 : 0} elevation={0}>
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
              {/* Logo con animación */}
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}33, transparent)`,
                    left: '-100%',
                    top: 0,
                    animation: 'shimmer 2s infinite',
                  },
                  '@keyframes shimmer': {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' }
                  }
                }}
              >
                <LocalHospitalIcon sx={{ 
                  mr: 1, 
                  color: theme.palette.primary.main,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
                Doctorfy
              </Typography>

              {/* Navegación para desktop */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <GooeyNav
                    items={navItems}
                    animationTime={600}
                    particleCount={15}
                    particleDistances={[90, 10]}
                    particleR={100}
                    timeVariance={300}
                    colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                    initialActiveIndex={0}
                  />
                  
                  {user ? (
                    <>
                      <ActionButton
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/dashboard')}
                        sx={{ ml: 3 }}
                      >
                        Dashboard
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        color="secondary"
                        onClick={logout}
                        sx={{ ml: 2 }}
                      >
                        Cerrar Sesión
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate('/login')}
                        sx={{ ml: 3 }}
                      >
                        Iniciar Sesión
                      </ActionButton>
                      <ActionButton
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/register')}
                        sx={{ ml: 2 }}
                      >
                        Registrarse
                      </ActionButton>
                    </>
                  )}
                </Box>
              )}

              {/* Menú hamburguesa para móvil */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Toolbar>
          </Container>
        </GlassNavbar>
      </HideOnScroll>

      {/* Drawer para navegación móvil */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en dispositivos móviles
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Espacio para compensar la altura del navbar fijo */}
      <Toolbar />
    </>
  );
};

export default LandingNavbar; 