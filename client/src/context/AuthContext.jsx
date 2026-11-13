import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { translateError } from '../services/api';

/**
 * AuthContext — Gestion centralisée de l'authentification (Phase 3).
 * - Stocke le token JWT dans localStorage (persistance F5)
 * - Stocke l'objet user en mémoire (state React)
 * - Revalide la session au montage via GET /api/auth/me
 * - Expose : user, token, loading, login(), logout(), isAuthenticated
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true pendant la vérification initiale du token

  /**
   * Au montage de l'app, si un token existe dans localStorage,
   * on le valide auprès du serveur (/api/auth/me) pour récupérer
   * les données fraîches de l'utilisateur → la session survit au F5.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dossicom_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        // Token invalide ou expiré : on nettoie
        localStorage.removeItem('dossicom_token');
        localStorage.removeItem('dossicom_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Connexion : appelle POST /api/auth/login, stocke le token et l'user.
   * @param {string} email
   * @param {string} password
   * @returns {object} { success, user, error }
   */
  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      // Persistance dans localStorage → survit au rafraîchissement (F5)
      localStorage.setItem('dossicom_token', token);
      localStorage.setItem('dossicom_user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: translateError(error, 'Erreur de connexion.') };
    }
  }, []);

  /**
   * Inscription d'un compte patient (seul le patient peut créer son compte).
   */
  const register = useCallback(async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'patient',
      });
      const { token, user: userData } = response.data;

      localStorage.setItem('dossicom_token', token);
      localStorage.setItem('dossicom_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: translateError(error, 'Erreur lors de la création du compte.') };
    }
  }, []);

  /**
   * Déconnexion : supprime le token et réinitialise l'état.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('dossicom_token');
    localStorage.removeItem('dossicom_user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook personnalisé pour consommer le contexte d'authentification.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
