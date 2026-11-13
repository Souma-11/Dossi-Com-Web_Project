const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et mot de passe sont requis.',
      });
    }

    const validRoles = ['accueil', 'infirmier', 'medecin', 'responsable', 'patient'];
    const userRole = role && validRoles.includes(role) ? role : 'patient';

    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cet email existe déjà.',
      });
    }

    // Découpage du nom complet en prenom + nom pour la table PostgreSQL
    const parts = name.trim().split(/\s+/);
    const prenom = parts[0];
    const nom = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const { rows } = await db.query(
      `INSERT INTO users (nom, prenom, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nom, prenom, email, role`,
      [nom, prenom, email.toLowerCase().trim(), passwordHash, userRole]
    );

    const newUser = rows[0];
    const fullName = `${newUser.prenom} ${newUser.nom}`.trim();

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      token,
      user: {
        id: newUser.id,
        _id: String(newUser.id),
        name: fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte.',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis.',
      });
    }

    const { rows } = await db.query(
      'SELECT id, nom, prenom, email, password_hash, role FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const fullName = `${user.prenom} ${user.nom}`.trim();
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        _id: String(user.id),
        name: fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur.',
    });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        _id: String(req.user.id),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { register, login, getMe };