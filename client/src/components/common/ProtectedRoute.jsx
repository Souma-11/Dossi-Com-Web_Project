import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role ? String(user.role).trim().toLowerCase() : '';
  const rolesList = allowedRoles
    ? allowedRoles.map((r) => String(r).trim().toLowerCase())
    : role
      ? [String(role).trim().toLowerCase()]
      : null;

  if (rolesList && !rolesList.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}