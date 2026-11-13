const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  triagePatient,
  consultationPatient,
  signalerAggravation,
  traiterAggravation,
} = require('../controllers/patient.controller');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// ─── Phase 2 (Logique Métier) + Phase 3 (Jonction Sécurité RBAC) ───────────

/**
 * @route   POST /api/patients
 * @desc    Enregistrement d'un nouveau patient depuis l'Accueil
 * @access  Rôles : accueil, responsable
 */
router.post('/', verifyToken, checkRole(['accueil', 'responsable']), createPatient);

/**
 * @route   GET /api/patients
 * @desc    Consultation de la file d'attente / patients
 * @access  Authentifié (filtrage automatique selon le rôle de l'utilisateur)
 */
router.get(
  '/',
  verifyToken,
  checkRole(['accueil', 'infirmier', 'medecin', 'responsable', 'patient']),
  getPatients
);

/**
 * @route   GET /api/patients/:id
 * @desc    Dossier complet d'un patient
 * @access  Authentifié
 */
router.get('/:id', verifyToken, getPatientById);

/**
 * @route   PATCH /api/patients/:id/triage
 * @desc    Tri & constantes vitales (P1 à P4) par l'infirmier IAO
 * @access  Rôles : infirmier, responsable
 * @note    Ligne de jonction exacte spécifiée dans la documentation du projet
 */
router.patch('/:id/triage', verifyToken, checkRole(['infirmier', 'responsable']), triagePatient);

/**
 * @route   PATCH /api/patients/:id/consultation
 * @desc    Validation médicale, diagnostic, prescriptions et clôture
 * @access  Rôles : medecin, responsable
 */
router.patch(
  '/:id/consultation',
  verifyToken,
  checkRole(['medecin', 'responsable']),
  consultationPatient
);

// ─── Phase 4 : Alerte "Mon état s'aggrave" ──────────────────────────────────

/**
 * @route   POST /api/patients/:id/aggravation
 * @desc    Le patient signale une aggravation de son état (alerte infirmier)
 * @access  Rôles : patient (son propre dossier uniquement)
 */
router.post('/:id/aggravation', verifyToken, checkRole(['patient']), signalerAggravation);

/**
 * @route   PATCH /api/patients/:id/aggravation
 * @desc    Acquittement d'une alerte d'aggravation par l'équipe soignante
 * @access  Rôles : infirmier, responsable
 */
router.patch(
  '/:id/aggravation',
  verifyToken,
  checkRole(['infirmier', 'responsable']),
  traiterAggravation
);

module.exports = router;
