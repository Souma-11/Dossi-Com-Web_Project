/**
 * Utilitaires de formatage partagés entre les espaces.
 */

/** Libellés lisibles des statuts du parcours patient */
export const STATUT_LABELS = {
  en_attente_triage: 'En attente de tri',
  en_attente_consultation: 'En attente de consultation',
  en_consultation: 'En consultation',
  sorti: 'Sorti',
};

/** Libellés simplifiés (espace patient — langage simple) */
export const PRIORITE_SIMPLE = {
  P1: 'Très urgent — pris en charge immédiatement',
  P2: 'Urgent — priorité élevée',
  P3: 'Urgence relative — surveillé régulièrement',
  P4: 'Peu urgent — sera pris en charge dès qu\'un box sera libre',
};

/** Libellés des orientations de sortie */
export const ORIENTATIONS = {
  en_cours: 'En cours',
  retour_domicile: 'Retour au domicile',
  hospitalisation: 'Hospitalisation',
  mutation: 'Mutation vers un autre établissement',
  deces: 'Décès',
};

/** Statuts des box */
export const LIT_STATUTS = {
  libre: { label: 'Libre', classes: 'border-status-valid bg-green-50 text-green-700' },
  occupe: { label: 'Occupé', classes: 'border-priority-p1 bg-red-50 text-red-700' },
  nettoyage: { label: 'Nettoyage', classes: 'border-priority-p2 bg-orange-50 text-orange-700' },
  maintenance: { label: 'Maintenance', classes: 'border-status-maintenance bg-slate-100 text-slate-600' },
};

/**
 * Durée écoulée entre une date et maintenant → "15 min", "1 h 20".
 */
export function dureeDepuis(dateStr) {
  if (!dateStr) return '—';
  const diffMin = Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000));
  if (diffMin < 60) return `${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h} h ${m.toString().padStart(2, '0')}` : `${h} h`;
}

/** "15" → "15 min", "80" → "1 h 20" */
export function minutesEnTexte(minutes) {
  const m = Number(minutes) || 0;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest > 0 ? `${h} h ${rest.toString().padStart(2, '0')}` : `${h} h`;
}

/** Heure locale "14h30" */
export function heureFr(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getHours()}h${d.getMinutes().toString().padStart(2, '0')}`;
}

/** Date + heure locale complète */
export function dateHeureFr(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('fr-FR')} à ${heureFr(dateStr)}`;
}

/**
 * Tri de la file d'attente (règle métier) : par priorité P1→P4 puis
 * par ancienneté (le plus ancien d'abord).
 */
export const RANG_PRIORITE = { P1: 1, P2: 2, P3: 3, P4: 4, null: 9 };

export function trierFile(patients) {
  return [...patients].sort((a, b) => {
    const rangA = RANG_PRIORITE[a.dossierActif?.priorite] ?? 9;
    const rangB = RANG_PRIORITE[b.dossierActif?.priorite] ?? 9;
    if (rangA !== rangB) return rangA - rangB;
    const dateA = new Date(a.dossierActif?.dateTriage || a.dateArrivee).getTime();
    const dateB = new Date(b.dossierActif?.dateTriage || b.dateArrivee).getTime();
    return dateA - dateB;
  });
}
