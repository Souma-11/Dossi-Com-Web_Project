import { useState } from 'react';
import { Stethoscope, Eye, RefreshCw, Activity, ClipboardList } from 'lucide-react';
import useApi from '../hooks/useApi';
import ConsultationModal from '../components/patients/ConsultationModal';
import PriorityBadge from '../components/ui/PriorityBadge';
import api from '../services/api';
import { trierFile, dureeDepuis, STATUT_LABELS } from '../utils/format';

/**
 * Espace Médecin — Consultations (Phase 4).
 * - File d'attente médicale : patients triés par l'IAO (P1 → P4, puis ancienneté)
 * - Bouton "Consulter" → ConsultationModal (compte-rendu, prescriptions, clôture)
 * - Le médecin consulte la priorité SANS pouvoir la modifier (règle métier)
 * - Temps réel : un patient trié par l'Infirmier apparaît immédiatement ici
 */
export default function MedecinDashboard() {
  const { data, loading, error, refresh } = useApi('/patients', { pollMs: 15000 });
  const [consultationId, setConsultationId] = useState(null); // patient en cours de consultation
  const [flash, setFlash] = useState('');
  const [demarrageEnCours, setDemarrageEnCours] = useState('');

  const patients = trierFile(
    (data?.patients || []).filter((p) =>
      ['en_attente_consultation', 'en_consultation'].includes(p.statut)
    )
  );

  const afficherFlash = (message) => {
    setFlash(message);
    setTimeout(() => setFlash(''), 6000);
  };

  /**
   * "Consulter" démarre la prise en charge : PATCH sans clôture →
   * le patient passe en "en_consultation" et le médecin est enregistré
   * comme responsable. Puis la fenêtre de consultation s'ouvre.
   */
  const ouvrirConsultation = async (patient) => {
    setDemarrageEnCours(patient._id);
    try {
      if (patient.statut === 'en_attente_consultation') {
        await api.patch(`/patients/${patient._id}/consultation`, {});
      }
      setConsultationId(patient._id);
    } catch (err) {
      afficherFlash(
        err.response?.data?.message || 'Erreur lors du démarrage de la consultation.'
      );
    } finally {
      setDemarrageEnCours('');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="font-title text-2xl text-brand-navy flex items-center gap-2">
            <Stethoscope className="text-brand-turquoise" />
            Espace Médecin — Consultations
          </h1>
          <p className="text-brand-slate text-sm mt-1">
            Prise en charge médicale des patients triés — classés par priorité puis ancienneté.
          </p>
        </div>
        <button
          onClick={() => refresh()}
          title="Rafraîchir"
          className="p-2 rounded-lg border border-gray-200 hover:bg-brand-bg text-brand-slate hover:text-brand-navy transition"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {flash && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          {flash}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Grille des patients */}
      {loading ? (
        <p className="bg-white border border-gray-200 rounded-lg p-6 text-center text-sm text-brand-slate">
          Chargement de la file médicale…
        </p>
      ) : patients.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <ClipboardList size={32} className="mx-auto text-brand-slate mb-2" />
          <p className="text-sm text-brand-slate">
            Aucun patient en attente de consultation. Les patients triés par l'infirmier IAO apparaîtront
            ici automatiquement (temps réel).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => {
            const cv = patient.dossierActif?.constantesVitales || {};
            const enCours = patient.statut === 'en_consultation';
            return (
              <div
                key={patient._id}
                className={`bg-white rounded-lg shadow-sm border p-5 flex flex-col justify-between hover:shadow-md transition ${
                  enCours ? 'border-brand-blue ring-1 ring-brand-blue' : 'border-gray-200'
                }`}
              >
                {/* Informations du patient */}
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-bold text-lg text-brand-navy">
                      {patient.nom} {patient.prenom}
                    </h3>
                    <PriorityBadge level={patient.dossierActif?.priorite} />
                  </div>
                  <p className="text-sm text-brand-slate mb-2">
                    <span className="font-semibold">Motif :</span>{' '}
                    {patient.dossierActif?.motifAdmission || '—'}
                  </p>
                  <p className="text-xs text-brand-darkTurquoise font-medium mb-2">
                    {STATUT_LABELS[patient.statut]} · depuis{' '}
                    {dureeDepuis(patient.dossierActif?.dateTriage || patient.dateArrivee)}
                  </p>
                  {/* Constantes vitales résumées (saisies par l'IAO) */}
                  <div className="grid grid-cols-2 gap-1 text-xs text-brand-slate bg-brand-bg rounded-lg p-2">
                    <span>Tension : <b className="text-brand-navy">{cv.tension || '—'}</b></span>
                    <span>Temp. : <b className="text-brand-navy">{cv.temperature ?? '—'} °C</b></span>
                    <span>FC : <b className="text-brand-navy">{cv.frequenceCardiaque ?? '—'} bpm</b></span>
                    <span>SpO2 : <b className="text-brand-navy">{cv.spO2 ?? '—'} %</b></span>
                    <span className="col-span-2">
                      Douleur : <b className="text-brand-navy">{cv.douleur ?? '—'}/10</b>
                    </span>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => ouvrirConsultation(patient)}
                    disabled={demarrageEnCours === patient._id}
                    className="flex-1 flex items-center justify-center gap-1 bg-brand-blue hover:bg-brand-navy text-white text-xs font-bold py-2 rounded transition disabled:opacity-60"
                  >
                    <Activity size={14} />
                    {demarrageEnCours === patient._id
                      ? 'Ouverture…'
                      : enCours
                        ? 'Poursuivre la consultation'
                        : 'Consulter'}
                  </button>
                  <button
                    onClick={() => setConsultationId(patient._id)}
                    title="Voir le dossier"
                    className="flex items-center justify-center gap-1 bg-brand-bg hover:bg-gray-200 text-brand-navy text-xs font-bold py-2 px-3 rounded transition border border-gray-300"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fenêtre de consultation */}
      <ConsultationModal
        open={!!consultationId}
        patientId={consultationId}
        onClose={() => setConsultationId(null)}
        onSuccess={(message) => {
          afficherFlash(message);
          refresh(true);
        }}
      />
    </div>
  );
}
