export const DEMO_PASSAGES = [
  {
    id: 1,
    numero_dossier: 'UR-2026-0001',
    patient_nom: 'Gharbi',
    patient_prenom: 'Salma',
    age: 64,
    sexe: 'F',
    motif_admission: 'Douleur thoracique aiguë',
    priorite: 'P1',
    aggravation: true,
    alerte_motif: 'Chute SpO₂ à 91% et douleur thoracique croissante — Prise en charge immédiate requise',
    statut: 'en_attente',
    heure_arrivee: '08:15',
    attente_min: 8,
    box: 'Box 1 (Déchocage)',
    constantes: { ta: '165/95', fc: '118 bpm', spo2: '91%', temp: '37.1°C' },
  },
  {
    id: 2,
    numero_dossier: 'UR-2026-0002',
    patient_nom: 'Trabelsi',
    patient_prenom: 'Youssef',
    age: 38,
    sexe: 'M',
    motif_admission: 'Suspicion fracture poignet droit',
    priorite: 'P2',
    aggravation: false,
    statut: 'en_attente',
    heure_arrivee: '08:22',
    attente_min: 14,
    box: 'Box 2',
    constantes: { ta: '130/80', fc: '84 bpm', spo2: '99%', temp: '36.8°C' },
  },
  {
    id: 3,
    numero_dossier: 'UR-2026-0003',
    patient_nom: 'Ben Salah',
    patient_prenom: 'Amira',
    age: 29,
    sexe: 'F',
    motif_admission: 'Fièvre élevée et céphalées intenses',
    priorite: 'P2',
    aggravation: false,
    statut: 'en_attente',
    heure_arrivee: '08:28',
    attente_min: 19,
    box: 'Box 3',
    constantes: { ta: '118/74', fc: '98 bpm', spo2: '98%', temp: '39.4°C' },
  },
  {
    id: 4,
    numero_dossier: 'UR-2026-0004',
    patient_nom: 'Khelifi',
    patient_prenom: 'Mohamed',
    age: 52,
    sexe: 'M',
    motif_admission: 'Douleur abdominale aiguë',
    priorite: 'P3',
    aggravation: false,
    statut: 'en_attente',
    heure_arrivee: '08:35',
    attente_min: 22,
    box: 'Salle A',
    constantes: { ta: '135/85', fc: '88 bpm', spo2: '98%', temp: '37.6°C' },
  },
  {
    id: 5,
    numero_dossier: 'UR-2026-0005',
    patient_nom: 'Mansouri',
    patient_prenom: 'Leila',
    age: 45,
    sexe: 'F',
    motif_admission: "Crise d'asthme modérée",
    priorite: 'P2',
    aggravation: false,
    statut: 'en_attente',
    heure_arrivee: '08:41',
    attente_min: 28,
    box: 'Box 4',
    constantes: { ta: '126/82', fc: '104 bpm', spo2: '94%', temp: '37.0°C' },
  },
  {
    id: 6,
    numero_dossier: 'UR-2026-0006',
    patient_nom: 'Jaziri',
    patient_prenom: 'Karim',
    age: 31,
    sexe: 'M',
    motif_admission: 'Plaie profonde avant-bras gauche',
    priorite: 'P3',
    aggravation: false,
    statut: 'en_attente',
    heure_arrivee: '08:49',
    attente_min: 35,
    box: 'Salle B',
    constantes: { ta: '122/78', fc: '79 bpm', spo2: '99%', temp: '36.9°C' },
  },
  {
    id: 7,
    numero_dossier: 'UR-2026-0007',
    patient_nom: 'Chaabane',
    patient_prenom: 'Nadia',
    age: 71,
    sexe: 'F',
    motif_admission: 'Vertiges et poussée tensionnelle',
    priorite: 'P4',
    aggravation: false,
    statut: 'en_attente',
    heure_arrivee: '08:55',
    attente_min: 42,
    box: 'Salle C',
    constantes: { ta: '175/98', fc: '86 bpm', spo2: '97%', temp: '36.7°C' },
  },
];

export const DEMO_HISTORIQUE = [
  {
    id: 101,
    numero_dossier: 'UR-2026-0000',
    patient_nom: 'Oueslati',
    patient_prenom: 'Hichem',
    motif_admission: 'Entorse cheville gauche',
    priorite: 'P4',
    orientation: 'Retour à domicile avec ordonnance',
    heure_sortie: '08:05',
  },
];

export function computeServiceStats(passages = DEMO_PASSAGES) {
  const capaciteTotale = 10;
  const patientsEnAttente = passages.length;
  const boxLibres = Math.max(0, capaciteTotale - patientsEnAttente);
  const medecinsActifs = 4;
  const saturation = Math.min(100, Math.round((patientsEnAttente / capaciteTotale) * 100));
  const attenteMoyenne =
    patientsEnAttente > 0
      ? Math.round(
          passages.reduce((acc, p) => acc + (Number(p.attente_min) || 0), 0) / patientsEnAttente
        )
      : 0;

  return {
    capaciteTotale,
    patientsEnAttente,
    boxLibres,
    medecinsActifs,
    saturation,
    attenteMoyenne,
  };
}

export const DEMO_STATS = computeServiceStats(DEMO_PASSAGES);