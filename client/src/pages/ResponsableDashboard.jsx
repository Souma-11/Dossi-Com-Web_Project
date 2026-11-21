import { useEffect, useState } from 'react';
import { StatusBadge } from '../components/ui/PriorityBadge';
import { urgenceService } from '../services/urgenceService';

export default function ResponsableDashboard() {
  const [patientsEnAttente, setPatientsEnAttente] = useState(0);
  const [reclamations, setReclamations] = useState([]);
  const [reclamationOuverte, setReclamationOuverte] = useState(null);
  const [texteReponse, setTexteReponse] = useState('');

  const [salles, setSalles] = useState([]);
  const [showHistoriqueSalles, setShowHistoriqueSalles] = useState(false);

  const [journal, setJournal] = useState([]);
  const [filtreJournal, setFiltreJournal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await urgenceService.getResponsableData();
        if (!isMounted || !data) return;

        setPatientsEnAttente(data.patientsEnAttente ?? 0);
        setSalles(Array.isArray(data.salles) ? data.salles : []);
        setReclamations(Array.isArray(data.reclamations) ? data.reclamations : []);
        setJournal(Array.isArray(data.journal) ? data.journal : []);
      } catch (err) {
        console.error('Erreur chargement espace responsable :', err);
      }
    };

    loadData();
    window.addEventListener('dossicom:db-updated', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('dossicom:db-updated', loadData);
    };
  }, []);

  const sallesHorsService = salles.filter((s) => s.etat === 'maintenance').length;
  const reclamationsOuvertes = reclamations.filter(
    (r) => r.statut !== 'Traité'
  ).length;
  const signalementsNonLus = reclamations.filter(
    (r) => r.statut === 'Nouveau'
  ).length;

  const handleOuvrirReclamation = (rec) => {
    setReclamationOuverte(rec);
    setTexteReponse(
      rec.reponse && rec.reponse !== 'En attente de lecture par le responsable.'
        ? rec.reponse
        : ''
    );
  };

  const handleRepondreReclamation = async (e) => {
    e.preventDefault();
    if (!reclamationOuverte || !texteReponse.trim() || submitting) return;

    setSubmitting(true);
    try {
      await urgenceService.repondreReclamation(
        reclamationOuverte.id,
        texteReponse.trim()
      );
      setReclamationOuverte(null);
      setTexteReponse('');
    } catch (err) {
      console.error('Erreur réponse réclamation :', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMaintenanceSalle = async (salleId) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await urgenceService.toggleMaintenanceSalle(salleId);
    } catch (err) {
      console.error('Erreur bascule maintenance salle :', err);
    } finally {
      setSubmitting(false);
    }
  };

  const journalFiltre = journal.filter((ligne) =>
    `${ligne.heure} ${ligne.utilisateur} ${ligne.evenement} ${ligne.objet}`
      .toLowerCase()
      .includes(filtreJournal.toLowerCase())
  );

  const badgeStatutRec = (statut) => {
    if (statut === 'Traité') {
      return 'bg-[#1B7F4B]/15 text-[#1B7F4B] border border-[#1B7F4B]/30';
    }
    if (statut === 'En cours') {
      return 'bg-[#0B4F9E]/15 text-[#0B4F9E] border border-[#0B4F9E]/30';
    }
    return 'bg-[#B85C00]/15 text-[#B85C00] border border-[#B85C00]/30';
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête */}
      <div>
        <h1>Espace responsable — Supervision</h1>
        <p className="text-caption mt-1">
          Supervision du service, réclamations, maintenance des salles et journal d’événements
        </p>
      </div>

      {/* 4 Indicateurs clés */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dossi-kpi kpi-navy p-5">
          <p className="text-3xl font-bold text-[#0B2A5B] tabular-nums">
            {String(patientsEnAttente).padStart(2, '0')}
          </p>
          <p className="text-sm font-medium text-[#5B6675] mt-1">
            Patients en attente
          </p>
        </div>

        <div className="dossi-kpi kpi-institutional p-5">
          <p className="text-3xl font-bold text-[#0B2A5B] tabular-nums">
            {String(sallesHorsService).padStart(2, '0')}
          </p>
          <p className="text-sm font-medium text-[#5B6675] mt-1">
            Salles hors service
          </p>
        </div>

        <div className="dossi-kpi kpi-warning p-5">
          <p className="text-3xl font-bold text-[#0B2A5B] tabular-nums">
            {String(reclamationsOuvertes).padStart(2, '0')}
          </p>
          <p className="text-sm font-medium text-[#5B6675] mt-1">
            Réclamations ouvertes
          </p>
        </div>

        <div
          className={`dossi-kpi p-5 ${
            signalementsNonLus > 0 ? 'kpi-critical' : 'kpi-turquoise'
          }`}
        >
          <p
            className={`text-3xl font-bold tabular-nums ${
              signalementsNonLus > 0 ? 'text-[#C8102E]' : 'text-[#0B2A5B]'
            }`}
          >
            {String(signalementsNonLus).padStart(2, '0')}
          </p>
          <p className="text-sm font-medium text-[#5B6675] mt-1">
            Signalements non lus
          </p>
        </div>
      </section>

      {/* Grille 2 colonnes : Avis & réclamations + Maintenance des salles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avis et réclamations */}
        <section className="dossi-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2>Avis et réclamations</h2>
            <span className="text-caption">Sans effet sur la priorité médicale</span>
          </div>

          <div className="divide-y divide-[#D5DEEA] border border-[#D5DEEA] rounded-lg">
            {reclamations.length === 0 ? (
              <p className="p-4 text-sm text-[#5B6675]">
                Aucun avis ou réclamation enregistré.
              </p>
            ) : (
              reclamations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${badgeStatutRec(
                        rec.statut
                      )}`}
                    >
                      {rec.statut}
                    </span>
                    <p className="text-sm font-medium text-slate-900 truncate tabular-nums">
                      {rec.type} n° {rec.id} · {rec.objet}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOuvrirReclamation(rec)}
                    className="btn-secondary px-3.5 py-1.5 text-xs shrink-0 cursor-pointer"
                  >
                    Ouvrir
                  </button>
                </div>
              ))
            )}
          </div>

          {reclamationOuverte && (
            <form
              onSubmit={handleRepondreReclamation}
              className="p-4 rounded-lg bg-[#EEF3F9] border border-[#D5DEEA] space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#0B2A5B]">
                  {reclamationOuverte.type} n° {reclamationOuverte.id}
                </p>
                <button
                  type="button"
                  onClick={() => setReclamationOuverte(null)}
                  className="text-xs font-semibold text-[#5B6675] hover:text-[#0B2A5B] cursor-pointer"
                >
                  Fermer
                </button>
              </div>
              <p className="text-xs text-slate-800">
                « {reclamationOuverte.message} »
              </p>
              <textarea
                rows={2}
                value={texteReponse}
                onChange={(e) => setTexteReponse(e.target.value)}
                placeholder="Saisir la réponse qui sera affichée au patient..."
                className="w-full rounded-lg border border-[#D5DEEA] bg-white p-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-4 py-1.5 text-xs cursor-pointer disabled:opacity-60"
              >
                {submitting
                  ? 'Enregistrement...'
                  : 'Répondre et marquer comme traité'}
              </button>
            </form>
          )}
        </section>

        {/* Maintenance des salles */}
        <section className="dossi-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2>Maintenance des salles</h2>
            <span className="text-caption">Blocage automatique des affectations</span>
          </div>

          <div className="overflow-x-auto border border-[#D5DEEA] rounded-lg">
            <table className="dossi-table w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Salle</th>
                  <th className="py-3 px-4 font-semibold">État</th>
                  <th className="py-3 px-4 font-semibold">Depuis</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DEEA] text-sm">
                {salles.map((salle) => {
                  const enMaintenance = salle.etat === 'maintenance';
                  const statutBadge =
                    salle.etatAffichage ||
                    (enMaintenance ? 'maintenance' : 'operationnelle');
                  return (
                    <tr key={salle.id} className="hover:bg-[#EEF3F9]/50">
                      <td className="py-3 px-4 font-bold text-[#0B2A5B]">
                        {salle.id}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={statutBadge} />
                      </td>
                      <td className="py-3 px-4 text-[#5B6675] tabular-nums">
                        {salle.depuis}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleToggleMaintenanceSalle(salle.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-60 ${
                            enMaintenance ? 'btn-primary' : 'btn-secondary'
                          }`}
                        >
                          {enMaintenance ? 'Clôturer' : 'Déclarer'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowHistoriqueSalles(!showHistoriqueSalles)}
              className="text-xs font-semibold text-[#0B4F9E] hover:underline cursor-pointer"
            >
              {showHistoriqueSalles
                ? '− Masquer l’historique par salle'
                : '+ Historique par salle'}
            </button>

            {showHistoriqueSalles && (
              <div className="mt-2.5 p-3 rounded-lg bg-[#EEF3F9] border border-[#D5DEEA] text-xs text-[#5B6675] space-y-1">
                {journal
                  .filter((j) => j.objet?.startsWith('Salle'))
                  .slice(0, 4)
                  .map((j, index) => (
                    <p key={index}>
                      • {j.objet} : {j.evenement} ({j.heure})
                    </p>
                  ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Journal d'événements (consultation filtrable, aucune modification possible) */}
      <section className="dossi-card overflow-hidden">
        <div className="p-5 border-b border-[#D5DEEA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2>Journal d’événements</h2>
            <p className="text-caption">
              Traçabilité complète en lecture seule (aucune modification possible)
            </p>
          </div>

          <input
            type="search"
            value={filtreJournal}
            onChange={(e) => setFiltreJournal(e.target.value)}
            placeholder="Filtrer : heure, utilisateur, type..."
            className="w-full sm:w-72 rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="dossi-table w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wider">
                <th className="py-3.5 px-5 font-semibold">Heure</th>
                <th className="py-3.5 px-5 font-semibold">Utilisateur</th>
                <th className="py-3.5 px-5 font-semibold">Événement</th>
                <th className="py-3.5 px-5 font-semibold">Dossier / objet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DEEA] text-sm">
              {journalFiltre.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#EEF3F9]/50">
                  <td className="py-3.5 px-5 font-semibold text-[#5B6675] tabular-nums">
                    {item.heure}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[#0B2A5B]">
                    {item.utilisateur}
                  </td>
                  <td className="py-3.5 px-5 text-slate-800">
                    {item.evenement}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[#0B4F9E] tabular-nums">
                    {item.objet}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}