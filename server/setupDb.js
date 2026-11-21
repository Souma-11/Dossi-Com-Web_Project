const { Client } = require('pg');
require('dotenv').config();

function getConnectionParams(dbName) {
  const fallbackPassword = String(
    process.env.DB_PASSWORD || process.env.DB_PASS || process.env.PGPASSWORD || 'postgres'
  );

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: fallbackPassword,
    database: dbName,
  };
}

async function setup() {
  const targetDb = process.env.DB_NAME || 'dossicom';

  // 1. Création de la base de données si elle n'existe pas
  const adminClient = new Client(getConnectionParams('postgres'));
  await adminClient.connect();

  const exists = await adminClient.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [targetDb]
  );

  if (exists.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE "${targetDb}"`);
    console.log(`✅ Base de données "${targetDb}" créée.`);
  } else {
    console.log(`ℹ️ La base de données "${targetDb}" existe déjà.`);
  }
  await adminClient.end();

  // 2. Création des tables, colonnes et index dans 'dossicom'
  const dbClient = new Client(getConnectionParams(targetDb));
  await dbClient.connect();

  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('accueil', 'infirmier', 'medecin', 'responsable', 'patient')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      numero_dossier VARCHAR(30) UNIQUE NOT NULL,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      date_naissance DATE NOT NULL,
      sexe VARCHAR(10) CHECK (sexe IN ('M', 'F', 'Autre')),
      telephone VARCHAR(20),
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lits (
      id SERIAL PRIMARY KEY,
      code_box VARCHAR(30) UNIQUE NOT NULL,
      zone VARCHAR(50) NOT NULL,
      statut VARCHAR(20) NOT NULL DEFAULT 'libre' CHECK (statut IN ('libre', 'occupe', 'nettoyage', 'maintenance')),
      patient_affecte INT REFERENCES patients(id) ON DELETE SET NULL,
      derniere_modification_par INT REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS dossiers_urgence (
      id SERIAL PRIMARY KEY,
      patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      lit_id INT REFERENCES lits(id) ON DELETE SET NULL,
      medecin_id INT REFERENCES users(id) ON DELETE SET NULL,
      motif_admission TEXT NOT NULL,
      constantes JSONB DEFAULT '{}',
      priorite VARCHAR(5) CHECK (priorite IN ('P1', 'P2', 'P3', 'P4')),
      statut VARCHAR(30) NOT NULL DEFAULT 'en_attente_triage'
        CHECK (statut IN ('en_attente_triage', 'en_attente_consultation', 'en_consultation', 'sorti')),
      diagnostic TEXT,
      prescriptions TEXT,
      observations_triage TEXT DEFAULT '',
      alerte_aggravation JSONB DEFAULT '{"active": false}'::jsonb,
      triage_effectue_par INT REFERENCES users(id) ON DELETE SET NULL,
      compte_rendu TEXT DEFAULT '',
      orientation_sortie VARCHAR(50) DEFAULT 'en_cours',
      date_admission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_triage TIMESTAMP,
      date_consultation TIMESTAMP,
      date_sortie TIMESTAMP
    );

    ALTER TABLE dossiers_urgence
      ADD COLUMN IF NOT EXISTS observations_triage TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS alerte_aggravation JSONB DEFAULT '{"active": false}'::jsonb,
      ADD COLUMN IF NOT EXISTS triage_effectue_par INT REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS compte_rendu TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS orientation_sortie VARCHAR(50) DEFAULT 'en_cours',
      ADD COLUMN IF NOT EXISTS date_consultation TIMESTAMP;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_lit_actif
    ON dossiers_urgence (lit_id)
    WHERE lit_id IS NOT NULL AND statut != 'sorti';

    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_patient_actif
    ON dossiers_urgence (patient_id)
    WHERE statut != 'sorti';

    INSERT INTO lits (code_box, zone, statut) VALUES
      ('Déchoquage 1', 'Urgences Vitales', 'libre'),
      ('Box 1', 'Soins Standards', 'libre'),
      ('Box 2', 'Soins Standards', 'libre'),
      ('Box 3', 'Circuit Court', 'libre'),
      ('Box 4', 'Circuit Court', 'libre')
    ON CONFLICT (code_box) DO NOTHING;
  `);

  console.log('✅ Tables, colonnes, index et lits mis à jour avec succès.');
  await dbClient.end();
}

setup().catch((err) => {
  console.error('❌ Erreur setupDb :', err.message);
  process.exit(1);
});