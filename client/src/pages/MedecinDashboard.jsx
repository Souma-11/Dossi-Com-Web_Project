import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PriorityBadge from '../components/ui/PriorityBadge';
import { urgenceService } from '../services/urgenceService';

export default function MedecinDashboard() {
  const [dossiers, setDossiers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [onglet, setOnglet] = useState('observations');

  const [nouvelleObservation, setNouvelleObservation] = useState('');
  const [nouvelExamen, setNouvelExamen] = useState('');
  const [motifReevaluation, setMotifReevaluation] = useState('');
  const [issueCloture, setIssueCloture] = useState('Sortie avec ordonnance et consignes');
  const [consignesSortie, setConsignesSortie] = useState('');
  const [notification, setNotification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await urgenceService.getMedecinData();
        if (!isMounted || !Array.isArray(data)) return;

        setDossiers(data);
        setSelectedId((prev) => {
          if (prev && data.some((d) => d.id === prev)) return prev;
          return data[0]?.id || '';
        });
      } catch (err) {
        console.error('Erreur chargement espace médecin :', err);
      }
    };

    loadData();
    window.addEventListener('dossicom:db-updated', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('dossicom:db-updated', loadData);
    };
  }, []);

  const dossierCourant = dossiers.find((d) => d.id === selectedId) || dossiers[0];

  const handleAjouterObservation = async (e) => {
    e.preventDefault();
    if (!nouvelleObservation.trim() || !dossierCourant || submitting) return;

    setSubmitting(true);
    try {
      await urgenceService.ajouterObservationMedecin(
        dossierCourant.id,
        nouvelleObservation.trim()
      );
      setNouvelleObservation('');
      setNotification('Observation médicale ajoutée au dossier.');
    } catch (err) {
      setNotification(err?.message || 'Erreur lors de l’ajout de l’observation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrescrireExamen = async (e) => {
    e.preventDefault();
    if (!nouvelExamen.trim() || !dossierCourant || submitting) return;

    const libelle = nouvelExamen.trim();
    setSubmitting(true);
    try {
      await urgenceService.prescrireExamen(dossierCourant.id, libelle);
      setNouvelExamen('');
      setNotification(`Examen prescrit : ${libelle}.`);
    } catch (err) {
      setNotification(err?.message || 'Erreur lors de la prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemanderReevaluation = async (e) => {
    e.preventDefault();
    if (!motifReevaluation.trim() || !dossierCourant || submitting) return;

    setSubmitting(true);
    try {
      await urgenceService.demanderReevaluationMedecin(
        dossierCourant.id,
        motifReevaluation.trim()
      );
      setNotification(
        `Demande de réévaluation transmise à l’infirmier pour ${dossierCourant.id}.`
      );
      setMotifReevaluation('');
    } catch (err) {
      setNotification(err?.message || 'Erreur lors de la demande de réévaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloturerDossier = async (e) => {
    e.preventDefault();
    if (!dossierCourant || submitting) return;

    const idCloture = dossierCourant.id;
    setSubmitting(true);
    try {
      await urgenceService.cloturerDossier(
        idCloture,
        issueCloture,
        consignesSortie
      );
      setConsignesSortie('');
      setNotification(
        `Dossier ${idCloture} clôturé (${issueCloture}). La salle est libérée.`
      );
    } catch (err) {
      setNotification(err?.message || 'Erreur lors de la clôture du dossier.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Espace médecin</h1>
          <p className="text-caption mt-1">
            Prise en charge des dossiers assignés, examens et orientation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/file-attente" className="btn-secondary px-4 py-2 text-sm">
            File d’attente et ressources
          </Link>
          <Link to="/medecin/signalement" className="btn-secondary px-4 py-2 text-sm">
            Signaler un problème
          </Link>
        </div>
      </div>

      {notification && (
        <div
          role="status"
          className="dossi-card border-l-4 border-l-[#0E7C86] p-4 flex items-center justify-between gap-4"
        >
          <p className="text-sm font-medium text-[#0B2A5B]">{notification}</p>
          <button
            type="button"
            onClick={() => setNotification('')}
            className="text-xs font-semibold text-[#5B6675] hover:text-[#0B2A5B] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Mes dossiers assignés */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="dossi-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2>Mes dossiers assignés ({dossiers.length})</h2>
            </div>

            {dossiers.length === 0 ? (
              <p className="text-sm text-[#5B6675] py-4">
                Aucun dossier assigné actuellement.
              </p>
            ) : (
              <div className="space-y-3">
                {dossiers.map((dossier) => {
                  const estActif = dossierCourant?.id === dossier.id;
                  return (
                    <button
                      key={dossier.id}
                      type="button"
                      onClick={() => setSelectedId(dossier.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                        estActif
                          ? 'bg-[#EEF3F9] border-[#0B2A5B]'
                          : 'bg-white border-[#D5DEEA] hover:bg-[#EEF3F9]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#0B4F9E] tabular-nums">
                          {dossier.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1B7F4B]/15 text-[#1B7F4B]">
                          {dossier.salle}
                        </span>
                      </div>

                      <p className="font-bold text-[#0B2A5B]">
                        {dossier.patient} · {dossier.age} ans
                      </p>
                      <p className="text-xs text-[#5B6675] mt-1 mb-2.5">
                        {dossier.motifTriage}
                      </p>

                      <PriorityBadge level={dossier.priorite} size="sm" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Colonne droite : Dossier patient actif */}
        <section className="lg:col-span-8">
          {!dossierCourant ? (
            <div className="dossi-card p-8 text-center text-sm text-[#5B6675]">
              Sélectionnez un dossier assigné ou consultez la file d’attente.
            </div>
          ) : (
            <div className="dossi-card p-5 sm:p-6 space-y-6">
              {/* En-tête du dossier patient */}
              <div className="border-b border-[#D5DEEA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-[#0B2A5B]">
                      {dossierCourant.patient} ({dossierCourant.age} ans)
                    </h2>
                    <PriorityBadge level={dossierCourant.priorite} size="sm" />
                  </div>
                  <p className="text-xs text-[#5B6675] tabular-nums mt-1">
                    Dossier {dossierCourant.id} · {dossierCourant.salle} · Arrivée{' '}
                    {dossierCourant.arrivee}
                  </p>
                  <p className="text-sm text-slate-800 mt-1.5">
                    <span className="font-semibold text-[#0B2A5B]">Triage :</span>{' '}
                    {dossierCourant.motifTriage}
                  </p>
                </div>
              </div>

              {/* Navigation par onglets du dossier */}
              <div className="flex flex-wrap gap-2 border-b border-[#D5DEEA] pb-3">
                {[
                  { id: 'observations', label: 'Observations médicales' },
                  { id: 'examens', label: 'Examens et résultats' },
                  { id: 'reevaluation', label: 'Demande de réévaluation' },
                  { id: 'historique', label: 'Historique des passages' },
                  { id: 'cloture', label: 'Orientation et clôture' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOnglet(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      onglet === tab.id
                        ? 'bg-[#0B2A5B] text-white'
                        : 'bg-[#EEF3F9] text-[#5B6675] hover:text-[#0B2A5B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Contenu de l'onglet actif */}
              {onglet === 'observations' && (
                <div className="space-y-4">
                  <form onSubmit={handleAjouterObservation} className="space-y-3">
                    <label
                      htmlFor="obs-med"
                      className="block text-sm font-semibold text-[#0B2A5B]"
                    >
                      Nouvelle observation clinique
                    </label>
                    <textarea
                      id="obs-med"
                      rows={3}
                      value={nouvelleObservation}
                      onChange={(e) => setNouvelleObservation(e.target.value)}
                      placeholder="Saisir l'examen clinique, le diagnostic évoqué et la conduite à tenir..."
                      className="w-full rounded-lg border border-[#D5DEEA] p-3 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-4 py-2 text-sm cursor-pointer disabled:opacity-60"
                    >
                      Enregistrer l’observation
                    </button>
                  </form>

                  <div className="space-y-2.5 pt-2">
                    {dossierCourant.observations.length === 0 ? (
                      <p className="text-sm text-[#5B6675]">
                        Aucune observation médicale saisie pour ce passage.
                      </p>
                    ) : (
                      dossierCourant.observations.map((obs, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg bg-[#EEF3F9]/70 border border-[#D5DEEA]"
                        >
                          <span className="text-xs font-bold text-[#0B4F9E] tabular-nums">
                            {obs.heure}
                          </span>
                          <p className="text-sm text-slate-900 mt-1">{obs.texte}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {onglet === 'examens' && (
                <div className="space-y-4">
                  <form
                    onSubmit={handlePrescrireExamen}
                    className="flex flex-col sm:flex-row gap-2.5"
                  >
                    <input
                      type="text"
                      value={nouvelExamen}
                      onChange={(e) => setNouvelExamen(e.target.value)}
                      placeholder="Ex. Radiographie thorax, Ionogramme sanguin..."
                      className="flex-1 rounded-lg border border-[#D5DEEA] px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-4 py-2 text-sm shrink-0 cursor-pointer disabled:opacity-60"
                    >
                      Prescrire un examen
                    </button>
                  </form>

                  <div className="divide-y divide-[#D5DEEA] border border-[#D5DEEA] rounded-lg">
                    {dossierCourant.examens.length === 0 ? (
                      <p className="p-4 text-sm text-[#5B6675]">
                        Aucun examen prescrit pour ce dossier.
                      </p>
                    ) : (
                      dossierCourant.examens.map((ex) => (
                        <div key={ex.id} className="p-4 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-[#0B2A5B]">
                              {ex.libelle}
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#0B4F9E]/15 text-[#0B4F9E]">
                              {ex.statut}
                            </span>
                          </div>
                          <p className="text-xs text-[#5B6675]">{ex.resultat}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {onglet === 'reevaluation' && (
                <form onSubmit={handleDemanderReevaluation} className="space-y-4">
                  <p className="text-sm text-[#5B6675]">
                    Cette demande génère une alerte prioritaire dans l’espace infirmier afin de réévaluer le niveau P1–P4 du patient.
                  </p>
                  <div>
                    <label
                      htmlFor="motif-reeval-med"
                      className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
                    >
                      Motif clinique de la réévaluation *
                    </label>
                    <textarea
                      id="motif-reeval-med"
                      rows={3}
                      value={motifReevaluation}
                      onChange={(e) => setMotifReevaluation(e.target.value)}
                      placeholder="Indiquez l'évolution clinique constatée..."
                      className="w-full rounded-lg border border-[#D5DEEA] p-3 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-4 py-2 text-sm cursor-pointer disabled:opacity-60"
                  >
                    Envoyer la demande à l’infirmier
                  </button>
                </form>
              )}

              {onglet === 'historique' && (
                <div className="space-y-3">
                  {(!dossierCourant.historiquePassages ||
                    dossierCourant.historiquePassages.length === 0) ? (
                    <p className="text-sm text-[#5B6675]">
                      Aucun passage antérieur enregistré pour ce patient.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#D5DEEA] border border-[#D5DEEA] rounded-lg">
                      {dossierCourant.historiquePassages.map((pass) => (
                        <div
                          key={pass.dossier}
                          className="p-3.5 flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-semibold text-[#0B2A5B] tabular-nums">
                              {pass.date} · {pass.dossier}
                            </p>
                            <p className="text-xs text-[#5B6675]">
                              {pass.conclusion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {onglet === 'cloture' && (
                <form onSubmit={handleCloturerDossier} className="space-y-4">
                  <div>
                    <label
                      htmlFor="issue-orientation"
                      className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
                    >
                      Décision d’orientation
                    </label>
                    <select
                      id="issue-orientation"
                      value={issueCloture}
                      onChange={(e) => setIssueCloture(e.target.value)}
                      className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none"
                    >
                      <option>Sortie avec ordonnance et consignes</option>
                      <option>Hospitalisation — Service de médecine</option>
                      <option>Hospitalisation — Chirurgie</option>
                      <option>Transfert vers un autre établissement</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="consignes-patient"
                      className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
                    >
                      Consignes visibles par le patient
                    </label>
                    <textarea
                      id="consignes-patient"
                      rows={3}
                      value={consignesSortie}
                      onChange={(e) => setConsignesSortie(e.target.value)}
                      placeholder="Consignes de surveillance, traitement ou rendez-vous de contrôle..."
                      className="w-full rounded-lg border border-[#D5DEEA] p-3 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-5 py-2.5 text-sm cursor-pointer disabled:opacity-60"
                  >
                    Valider l’orientation et clôturer le dossier
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}