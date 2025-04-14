const testBackendConnection = async () => {
  const API_URL = process.env.REACT_APP_API_URL || process.env.NODE_ENV === 'production'
    ? 'https://doctorfy.onrender.com/api'
    : 'http://localhost:5000/api';

  try {
    console.log('Intentando conectar con el backend...');
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Backend connection test:', data);
    return true;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

export default testBackendConnection; 