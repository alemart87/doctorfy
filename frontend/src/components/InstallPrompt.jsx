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
  useTheme
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      
      // Solo mostrar automáticamente en móvil
      if (isMobile) {
        setShowDialog(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isMobile]);

  const handleInstall = async () => {
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

  if (!installPromptEvent) return null;

  return (
    <>
      {!isMobile && (
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
    </>
  );
};

export default InstallPrompt; 