import React, { useEffect } from 'react';
import testBackendConnection from './utils/testConnection';

function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await testBackendConnection();
        console.log('¿Conexión exitosa?:', isConnected);
      } catch (error) {
        console.error('Error al probar conexión:', error);
      }
    };

    testConnection();
  }, []);

  // ... resto del componente
} 