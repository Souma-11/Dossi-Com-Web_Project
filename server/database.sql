-- 1. Colonnes supplémentaires sur la table lits
ALTER TABLE lits DROP CONSTRAINT IF EXISTS lits_statut_check;
ALTER TABLE lits ADD CONSTRAINT lits_statut_check 
    CHECK (statut IN ('libre', 'occupe', 'nettoyage', 'maintenance'));

ALTER TABLE lits 
    ADD COLUMN IF NOT EXISTS patient_affecte INT REFERENCES patients(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS derniere_modification_par INT REFERENCES users(id) ON DELETE SET NULL;

-- 2. Colonnes supplémentaires sur la table dossiers_urgence
ALTER TABLE dossiers_urgence
    ADD COLUMN IF NOT EXISTS observations_triage TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS alerte_aggravation JSONB DEFAULT '{"active": false}'::jsonb,
    ADD COLUMN IF NOT EXISTS triage_effectue_par INT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS date_triage TIMESTAMP,
    ADD COLUMN IF NOT EXISTS compte_rendu TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS orientation_sortie VARCHAR(30) DEFAULT 'en_cours',
    ADD COLUMN IF NOT EXISTS date_consultation TIMESTAMP;