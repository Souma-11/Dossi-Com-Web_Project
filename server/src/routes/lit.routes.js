const express = require('express');
const router = express.Router();
const { getLits, updateLit } = require('../controllers/lit.controller');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// ─── Phase 2 (Logique Métier) + Phase 3 (Jonction Sécurité RBAC) ───────────

/**
 * @route   GET /api/lits
 * @desc    Obtenir l'état de tous les box d'urgence
 * @access  Rôles : accueil, infirmier, medecin, responsable
 */
router.get('/', verifyToken, checkRole(['accueil', 'infirmier', 'medecin', 'responsable']), getLits);

/**
 * @route   PATCH /api/lits/:id
 * @desc    Modifier l'état d'un box (libre / occupé / nettoyage) et affecter un patient
 * @access  Rôle : responsable uniquement
 */
router.patch('/:id', verifyToken, checkRole(['responsable']), updateLit);

module.exports = router;
