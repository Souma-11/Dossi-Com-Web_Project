/**
 * Aide au tri — SUGGESTION indicative de priorité P1–P4 calculée à partir
 * des constantes vitales saisies par l'infirmier IAO.
 *
 * RÈGLE MÉTIER (charte du projet) : le système alerte et suggère, mais il ne
 * décide JAMAIS seul de la priorité clinique. L'infirmier confirme ou corrige
 * manuellement le niveau final.
 */

const TOLERANCES = {
  P1: {
    label: 'P1 Immédiate',
    color: 'text-priority-p1',
    motifs: [],
  },
  P2: { label: 'P2 Très urgente', color: 'text-priority-p2', motifs: [] },
  P3: { label: 'P3 Urgente', color: 'bg-priority-p3 text-white', motifs: [] },
  P4: { label: 'P4 Moins urgente', color: 'text-priority-p4', motifs: [] },
};

/**
 * Analyse les constantes vitales et retourne { niveau, motifs }.
 * @param {object} c - { tension, temperature, frequenceCardiaque, spO2, frequenceRespiratoire, douleur, glycemie }
 */
export function suggererPriorite(c = {}) {
  const motifs = [];
  const num = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));

  const spO2 = num(c.spO2);
  const fc = num(c.frequenceCardiaque);
  const temp = num(c.temperature);
  const douleur = num(c.douleur);
  const fr = num(c.frequenceRespiratoire);
  const glyc = num(c.glycemie);

  // Tension "125/80" → systolique / diastolique
  let syst = null;
  let dias = null;
  if (typeof c.tension === 'string' && c.tension.includes('/')) {
    const [s, d] = c.tension.split('/');
    syst = num(s);
    dias = num(d);
  }

  let niveau = 'P4';

  // ─── Critères P1 — défaillance vitale immédiate ──────────────────────────
  const p1Motifs = [];
  if (spO2 !== null && spO2 < 90) p1Motifs.push(`SpO2 critique (${spO2} %)`);
  if (fc !== null && (fc < 40 || fc > 150)) p1Motifs.push(`FC extrême (${fc} bpm)`);
  if (syst !== null && (syst < 80 || syst > 220)) p1Motifs.push(`Tension systolique extrême (${syst} mmHg)`);
  if (temp !== null && (temp >= 40 || temp < 32)) p1Motifs.push(`Température extrême (${temp} °C)`);
  if (fr !== null && (fr < 8 || fr > 35)) p1Motifs.push(`Fréquence respiratoire extrême (${fr}/min)`);
  if (douleur !== null && douleur >= 9) p1Motifs.push(`Douleur extrême (${douleur}/10)`);
  if (glyc !== null && (glyc < 0.5 || glyc > 4.5)) p1Motifs.push(`Glycémie extrême (${glyc} g/L)`);
  if (p1Motifs.length > 0) {
    return { niveau: 'P1', motifs: p1Motifs, label: TOLERANCES.P1.label };
  }

  // ─── Critères P2 — urgence vitale potentielle ────────────────────────────
  const p2Motifs = [];
  if (spO2 !== null && spO2 < 94) p2Motifs.push(`SpO2 basse (${spO2} %)`);
  if (fc !== null && (fc < 50 || fc > 120)) p2Motifs.push(`FC anormale (${fc} bpm)`);
  if (syst !== null && (syst < 90 || syst > 180)) p2Motifs.push(`Tension systolique anormale (${syst} mmHg)`);
  if (dias !== null && dias > 110) p2Motifs.push(`Diastolique élevée (${dias} mmHg)`);
  if (temp !== null && temp >= 39.5) p2Motifs.push(`Fièvre élevée (${temp} °C)`);
  if (fr !== null && (fr < 12 || fr > 25)) p2Motifs.push(`FR anormale (${fr}/min)`);
  if (douleur !== null && douleur >= 7) p2Motifs.push(`Douleur intense (${douleur}/10)`);
  if (glyc !== null && (glyc < 0.7 || glyc > 3)) p2Motifs.push(`Glycémie anormale (${glyc} g/L)`);
  if (p2Motifs.length > 0) {
    return { niveau: 'P2', motifs: p2Motifs, label: TOLERANCES.P2.label };
  }

  // ─── Critères P3 — urgence relative ──────────────────────────────────────
  const p3Motifs = [];
  if (fc !== null && (fc < 60 || fc > 100)) p3Motifs.push(`FC limite (${fc} bpm)`);
  if (syst !== null && (syst < 100 || syst > 150)) p3Motifs.push(`Tension limite (${syst} mmHg)`);
  if (temp !== null && temp >= 38) p3Motifs.push(`Fièvre modérée (${temp} °C)`);
  if (douleur !== null && douleur >= 4) p3Motifs.push(`Douleur modérée (${douleur}/10)`);
  if (p3Motifs.length > 0) {
    return { niveau: 'P3', motifs: p3Motifs, label: TOLERANCES.P3.label };
  }

  if (douleur !== null && douleur >= 1) motifs.push(`Douleur légère (${douleur}/10)`);
  return { niveau: 'P4', motifs, label: TOLERANCES.P4.label };
}

export const PRIORITES = [
  { code: 'P1', label: 'P1 — Immédiate (rouge)' },
  { code: 'P2', label: 'P2 — Très urgente (orange)' },
  { code: 'P3', label: 'P3 — Urgente (bleu)' },
  { code: 'P4', label: 'P4 — Moins urgente (gris)' },
];

export default suggererPriorite;
