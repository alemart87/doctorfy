import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
                  <Nutrition />
                </PrivateRoute>
              } />
              <Route path="/doctors" element={<DoctorDirectory />} />
              <Route path="/admin" element={
                <PrivateRoute adminOnly>
                  <AdminPanel />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } />
              <Route path="/doctor/profile" element={
                <PrivateRoute>
                  <DoctorProfile />
                </PrivateRoute>
              } />
              <Route path="/nutrition-dashboard" element={<NutritionDashboard />} />
              
              {/* Rutas para médicos */}
              <Route path="/doctor/dashboard" element={
                <PrivateRoute>
                  <DoctorDashboard />
                </PrivateRoute>
              } />
              <Route path="/doctor/patient/:patientId/nutrition" element={
                <PrivateRoute>
                  <PatientNutritionView />
                </PrivateRoute>
              } />
              
              {/* Ruta para ver el perfil detallado de un médico */}
              <Route path="/doctors/:doctorId" element={<DoctorProfileView />} />
              
              {/* Ruta para manejar URLs no encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />

              <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/guide" element={<GuidePage />} />
            </Routes>
          </NavbarWrapper>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 