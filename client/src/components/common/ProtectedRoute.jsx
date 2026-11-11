import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles, user }) {
  // 1. Si l'utilisateur n'est pas connecté, on le renvoie vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si un tableau de rôles autorisés est défini et que le rôle de l'utilisateur n'y est pas, on le renvoie à l'accueil
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Si tout est bon, on affiche le contenu demandé
  return children;
}