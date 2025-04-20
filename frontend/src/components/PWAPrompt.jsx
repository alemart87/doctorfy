import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Badge } from '@mui/material';
import { GetApp, Close, PhoneIphone, Computer } from '@mui/icons-material';

const PWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Reducimos el tiempo de espera a 10 segundos
      setTimeout(() => setShowDialog(true), 10000);
    });
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario instaló la PWA');
      }
      setDeferredPrompt(null);
      setShowDialog(false);
    });
  };

  return (
    <>
      <Dialog 
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge color="error" variant="dot">
              <PhoneIphone />
            </Badge>
            ¡Instala Doctorfy en tu dispositivo!
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            ¿Por qué instalar Doctorfy?
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <Typography component="li" sx={{ mb: 1 }}>
              ✨ Acceso instantáneo desde tu pantalla de inicio
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              🚀 Funciona más rápido que la web
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              📱 Consultas médicas 24/7 desde tu celular
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              💪 Funciona incluso sin internet
            </Typography>
          </Box>
          
          <Box sx={{ mt: 3, bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              💡 Tip: También puedes instalarla desde el ícono {' '}
              <GetApp fontSize="small" sx={{ verticalAlign: 'middle' }} /> 
              en la barra de direcciones de tu navegador
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowDialog(false)} 
            startIcon={<Close />}
          >
            Ahora No
          </Button>
          <Button 
            onClick={handleInstallClick} 
            variant="contained" 
            color="primary"
            startIcon={<GetApp />}
            sx={{ px: 3 }}
          >
            Instalar Doctorfy
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PWAPrompt; 