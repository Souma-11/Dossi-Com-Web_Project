const express = require('express');
const router = express.Router();
const { getStatsPublic } = require('../controllers/stats.controller');

/**
 * @route   GET /api/stats/public
 * @desc    Indicateurs agrégés publics (saturation, attente, box)
 * @access  Public — aucune donnée nominative exposée
 */
router.get('/public', getStatsPublic);

module.exports = router;
