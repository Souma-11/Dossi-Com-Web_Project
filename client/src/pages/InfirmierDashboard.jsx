import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PriorityBadge from '../components/ui/PriorityBadge';
import { urgenceService } from '../services/urgenceService';

const NIVEAUX_PRIORITE = [
  { code: 'P1', label: 'P1 Immédiate', activeClass: 'bg-[#C8102E] text-white border-[#C8102E]' },
  { code: 'P2', label: 'P2 Très urgente', activeClass: 'bg-[#B85C00] text-white border-[#B85C00]' },
  { code: 'P3', label: 'P3 Urgente', activeClass: 'bg-[#0B4F9E] text-white border-[#0B4F9E]' },
  { code: 'P4', label: 'P4 Moins urgente', activeClass: 'bg-[#5B6675] text-white border-[#5B6675]' },
];

export default function InfirmierDashboard() {
  const [aTrier, setATrier] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [historique, setHistorique] = useState({});
  const [patientsEnAttente, setPatientsEnAttente] = useState(0);

  const [dossierActif, setDossierActif] = useState('');
  const [modeReevaluation, setModeReevaluation] = useState(false);
  const [alerteActiveId, setAlerteActiveId] = useState(null);

  // Aucune priorité présélectionnée par défaut (règle métier Dossi'Com)
  const [prioriteChoisie, setPrioriteChoisie] = useState('');
  const [observations, setObservations] = useState('');
  const [motifChangement, setMotifChangement] = useState('');
  const [erreurForm, setErreurForm] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await urgenceService.getInfirmierData();
        if (!isMounted || !data) return;

        const nextATrier = data.aTrier || [];
        const nextAlertes = data.alertes || [];

        setATrier(nextATrier);
        setAlertes(nextAlertes);
        setHistorique(data.historique || {});
        setPatientsEnAttente(data.patientsEnAttente ?? 0);

        setDossierActif((prev) => {
          if (prev) return prev;
          return nextATrier[0]?.id || nextAlertes[0]?.dossier || '';
        });
      } catch (err) {
        console.error('Erreur chargement espace infirmier :', err);
      }
    };

    loadData();
    window.addEventListener('dossicom:db-updated', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('dossicom:db-updated', loadData);
    };
  }, []);

  const selectionnerPourTriage = (dossierId) => {
    setDossierActif(dossierId);
    setModeReevaluation(false);
    setAlerteActiveId(null);
    setPrioriteChoisie('');
    setObservations('');
    setMotifChangement('');
    setErreurForm('');
  };

  const selectionnerPourAlerte = (alerte) => {
    setDossierActif(alerte.dossier);
    setModeReevaluation(true);
    setAlerteActiveId(alerte.id);
    setPrioriteChoisie('');
    setObservations('');
    setMotifChangement('');
    setErreurForm('');
  };

  const handleEnregistrerTriage = async (e) => {
    e.preventDefault();
    setErreurForm('');

    if (!dossierActif) {
      setErreurForm('Veuillez sélectionner un dossier à évaluer.');
      return;
    }
    if (!observations.trim()) {
      setErreurForm('Les observations cliniques (motif, constantes, état) sont obligatoires.');
      return;
    }
    if (modeReevaluation && !motifChangement.trim()) {
      setErreurForm('Le motif du changement de priorité est obligatoire lors d’une réévaluation.');
      return;
    }
    if (!prioriteChoisie) {
      setErreurForm('Veuillez sélectionner manuellement une priorité (P1 à P4).');
      return;
    }

    setSubmitting(true);
    try {
      await urgenceService.enregistrerTriage({
        dossierId: dossierActif,
        priorite: prioriteChoisie,
        observations: observations.trim(),
        motifChangement: motifChangement.trim(),
        estReevaluation: modeReevaluation,
        alerteId: alerteActiveId,
      });

      const dossierTraite = dossierActif;
      const prioriteEnregistree = prioriteChoisie;
      const etaitReevaluation = modeReevaluation;

      const restantsATrier = aTrier.filter((d) => d.id !== dossierTraite);
      const restantesAlertes = alerteActiveId
        ? alertes.filter((a) => a.id !== alerteActiveId)
        : alertes;

      setConfirmation(
        `${etaitReevaluation ? 'Réévaluation' : 'Triage'} enregistré pour le dossier ${dossierTraite} (${prioriteEnregistree}).`
      );
      setPrioriteChoisie('');
      setObservations('');
      setMotifChangement('');
      setModeReevaluation(false);
      setAlerteActiveId(null);
      setDossierActif(
        restantsATrier[0]?.id || restantesAlertes[0]?.dossier || ''
      );
    } catch (err) {
      setErreurForm(
        err?.message || 'Erreur lors de l’enregistrement du triage.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const entreesHistoriqueDossier = historique[dossierActif] || [];

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Espace infirmier — À trier</h1>
          <p className="text-caption mt-1">
            Évaluation clinique, attribution manuelle P1 à P4 et traitement des alertes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/file-attente" className="btn-secondary px-4 py-2 text-sm">
            File d’attente et ressources
          </Link>
          <Link to="/infirmier/signalement" className="btn-secondary px-4 py-2 text-sm">
            Signaler un problème
          </Link>
        </div>
      </div>

      {/* 3 Indicateurs clés */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dossi-kpi kpi-navy p-5">
          <p className="text-3xl font-bold text-[#0B2A5B] tabular-nums">
            {String(aTrier.length).padStart(2, '0')}
          </p>
          <p className="text-sm font-medium text-[#5B6675] mt-1">
            Patients à trier
          </p>
        </div>

        <div
          className={`dossi-kpi p-5 ${
            alertes.length > 0 ? 'kpi-critical' : 'kpi-turquoise'
          }`}
        >
          <p
            className={`text-3xl font-bold tabular-nums ${
              alertes.length > 0 ? 'text-[#C8102E]' : 'text-[#0B2A5B]'
            }`}
          >
            {String(alertes.length).padStart(2, '0')}
          </p>
          <p className="text-sm font-medium text-[#5B6675] mt-1">
            Alertes non traitées
          </p>
        </div>

        <div className="dossi-kpi kpi-turquoise p-5">
          <p className="text-3xl font-bold text-[#0B2A5B] tabular-nums">
            {String(patientsEnAttente).padStart(2, '0')}
          </p>
          <p className="text-sm font-medium text-[#5B6675] mt-1">
            Patients en attente
          </p>
        </div>
      </section>

      {confirmation && (
        <div
          role="status"
          className="dossi-card border-l-4 border-l-[#1B7F4B] p-4 flex items-center justify-between gap-4"
        >
          <p className="text-sm font-medium text-[#1B7F4B]">{confirmation}</p>
          <button
            type="button"
            onClick={() => setConfirmation('')}
            className="text-xs font-semibold text-[#5B6675] hover:text-[#0B2A5B] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Grille principale à 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Liste À trier (N) */}
        <section className="dossi-card overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#D5DEEA] flex items-center justify-between">
            <div>
              <h2>À trier ({aTrier.length})</h2>
              <p className="text-caption">
                Classés par ancienneté · Seuil d’alerte &gt; 15 min
              </p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="dossi-table w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Dossier</th>
                  <th className="py-3 px-4 font-semibold">Arrivée</th>
                  <th className="py-3 px-4 font-semibold">Attente</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DEEA] text-sm">
                {aTrier.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#5B6675]">
                      Aucun dossier en attente de triage initial.
                    </td>
                  </tr>
                ) : (
                  aTrier.map((item) => {
                    const depasseSeuil = item.attenteMin > 15;
                    const estSelectionne = dossierActif === item.id && !modeReevaluation;
                    return (
                      <tr
                        key={item.id}
                        className={
                          estSelectionne
                            ? 'bg-[#EEF3F9]'
                            : 'hover:bg-[#EEF3F9]/50'
                        }
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#0B2A5B] tabular-nums">
                            {item.id}
                          </p>
                          <p className="text-xs text-[#5B6675]">{item.patient}</p>
                        </td>
                        <td className="py-3 px-4 text-[#5B6675] tabular-nums">
                          {item.arrivee}
                        </td>
                        <td className="py-3 px-4 tabular-nums">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              depasseSeuil
                                ? 'bg-[#C8102E]/15 text-[#C8102E]'
                                : 'text-[#0B2A5B]'
                            }`}
                          >
                            {item.attenteMin} min
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => selectionnerPourTriage(item.id)}
                            className="btn-secondary px-3 py-1.5 text-xs cursor-pointer"
                          >
                            Trier
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Formulaire de Triage / Réévaluation */}
        <section className="dossi-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="tabular-nums">
              {modeReevaluation ? 'Réévaluation' : 'Triage'} :{' '}
              {dossierActif || 'Aucun dossier'}
            </h2>
            {modeReevaluation && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#B85C00]/15 text-[#B85C00]">
                Réévaluation clinique
              </span>
            )}
          </div>

          {erreurForm && (
            <div
              role="alert"
              className="rounded-lg bg-[#C8102E]/10 border border-[#C8102E] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#C8102E]"
            >
              {erreurForm}
            </div>
          )}

          <form onSubmit={handleEnregistrerTriage} className="space-y-4">
            <div>
              <label
                htmlFor="observations-triage"
                className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
              >
                Observations (motif, constantes, état) *
              </label>
              <textarea
                id="observations-triage"
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex. TA 13/8, FC 88 bpm, SpO2 98 %, douleur évaluée à 5/10..."
                className="w-full rounded-lg border border-[#D5DEEA] bg-white p-3 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
              />
            </div>

            {modeReevaluation && (
              <div>
                <label
                  htmlFor="motif-changement"
                  className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
                >
                  Motif du changement *
                </label>
                <input
                  id="motif-changement"
                  type="text"
                  value={motifChangement}
                  onChange={(e) => setMotifChangement(e.target.value)}
                  placeholder="Précisez la raison de la réévaluation..."
                  className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
                />
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-[#0B2A5B] mb-2">
                Priorité (choisie par l’infirmier) *
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {NIVEAUX_PRIORITE.map((niv) => {
                  const estActif = prioriteChoisie === niv.code;
                  return (
                    <button
                      key={niv.code}
                      type="button"
                      onClick={() => setPrioriteChoisie(niv.code)}
                      aria-pressed={estActif}
                      className={`py-2.5 px-3.5 rounded-lg border text-sm font-semibold transition-colors cursor-pointer ${
                        estActif
                          ? niv.activeClass
                          : 'bg-white text-[#0B2A5B] border-[#D5DEEA] hover:bg-[#EEF3F9]'
                      }`}
                    >
                      {niv.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 px-4 text-sm cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer le triage'}
            </button>
          </form>
        </section>

        {/* 3. Alertes à traiter (N) */}
        <section className="dossi-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2>Alertes à traiter ({alertes.length})</h2>
            <span className="text-caption">Aggravations &amp; réévaluations</span>
          </div>

          {alertes.length === 0 ? (
            <p className="text-sm text-[#5B6675] py-4">
              Aucune alerte en attente de traitement.
            </p>
          ) : (
            <div className="divide-y divide-[#D5DEEA] border border-[#D5DEEA] rounded-lg">
              {alertes.map((alerte) => (
                <div
                  key={alerte.id}
                  className="p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          alerte.type === 'Aggravation'
                            ? 'bg-[#C8102E] text-white'
                            : 'bg-[#B85C00] text-white'
                        }`}
                      >
                        {alerte.type}
                      </span>
                      <span className="text-sm font-semibold text-[#0B2A5B]">
                        {alerte.origine}
                      </span>
                    </div>
                    <p className="text-xs text-[#5B6675] tabular-nums">
                      {alerte.dossier} ({alerte.patient}) · il y a {alerte.ilYa}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => selectionnerPourAlerte(alerte)}
                    className="btn-secondary px-3.5 py-1.5 text-xs shrink-0 cursor-pointer"
                  >
                    Traiter
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Historique des priorités */}
        <section className="dossi-card p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <h2 className="tabular-nums">
              Historique des priorités : {dossierActif || '—'}
            </h2>

            {entreesHistoriqueDossier.length === 0 ? (
              <p className="text-sm text-[#5B6675]">
                Aucun triage enregistré pour ce dossier pour le moment.
              </p>
            ) : (
              <ol className="relative border-l-2 border-[#0B2A5B] ml-2.5 space-y-4 pl-5">
                {entreesHistoriqueDossier.map((entree, idx) => (
                  <li key={idx} className="relative">
                    <span className="w-3 h-3 rounded-full bg-[#0B2A5B] absolute -left-[27px] top-1.5" />
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-[#5B6675] tabular-nums">
                        {entree.heure}
                      </span>
                      <PriorityBadge level={entree.niveau} size="sm" />
                    </div>
                    <p className="text-sm text-slate-800 mt-1">{entree.motif}</p>
                    <p className="text-xs text-[#5B6675] mt-0.5">
                      Par {entree.auteur}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <p className="text-xs text-[#5B6675] border-t border-[#D5DEEA] pt-3">
            Chaque changement est ajouté à l’historique, jamais écrasé.
          </p>
        </section>
      </div>
    </div>
  );
}