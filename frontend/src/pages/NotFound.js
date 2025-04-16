import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que estás buscando no existe.</p>
      <div className="not-found-links">
        <Link to="/" className="not-found-link">Volver al inicio</Link>
        <Link to="/dashboard" className="not-found-link">Ir al dashboard</Link>
      </div>
    </div>
  );
};

export default NotFound; 