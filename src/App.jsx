import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import des composants et de TOUTES les pages
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicDashboard from './pages/PublicDashboard';
import LoginPage from './pages/LoginPage';
import AccueilDashboard from './pages/AccueilDashboard';
import InfirmierDashboard from './pages/InfirmierDashboard';
import MedecinDashboard from './pages/MedecinDashboard';
import ResponsableDashboard from './pages/ResponsableDashboard';
import PatientDashboard from './pages/PatientDashboard'; // La page Patient !

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-brand-bg font-body flex flex-col">
        <Navbar 
          userRole={user?.role} 
          userName={user?.name} 
          onLogout={handleLogout} 
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4">
          <Routes>
            <Route path="/" element={<PublicDashboard />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            
            <Route 
              path="/accueil" 
              element={
                <ProtectedRoute allowedRoles={['accueil', 'responsable']} user={user}>
                  <AccueilDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/infirmier" 
              element={
                <ProtectedRoute allowedRoles={['infirmier', 'responsable']} user={user}>
                  <InfirmierDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/medecin" 
              element={
                <ProtectedRoute allowedRoles={['medecin', 'responsable']} user={user}>
                  <MedecinDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/responsable" 
              element={
                <ProtectedRoute allowedRoles={['responsable']} user={user}>
                  <ResponsableDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Vraie page Patient */}
            <Route 
              path="/patient" 
              element={
                <ProtectedRoute allowedRoles={['patient']} user={user}>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}