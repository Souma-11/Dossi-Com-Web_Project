const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route de test pour vérifier que le serveur tourne
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: "API Dossi'Com opérationnelle" });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});