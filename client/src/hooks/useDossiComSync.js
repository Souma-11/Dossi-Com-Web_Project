import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { authService } from '../services/authService';
import { urgenceService } from '../services/urgenceService';
import { API_BASE_URL } from '../services/api';

// On retire '/api' pour obtenir l'URL racine du serveur Socket
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export function useDossiComSync() {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [publicStats, setPublicStats] = useState({
    saturation: 0,
    medecinsPresents: 0,
    patientsAttente: 0,
    attenteMoyenne: 0,
  });
  const [alertCount, setAlertCount] = useState(0);

  const refreshData = useCallback(async () => {
    try {
      // 1. Statistiques publiques (toujours accessibles, même déconnecté)
      const stats = await urgenceService.getPublicStats();
      if (stats) {
        setPublicStats(stats);
      }

      // 2. Alertes cliniques (chargées uniquement si une session est active)
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const infirmierData = await urgenceService.getInfirmierData();
          setAlertCount(infirmierData?.alertes?.length ?? 0);
        } catch {
          setAlertCount(0);
        }
      } else {
        setAlertCount(0);
      }

      // Dispatch local pour que les autres composants se rafraîchissent aussi
      window.dispatchEvent(new CustomEvent('dossicom:local-refresh'));
    } catch (error) {
      console.error('Erreur de synchronisation Dossi’Com :', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialLoad = async () => {
      if (isMounted) await refreshData();
    };
    initialLoad();

    // 1. Connexion au serveur Socket.io
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('🟢 Connecté au serveur Socket.io (Temps réel actif)');
    });

    // 2. Écoute des événements émis par PostgreSQL / Express
    const handleUpdate = () => {
      if (isMounted) refreshData();
    };

    socket.on('patients:update', handleUpdate);
    socket.on('alerts:update', handleUpdate);
    socket.on('lits:update', handleUpdate);
    socket.on('stats:update', handleUpdate);

    // Fallback pour les mises à jour locales du navigateur courant
    window.addEventListener('dossicom:db-updated', handleUpdate);

    return () => {
      isMounted = false;
      socket.disconnect();
      window.removeEventListener('dossicom:db-updated', handleUpdate);
    };
  }, [refreshData]);

  // Écoute des changements de session (connexion/déconnexion)
  useEffect(() => {
    const onAuthUpdated = () => {
      setUser(authService.getCurrentUser());
      refreshData();
    };
    window.addEventListener('dossicom:auth-updated', onAuthUpdated);
    window.addEventListener('storage', onAuthUpdated);
    return () => {
      window.removeEventListener('dossicom:auth-updated', onAuthUpdated);
      window.removeEventListener('storage', onAuthUpdated);
    };
  }, [refreshData]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setAlertCount(0);
  }, []);

  return {
    user,
    publicStats,
    alertCount,
    refreshData,
    logout,
  };
}