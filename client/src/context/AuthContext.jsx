/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function normalizeUser(data) {
  const rawUser = data?.user || data;
  if (!rawUser || typeof rawUser !== 'object') return null;

  const role = rawUser.role ? String(rawUser.role).trim().toLowerCase() : '';
  return {
    ...rawUser,
    role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data?.token || res.data?.accessToken;
    const normalizedUser = normalizeUser(res.data);

    if (token) {
      localStorage.setItem('token', token);
    }
    if (normalizedUser) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }

    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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