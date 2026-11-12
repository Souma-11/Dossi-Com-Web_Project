const express = require('express');
const router = express.Router();
const {
  getPatientsActifs,
  admettrePatient,
  triagePatient,
  cloturerConsultation,
  getDossierById,
  getUrgencesStats,
} = require('../controllers/patientController');

// GET /api/patients/stats -> Statistiques globales
router.get('/stats', getUrgencesStats);

// GET /api/patients -> File active des urgences
router.get('/', getPatientsActifs);

// POST /api/patients -> Admission à l'accueil
router.post('/', admettrePatient);

// GET /api/patients/:dossierId -> Détail d'un dossier spécifique (Uniquement des chiffres autorisés)
router.get('/:dossierId(\\d+)', getDossierById);

// PATCH /api/patients/:dossierId/triage -> Triage IAO + affectation box (Uniquement des chiffres autorisés)
router.patch('/:dossierId(\\d+)/triage', triagePatient);

// PATCH /api/patients/:dossierId/sortie -> Consultation médecin + sortie (Uniquement des chiffres autorisés)
router.patch('/:dossierId(\\d+)/sortie', cloturerConsultation);

module.exports = router;