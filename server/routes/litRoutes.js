const express = require('express');
const router = express.Router();
const { getAllLits, updateLitStatut } = require('../controllers/litController');

router.get('/', getAllLits);
router.patch('/:id/statut', updateLitStatut);

module.exports = router;