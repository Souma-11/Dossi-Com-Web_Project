const db = require('../config/db');

// 1. Récupérer tous les lits avec les informations du patient s'il est occupé
const getAllLits = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.id, l.code_box, l.zone, l.statut,
        d.id AS dossier_id, d.priorite, d.statut AS statut_dossier,
        p.nom AS patient_nom, p.prenom AS patient_prenom, p.numero_dossier
      FROM lits l
      LEFT JOIN dossiers_urgence d ON l.id = d.lit_id AND d.statut != 'sorti'
      LEFT JOIN patients p ON d.patient_id = p.id
      ORDER BY l.id ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des lits:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des lits.' });
  }
};

// 2. Changer le statut d'un lit (ex: 'nettoyage' -> 'libre')
const updateLitStatut = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  if (!['libre', 'occupe', 'nettoyage'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide. Valeurs autorisées : libre, occupe, nettoyage.' });
  }

  try {
    if (statut === 'libre') {
      const checkActif = await db.query(
        "SELECT id FROM dossiers_urgence WHERE lit_id = $1 AND statut != 'sorti'",
        [id]
      );
      if (checkActif.rows.length > 0) {
        return res.status(400).json({ message: 'Impossible de libérer ce lit : un patient y est encore affecté.' });
      }
    }

    const { rows } = await db.query(
      'UPDATE lits SET statut = $1 WHERE id = $2 RETURNING *',
      [statut, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lit non trouvé.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du lit:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du lit.' });
  }
};

module.exports = {
  getAllLits,
  updateLitStatut,
};