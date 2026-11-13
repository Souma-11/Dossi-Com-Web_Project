require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Import des routes (Phase 2 Métier + Phase 3 Authentification + Phase 4 Temps réel)
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const litRoutes = require('./routes/lit.routes');
const statsRoutes = require('./routes/stats.routes');

const { initSocket } = require('./socket/socket');

// Connexion à la base de données (avec messages d'aide si MongoDB est éteint)
connectDB();

const app = express();

// ─── Middlewares de sécurité (Phase 3) ──────────────────────────────────────
app.use(helmet()); // Protection par headers HTTP sécurisés

// CORS multi-origines : accepte CLIENT_URL + les ports de dev Vite usuels
// (5173 par défaut, 5174 si le port était déjà occupé, 3000 pour CRA)
const corsOrigins = () => {
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

app.use(
  cors({
    origin: corsOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Parsers du corps de requête ────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Montage des Routes API ─────────────────────────────────────────────────
// Phase 3 : Authentification & Comptes
app.use('/api/auth', authRoutes);

// Phase 2 : Logique Métier Urgences (sécurisée par les middlewares RBAC Phase 3)
app.use('/api/patients', patientRoutes);
app.use('/api/lits', litRoutes);

// Phase 4 : Indicateurs publics (tableau de bord public, sans authentification)
app.use('/api/stats', statsRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: "API Dossi'Com opérationnelle — Fusion Phase 2 (Métier) & Phase 3 (RBAC) + Phase 4 (Temps réel)",
    timestamp: new Date().toISOString(),
  });
});

// Gestionnaire d'erreurs 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} non trouvée.` });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur.',
  });
});

// ─── Serveur HTTP + Socket.io (même port, Phase 4 temps réel) ───────────────
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur Dossi'Com démarré sur http://localhost:${PORT}`);
  console.log(`⚡ Socket.io prêt (temps réel) sur ws://localhost:${PORT}`);
  console.log(`🌐 CORS autorisé pour : ${corsOrigins().join(', ')}`);
});

module.exports = app;
