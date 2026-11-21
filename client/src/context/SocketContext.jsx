import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * SocketContext — Connexion temps réel Socket.io (Phase 4).
 *
 * Synchronisation instantanée entre les postes : un patient ajouté à
 * l'Accueil apparaît immédiatement sur l'écran de l'Infirmier, sans
 * recharger la page.
 *
 * Événements émis par le serveur :
 *  - 'patients:update'  : liste des patients / dossiers modifiée
 *  - 'lits:update'      : état des box modifié
 *  - 'stats:update'     : indicateurs publics modifiés
 *  - 'alerts:update'    : alerte d'aggravation signalée / traitée
 */

const SocketContext = createContext(null);

// URL du serveur backend (même que l'API), configurable via .env
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Singleton : une seule connexion Socket.io pour toute l'application
let socketSingleton = null;
const getSocket = () => {
  if (!socketSingleton) {
    socketSingleton = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 3000,
      timeout: 10000,
    });
  }
  return socketSingleton;
};

export function SocketProvider({ children }) {
  const [socket] = useState(() => getSocket());

  // Indicateur de connexion exposé aux composants (bandeau "hors ligne")
  useEffect(() => {
    const handleConnect = () => {
      window.__DOSSICOM_SOCKET_CONNECTED = true;
    };
    const handleDisconnect = () => {
      window.__DOSSICOM_SOCKET_CONNECTED = false;
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  /**
   * S'abonner à un événement temps réel.
   * Retourne la fonction de désabonnement (compatible useEffect).
   */
  const subscribe = useCallback(
    (event, handler) => {
      if (!socket) return () => {};
      socket.on(event, handler);
      return () => socket.off(event, handler);
    },
    [socket]
  );

  return (
    <SocketContext.Provider value={{ socket, subscribe, url: SOCKET_URL }}>
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket doit être utilisé à l'intérieur d'un SocketProvider");
  }
  return context;
}

/**
 * Hook : exécute handler à chaque émission de l'événement temps réel.
 * Le handler est mémorisé pour éviter les désabonnements en cascade.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSocketEvent(event, handler) {
  const { subscribe } = useSocket();
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const unsubscribe = subscribe(event, (...args) => savedHandler.current(...args));
    return unsubscribe;
  }, [event, subscribe]);
}