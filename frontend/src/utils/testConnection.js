const testBackendConnection = async () => {
  try {
    console.log('Intentando conectar con el backend...');
    const response = await fetch('https://doctorfy.onrender.com/api/health', {
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