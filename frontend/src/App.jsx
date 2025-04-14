import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import testBackendConnection from './utils/testConnection';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    const checkConnection = async () => {
      console.log("Iniciando prueba de conexión desde App.jsx...");
      setConnectionStatus('checking');
      const isConnected = await testBackendConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      console.log(`Resultado final de la prueba: ${isConnected ? 'Éxito' : 'Fallo'}`);
    };

    checkConnection();
  }, []);

  return (
    <Router>
      <div style={{ position: 'fixed', top: 10, right: 10, background: 'lightgray', padding: '5px', zIndex: 1000 }}>
        API Status: {' '}
        {connectionStatus === 'checking' && '🔄'}
        {connectionStatus === 'connected' && '✅'}
        {connectionStatus === 'failed' && '❌'}
      </div>

      <Routes>
        <Route path="/" element={<div>Página Principal (Reemplazar con tu componente)</div>} />
      </Routes>
    </Router>
  );
}

export default App; 