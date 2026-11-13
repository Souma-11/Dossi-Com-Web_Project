import axios from 'axios';

/**
 * Instance Axios centralisée pour toutes les requêtes vers le backend Dossi'Com.
 * Injecte automatiquement le JWT depuis localStorage dans chaque requête.
 *
 * L'URL du backend est configurable via la variable d'environnement
 * VITE_API_URL (fichier client/.env). Par défaut : http://localhost:5000/api
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Intercepteur de requête : injecte le token JWT ───────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dossicom_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur de réponse : gère l'expiration du token ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicPage =
      window.location.pathname === '/login' || window.location.pathname === '/register';

    if (error.response?.status === 401 && !isPublicPage) {
      // Token expiré ou invalide : on nettoie le localStorage et on renvoie au login
      localStorage.removeItem('dossicom_token');
      localStorage.removeItem('dossicom_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Transforme une erreur Axios en message lisible pour l'utilisateur.
 */
export function translateError(error, fallback = 'Une erreur est survenue.') {
  if (!error.response) {
    const apiUrl = API_URL.replace('/api', '');
    return `Impossible de joindre le serveur backend (${apiUrl}). Démarrez-le avec : cd server → npm run dev (et vérifiez que MongoDB est démarré).`;
  }
  return error.response?.data?.message || fallback;
}

export default api;
