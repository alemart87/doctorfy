import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

// Componentes
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import MedicalStudies from './pages/MedicalStudies';
import StudyDetails from './pages/StudyDetails';
import DoctorDirectory from './pages/DoctorDirectory';
import NutritionAnalyzer from './components/NutritionAnalyzer';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Ruta principal para la landing page */}
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/medical-studies" element={
              <PrivateRoute>
                <MedicalStudies />
              </PrivateRoute>
            } />
            <Route path="/medical-studies/:studyId" element={
              <PrivateRoute>
                <StudyDetails />
              </PrivateRoute>
            } />
            <Route path="/nutrition" element={
              <PrivateRoute>
                <NutritionAnalyzer />
              </PrivateRoute>
            } />
            <Route path="/doctors" element={<DoctorDirectory />} />
            <Route path="/admin" element={
              <PrivateRoute adminOnly>
                <AdminPanel />
              </PrivateRoute>
            } />
            {/* Ruta para manejar URLs no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 