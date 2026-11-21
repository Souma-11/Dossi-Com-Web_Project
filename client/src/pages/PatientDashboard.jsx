import { useEffect, useState } from 'react';
import PriorityBadge from '../components/ui/PriorityBadge';
import { useAuth } from '../context/AuthContext';
import { urgenceService } from '../services/urgenceService';

const ETAPES = [
  'Enregistré',
  'Triage',
  'En attente',
  'Consultation',
  'Orientation',
];

const PASSAGE_DEFAUT = {
  numeroSuivi: 'UR-2026-0104',
  etapeIndex: 2,
  positionFile: 1,
  attenteEstimee: '15 à 25 min',
  priorite: 'P3',
  salle: 'En attente d’affectation',
  medecin: 'Vous serez informé dès l’appel',
  consignes: [
    'Restez en salle d’attente principale afin d’entendre votre appel.',
  ],
};

const PASSAGES_PRECEDENTS = [
  { date: '14/03/2026', dossier: 'UR-2026-0042', issue: 'Sortie avec ordonnance' },
  { date: '09/11/2025', dossier: 'UR-2025-1890', issue: 'Sortie — Consultation' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const dossierId = user?.dossierActif || 'UR-2026-0104';

  const [passageActuel, setPassageActuel] = useState(PASSAGE_DEFAUT);
  const [reclamations, setReclamations] = useState([]);
  const [confirmAggravation, setConfirmAggravation] = useState(false);
  const [alerteEnvoyee, setAlerteEnvoyee] = useState(false);
  const [showAvisForm, setShowAvisForm] = useState(false);
  const [typeRetour, setTypeRetour] = useState('avis');
  const [messageRetour, setMessageRetour] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await urgenceService.getPatientDashboardData(dossierId);
        if (!isMounted || !data) return;

        if (data.passage) {
          setPassageActuel(data.passage);
        }
        if (Array.isArray(data.reclamations)) {
          setReclamations(data.reclamations);
        }
      } catch (err) {
        console.error('Erreur chargement espace patient :', err);
      }
    };

    loadData();
    window.addEventListener('dossicom:db-updated', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('dossicom:db-updated', loadData);
    };
  }, [dossierId]);

  const handleConfirmerAggravation = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await urgenceService.signalerAggravation(passageActuel.numeroSuivi);
      setConfirmAggravation(false);
      setAlerteEnvoyee(true);
    } catch (err) {
      console.error('Erreur signalement aggravation :', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnvoyerRetour = async (e) => {
    e.preventDefault();
    if (!messageRetour.trim() || submitting) return;

    setSubmitting(true);
    try {
      const updated = await urgenceService.envoyerAvisOuReclamation({
        type: typeRetour,
        message: messageRetour.trim(),
      });
      if (Array.isArray(updated)) {
        setReclamations(updated);
      }
      setMessageRetour('');
      setShowAvisForm(false);
    } catch (err) {
      console.error('Erreur envoi avis/réclamation :', err);
    } finally {
      setSubmitting(false);
    }
  };

  const dossiersDevant = Math.max(0, (passageActuel.positionFile || 1) - 1);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Bandeau d'accueil patient + Bouton d'alerte critique */}
      <section className="dossi-card p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1>Bonjour, votre passage est enregistré</h1>
          <p className="text-sm font-semibold text-[#0B4F9E] tabular-nums mt-1">
            Numéro de suivi : {passageActuel.numeroSuivi}
          </p>
          <p className="text-xs text-[#5B6675] mt-1">
            En cas d’aggravation, prévenez immédiatement le personnel. Ce bouton ne remplace pas un appel direct.
          </p>
        </div>

        <div className="shrink-0">
          {!confirmAggravation ? (
            <button
              type="button"
              onClick={() => setConfirmAggravation(true)}
              aria-label="Signaler que mon état s'aggrave"
              className="btn-danger w-full sm:w-auto px-5 py-3 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              <span>Mon état s’aggrave</span>
            </button>
          ) : (
            <div
              role="alertdialog"
              aria-label="Confirmer l'alerte d'aggravation"
              className="rounded-lg border-2 border-[#C8102E] bg-[#C8102E]/5 p-3.5 space-y-2.5 max-w-sm"
            >
              <p className="text-xs font-bold text-[#C8102E]">
                Confirmer l’envoi d’une alerte prioritaire à l’équipe infirmière ?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmerAggravation}
                  className="btn-danger px-3.5 py-1.5 text-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Envoi...' : 'Oui, alerter maintenant'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAggravation(false)}
                  className="btn-secondary px-3 py-1.5 text-xs cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Confirmation de réception de l'alerte */}
      {alerteEnvoyee && (
        <div
          role="status"
          className="dossi-card border-l-4 border-l-[#C8102E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <p className="text-sm font-semibold text-[#C8102E]">
            Alerte transmise à l’infirmier de triage. Si vous pouvez vous déplacer ou appeler un soignant proche, faites-le également.
          </p>
          <button
            type="button"
            onClick={() => setAlerteEnvoyee(false)}
            className="text-xs font-semibold text-[#5B6675] hover:text-[#0B2A5B] self-start sm:self-auto cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Étapes de votre passage */}
      <section className="dossi-card p-5 sm:p-6 space-y-4">
        <h2>Étapes de votre passage</h2>

        <ol className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {ETAPES.map((etape, index) => {
            const estValidee = index < passageActuel.etapeIndex;
            const estActuelle = index === passageActuel.etapeIndex;

            return (
              <li
                key={etape}
                aria-current={estActuelle ? 'step' : undefined}
                className={`p-3.5 rounded-lg border flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 ${
                  estActuelle
                    ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]'
                    : estValidee
                    ? 'bg-[#1FAFB5]/15 text-[#0B2A5B] border-[#1FAFB5]'
                    : 'bg-[#EEF3F9]/60 text-[#5B6675] border-[#D5DEEA]'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 tabular-nums ${
                    estActuelle
                      ? 'bg-[#1FAFB5] text-[#0B2A5B]'
                      : estValidee
                      ? 'bg-[#0E7C86] text-white'
                      : 'bg-white text-[#5B6675] border border-[#D5DEEA]'
                  }`}
                >
                  {estValidee ? '✓' : index + 1}
                </span>
                <span className="text-sm font-semibold">{etape}</span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 4 Informations clés */}
      <section
        aria-label="Informations clés de votre passage"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="dossi-kpi kpi-navy p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6675]">
            Position dans la file
          </p>
          <p className="text-3xl font-bold text-[#0B2A5B] tabular-nums mt-1">
            {passageActuel.positionFile}
          </p>
          <p className="text-xs text-[#5B6675] mt-1">
            {dossiersDevant}{' '}
            {dossiersDevant > 1 ? 'dossiers devant vous' : 'dossier devant vous'}
          </p>
        </div>

        <div className="dossi-kpi kpi-turquoise p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6675]">
            Attente estimée
          </p>
          <p className="text-2xl font-bold text-[#0B2A5B] tabular-nums mt-1">
            {passageActuel.attenteEstimee}
          </p>
          <p className="text-xs text-[#5B6675] mt-1">Estimation indicative</p>
        </div>

        <div className="dossi-kpi kpi-warning p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6675] mb-2">
            Priorité
          </p>
          <PriorityBadge level={passageActuel.priorite} simplified />
          <p className="text-xs text-[#5B6675] mt-2">Affichage simplifié</p>
        </div>

        <div className="dossi-kpi kpi-institutional p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6675]">
            Salle et médecin
          </p>
          <p className="text-lg font-bold text-[#0B2A5B] mt-1">
            {passageActuel.salle}
          </p>
          <p className="text-xs text-[#5B6675] mt-1">{passageActuel.medecin}</p>
        </div>
      </section>

      {/* Consignes, Historique & Avis / Réclamations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consignes */}
        <div className="dossi-card p-5 sm:p-6 space-y-3">
          <h2>Consignes</h2>
          {passageActuel.consignes.length === 0 ? (
            <p className="text-sm text-[#5B6675]">
              Aucune consigne particulière pour le moment.
            </p>
          ) : (
            <ul className="space-y-2.5 text-sm text-slate-800">
              {passageActuel.consignes.map((consigne, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-[#EEF3F9]/70 border border-[#D5DEEA]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0E7C86] mt-1.5 shrink-0" />
                  <span>{consigne}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mes passages précédents */}
        <div className="dossi-card p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h2>Mes passages précédents</h2>
            <div className="divide-y divide-[#D5DEEA] border border-[#D5DEEA] rounded-lg">
              {PASSAGES_PRECEDENTS.map((item) => (
                <div
                  key={item.dossier}
                  className="p-3.5 flex items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[#0B2A5B] tabular-nums">
                      {item.date}
                    </p>
                    <p className="text-xs text-[#5B6675] tabular-nums">
                      {item.dossier} · {item.issue}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EEF3F9] text-[#5B6675]">
                    Sortie
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#5B6675]">
            Lecture seule : seuls vos passages personnels sont affichés.
          </p>
        </div>

        {/* Avis et réclamations */}
        <div className="dossi-card p-5 sm:p-6 space-y-4">
          <h2>Avis et réclamations</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTypeRetour('avis');
                setShowAvisForm(true);
              }}
              className="btn-secondary py-2 px-3 text-xs sm:text-sm cursor-pointer"
            >
              Donner un avis
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeRetour('reclamation');
                setShowAvisForm(true);
              }}
              className="btn-secondary py-2 px-3 text-xs sm:text-sm cursor-pointer"
            >
              Envoyer une réclamation
            </button>
          </div>

          {showAvisForm && (
            <form
              onSubmit={handleEnvoyerRetour}
              className="p-3.5 rounded-lg bg-[#EEF3F9] border border-[#D5DEEA] space-y-3"
            >
              <label
                htmlFor="message-retour"
                className="block text-xs font-semibold text-[#0B2A5B]"
              >
                {typeRetour === 'avis'
                  ? 'Votre avis sur l’accueil ou la prise en charge'
                  : 'Votre réclamation'}
              </label>
              <textarea
                id="message-retour"
                rows={3}
                value={messageRetour}
                onChange={(e) => setMessageRetour(e.target.value)}
                className="w-full rounded-lg border border-[#D5DEEA] bg-white p-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-3.5 py-1.5 text-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Envoi...' : 'Envoyer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAvisForm(false)}
                  className="text-xs font-semibold text-[#5B6675] hover:text-[#0B2A5B] cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {reclamations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-lg border border-[#D5DEEA] space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#0B2A5B] tabular-nums">
                    {rec.type} n° {rec.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#0B4F9E]/15 text-[#0B4F9E]">
                    {rec.statut}
                  </span>
                </div>
                <p className="text-xs text-slate-800">{rec.message || rec.sujet}</p>
                <p className="text-xs text-[#5B6675]">{rec.reponse}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#5B6675]">
            Sans effet sur le dossier médical ni sur l’ordre de priorité.
          </p>
        </div>
      </section>
    </div>
  );
}