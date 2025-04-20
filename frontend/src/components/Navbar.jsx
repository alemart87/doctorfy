import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Container,
  IconButton,
  Drawer,
  useScrollTrigger,
  useMediaQuery,
  useTheme,
  Typography,
  Avatar,
  Button,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GooeyNav from './GooeyNav';
import MobileMenu from './MobileMenu';
import { Link } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import { CreditCard as CreditIcon } from '@mui/icons-material';

// Navbar con efecto glassmorphism
const GlassNavbar = styled(AppBar)(({ theme, scrolled }) => ({
  background: scrolled 
    ? `rgba(13, 17, 23, 0.85)`
    : `rgba(13, 17, 23, 0.65)`,
  backdropFilter: 'blur(12px) saturate(180%)',
  boxShadow: scrolled 
    ? '0 10px 30px -10px rgba(0, 0, 0, 0.3)' 
    : 'none',
  borderBottom: scrolled 
    ? `1px solid ${theme.palette.grey[800]}` 
    : 'none',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  color: theme.palette.common.white,
}));

const MobileMenuItem = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: '12px 20px',
  marginBottom: '8px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  color: theme.palette.common.white,
  background: 'rgba(255, 255, 255, 0.05)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '&.active': {
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: 'white',
  }
}));

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credits, setCredits] = useState(null);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await axios.get('/api/credits/balance');
        setCredits(response.data.credits);
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };
    
    fetchCredits();
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Definir items de navegación según el estado de autenticación
  const getNavItems = (isAuthenticated) => {
    if (isAuthenticated) {
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Estudios Médicos", href: "/medical-studies" },
        { label: "Nutrición", href: "/nutrition" },
        { label: "Doctores", href: "/doctors" },
        { label: "Chat Médico", href: "/medical-chat" },
        { label: "Mi Perfil", href: "/profile" },
        { label: "Configuración", href: "/settings" },
        { label: "Cerrar Sesión", href: "/logout" },
      ];
    }
    return [
      { label: "Inicio", href: "/" },
      { label: "Estudios Médicos", href: "/medical-studies" },
      { label: "Nutrición", href: "/nutrition" },
      { label: "Doctores", href: "/doctors" },
      { label: "Chat Médico", href: "/medical-chat" },
      { label: "Registrarse", href: "/register" },
      { label: "Iniciar Sesión", href: "/login" },
    ];
  };

  const navItems = getNavItems(!!user);

  const handleMobileNavigation = (href) => {
    setDrawerOpen(false);
    if (href === '/logout') {
      logout();
    } else {
      navigate(href);
    }
  };

  return (
    <>
      <GlassNavbar position="fixed" scrolled={scrolled}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box 
              onClick={() => navigate('/')} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <LocalHospitalIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Doctorfy
              </Typography>
            </Box>

            {/* GooeyNav solo en desktop */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GooeyNav
                  items={navItems}
                  animationTime={600}
                  particleCount={15}
                  particleSpread={10}
                  particleBaseSize={100}
                  colors={[1, 2, 3, 4]}
                />
              </Box>
            )}

            {/* Botón menú móvil */}
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Añadir el botón de Chat Médico al menú de navegación */}
            <Button
              variant="contained"
              component={Link}
              to="/medical-chat"
              startIcon={<ChatIcon />}
              sx={{ 
                ml: 2,
                fontWeight: 'bold',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                '&:hover': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Chat Médico
            </Button>

            {/* Botón de Créditos - Agregar antes del menú de usuario */}
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Tooltip title="Comprar más créditos">
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CreditIcon />}
                    onClick={() => navigate('/credits-info')}
                    sx={{
                      borderRadius: 2,
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Créditos:
                    </Typography>
                    <Typography variant="h6" component="span">
                      {credits?.toFixed(1)}
                    </Typography>
                  </Button>
                </Tooltip>
              </Box>
            )}

            {/* Menú de usuario existente */}
            <Box sx={{ flexGrow: 0 }}>
              {/* ... resto del código ... */}
            </Box>
          </Toolbar>
        </Container>
      </GlassNavbar>

      {/* Drawer móvil */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        variant="temporary"
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: '320px',
            background: 'transparent',
            border: 'none',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          },
        }}
      >
        <MobileMenu onClose={handleDrawerToggle} items={navItems} />
      </Drawer>
    </>
  );
};

export default Navbar; 