/**
 * Redirection automatique après connexion : chaque rôle arrive dans
 * son propre espace (charte du site — Objectif 2).
 */
export const ROLE_ROUTES = {
  accueil: '/accueil',
  infirmier: '/infirmier',
  medecin: '/medecin',
  responsable: '/responsable',
  patient: '/patient',
};

export const ROLE_LABELS = {
  accueil: 'Accueil',
  infirmier: 'Infirmier',
  medecin: 'Médecin',
  responsable: 'Responsable',
  patient: 'Patient',
};
