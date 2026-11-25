import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useDossiComSync } from './hooks/useDossiComSync';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AnimatedBackground from './components/common/AnimatedBackground';

// Pages publiques chargées immédiatement pour un affichage initial rapide
import PublicDashboard from './pages/PublicDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Chargement différé (Code Splitting) des espaces métiers protégés
const AccueilDashboard = lazy(() => import('./pages/AccueilDashboard'));
const InfirmierDashboard = lazy(() => import('./pages/InfirmierDashboard'));
const MedecinDashboard = lazy(() => import('./pages/MedecinDashboard'));
const ResponsableDashboard = lazy(() => import('./pages/ResponsableDashboard'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));

const ESPACE_PREFIXES = [
  '/accueil',
  '/infirmier',
  '/medecin',
  '/responsable',
  '/patient',
];

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-3"
    >
      <div className="w-9 h-9 border-4 border-[#D5DEEA] border-t-[#0B2A5B] rounded-full animate-spin" />
      <p className="text-sm font-medium text-[#5B6675]">
        Chargement de l’espace...
      </p>
    </div>
  );
}

function AppLayout() {
  const { publicStats, alertCount, logout } = useDossiComSync();
  const navigate = useNavigate();
  const location = useLocation();

  const isEspacePage = ESPACE_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex flex-col text-[#0F172A]">
      {isEspacePage && <AnimatedBackground />}

      <Navbar alertCount={alertCount} onLogout={handleLogout} />

      <main className="relative z-10 flex-1 flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<PublicDashboard stats={publicStats} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Espaces protégés par rôle */}
            <Route
              path="/accueil/*"
              element={
                <ProtectedRoute allowedRoles={['accueil']}>
                  <AccueilDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/infirmier/*"
              element={
                <ProtectedRoute allowedRoles={['infirmier']}>
                  <InfirmierDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/medecin/*"
              element={
                <ProtectedRoute allowedRoles={['medecin']}>
                  <MedecinDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/responsable/*"
              element={
                <ProtectedRoute allowedRoles={['responsable']}>
                  <ResponsableDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/*"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut uniquement pour les URL inexistantes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}