const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/authMiddleware');

// @route  POST /api/auth/register (Développeur B - Sécurité & Auth)
router.post('/register', register);

// @route  POST /api/auth/login (Développeur B - Sécurité & Auth)
router.post('/login', login);

// @route  GET /api/auth/me (Vérification et persistance session F5)
router.get('/me', verifyToken, getMe);

module.exports = router;
