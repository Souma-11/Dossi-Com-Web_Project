import { useState } from 'react';
import { ClipboardList, Activity, AlertCircle, RefreshCw, BellRing, CheckCheck } from 'lucide-react';
import useApi from '../hooks/useApi';
import TriageModal from '../components/patients/TriageModal';
import PriorityBadge from '../components/ui/PriorityBadge';
import api, { translateError } from '../services/api';
import { dureeDepuis, heureFr } from '../utils/format';

/**
 * Espace Infirmier (IAO) — File d'attente & Tri (Phase 4).
 * - Patients "À trier" (venant de l'accueil) → bouton "Évaluer" → TriageModal
 * - Patients déjà triés (réévaluation possible avec le même formulaire)
 * - Alertes "Mon état s'aggrave" envoyées par les patients (temps réel)
 * - Temps réel : un patient ajouté à l'Accueil apparaît immédiatement ici
 */
const SEUIL_ALERTE_MIN = 30; // seuil d'alerte visuelle au-delà de 30 min d'attente

export default function InfirmierDashboard() {
  const { data, loading, error, refresh } = useApi('/patients', { pollMs: 15000 });
  const [modalPatient, setModalPatient] = useState(null); // patient en cours d'évaluation
  const [flash, setFlash] = useState('');
  const [traitementEnCours, setTraitementEnCours] = useState('');

  const patients = data?.patients || [];

  const aTrier = patients
    .filter((p) => p.statut === 'en_attente_triage')
    .sort((a, b) => new Date(a.dateArrivee) - new Date(b.dateArrivee));

  const dejaTries = patients.filter((p) =>
    ['en_attente_consultation', 'en_consultation'].includes(p.statut)
  );

  const alertes = patients.filter((p) => p.dossierActif?.alerteAggravation?.active);

  const afficherFlash = (message) => {
    setFlash(message);
    setTimeout(() => setFlash(''), 5000);
  };

  /** Acquitter une alerte d'aggravation */
  const traiterAlerte = async (patient) => {
    setTraitementEnCours(patient._id);
    try {
      const res = await api.patch(`/patients/${patient._id}/aggravation`);
      afficherFlash(res.data.message);
      refresh(true);
    } catch (err) {
      afficherFlash(translateError(err, 'Erreur lors du traitement de l\'alerte.'));
    } finally {
      setTraitementEnCours('');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="font-title text-2xl text-brand-navy flex items-center gap-2">
            <ClipboardList className="text-brand-turquoise" />
            Espace Infirmier (IAO) — File d'attente & Tri
          </h1>
          <p className="text-brand-slate text-sm mt-1">
            Évaluation des patients, saisie des constantes et attribution des niveaux de priorité P1 à P4.
          </p>
        </div>
        <button
          onClick={() => refresh()}
          title="Rafraîchir la liste"
          className="p-2 rounded-lg border border-gray-200 hover:bg-brand-bg text-brand-slate hover:text-brand-navy transition"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Messages flash */}
      {flash && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCheck size={16} className="shrink-0" />
          {flash}
        </div>
      )}

      {/* Alertes d'aggravation (temps réel) */}
      {alertes.length > 0 && (
        <div className="bg-red-50 border-2 border-priority-p1 rounded-lg p-4">
          <h2 className="font-bold text-priority-p1 flex items-center gap-2 mb-3">
            <BellRing size={18} className="animate-pulse" />
            Alertes à traiter — « Mon état s'aggrave » ({alertes.length})
          </h2>
          <div className="space-y-2">
            {alertes.map((p) => (
              <div
                key={p._id}
                className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-lg border border-red-200 px-4 py-2.5"
              >
                <div className="text-sm">
                  <span className="font-bold text-brand-navy">
                    {p.nom} {p.prenom}
                  </span>
                  <span className="text-brand-slate">
                    {' '}— signalé à {heureFr(p.dossierActif?.alerteAggravation?.dateSignalement)} ·{' '}
                    {STATUT(p)}
                  </span>
                </div>
                <button
                  onClick={() => traiterAlerte(p)}
                  disabled={traitementEnCours === p._id}
                  className="flex items-center gap-1.5 bg-priority-p1 hover:bg-red-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition disabled:opacity-60"
                >
                  <CheckCheck size={14} />
                  {traitementEnCours === p._id ? 'Traitement…' : 'Traiter'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Liste des patients à trier */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-brand-navy">Patients à trier ({aTrier.length})</h2>
          <AlertCircle size={20} className="text-brand-slate" />
        </div>

        {loading ? (
          <p className="p-6 text-center text-sm text-brand-slate">Chargement de la file de tri…</p>
        ) : aTrier.length === 0 ? (
          <p className="p-6 text-center text-sm text-brand-slate">
            Aucun patient en attente de tri. Les nouvelles admissions de l'accueil apparaîtront ici
            automatiquement (temps réel).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase text-brand-slate border-b">
                  <th className="p-4">Patient</th>
                  <th className="p-4">Motif d'admission</th>
                  <th className="p-4">Attente</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aTrier.map((patient) => {
                  const attente = dureeDepuis(patient.dateArrivee);
                  const depasse = minutesDepuis(patient.dateArrivee) > SEUIL_ALERTE_MIN;
                  return (
                    <tr key={patient._id} className={`transition ${depasse ? 'bg-red-50/60' : 'hover:bg-brand-bg'}`}>
                      <td className="p-4">
                        <p className="font-bold text-brand-navy">
                          {patient.nom} {patient.prenom}
                        </p>
                        <p className="text-xs text-brand-slate">
                          {patient.numeroDossier} · {patient.age} ans
                        </p>
                      </td>
                      <td className="p-4 text-sm text-brand-slate max-w-[260px]">
                        {patient.dossierActif?.motifAdmission || '—'}
                      </td>
                      <td className={`p-4 text-sm font-semibold ${depasse ? 'text-priority-p1' : 'text-brand-darkTurquoise'}`}>
                        {attente}
                        {depasse && (
                          <span className="ml-1.5 text-xs bg-priority-p1 text-white px-1.5 py-0.5 rounded-full font-bold">
                            Retard
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setModalPatient(patient)}
                          className="flex items-center justify-center gap-1 mx-auto bg-brand-blue hover:bg-brand-navy text-white text-xs font-bold py-1.5 px-3 rounded transition"
                        >
                          <Activity size={14} />
                          Évaluer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patients déjà triés — file médicale + réévaluation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-bold text-brand-navy">
            Patients triés — en attente de consultation ({dejaTries.length})
          </h2>
          <p className="text-xs text-brand-slate mt-0.5">
            Réévaluation possible (même formulaire, motif du changement conservé).
          </p>
        </div>
        {dejaTries.length === 0 ? (
          <p className="p-6 text-center text-sm text-brand-slate">Aucun patient trié pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase text-brand-slate border-b">
                  <th className="p-4">Patient</th>
                  <th className="p-4">Priorité</th>
                  <th className="p-4">Depuis le tri</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dejaTries.map((patient) => (
                  <tr key={patient._id} className="hover:bg-brand-bg transition">
                    <td className="p-4">
                      <p className="font-bold text-brand-navy">
                        {patient.nom} {patient.prenom}
                      </p>
                      <p className="text-xs text-brand-slate">{patient.numeroDossier}</p>
                    </td>
                    <td className="p-4">
                      <PriorityBadge level={patient.dossierActif?.priorite} />
                    </td>
                    <td className="p-4 text-sm text-brand-darkTurquoise font-semibold">
                      {dureeDepuis(patient.dossierActif?.dateTriage)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setModalPatient(patient)}
                        className="flex items-center justify-center gap-1 mx-auto bg-brand-bg hover:bg-gray-200 text-brand-navy border border-gray-300 text-xs font-bold py-1.5 px-3 rounded transition"
                      >
                        <Activity size={14} />
                        Réévaluer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Légende des priorités (composant réutilisable) */}
      <div className="bg-brand-bg p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-bold text-brand-navy mb-3">Rappel des niveaux de priorité :</h3>
        <div className="flex flex-wrap gap-3">
          <PriorityBadge level="P1" />
          <PriorityBadge level="P2" />
          <PriorityBadge level="P3" />
          <PriorityBadge level="P4" />
        </div>
      </div>

      {/* Fenêtre d'évaluation / triage */}
      <TriageModal
        open={!!modalPatient}
        patient={modalPatient}
        onClose={() => setModalPatient(null)}
        onSuccess={(message) => {
          afficherFlash(message);
          refresh(true);
        }}
      />
    </div>
  );
}

/** petit helper de libellé statut */
function STATUT(p) {
  const labels = {
    en_attente_triage: 'en attente de tri',
    en_attente_consultation: 'en attente de consultation',
    en_consultation: 'en consultation',
    sorti: 'sorti',
  };
  return labels[p.statut] || p.statut;
}

function minutesDepuis(dateStr) {
  if (!dateStr) return 0;
  return Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
}
