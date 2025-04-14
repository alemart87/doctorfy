import React, { useEffect, useState } from 'react';
import testBackendConnection from './utils/testConnection'; // Asegúrate que la ruta sea correcta

function App() {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [error, setError] = useState(null);

  // Log para ver si el componente se monta
  console.log("App component mounted. Intentando useEffect...");

  useEffect(() => {
    console.log("Dentro de useEffect, llamando a checkConnection...");
    const checkConnection = async () => {
      try {
        console.log('Probando conexión con el backend...');
        setConnectionStatus('checking');
        const isConnected = await testBackendConnection();
        console.log('Resultado de la conexión:', isConnected);
        setConnectionStatus(isConnected ? 'connected' : 'failed');
      } catch (error) {
        console.error('Error al probar conexión:', error);
        setConnectionStatus('failed');
        setError(error.message || 'Error desconocido'); // Asegura que error.message exista
      }
    };

    checkConnection();
  }, []); // Array vacío para ejecutar solo una vez

  console.log("Renderizando App. Estado:", connectionStatus);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Prueba de Conexión API</h1>
      <p>
        <strong>Estado: </strong>
        {connectionStatus === 'checking' && '🔄 Verificando...'}
        {connectionStatus === 'connected' && '✅ Conectado'}
        {connectionStatus === 'failed' && '❌ Error de conexión'}
      </p>
      {error && (
        <p style={{ color: 'red' }}>
          <strong>Error: </strong> {error}
        </p>
      )}
       <p>
        <strong>Ambiente: </strong> {process.env.NODE_ENV}
      </p>
       <p>
        <strong>URL Base API Esperada: </strong> {process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://doctorfy.onrender.com' : 'http://localhost:5000')}
      </p>
    </div>
  );
}

export default App; 