-- 1. Table des utilisateurs (Personnel & Patients avec accès)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('accueil', 'infirmier', 'medecin', 'responsable', 'patient')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des patients (Identité administrative)
CREATE TABLE patients (
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

-- 3. Table des box / lits d'urgence
CREATE TABLE lits (
    id SERIAL PRIMARY KEY,
    code_box VARCHAR(30) UNIQUE NOT NULL, -- Ex: 'Box 1', 'Déchoquage A'
    zone VARCHAR(50) NOT NULL,            -- Ex: 'Soins critiques', 'Circuit court'
    statut VARCHAR(20) NOT NULL DEFAULT 'libre' CHECK (statut IN ('libre', 'occupe', 'nettoyage'))
);

-- 4. Table des passages / dossiers d'urgence (Relation 1-N avec patients, lits et users)
CREATE TABLE dossiers_urgence (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    lit_id INT REFERENCES lits(id) ON DELETE SET NULL,
    medecin_id INT REFERENCES users(id) ON DELETE SET NULL,
    motif_admission TEXT NOT NULL,
    constantes JSONB DEFAULT '{}', -- Ex: {"tension": "12/8", "temperature": 38.2, "douleur": 6}
    priorite VARCHAR(5) CHECK (priorite IN ('P1', 'P2', 'P3', 'P4')),
    statut VARCHAR(30) NOT NULL DEFAULT 'en_attente_triage' 
        CHECK (statut IN ('en_attente_triage', 'en_attente_consultation', 'en_consultation', 'sorti')),
    diagnostic TEXT,
    prescriptions TEXT,
    date_admission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_sortie TIMESTAMP
);

-- INDEX UNIQUES PARTIELS (Garantie anti-double affectation)
-- Empêche qu'un même lit soit assigné à deux dossiers actifs simultanément
CREATE UNIQUE INDEX idx_unique_lit_actif 
ON dossiers_urgence (lit_id) 
WHERE lit_id IS NOT NULL AND statut != 'sorti';

-- Empêche qu'un même patient ait deux passages actifs en même temps aux urgences
CREATE UNIQUE INDEX idx_unique_patient_actif 
ON dossiers_urgence (patient_id) 
WHERE statut != 'sorti';

-- Jeu de données initial pour les lits
INSERT INTO lits (code_box, zone, statut) VALUES
('Déchoquage 1', 'Urgences Vitales', 'libre'),
('Box 1', 'Soins Standards', 'libre'),
('Box 2', 'Soins Standards', 'libre'),
('Box 3', 'Circuit Court', 'libre'),
('Box 4', 'Circuit Court', 'libre');