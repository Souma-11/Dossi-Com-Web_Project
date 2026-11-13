require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

const seedDatabase = async () => {
  try {
    console.log("🌱 Initialisation des données de test dans PostgreSQL (Dossi'Com)...");

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('Dossicom2026!', salt);

    // 1. Création des utilisateurs (1 par rôle)
    const users = [
      { nom: 'Ben Ali', prenom: 'Sarra', email: 'accueil@dossicom.tn', role: 'accueil' },
      { nom: 'Trabelsi', prenom: 'Karim', email: 'infirmier@dossicom.tn', role: 'infirmier' },
      { nom: 'Mansouri', prenom: 'Dr. Amel', email: 'medecin@dossicom.tn', role: 'medecin' },
      { nom: 'Gharbi', prenom: 'Youssef', email: 'responsable@dossicom.tn', role: 'responsable' },
      { nom: 'Khelifi', prenom: 'Sami', email: 'patient@dossicom.tn', role: 'patient' },
    ];

    let patientUserId = null;
    for (const u of users) {
      const res = await db.query(
        `INSERT INTO users (nom, prenom, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING id, role`,
        [u.nom, u.prenom, u.email, hash, u.role]
      );
      if (u.role === 'patient') patientUserId = res.rows[0].id;
    }

    // 2. Création d'un patient lié au compte patient@dossicom.tn
    const patRes = await db.query(
      `INSERT INTO patients (numero_dossier, nom, prenom, date_naissance, sexe, telephone, user_id)
       VALUES ('DOS-100001', 'Khelifi', 'Sami', '1992-05-14', 'M', '22123456', $1)
       ON CONFLICT (numero_dossier) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING id`,
      [patientUserId]
    );

    const existingDossier = await db.query(
      "SELECT id FROM dossiers_urgence WHERE patient_id = $1 AND statut != 'sorti'",
      [patRes.rows[0].id]
    );

    if (existingDossier.rows.length === 0) {
      await db.query(
        `INSERT INTO dossiers_urgence (patient_id, motif_admission, priorite, statut, constantes, date_triage)
         VALUES ($1, 'Douleur thoracique modérée', 'P2', 'en_attente_consultation', '{"tension":"13/8","temperature":37.6,"douleur":5}'::jsonb, NOW())`,
        [patRes.rows[0].id]
      );
    }

    console.log('✅ Données insérées avec succès !');
    console.log('🔑 Mot de passe commun : Dossicom2026!');
    console.log('   - Accueil     : accueil@dossicom.tn');
    console.log('   - Infirmier   : infirmier@dossicom.tn');
    console.log('   - Médecin     : medecin@dossicom.tn');
    console.log('   - Responsable : responsable@dossicom.tn');
    console.log('   - Patient     : patient@dossicom.tn');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur seed :', error);
    process.exit(1);
  }
};

seedDatabase();