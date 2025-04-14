const testBackendConnection = async () => {
  try {
    const response = await fetch('https://doctorfy.onrender.com/api/health');
    const data = await response.json();
    console.log('Backend connection test:', data);
    return true;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

export default testBackendConnection; 