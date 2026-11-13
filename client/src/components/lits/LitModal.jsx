import { useEffect, useState } from 'react';
import { Bed, AlertTriangle, CheckCircle2, UserRound } from 'lucide-react';
import Modal from '../common/Modal';
import PriorityBadge from '../ui/PriorityBadge';
import api, { translateError } from '../../services/api';
import { LIT_STATUTS, STATUT_LABELS } from '../../utils/format';

/**
 * LitModal — Fenêtre de gestion d'un box (Phase 4).
 * Espace Responsable : clic sur un box → changement d'état
 * (libre → occupé → nettoyage) + affectation d'un patient.
 */
export default function LitModal({ open, lit, patients, onClose, onSuccess }) {
  const [statut, setStatut] = useState('libre');
  const [patientId, setPatientId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Réinitialisation à chaque ouverture
  useEffect(() => {
    if (!open) return;
    setError('');
    setStatut(lit?.statut || 'libre');
    setPatientId(lit?.patientAffecte?._id || '');
  }, [open, lit]);

  // Patients affectables : actifs (non sortis) et sans box (ou déjà dans CE box)
  const affectables = (patients || []).filter(
    (p) =>
      p.statut !== 'sorti' &&
      (!p.litActuel || (lit && p.litActuel._id === lit._id))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.patch(`/lits/${lit._id}`, {
        statut,
        patientId: statut === 'occupe' ? patientId || null : null,
      });
      onSuccess?.(`${lit.numeroBox} mis à jour : ${LIT_STATUTS[statut]?.label}.`);
      onClose();
    } catch (err) {
      setError(translateError(err, 'Erreur lors de la mise à jour du box.'));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full p-2 border border-gray-300 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue';

  const patientActuel = lit?.patientAffecte;
  const dossierActuel = patientActuel?.dossierActif;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${lit?.numeroBox || ''}`}
      subtitle={lit?.service}
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
            form="form-lit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-navy text-white text-sm font-bold transition disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {saving ? 'Mise à jour…' : 'Valider'}
          </button>
        </div>
      }
    >
      {lit && (
        <form id="form-lit" onSubmit={handleSubmit} className="space-y-5">
          {/* État actuel */}
          <div className="bg-brand-bg rounded-lg p-3 text-sm flex items-center justify-between">
            <span className="text-brand-slate">
              État actuel :{' '}
              <b className="text-brand-navy">{LIT_STATUTS[lit.statut]?.label || lit.statut}</b>
            </span>
            {patientActuel && (
              <span className="text-brand-slate flex items-center gap-1.5">
                <UserRound size={14} />
                <b className="text-brand-navy">
                  {patientActuel.prenom} {patientActuel.nom}
                </b>
                {dossierActuel?.priorite && <PriorityBadge level={dossierActuel.priorite} />}
              </span>
            )}
          </div>

          {/* Changement d'état */}
          <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="px-2 text-sm font-bold text-brand-navy flex items-center gap-1.5">
              <Bed size={14} /> Nouvel état du box
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(LIT_STATUTS).map(([code, conf]) => (
                <label
                  key={code}
                  className={`flex items-center justify-center gap-2 border-2 rounded-lg px-3 py-2.5 cursor-pointer text-sm font-bold transition ${conf.classes} ${
                    statut === code ? 'ring-2 ring-brand-blue' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="statut-lit"
                    value={code}
                    checked={statut === code}
                    onChange={() => setStatut(code)}
                    className="sr-only"
                  />
                  {conf.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Affectation du patient */}
          {statut === 'occupe' && (
            <div>
              <label className="block text-sm font-bold text-brand-navy mb-1">
                Patient affecté à ce box
              </label>
              {affectables.length === 0 ? (
                <p className="text-sm text-brand-slate bg-brand-bg rounded-lg p-3">
                  Aucun patient actif sans box. Les patients venant de l'accueil et l'infirmier
                  apparaissent ici dès leur enregistrement.
                </p>
              ) : (
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">— Sélectionner un patient —</option>
                  {affectables.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nom} {p.prenom} — {STATUT_LABELS[p.statut]}
                      {p.dossierActif?.priorite ? ` (${p.dossierActif.priorite})` : ''}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-brand-slate mt-1.5">
                Affecter un patient le retire automatiquement de son ancien box (aucune double
                affectation possible).
              </p>
            </div>
          )}

          {statut !== 'occupe' && patientActuel && (
            <p className="text-xs text-priority-p2 bg-orange-50 border border-orange-100 rounded-lg p-2.5">
              Le patient {patientActuel.prenom} {patientActuel.nom} sera retiré de ce box.
            </p>
          )}

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
