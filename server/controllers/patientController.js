const db = require('../config/db');

// 1. LISTE DES PATIENTS ACTIFS AUX URGENCES (Triés par urgence P1 -> P4 puis heure d'arrivée)
const getPatientsActifs = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id AS dossier_id, d.motif_admission, d.constantes, d.priorite, 
        d.statut, d.diagnostic, d.prescriptions, d.date_admission,
        p.id AS patient_id, p.numero_dossier, p.nom, p.prenom, p.date_naissance, p.sexe, p.telephone,
        l.id AS lit_id, l.code_box, l.zone
      FROM dossiers_urgence d
      JOIN patients p ON d.patient_id = p.id
      LEFT JOIN lits l ON d.lit_id = l.id
      WHERE d.statut != 'sorti'
      ORDER BY 
        CASE d.priorite 
          WHEN 'P1' THEN 1 
          WHEN 'P2' THEN 2 
          WHEN 'P3' THEN 3 
          WHEN 'P4' THEN 4 
          ELSE 5 
        END ASC,
        d.date_admission ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération patients actifs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des patients.' });
  }
};

// 2. ACCUEIL : Admettre un patient et ouvrir son dossier d'urgence (Transaction SQL)
const admettrePatient = async (req, res) => {
  const { nom, prenom, date_naissance, sexe, telephone, motif_admission } = req.body;

  if (!nom || !prenom || !date_naissance || !motif_admission) {
    return res.status(400).json({ message: 'Nom, prénom, date de naissance et motif sont obligatoires.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Génération d'un numéro de dossier unique (ex: DOS-2026-8492)
    const numeroDossier = `DOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insertion dans la table patients
    const patientRes = await client.query(
      `INSERT INTO patients (numero_dossier, nom, prenom, date_naissance, sexe, telephone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [numeroDossier, nom.toUpperCase(), prenom, date_naissance, sexe || null, telephone || null]
    );
    const patient = patientRes.rows[0];

    // Ouverture du passage dans dossiers_urgence
    const dossierRes = await client.query(
      `INSERT INTO dossiers_urgence (patient_id, motif_admission, statut)
       VALUES ($1, $2, 'en_attente_triage') RETURNING *`,
      [patient.id, motif_admission]
    );

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Patient admis avec succès',
      patient,
      dossier: dossierRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur admission patient:', error);
    res.status(500).json({ message: "Erreur lors de l'admission du patient." });
  } finally {
    client.release();
  }
};

// 3. INFIRMIER (IAO) : Saisir les constantes, la priorité (P1-P4) et éventuellement affecter un lit
const triagePatient = async (req, res) => {
  const { dossierId } = req.params;
  const { priorite, constantes, lit_id } = req.body;

  if (!['P1', 'P2', 'P3', 'P4'].includes(priorite)) {
    return res.status(400).json({ message: 'Priorité invalide (P1, P2, P3 ou P4 requis).' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Si un lit est choisi, vérifier qu'il est libre et le passer en 'occupe'
    if (lit_id) {
      const litCheck = await client.query('SELECT statut FROM lits WHERE id = $1 FOR UPDATE', [lit_id]);
      if (litCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Box/Lit introuvable.' });
      }
      if (litCheck.rows[0].statut !== 'libre') {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'Ce box est déjà occupé ou en nettoyage.' });
      }

      await client.query("UPDATE lits SET statut = 'occupe' WHERE id = $1", [lit_id]);
    }

    const updateDossier = await client.query(
      `UPDATE dossiers_urgence 
       SET priorite = $1, 
           constantes = $2, 
           lit_id = COALESCE($3, lit_id),
           statut = 'en_attente_consultation'
       WHERE id = $4 AND statut != 'sorti'
       RETURNING *`,
      [priorite, constantes || {}, lit_id || null, dossierId]
    );

    if (updateDossier.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Dossier actif introuvable.' });
    }

    await client.query('COMMIT');
    res.json({
      message: 'Triage enregistré avec succès',
      dossier: updateDossier.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Conflit : ce box vient déjà d’être attribué.' });
    }
    console.error('Erreur triage patient:', error);
    res.status(500).json({ message: 'Erreur lors du triage.' });
  } finally {
    client.release();
  }
};

// 4. MÉDECIN : Clôturer la consultation, enregistrer le diagnostic et libérer le box (en nettoyage)
const cloturerConsultation = async (req, res) => {
  const { dossierId } = req.params;
  const { diagnostic, prescriptions, medecin_id } = req.body;

  if (!diagnostic) {
    return res.status(400).json({ message: 'Le diagnostic médical est obligatoire pour clôturer le dossier.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Récupérer le dossier pour savoir s'il occupait un lit
    const dossierRes = await client.query(
      "SELECT lit_id FROM dossiers_urgence WHERE id = $1 AND statut != 'sorti' FOR UPDATE",
      [dossierId]
    );

    if (dossierRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Dossier actif introuvable ou déjà clôturé.' });
    }

    const litId = dossierRes.rows[0].lit_id;

    // Passer le dossier en 'sorti'
    const updatedDossier = await client.query(
      `UPDATE dossiers_urgence 
       SET diagnostic = $1, 
           prescriptions = $2, 
           medecin_id = COALESCE($3, medecin_id),
           statut = 'sorti', 
           date_sortie = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [diagnostic, prescriptions || '', medecin_id || null, dossierId]
    );

    // Si le patient occupait un box, passer le box en 'nettoyage' automatiquement
    if (litId) {
      await client.query("UPDATE lits SET statut = 'nettoyage' WHERE id = $1", [litId]);
    }

    await client.query('COMMIT');
    res.json({
      message: 'Consultation clôturée et sortie validée',
      dossier: updatedDossier.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur clôture consultation:', error);
    res.status(500).json({ message: 'Erreur lors de la clôture de la consultation.' });
  } finally {
    client.release();
  }
};

// 5. DÉTAIL D'UN DOSSIER (Pour la fiche Médecin ou le suivi Patient)
const getDossierById = async (req, res) => {
  const { dossierId } = req.params;
  try {
    const query = `
      SELECT 
        d.*, 
        p.numero_dossier, p.nom, p.prenom, p.date_naissance, p.sexe, p.telephone,
        l.code_box, l.zone
      FROM dossiers_urgence d
      JOIN patients p ON d.patient_id = p.id
      LEFT JOIN lits l ON d.lit_id = l.id
      WHERE d.id = $1;
    `;
    const { rows } = await db.query(query, [dossierId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur récupération détail dossier:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 6. STATISTIQUES GLOBALES (Pour le tableau de bord Responsable)
const getUrgencesStats = async (req, res) => {
  try {
    const patientsStats = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE statut = 'en_attente_triage') AS en_attente_triage,
        COUNT(*) FILTER (WHERE statut = 'en_attente_consultation') AS en_attente_consultation,
        COUNT(*) FILTER (WHERE statut = 'en_consultation') AS en_consultation,
        COUNT(*) FILTER (WHERE statut = 'sorti' AND DATE(date_sortie) = CURRENT_DATE) AS sortis_aujourd_hui
      FROM dossiers_urgence;
    `);

    const litsStats = await db.query(`
      SELECT 
        COUNT(*) AS total_lits,
        COUNT(*) FILTER (WHERE statut = 'libre') AS lits_libres,
        COUNT(*) FILTER (WHERE statut = 'occupe') AS lits_occupes,
        COUNT(*) FILTER (WHERE statut = 'nettoyage') AS lits_nettoyage
      FROM lits;
    `);

    res.json({
      patients: patientsStats.rows[0],
      lits: litsStats.rows[0],
    });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques.' });
  }
};

module.exports = {
  getPatientsActifs,
  admettrePatient,
  triagePatient,
  cloturerConsultation,
  getDossierById,
  getUrgencesStats,
};