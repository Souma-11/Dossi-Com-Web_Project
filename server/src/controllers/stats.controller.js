const db = require('../config/db');

const getStatsPublic = async (req, res) => {
  try {
    const [litsRes, dossiersRes] = await Promise.all([
      db.query('SELECT statut FROM lits'),
      db.query(`
        SELECT statut, priorite, date_triage, date_admission
        FROM dossiers_urgence
        WHERE statut IN ('en_attente_triage', 'en_attente_consultation', 'en_consultation')
      `),
    ]);

    const lits = litsRes.rows;
    const actifs = dossiersRes.rows;

    const boxTotal = lits.length;
    const boxOccupes = lits.filter((l) => l.statut === 'occupe').length;
    const boxLibres = lits.filter((l) => l.statut === 'libre').length;
    const boxNettoyage = lits.filter((l) => l.statut === 'nettoyage').length;
    const boxMaintenance = lits.filter((l) => l.statut === 'maintenance').length;

    const utilisables = boxTotal - boxMaintenance;
    const saturation = utilisables > 0 ? Math.round((boxOccupes / utilisables) * 100) : 0;

    const patientsEnAttente = actifs.filter((d) =>
      ['en_attente_triage', 'en_attente_consultation'].includes(d.statut)
    ).length;
    const patientsEnConsultation = actifs.filter((d) => d.statut === 'en_consultation').length;

    const enAttente = actifs.filter((d) => d.statut === 'en_attente_consultation');
    let attenteMoyenne = 0;
    if (enAttente.length > 0) {
      const totalMin = enAttente.reduce((sum, d) => {
        const ref = d.date_triage || d.date_admission;
        return sum + (ref ? (Date.now() - new Date(ref).getTime()) / 60000 : 0);
      }, 0);
      attenteMoyenne = Math.round(totalMin / enAttente.length);
    }

    res.json({
      success: true,
      stats: {
        saturation,
        patientsEnAttente,
        patientsEnConsultation,
        boxTotal,
        boxLibres,
        boxOccupes,
        boxNettoyage,
        boxMaintenance,
        attenteMoyenne,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erreur getStatsPublic:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du calcul des indicateurs.' });
  }
};

module.exports = { getStatsPublic };