/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

function normalizeUser(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return null;

  const role = rawUser.role ? String(rawUser.role).trim().toLowerCase() : '';
  return {
    ...rawUser,
    role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    normalizeUser(authService.getCurrentUser())
  );

  useEffect(() => {
    const syncAuth = () => {
      setUser(normalizeUser(authService.getCurrentUser()));
    };

    window.addEventListener('dossicom:auth-updated', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('dossicom:auth-updated', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const login = async (credentialsOrEmail, maybePassword) => {
    const payload =
      typeof credentialsOrEmail === 'object'
        ? credentialsOrEmail
        : { identifiant: credentialsOrEmail, password: maybePassword };

    const rawUser = await authService.login(payload);
    const normalizedUser = normalizeUser(rawUser);
    setUser(normalizedUser);
    return normalizedUser;
  };

  const registerPatient = async (formData) => {
    const rawUser = await authService.registerPatient(formData);
    const normalizedUser = normalizeUser(rawUser);
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerPatient, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider');
  }
  return context;
}