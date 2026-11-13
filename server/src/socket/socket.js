const { Server } = require('socket.io');

/**
 * Socket.io — Temps réel (Phase 4)
 * Permet la synchronisation instantanée entre les postes :
 * un patient ajouté à l'Accueil apparaît immédiatement chez l'Infirmier,
 * sans recharger la page.
 *
 * Événements émis par le serveur :
 *  - 'patients:update' : la liste des patients / dossiers a changé
 *  - 'lits:update'     : l'état des box a changé
 *  - 'stats:update'    : les indicateurs publics ont changé
 *  - 'alerts:update'   : une alerte d'aggravation a été signalée / traitée
 */

let io = null;

/** Origines autorisées pour le handshake WebSocket (dev + CLIENT_URL) */
const allowedOrigins = () => {
  const origins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
  ]);
  if (process.env.CLIENT_URL) origins.add(process.env.CLIENT_URL);
  return [...origins];
};

/**
 * Initialisation de Socket.io sur le serveur HTTP (pas sur l'app Express
 * directement, pour partager le même port 5000).
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Poste connecté (temps réel) : ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Poste déconnecté : ${socket.id}`);
    });
  });

  return io;
};

/** Retourne l'instance Socket.io (ou null si non initialisée) */
const getIO = () => io;

/**
 * Émet un événement temps réel à tous les postes connectés.
 * Sans danger : n'émet rien si Socket.io n'est pas encore initialisé.
 */
const emitEvent = (event, payload = {}) => {
  if (!io) return;
  io.emit(event, { ...payload, at: new Date().toISOString() });
};

module.exports = { initSocket, getIO, emitEvent };
