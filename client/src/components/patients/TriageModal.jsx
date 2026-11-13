import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, Save, ClipboardList } from 'lucide-react';
import Modal from '../common/Modal';
import PriorityBadge from '../ui/PriorityBadge';
import { suggererPriorite, PRIORITES } from '../../utils/triage';
import { dureeDepuis, STATUT_LABELS } from '../../utils/format';
import { translateError } from '../../services/api';
import api from '../../services/api';

/**
 * TriageModal — Fenêtre de saisie des constantes vitales (Phase 4).
 * Espace Infirmier (IAO) : tension, température, FC, SpO2, douleur…
 * → suggestion indicative P1–P4 calculée, mais LA PRIORITÉ FINALE EST
 *   CONFIRMÉE MANUELLEMENT par l'infirmier (règle métier du projet).
 */
export default function TriageModal({ open, patient, onClose, onSuccess }) {
  const [constantes, setConstantes] = useState({
    tensionSystolique: '',
    tensionDiastolique: '',
    temperature: '',
    frequenceCardiaque: '',
    spO2: '',
    frequenceRespiratoire: '',
    douleur: 0,
    glycemie: '',
  });
  const [priorite, setPriorite] = useState('');
  const [observations, setObservations] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const dossier = patient?.dossierActif;

  // Suggestion indicative recalculée en direct à chaque frappe
  const suggestion = useMemo(
    () =>
      suggererPriorite({
        tension:
          constantes.tensionSystolique && constantes.tensionDiastolique
            ? `${constantes.tensionSystolique}/${constantes.tensionDiastolique}`
            : '',
        temperature: constantes.temperature,
        frequenceCardiaque: constantes.frequenceCardiaque,
        spO2: constantes.spO2,
        frequenceRespiratoire: constantes.frequenceRespiratoire,
        douleur: constantes.douleur,
        glycemie: constantes.glycemie,
      }),
    [constantes]
  );

  const setField = (field, value) => setConstantes((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!priorite) {
      setError('Veuillez sélectionner le niveau de priorité (P1 à P4) après évaluation.');
      return;
    }

    setSaving(true);
    try {
      const tension =
        constantes.tensionSystolique && constantes.tensionDiastolique
          ? `${constantes.tensionSystolique}/${constantes.tensionDiastolique}`
          : constantes.tensionSystolique || '';

      await api.patch(`/patients/${patient._id}/triage`, {
        constantesVitales: {
          tension,
          temperature: constantes.temperature || null,
          frequenceCardiaque: constantes.frequenceCardiaque || null,
          spO2: constantes.spO2 || null,
          frequenceRespiratoire: constantes.frequenceRespiratoire || null,
          douleur: constantes.douleur || 0,
          glycemie: constantes.glycemie || null,
        },
        priorite,
        observationsTriage: observations,
      });
      onSuccess?.(`Tri de ${patient.prenom} ${patient.nom} enregistré — priorité ${priorite}.`);
      onClose();
    } catch (err) {
      setError(translateError(err, 'Erreur lors de l\'enregistrement du tri.'));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full p-2 border border-gray-300 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Évaluer — ${patient?.prenom} ${patient?.nom}`}
      subtitle={`Dossier ${patient?.numeroDossier} · ${patient?.age} ans · ${dossier?.motifAdmission || 'motif non renseigné'}`}
      footer={
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-brand-slate hover:bg-white transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="form-triage"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-navy text-white text-sm font-bold transition disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Enregistrement…' : 'Enregistrer le triage'}
          </button>
        </div>
      }
    >
      {patient && (
        <form id="form-triage" onSubmit={handleSubmit} className="space-y-5">
          {/* Bandeau patient */}
          <div className="flex flex-wrap items-center gap-3 bg-brand-bg rounded-lg p-3 text-sm">
            <ClipboardList size={18} className="text-brand-blue" />
            <span className="font-semibold text-brand-navy">{STATUT_LABELS[patient.statut]}</span>
            <span className="text-brand-slate">
              Arrivé(e) il y a <span className="font-bold text-brand-darkTurquoise">{dureeDepuis(patient.dateArrivee)}</span>
            </span>
          </div>

          {/* Constantes vitales */}
          <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="px-2 text-sm font-bold text-brand-navy flex items-center gap-1">
              <Activity size={14} /> Constantes vitales
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-slate mb-1">Tension syst. (mmHg)</label>
                <input type="number" min="50" max="260" value={constantes.tensionSystolique}
                  onChange={(e) => setField('tensionSystolique', e.target.value)}
                  className={inputClass} placeholder="125" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate mb-1">Tension diast. (mmHg)</label>
                <input type="number" min="30" max="160" value={constantes.tensionDiastolique}
                  onChange={(e) => setField('tensionDiastolique', e.target.value)}
                  className={inputClass} placeholder="80" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate mb-1">Température (°C)</label>
                <input type="number" step="0.1" min="30" max="43" value={constantes.temperature}
                  onChange={(e) => setField('temperature', e.target.value)}
                  className={inputClass} placeholder="37.2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate mb-1">Fréq. cardiaque (bpm)</label>
                <input type="number" min="20" max="240" value={constantes.frequenceCardiaque}
                  onChange={(e) => setField('frequenceCardiaque', e.target.value)}
                  className={inputClass} placeholder="80" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate mb-1">SpO2 (%)</label>
                <input type="number" min="50" max="100" value={constantes.spO2}
                  onChange={(e) => setField('spO2', e.target.value)}
                  className={inputClass} placeholder="97" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate mb-1">Fréq. resp. (/min)</label>
                <input type="number" min="5" max="60" value={constantes.frequenceRespiratoire}
                  onChange={(e) => setField('frequenceRespiratoire', e.target.value)}
                  className={inputClass} placeholder="16" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate mb-1">Glycémie (g/L)</label>
                <input type="number" step="0.1" min="0" max="6" value={constantes.glycemie}
                  onChange={(e) => setField('glycemie', e.target.value)}
                  className={inputClass} placeholder="1.0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate mb-1">
                  Douleur (EVA) : <span className="text-brand-navy">{constantes.douleur}/10</span>
                </label>
                <input type="range" min="0" max="10" step="1" value={constantes.douleur}
                  onChange={(e) => setField('douleur', e.target.value)}
                  className="w-full accent-brand-blue mt-2" />
              </div>
            </div>
          </fieldset>

          {/* Suggestion indicative du système */}
          {(suggestion.motifs.length > 0 || priorite) && (
            <div className={`rounded-lg p-3 border text-sm ${suggestion.niveau === 'P1' ? 'border-red-200 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
              <p className="font-bold text-brand-navy flex items-center gap-1.5 text-xs uppercase">
                <AlertTriangle size={14} className={suggestion.niveau === 'P1' ? 'text-priority-p1' : 'text-brand-blue'} />
                Suggestion indicative du système — décision humaine obligatoire
              </p>
              <p className="mt-1 text-brand-slate">
                {suggestion.motifs.length > 0 ? (
                  <>
                    Critères détectés : {suggestion.motifs.join(' · ')} →{' '}
                    <span className="font-bold text-brand-navy">niveau suggéré {suggestion.niveau}</span>
                  </>
                ) : (
                  'Aucun critère d\'alerte détecté dans les constantes saisies.'
                )}
              </p>
            </div>
          )}

          {/* Choix de la priorité — décision de l'infirmier */}
          <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="px-2 text-sm font-bold text-brand-navy">Niveau de priorité (P1 à P4)</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITES.map((p) => (
                <label
                  key={p.code}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer text-sm font-semibold transition ${
                    priorite === p.code
                      ? 'border-brand-blue bg-brand-bg text-brand-navy ring-1 ring-brand-blue'
                      : 'border-gray-200 text-brand-slate hover:border-brand-blue'
                  }`}
                >
                  <input
                    type="radio"
                    name="priorite"
                    value={p.code}
                    checked={priorite === p.code}
                    onChange={() => setPriorite(p.code)}
                    className="accent-brand-blue"
                  />
                  {p.label}
                </label>
              ))}
            </div>
            {priorite && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-brand-slate">Aperçu :</span>
                <PriorityBadge level={priorite} />
              </div>
            )}
          </fieldset>

          {/* Observations */}
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-1">
              Observations du tri <span className="text-brand-slate font-normal">(obligatoires)</span>
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              required
              className={`${inputClass} h-20 resize-none`}
              placeholder="Ex : douleur thoracique atypique, ECG normal, à réévaluer dans 30 min…"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}
