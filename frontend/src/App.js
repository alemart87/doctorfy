import React, { useEffect, lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import axios from 'axios';
import ProtectedRoute from './components/ProtectedRoute';
import { HelmetProvider } from 'react-helmet-async';
import FloatingChatButton from './components/FloatingChatButton';
import IntroModal from './components/IntroModal';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import { Button, Box, Typography, Tooltip } from '@mui/material';
import { CreditCard as CreditIcon } from '@mui/icons-material';
import InstallPrompt from './components/InstallPrompt';
import UpdateNotification from './components/UpdateNotification';

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
import SubscriptionPage from './pages/SubscriptionPage';
import AdminUsersPage from './pages/AdminUsersPage';
import BlogPage from './pages/BlogPage';
import BlogPost from './pages/BlogPost';
import WelcomePage from './components/WelcomePage';
import CreditsInfo from './pages/CreditsInfo';
import AdminCredits from './pages/AdminCredits';
import NewWelcomePage from './components/NewWelcomePage';
import NotFound from './components/NotFound';
import SearchPage from './pages/SearchPage.jsx';
import ShareTarget from './pages/ShareTarget';
import ProtocolHandler from './pages/ProtocolHandler';
import OpenFileHandler from './pages/OpenFileHandler';
import ComposeEmail from './pages/ComposeEmail';
import CalorieTrackerPage from './pages/CalorieTrackerPage';

// Lazy load de componentes pesados
const LandingPageLazy = lazy(() => import('./pages/LandingPage'));
const SubscriptionPageLazy = lazy(() => import('./pages/SubscriptionPage'));
const MedicalStudiesLazy = lazy(() => import('./pages/MedicalStudies'));

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

// Define o importa las alturas de la Navbar
const NAVBAR_HEIGHT_XS = 56; // Altura para móviles
const NAVBAR_HEIGHT_SM = 64; // Altura para pantallas más grandes

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HelmetProvider>
        <AuthProvider>
          <Router>
            <ErrorBoundary>
              {showWelcome ? (
                <NewWelcomePage onComplete={() => setShowWelcome(false)} />
              ) : (
                <NavbarWrapper>
                  <Box 
                    component="main"
                    sx={{ 
                      pt: { xs: `${NAVBAR_HEIGHT_XS}px`, sm: `${NAVBAR_HEIGHT_SM}px` },
                      flexGrow: 1,
                    }}
                  >
                    <Suspense fallback={<LoadingScreen />}>
                      <Routes>
                        {/* Ruta principal para la landing page */}
                        <Route path="/" element={<LandingPageLazy />} />
                        
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        
                        <Route path="/medical-studies" element={
                          <ProtectedRoute>
                            <MedicalStudiesLazy />
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
                        <Route path="*" element={<NotFound />} />

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
                        <Route path="/subscription" element={<SubscriptionPageLazy />} />
                        <Route path="/admin/users" element={
                          <ProtectedRoute>
                            <AdminUsersPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/credits-info" element={<CreditsInfo />} />
                        <Route 
                          path="/admin/credits" 
                          element={
                            <ProtectedRoute>
                              <AdminCredits />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/share-target" element={<ShareTarget />} />
                        <Route path="/protocol" element={<ProtocolHandler />} />
                        <Route path="/open-file" element={<OpenFileHandler />} />
                        <Route path="/compose" element={<ComposeEmail />} />
                        <Route path="/calorie-tracker" element={
                          <ProtectedRoute>
                            <CalorieTrackerPage />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </Suspense>
                    <FloatingChatButton />
                  </Box>
                </NavbarWrapper>
              )}
            </ErrorBoundary>
            <InstallPrompt />
            <UpdateNotification />
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App; 