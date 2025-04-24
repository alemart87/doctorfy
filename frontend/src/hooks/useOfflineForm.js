import { useState } from 'react';
import { openDB } from 'idb';

async function initDB() {
  return openDB('doctorfy-offline-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('offlineFormData')) {
        db.createObjectStore('offlineFormData', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export function useOfflineForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitForm = async (url, method, data, headers = {}) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Intentar enviar normalmente
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });

      setIsSubmitting(false);
      return response;
    } catch (err) {
      // Si hay un error (probablemente offline), guardar para sincronización
      console.log('Error submitting form, saving for later sync', err);
      
      try {
        const db = await initDB();
        await db.add('offlineFormData', {
          url,
          method,
          data,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          timestamp: new Date().toISOString()
        });

        // Registrar para sincronización en segundo plano
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-form-data');
        }

        setIsSubmitting(false);
        return { ok: true, offline: true };
      } catch (dbError) {
        console.error('Error saving form data offline', dbError);
        setError('No se pudo guardar el formulario para sincronización posterior');
        setIsSubmitting(false);
        throw dbError;
      }
    }
  };

  return { submitForm, isSubmitting, error };
} 