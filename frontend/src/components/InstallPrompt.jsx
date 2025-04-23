import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import AddBoxIcon from '@mui/icons-material/AddBox';

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Mostrar snackbar después de 5 segundos en la primera visita
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('hasSeenInstallPrompt');
    
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowSnackbar(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Manejar evento beforeinstallprompt (Android/Desktop)
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      
      // Solo mostrar automáticamente en móvil no-iOS
      if (isMobile && !isIOS) {
        setTimeout(() => {
          setShowDialog(true);
          localStorage.setItem('hasSeenInstallPrompt', 'true');
        }, 10000); // Mostrar después de 10 segundos
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isMobile, isIOS]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    
    if (!installPromptEvent) return;

    installPromptEvent.prompt();
    
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setInstallPromptEvent(null);
    setShowDialog(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setShowSnackbar(false);
    localStorage.setItem('hasSeenInstallPrompt', 'true');
  };

  return (
    <>
      {/* Botón flotante en escritorio */}
      {!isMobile && installPromptEvent && (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<GetAppIcon />}
          onClick={() => setShowDialog(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            zIndex: 1000,
            borderRadius: 28,
            px: 3,
            py: 1.5,
            boxShadow: 3
          }}
        >
          Instalar App
        </Button>
      )}

      {/* Botón flotante en iOS */}
      {isIOS && !localStorage.getItem('dismissedIOSPrompt') && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            right: 20,
            p: 2,
            borderRadius: 2,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.palette.primary.main,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GetAppIcon sx={{ mr: 1 }} />
            <Typography variant="body1">
              Instala Doctorfy en tu iPhone
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              color="inherit"
              size="small"
              onClick={() => setShowIOSInstructions(true)}
              sx={{ mr: 1 }}
            >
              Cómo instalar
            </Button>
            <IconButton 
              size="small" 
              color="inherit"
              onClick={() => {
                localStorage.setItem('dismissedIOSPrompt', 'true');
                document.querySelector('[data-ios-prompt]').style.display = 'none';
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Snackbar para primera visita */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={10000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="info" 
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={handleInstall}>
              Instalar
            </Button>
          }
        >
          ¡Instala Doctorfy para una mejor experiencia!
        </Alert>
      </Snackbar>

      {/* Dialog para Android/Desktop */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        aria-labelledby="install-dialog-title"
      >
        <DialogTitle id="install-dialog-title">
          Instala Doctorfy en tu dispositivo
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Instala Doctorfy para disfrutar de:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li">Acceso más rápido</Typography>
            <Typography component="li">Funcionamiento sin conexión</Typography>
            <Typography component="li">Experiencia de app nativa</Typography>
            <Typography component="li">Sin ocupar espacio en tu navegador</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="primary">
            Más tarde
          </Button>
          <Button 
            onClick={handleInstall} 
            variant="contained" 
            color="primary"
            startIcon={<GetAppIcon />}
          >
            Instalar ahora
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para instrucciones iOS */}
      <Dialog
        open={showIOSInstructions}
        onClose={() => setShowIOSInstructions(false)}
        aria-labelledby="ios-install-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="ios-install-dialog-title">
          Instalar Doctorfy en tu iPhone/iPad
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Sigue estos pasos para instalar Doctorfy:
          </Typography>
          <Box sx={{ my: 2 }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box component="span" sx={{ mr: 1, fontWeight: 'bold' }}>1.</Box>
              <ShareIcon color="primary" sx={{ mr: 1 }} /> 
              Toca el botón "Compartir" en la barra de navegación
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box component="span" sx={{ mr: 1, fontWeight: 'bold' }}>2.</Box>
              <AddBoxIcon color="primary" sx={{ mr: 1 }} /> 
              Desplázate y selecciona "Añadir a Pantalla de inicio"
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1, fontWeight: 'bold' }}>3.</Box>
              Toca "Añadir" en la esquina superior derecha
            </Typography>
          </Box>
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: theme.palette.primary.main,
            borderRadius: 1,
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'white',
                fontWeight: 500 
              }}
            >
              Una vez instalada, Doctorfy aparecerá como una aplicación en tu pantalla de inicio y funcionará como una app nativa, incluso sin conexión.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIOSInstructions(false)} color="primary">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallPrompt; 