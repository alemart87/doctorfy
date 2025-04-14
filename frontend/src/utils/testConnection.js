import config from '../config'; // Importa la configuración

const testBackendConnection = async () => {
  // Usa el endpoint de salud desde la configuración
  const url = config.endpoints.health;
  console.log('Intentando conectar con:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Respuesta recibida:', { /* ... */ });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Datos recibidos:', data);
    return true;
  } catch (error) {
    console.error('Error detallado:', { /* ... */ });
    return false;
  }
};

export default testBackendConnection; 