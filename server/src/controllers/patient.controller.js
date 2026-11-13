const db = require('../config/db');
const { emitEvent } = require('../socket/socket');

const RANG_PRIORITE = { P1: 1, P2: 2, P3: 3, P4: 4 };

// Requête de base reliant patient + dernier dossier + lit + soignants
const basePatientQuery = `
  SELECT 
    p.id, p.numero_dossier, p.nom, p.prenom, p.date_naissance,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_naissance))::int AS age,
    p.sexe, p.telephone, p.user_id, p.created_at,
    d.id AS d_id, d.lit_id, d.medecin_id, d.motif_admission,
    d.constantes, d.priorite, d.statut AS d_statut,
    d.diagnostic, d.prescriptions, d.date_admission, d.date_sortie,
    d.observations_triage, d.alerte_aggravation, d.triage_effectue_par,
    d.date_triage, d.compte_rendu, d.orientation_sortie, d.date_consultation,
    l.id AS l_id, l.code_box, l.zone AS l_zone, l.statut AS l_statut,
    med.nom AS med_nom, med.prenom AS med_prenom, med.role AS med_role,
    inf.nom AS inf_nom, inf.prenom AS inf_prenom, inf.role AS inf_role
  FROM patients p
  LEFT JOIN LATERAL (
    SELECT * FROM dossiers_urgence
    WHERE patient_id = p.id
    ORDER BY date_admission DESC
    LIMIT 1
  ) d ON true
  LEFT JOIN lits l ON d.lit_id = l.id
  LEFT JOIN users med ON d.medecin_id = med.id
  LEFT JOIN users inf ON d.triage_effectue_par = inf.id
`;

const parsePrescriptions = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return raw.split('\n').filter(Boolean);
  }
};

const formatPatient = (row) => ({
  _id: String(row.id),
  id: row.id,
  numeroDossier: row.numero_dossier,
  nom: row.nom,
  prenom: row.prenom,
  age: row.age ?? 0,
  sexe: row.sexe,
  telephone: row.telephone || '',
  statut: row.d_statut || 'en_attente_triage',
  dateArrivee: row.date_admission || row.created_at,
  dateSortie: row.date_sortie || null,
  userAccount: row.user_id ? String(row.user_id) : null,
  dossierActif: row.d_id
    ? {
        _id: String(row.d_id),
        id: row.d_id,
        motifAdmission: row.motif_admission,
        constantesVitales: row.constantes || {},
        priorite: row.priorite || null,
        observationsTriage: row.observations_triage || '',
        alerteAggravation: row.alerte_aggravation || { active: false },
        dateTriage: row.date_triage || null,
        diagnostic: row.diagnostic || '',
        prescriptions: parsePrescriptions(row.prescriptions),
        compteRendu: row.compte_rendu || '',
        orientationSortie: row.orientation_sortie || 'en_cours',
        dateConsultation: row.date_consultation || null,
        dateCloture: row.date_sortie || null,
        medecinResponsable: row.medecin_id
          ? {
              _id: String(row.medecin_id),
              id: row.medecin_id,
              name: `${row.med_prenom || ''} ${row.med_nom || ''}`.trim(),
              role: row.med_role || 'medecin',
            }
          : null,
        triageEffectuePar: row.triage_effectue_par
          ? {
              _id: String(row.triage_effectue_par),
              id: row.triage_effectue_par,
              name: `${row.inf_prenom || ''} ${row.inf_nom || ''}`.trim(),
              role: row.inf_role || 'infirmier',
            }
          : null,
      }
    : null,
  litActuel: row.l_id
    ? {
        _id: String(row.l_id),
        id: row.l_id,
        numeroBox: row.code_box,
        service: row.l_zone,
        statut: row.l_statut,
      }
    : null,
});

const calculerPosition = async (patientId) => {
  const { rows } = await db.query(`
    SELECT patient_id, priorite, date_triage
    FROM dossiers_urgence
    WHERE statut IN ('en_attente_consultation', 'en_consultation')
  `);

  const tri = rows
    .map((r) => ({
      id: String(r.patient_id),
      rang: RANG_PRIORITE[r.priorite] || 9,
      dateTriage: r.date_triage ? new Date(r.date_triage).getTime() : 0,
    }))
    .sort((a, b) => a.rang - b.rang || a.dateTriage - b.dateTriage);

  const index = tri.findIndex((p) => p.id === String(patientId));
  return { filePosition: index === -1 ? null : index + 1, fileTotal: tri.length };
};

const createPatient = async (req, res) => {
  try {
    const { nom, prenom, age, sexe, telephone, motifAdmission } = req.body;

    if (!nom || !prenom || (!age && age !== 0) || !sexe || !motifAdmission) {
      return res.status(400).json({
        success: false,
        message: "Nom, prénom, âge, sexe et motif d'admission sont obligatoires.",
      });
    }

    const numeroDossier = `DOS-${Date.now().toString().slice(-6)}`;

    // 1. Insertion dans patients (conversion de l'âge en date_naissance approximative)
    const patRes = await db.query(
      `INSERT INTO patients (numero_dossier, nom, prenom, date_naissance, sexe, telephone)
       VALUES ($1, $2, $3, (CURRENT_DATE - ($4::int * INTERVAL '1 year'))::date, $5, $6)
       RETURNING id`,
      [numeroDossier, nom.trim(), prenom.trim(), Number(age), sexe, telephone ? telephone.trim() : '']
    );
    const patientId = patRes.rows[0].id;

    // 2. Création immédiate du dossier d'urgence associé
    await db.query(
      `INSERT INTO dossiers_urgence (patient_id, motif_admission, statut)
       VALUES ($1, $2, 'en_attente_triage')`,
      [patientId, motifAdmission.trim()]
    );

    const fullRes = await db.query(`${basePatientQuery} WHERE p.id = $1`, [patientId]);
    const populatedPatient = formatPatient(fullRes.rows[0]);

    emitEvent('patients:update', { action: 'admission', patientId });
    emitEvent('stats:update', {});

    res.status(201).json({
      success: true,
      message: 'Patient enregistré avec succès aux urgences.',
      patient: populatedPatient,
    });
  } catch (error) {
    console.error('Erreur createPatient:', error);
    res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement du patient." });
  }
};

const getPatients = async (req, res) => {
  try {
    let whereClause = '';
    let params = [];

    if (req.user.role === 'patient') {
      whereClause = 'WHERE p.user_id = $1 OR LOWER(p.telephone) = LOWER($2)';
      params = [req.user.id, req.user.email];
    } else if (req.query.statut) {
      whereClause = "WHERE COALESCE(d.statut, 'en_attente_triage') = $1";
      params = [req.query.statut];
    }

    const { rows } = await db.query(
      `${basePatientQuery} ${whereClause} ORDER BY COALESCE(d.date_admission, p.created_at) DESC`,
      params
    );
    const patients = rows.map(formatPatient);

    let filePosition = null;
    let fileTotal = null;
    if (req.user.role === 'patient' && patients.length > 0) {
      const actif = patients.find((p) => p.statut !== 'sorti') || patients[0];
      const position = await calculerPosition(actif.id);
      filePosition = position.filePosition;
      fileTotal = position.fileTotal;
    }

    res.json({
      success: true,
      count: patients.length,
      filePosition,
      fileTotal,
      patients,
    });
  } catch (error) {
    console.error('Erreur getPatients:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des patients.' });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { rows } = await db.query(`${basePatientQuery} WHERE p.id = $1`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé.' });
    }

    const patient = formatPatient(rows[0]);

    if (req.user.role === 'patient' && String(patient.userAccount) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé à ce dossier médical.' });
    }

    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const triagePatient = async (req, res) => {
  try {
    const { constantesVitales, priorite, observationsTriage } = req.body;
    const patientId = req.params.id;

    if (!priorite || !['P1', 'P2', 'P3', 'P4'].includes(priorite)) {
      return res.status(400).json({
        success: false,
        message: 'Une priorité valide (P1, P2, P3 ou P4) est requise.',
      });
    }

    const { rows } = await db.query(`${basePatientQuery} WHERE p.id = $1`, [patientId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient introuvable.' });
    }
    const row = rows[0];

    const mergedConstantes = {
      ...(row.constantes || {}),
      ...(constantesVitales || {}),
    };
    const obs = observationsTriage !== undefined ? observationsTriage : row.observations_triage || '';

    if (!row.d_id) {
      await db.query(
        `INSERT INTO dossiers_urgence 
          (patient_id, motif_admission, constantes, priorite, observations_triage, triage_effectue_par, date_triage, statut)
         VALUES ($1, 'Non renseigné', $2::jsonb, $3, $4, $5, NOW(), 'en_attente_consultation')`,
        [patientId, JSON.stringify(mergedConstantes), priorite, obs, req.user.id]
      );
    } else {
      await db.query(
        `UPDATE dossiers_urgence
         SET constantes = $1::jsonb,
             priorite = $2,
             observations_triage = $3,
             triage_effectue_par = $4,
             date_triage = NOW(),
             statut = 'en_attente_consultation'
         WHERE id = $5`,
        [JSON.stringify(mergedConstantes), priorite, obs, req.user.id, row.d_id]
      );
    }

    const updatedRes = await db.query(`${basePatientQuery} WHERE p.id = $1`, [patientId]);
    const updatedPatient = formatPatient(updatedRes.rows[0]);

    emitEvent('patients:update', { action: 'triage', patientId, priorite });
    emitEvent('stats:update', {});

    res.json({
      success: true,
      message: `Tri validé avec priorité ${priorite}. Patient orienté vers la file d'attente médicale.`,
      patient: updatedPatient,
    });
  } catch (error) {
    console.error('Erreur triagePatient:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du triage du patient.' });
  }
};

const consultationPatient = async (req, res) => {
  try {
    const { diagnostic, prescriptions, compteRendu, orientationSortie, terminerConsultation } = req.body;
    const patientId = req.params.id;

    const { rows } = await db.query(`${basePatientQuery} WHERE p.id = $1`, [patientId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient introuvable.' });
    }
    const row = rows[0];
    if (!row.d_id) {
      return res.status(400).json({ success: false, message: 'Aucun dossier actif pour ce patient.' });
    }

    const diagVal = diagnostic !== undefined ? diagnostic : row.diagnostic || '';
    const prescVal =
      prescriptions !== undefined
        ? JSON.stringify(Array.isArray(prescriptions) ? prescriptions : [prescriptions])
        : row.prescriptions;
    const crVal = compteRendu !== undefined ? compteRendu : row.compte_rendu || '';
    const orientVal = orientationSortie || row.orientation_sortie || 'en_cours';

    const isSorti =
      Boolean(terminerConsultation) ||
      orientationSortie === 'retour_domicile' ||
      orientationSortie === 'hospitalisation';
    const newStatut = isSorti ? 'sorti' : 'en_consultation';

    await db.query(
      `UPDATE dossiers_urgence
       SET diagnostic = $1,
           prescriptions = $2,
           compte_rendu = $3,
           orientation_sortie = $4,
           medecin_id = $5,
           date_consultation = COALESCE(date_consultation, NOW()),
           statut = $6,
           date_sortie = CASE WHEN $6 = 'sorti' THEN NOW() ELSE date_sortie END,
           lit_id = CASE WHEN $6 = 'sorti' THEN NULL ELSE lit_id END
       WHERE id = $7`,
      [diagVal, prescVal, crVal, orientVal, req.user.id, newStatut, row.d_id]
    );

    if (isSorti && row.lit_id) {
      await db.query(
        "UPDATE lits SET statut = 'nettoyage', patient_affecte = NULL, derniere_modification_par = $1 WHERE id = $2",
        [req.user.id, row.lit_id]
      );
      emitEvent('lits:update', { action: 'liberation', patientId });
    }

    const updatedRes = await db.query(`${basePatientQuery} WHERE p.id = $1`, [patientId]);
    const updatedPatient = formatPatient(updatedRes.rows[0]);

    emitEvent('patients:update', {
      action: isSorti ? 'cloture' : 'consultation',
      patientId,
    });
    emitEvent('stats:update', {});

    res.json({
      success: true,
      message: 'Consultation médicale enregistrée avec succès.',
      patient: updatedPatient,
    });
  } catch (error) {
    console.error('Erreur consultationPatient:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la consultation médicale.' });
  }
};

const signalerAggravation = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { rows } = await db.query(`${basePatientQuery} WHERE p.id = $1`, [patientId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient introuvable.' });
    }
    const row = rows[0];

    if (req.user.role === 'patient' && String(row.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé à ce dossier médical.' });
    }
    if (!row.d_id || row.d_statut === 'sorti') {
      return res.status(400).json({ success: false, message: 'Ce dossier est clôturé ou introuvable.' });
    }
    if (row.alerte_aggravation?.active) {
      return res.status(409).json({
        success: false,
        message: "Une alerte d'aggravation est déjà en cours pour ce patient.",
      });
    }

    const alerte = {
      active: true,
      dateSignalement: new Date().toISOString(),
      dateTraitement: null,
      traiteePar: null,
    };

    await db.query('UPDATE dossiers_urgence SET alerte_aggravation = $1::jsonb WHERE id = $2', [
      JSON.stringify(alerte),
      row.d_id,
    ]);

    emitEvent('alerts:update', { action: 'signalement', patientId });
    emitEvent('patients:update', { action: 'aggravation', patientId });

    res.json({
      success: true,
      message:
        "Alerte transmise à l'équipe soignante. Un professionnel va vous prendre en charge. En cas d'urgence vitale, appelez immédiatement un soignant.",
    });
  } catch (error) {
    console.error('Erreur signalerAggravation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du signalement.' });
  }
};

const traiterAggravation = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { rows } = await db.query(`${basePatientQuery} WHERE p.id = $1`, [patientId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient introuvable.' });
    }
    const row = rows[0];

    if (!row.d_id || !row.alerte_aggravation?.active) {
      return res.status(400).json({ success: false, message: 'Aucune alerte active pour ce patient.' });
    }

    const alerte = {
      ...row.alerte_aggravation,
      active: false,
      dateTraitement: new Date().toISOString(),
      traiteePar: req.user.id,
    };

    await db.query('UPDATE dossiers_urgence SET alerte_aggravation = $1::jsonb WHERE id = $2', [
      JSON.stringify(alerte),
      row.d_id,
    ]);

    emitEvent('alerts:update', { action: 'traitement', patientId });
    emitEvent('patients:update', { action: 'aggravation_traitee', patientId });

    res.json({
      success: true,
      message: `Alerte d'aggravation de ${row.prenom} ${row.nom} traitée.`,
    });
  } catch (error) {
    console.error('Erreur traiterAggravation:', error);
    res.status(500).json({ success: false, message: "Erreur lors du traitement de l'alerte." });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  triagePatient,
  consultationPatient,
  signalerAggravation,
  traiterAggravation,
};