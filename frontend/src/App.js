import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
import axios from 'axios';
import ProtectedRoute from './components/ProtectedRoute';

// Componentes
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MedicalStudies from './pages/MedicalStudies';
import StudyDetails from './pages/StudyDetails';
import DoctorDirectory from './pages/DoctorDirectory';
import Nutrition from './pages/Nutrition';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './pages/UserProfile';
import DoctorProfile from './pages/DoctorProfile';
import NutritionDashboard from './pages/NutritionDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientNutritionView from './pages/PatientNutritionView';
import DoctorProfileView from './pages/DoctorProfileView';
import DashboardPage from './pages/DashboardPage';
import GuidePage from './pages/GuidePage';
import MedicalChat from './pages/MedicalChat';
import TixaeChatbot from './pages/TixaeChatbot';
import FloatingChatButton from './components/FloatingChatButton';
import SubscriptionPage from './pages/SubscriptionPage';

// Componente para decidir si mostrar el navbar general
const NavbarWrapper = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return (
    <>
      {!isLandingPage && <Navbar />}
      {children}
    </>
  );
};

function App() {
  useEffect(() => {
    // Cargar el token al iniciar la aplicación
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <NavbarWrapper>
            <Routes>
              {/* Ruta principal para la landing page */}
              <Route path="/" element={<LandingPage />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              <Route path="/medical-studies" element={
                <ProtectedRoute>
                  <MedicalStudies />
                </ProtectedRoute>
              } />
              <Route path="/medical-studies/:studyId" element={
                <ProtectedRoute>
                  <StudyDetails />
                </ProtectedRoute>
              } />
              <Route path="/nutrition" element={
                <ProtectedRoute>
                  <Nutrition />
                </ProtectedRoute>
              } />
              <Route path="/doctors" element={<DoctorDirectory />} />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute requireSubscription={false}>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/doctor/profile" element={
                <ProtectedRoute>
                  <DoctorProfile />
                </ProtectedRoute>
              } />
              <Route path="/nutrition-dashboard" element={<NutritionDashboard />} />
              
              {/* Rutas para médicos */}
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctor/patient/:patientId/nutrition" element={
                <ProtectedRoute>
                  <PatientNutritionView />
                </ProtectedRoute>
              } />
              
              {/* Ruta para ver el perfil detallado de un médico */}
              <Route path="/doctors/:doctorId" element={<DoctorProfileView />} />
              
              {/* Ruta para manejar URLs no encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/guide" element={<GuidePage />} />
              {/* Comentar temporalmente la ruta del Chat Médico IA */}
              {/*
              <Route path="/medical-chat" element={
                <ProtectedRoute>
                  <MedicalChat />
                </ProtectedRoute>
              } />
              */}
              <Route path="/tixae-chatbot" element={
                <ProtectedRoute>
                  <TixaeChatbot />
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={<SubscriptionPage />} />
            </Routes>
            <FloatingChatButton />
          </NavbarWrapper>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 