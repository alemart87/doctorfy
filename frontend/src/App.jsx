import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Componente de carga
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

// Componente de error
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error("Error capturado en límite:", error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="error-container">
        <h2>Algo salió mal</h2>
        <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
        <button onClick={() => window.location.reload()}>Recargar página</button>
      </div>
    );
  }
  
  return children;
};

// Cargar componentes de forma perezosa
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MedicalStudies = lazy(() => import('./pages/MedicalStudies'));
const StudyDetail = lazy(() => import('./pages/StudyDetail'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const NutritionDashboard = lazy(() => import('./pages/NutritionDashboard'));
const DoctorDirectory = lazy(() => import('./pages/DoctorDirectory'));
const Profile = lazy(() => import('./pages/Profile'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  try {
    return (
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/medical-studies" element={<MedicalStudies />} />
              <Route path="/medical-studies/:id" element={<StudyDetail />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/nutrition-dashboard" element={<NutritionDashboard />} />
              <Route path="/doctors" element={<DoctorDirectory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    );
  } catch (error) {
    console.error('Error fatal en App:', error);
    return (
      <div className="fatal-error">
        <h1>Error en la aplicación</h1>
        <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
        <button onClick={() => window.location.reload()}>Recargar</button>
      </div>
    );
  }
}

export default App; 