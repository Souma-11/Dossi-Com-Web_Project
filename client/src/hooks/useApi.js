import { useCallback, useEffect, useRef, useState } from 'react';
import api, { translateError } from '../services/api';
import { useSocketEvent } from '../context/SocketContext';

/**
 * useApi — Hook de chargement des données API avec synchronisation temps réel.
 *
 * - Charge les données au montage (et à chaque changement de path)
 * - Se réabonne aux événements Socket.io : dès qu'un poste modifie les
 *   données, TOUS les autres postes rechargent automatiquement (temps réel)
 * - Rafraîchissement de secours toutes les 15 s (recommandé par la charte
 *   technique du projet en cas de coupure WebSocket)
 *
 * @param {string} path            Route API relative (ex: '/patients')
 * @param {object} options
 * @param {number} options.pollMs  Intervalle de polling de secours (0 = désactivé)
 * @returns {data, loading, error, refresh}
 */
export default function useApi(path, { pollMs = 15000 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prevPath, setPrevPath] = useState(path);
  const mountedRef = useRef(true);

  // Réinitialise l'état de chargement proprement si la route (path) change
  if (prevPath !== path) {
    setPrevPath(path);
    setLoading(true);
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Chargement initial / rechargement asynchrone si la route change
  useEffect(() => {
    let cancelled = false;

    api
      .get(path)
      .then((response) => {
        if (!cancelled) {
          setData(response.data);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(translateError(err, 'Erreur lors du chargement des données.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  // Rafraîchissement manuel, temps réel ou polling
  const refresh = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const response = await api.get(path);
        if (mountedRef.current) {
          setData(response.data);
          setError('');
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(translateError(err, 'Erreur lors du chargement des données.'));
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [path]
  );

  // ─── Temps réel : les 4 événements Socket.io du serveur ──────────────────
  useSocketEvent('patients:update', () => refresh(true));
  useSocketEvent('lits:update', () => refresh(true));
  useSocketEvent('stats:update', () => refresh(true));
  useSocketEvent('alerts:update', () => refresh(true));

  // ─── Polling de secours toutes les 15 s (charte technique) ───────────────
  useEffect(() => {
    if (!pollMs || pollMs <= 0) return undefined;
    const interval = setInterval(() => refresh(true), pollMs);
    return () => clearInterval(interval);
  }, [pollMs, refresh]);

  return { data, loading, error, refresh };
}