const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

// Import des routes métier
const litRoutes = require('./routes/litRoutes');
const patientRoutes = require('./routes/patientRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route de test (vérification de l'état de l'API)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: "API Dossi'Com opérationnelle" });
});

// Branchement des routes métier
app.use('/api/lits', litRoutes);
app.use('/api/patients', patientRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});