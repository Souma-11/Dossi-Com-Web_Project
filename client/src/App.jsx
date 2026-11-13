import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import PublicDashboard from './pages/PublicDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccueilDashboard from './pages/AccueilDashboard';
import InfirmierDashboard from './pages/InfirmierDashboard';
import MedecinDashboard from './pages/MedecinDashboard';
import ResponsableDashboard from './pages/ResponsableDashboard';
import PatientDashboard from './pages/PatientDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#EEF3F9] text-[#0F172A]">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Pages publiques */}
              <Route path="/" element={<PublicDashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Espaces protégés par rôle */}
              <Route
                path="/accueil"
                element={
                  <ProtectedRoute allowedRoles={['accueil']}>
                    <AccueilDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/infirmier"
                element={
                  <ProtectedRoute allowedRoles={['infirmier']}>
                    <InfirmierDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/medecin"
                element={
                  <ProtectedRoute allowedRoles={['medecin']}>
                    <MedecinDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/responsable"
                element={
                  <ProtectedRoute allowedRoles={['responsable']}>
                    <ResponsableDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirection par défaut uniquement pour les URL inexistantes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}