import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts — Authentification (Phase 3) + Temps réel Socket.io (Phase 4)
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Composants communs
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import PublicDashboard from './pages/PublicDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccueilDashboard from './pages/AccueilDashboard';
import InfirmierDashboard from './pages/InfirmierDashboard';
import MedecinDashboard from './pages/MedecinDashboard';
import ResponsableDashboard from './pages/ResponsableDashboard';
import PatientDashboard from './pages/PatientDashboard';

/**
 * Layout interne — doit être à l'intérieur du Router ET de l'AuthProvider
 * pour pouvoir utiliser useAuth() et les hooks de navigation.
 */
function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-brand-bg font-body flex flex-col">
      <Navbar
        userRole={user?.role}
        userName={user?.name}
        onLogout={logout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <Routes>
          {/* ── Routes publiques ──────────────────────────────────── */}
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Routes protégées par rôle (RBAC côté serveur + garde client) ── */}
          <Route
            path="/accueil"
            element={
              <ProtectedRoute allowedRoles={['accueil', 'responsable']}>
                <AccueilDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/infirmier"
            element={
              <ProtectedRoute allowedRoles={['infirmier', 'responsable']}>
                <InfirmierDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medecin"
            element={
              <ProtectedRoute allowedRoles={['medecin', 'responsable']}>
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

          {/* ── Fallback : toute route inconnue → accueil ─────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * App — Point d'entrée racine.
 * AuthProvider (Phase 3) → SocketProvider (Phase 4) → Router.
 * L'ordre garantit que tous les composants ont accès à la session
 * et au canal temps réel.
 */
export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppLayout />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
