import React, { useState, useEffect } from 'react';
import { Snackbar, Button } from '@mui/material';
import * as serviceWorkerRegistration from '../serviceWorkerRegistration';

function UpdateNotification() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Configurar el callback para cuando hay una actualización disponible
    serviceWorkerRegistration.onUpdate((registration) => {
      setShowReload(true);
      setWaitingWorker(registration.waiting);
    });
  }, []);

  const handleReload = () => {
    if (waitingWorker) {
      // Enviar mensaje al service worker para activar la nueva versión
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Recargar la página para usar la nueva versión
    window.location.reload();
    setShowReload(false);
  };

  return (
    <Snackbar
      open={showReload}
      message="¡Nueva versión disponible!"
      action={
        <Button color="secondary" size="small" onClick={handleReload}>
          Actualizar
        </Button>
      }
    />
  );
}

export default UpdateNotification; 