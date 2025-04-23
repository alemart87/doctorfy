import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Box } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';

function UpdateNotification() {
  const [showReload, setShowReload] = useState(false);
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowReload(true);
    }
  }, [needRefresh]);

  const handleReload = () => {
    updateServiceWorker(true);
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