const db = require('../config/db');
const { emitEvent } = require('../socket/socket');

const fetchLitsQuery = `
  SELECT 
    l.id, l.code_box, l.zone, l.statut, l.patient_affecte,
    p.id AS p_id, p.numero_dossier, p.nom AS p_nom, p.prenom AS p_prenom,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_naissance))::int AS p_age,
    p.sexe AS p_sexe,
    d.id AS d_id, d.statut AS d_statut, d.priorite, d.motif_admission, d.constantes
  FROM lits l
  LEFT JOIN patients p ON l.patient_affecte = p.id
  LEFT JOIN LATERAL (
    SELECT * FROM dossiers_urgence 
    WHERE patient_id = p.id AND statut != 'sorti'
    ORDER BY date_admission DESC LIMIT 1
  ) d ON true
`;

const formatLit = (row) => ({
  _id: String(row.id),
  id: row.id,
  numeroBox: row.code_box,
  service: row.zone,
  statut: row.statut,
  patientAffecte: row.p_id
    ? {
        _id: String(row.p_id),
        id: row.p_id,
        nom: row.p_nom,
        prenom: row.p_prenom,
        age: row.p_age,
        sexe: row.p_sexe,
        statut: row.d_statut || 'en_attente_triage',
        numeroDossier: row.numero_dossier,
        dossierActif: row.d_id
          ? {
              _id: String(row.d_id),
              id: row.d_id,
              priorite: row.priorite,
              motifAdmission: row.motif_admission,
              constantesVitales: row.constantes || {},
            }
          : null,
      }
    : null,
});

const getLits = async (req, res) => {
  try {
    const { rows } = await db.query(`${fetchLitsQuery} ORDER BY l.code_box ASC`);
    const lits = rows.map(formatLit);

    res.json({
      success: true,
      count: lits.length,
      lits,
    });
  } catch (error) {
    console.error('Erreur getLits:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des box.' });
  }
};

const updateLit = async (req, res) => {
  try {
    const { statut, patientId } = req.body;
    const litId = req.params.id;

    const currentRes = await db.query('SELECT * FROM lits WHERE id = $1', [litId]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Box introuvable.' });
    }
    const lit = currentRes.rows[0];
    let newStatut =
      statut && ['libre', 'occupe', 'nettoyage', 'maintenance'].includes(statut)
        ? statut
        : lit.statut;
    let newPatientId = lit.patient_affecte;

    if (patientId !== undefined) {
      if (patientId) {
        const patRes = await db.query('SELECT id FROM patients WHERE id = $1', [patientId]);
        if (patRes.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Patient introuvable.' });
        }

        // Libérer l'ancien lit éventuel de ce patient
        await db.query(
          "UPDATE lits SET patient_affecte = NULL, statut = 'libre' WHERE patient_affecte = $1 AND id != $2",
          [patientId, litId]
        );
        await db.query(
          "UPDATE dossiers_urgence SET lit_id = $1 WHERE patient_id = $2 AND statut != 'sorti'",
          [litId, patientId]
        );

        newPatientId = patientId;
        newStatut = 'occupe';
      } else {
        // Libération du box
        if (lit.patient_affecte) {
          await db.query(
            "UPDATE dossiers_urgence SET lit_id = NULL WHERE patient_id = $1 AND statut != 'sorti'",
            [lit.patient_affecte]
          );
        }
        newPatientId = null;
        if (!statut) newStatut = 'libre';
      }
    } else if (newStatut !== 'occupe' && lit.patient_affecte) {
      await db.query(
        "UPDATE dossiers_urgence SET lit_id = NULL WHERE patient_id = $1 AND statut != 'sorti'",
        [lit.patient_affecte]
      );
      newPatientId = null;
    }

    await db.query(
      'UPDATE lits SET statut = $1, patient_affecte = $2, derniere_modification_par = $3 WHERE id = $4',
      [newStatut, newPatientId, req.user.id, litId]
    );

    const updatedRes = await db.query(`${fetchLitsQuery} WHERE l.id = $1`, [litId]);
    const updatedLit = formatLit(updatedRes.rows[0]);

    emitEvent('lits:update', { action: 'modification', litId, statut: newStatut });
    emitEvent('stats:update', {});

    res.json({
      success: true,
      message: 'Statut du box mis à jour avec succès.',
      lit: updatedLit,
    });
  } catch (error) {
    console.error('Erreur updateLit:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du box.' });
  }
};

module.exports = {
  getLits,
  updateLit,
};