import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { GetApp, PhoneIphone } from '@mui/icons-material';

const PWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostrar prompt después de 10 segundos
      setTimeout(() => setShowPrompt(true), 10000);
    });

    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
      if (result.outcome === 'accepted') {
        console.log('Usuario instaló la PWA');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  return (
    <Dialog 
      open={showPrompt} 
      onClose={() => setShowPrompt(false)}
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <PhoneIphone />
        Instala Doctorfy
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Accede más rápido a tus servicios de salud
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <Typography component="li">• Acceso instantáneo desde tu pantalla</Typography>
          <Typography component="li">• Funciona sin internet</Typography>
          <Typography component="li">• Mejor experiencia de usuario</Typography>
          <Typography component="li">• Notificaciones importantes</Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={() => setShowPrompt(false)}>
          Después
        </Button>
        <Button
          variant="contained"
          startIcon={<GetApp />}
          onClick={handleInstall}
        >
          Instalar Ahora
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PWAPrompt; 