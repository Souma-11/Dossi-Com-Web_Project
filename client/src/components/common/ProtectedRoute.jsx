import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — Garde de route basé sur l'AuthContext (JWT).
 *
 * Pendant la vérification initiale du token (loading=true), on affiche
 * un spinner pour éviter un flash de redirection.
 *
 * @param {string[]} allowedRoles - Rôles autorisés à accéder à cette route
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  // ── Vérification du token en cours (au démarrage / F5) ──────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-brand-blue mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-brand-slate text-sm">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  // ── Non authentifié → redirection vers /login ────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── Rôle non autorisé → redirection vers l'accueil ──────────────────────
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ── Accès accordé ────────────────────────────────────────────────────────
  return children;
}
