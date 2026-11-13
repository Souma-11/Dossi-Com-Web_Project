import { useEffect, useState } from 'react';
import {
  Stethoscope,
  ClipboardList,
  Pill,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import Modal from '../common/Modal';
import PriorityBadge from '../ui/PriorityBadge';
import { translateError } from '../../services/api';
import api from '../../services/api';
import { ORIENTATIONS, dureeDepuis } from '../../utils/format';

/**
 * ConsultationModal — Fenêtre "Consulter" du Médecin (Phase 4).
 * Rédaction du compte-rendu, prescriptions d'examens, diagnostic et
 * clôture du passage (orientation finale + libération automatique du box).
 */
export default function ConsultationModal({ open, patientId, onClose, onSuccess }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState('');
  const [compteRendu, setCompteRendu] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [nouvellePrescription, setNouvellePrescription] = useState('');
  const [orientation, setOrientation] = useState('en_cours');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Chargement du dossier complet à l'ouverture de la fenêtre
  useEffect(() => {
    if (!open || !patientId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get(`/patients/${patientId}`)
      .then(({ data }) => {
        if (cancelled) return;
        setPatient(data.patient);
        const d = data.patient.dossierActif;
        setDiagnostic(d?.diagnostic || '');
        setCompteRendu(d?.compteRendu || '');
        setPrescriptions(d?.prescriptions || []);
        setOrientation(d?.orientationSortie || 'en_cours');
      })
      .catch((err) => !cancelled && setError(translateError(err, 'Impossible de charger le dossier.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, patientId]);

  const ajouterPrescription = () => {
    const p = nouvellePrescription.trim();
    if (!p) return;
    setPrescriptions((prev) => [...prev, p]);
    setNouvellePrescription('');
  };

  /** Enregistrement sans clôture → statut "en_consultation" */
  const enregistrer = async () => {
    setError('');
    if (!diagnostic.trim()) {
      setError('Le diagnostic est obligatoire pour enregistrer la consultation.');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/patients/${patientId}/consultation`, {
        diagnostic,
        prescriptions,
        compteRendu,
        orientationSortie: orientation,
      });
      onSuccess?.(`Consultation de ${patient?.prenom} ${patient?.nom} enregistrée (en cours).`);
      onClose();
    } catch (err) {
      setError(translateError(err, 'Erreur lors de l\'enregistrement.'));
    } finally {
      setSaving(false);
    }
  };

  /** Clôture du passage → statut "sorti" + libération du box */
  const cloturer = async () => {
    setError('');
    if (!diagnostic.trim()) {
      setError('Le diagnostic est obligatoire pour clôturer le passage.');
      return;
    }
    if (orientation === 'en_cours') {
      setError('Choisissez une décision d\'orientation finale (domicile, hospitalisation, mutation) pour clôturer.');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/patients/${patientId}/consultation`, {
        diagnostic,
        prescriptions,
        compteRendu,
        orientationSortie: orientation,
        terminerConsultation: true,
      });
      onSuccess?.(
        `Passage de ${patient?.prenom} ${patient?.nom} clôturé — orientation : ${ORIENTATIONS[orientation]}. Box libéré pour nettoyage.`
      );
      onClose();
    } catch (err) {
      setError(translateError(err, 'Erreur lors de la clôture.'));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full p-2 border border-gray-300 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue';
  const dossier = patient?.dossierActif;
  const cv = dossier?.constantesVitales || {};

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Consultation — ${patient ? `${patient.prenom} ${patient.nom}` : 'chargement…'}`}
      subtitle={patient ? `Dossier ${patient.numeroDossier} · ${patient.age} ans · ${dossier?.motifAdmission || ''}` : ''}
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
            type="button"
            onClick={enregistrer}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-navy text-white text-sm font-bold transition disabled:opacity-60"
          >
            <Save size={16} />
            Enregistrer la consultation
          </button>
          <button
            type="button"
            onClick={cloturer}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-status-valid hover:bg-green-700 text-white text-sm font-bold transition disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            Clôturer le passage
          </button>
        </div>
      }
    >
      {loading && <p className="text-sm text-brand-slate py-6 text-center">Chargement du dossier médical…</p>}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {patient && (
        <div className="space-y-5">
          {/* Résumé du tri (lecture seule — le médecin ne peut pas modifier la priorité) */}
          <div className="bg-brand-bg rounded-lg p-4 text-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-brand-navy flex items-center gap-1.5">
                <ClipboardList size={15} /> Résumé du tri IAO
              </span>
              {dossier?.priorite && <PriorityBadge level={dossier.priorite} />}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <span className="text-brand-slate">
                Tension : <b className="text-brand-navy">{cv.tension || '—'}</b>
              </span>
              <span className="text-brand-slate">
                Température : <b className="text-brand-navy">{cv.temperature ?? '—'} °C</b>
              </span>
              <span className="text-brand-slate">
                FC : <b className="text-brand-navy">{cv.frequenceCardiaque ?? '—'} bpm</b>
              </span>
              <span className="text-brand-slate">
                SpO2 : <b className="text-brand-navy">{cv.spO2 ?? '—'} %</b>
              </span>
              <span className="text-brand-slate">
                Douleur : <b className="text-brand-navy">{cv.douleur ?? '—'}/10</b>
              </span>
              <span className="text-brand-slate">
                Glycémie : <b className="text-brand-navy">{cv.glycemie ?? '—'} g/L</b>
              </span>
              <span className="text-brand-slate col-span-2">
                Observation : <b className="text-brand-navy">{dossier?.observationsTriage || '—'}</b>
              </span>
            </div>
          </div>

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-1">Diagnostic médical *</label>
            <textarea
              value={diagnostic}
              onChange={(e) => setDiagnostic(e.target.value)}
              className={`${inputClass} h-20 resize-none`}
              placeholder="Ex : Syndrome coronarien aigu suspecté…"
            />
          </div>

          {/* Prescriptions d'examens et traitements */}
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-1 flex items-center gap-1.5">
              <Pill size={15} /> Prescriptions (examens, traitements)
            </label>
            <div className="flex gap-2">
              <input
                value={nouvellePrescription}
                onChange={(e) => setNouvellePrescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    ajouterPrescription();
                  }
                }}
                className={inputClass}
                placeholder="Ex : Radiographie thoracique / Aspirine 250mg IV…"
              />
              <button
                type="button"
                onClick={ajouterPrescription}
                className="shrink-0 flex items-center gap-1 bg-brand-bg hover:bg-gray-200 border border-gray-300 text-brand-navy text-sm font-bold px-3 rounded-lg transition"
              >
                <Plus size={15} /> Ajouter
              </button>
            </div>
            {prescriptions.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {prescriptions.map((p, idx) => (
                  <li
                    key={`${p}-${idx}`}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-brand-navy"
                  >
                    <span>• {p}</span>
                    <button
                      type="button"
                      onClick={() => setPrescriptions((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-brand-slate hover:text-priority-p1 transition"
                      aria-label={`Supprimer ${p}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Compte-rendu */}
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-1 flex items-center gap-1.5">
              <FileText size={15} /> Compte-rendu de consultation
            </label>
            <textarea
              value={compteRendu}
              onChange={(e) => setCompteRendu(e.target.value)}
              className={`${inputClass} h-24 resize-none`}
              placeholder="Examen clinique, hypothèses, suivi décidé…"
            />
          </div>

          {/* Orientation finale */}
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-1 flex items-center gap-1.5">
              <Stethoscope size={15} /> Décision d'orientation (clôture)
            </label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              className={inputClass}
            >
              <option value="en_cours">Consultation en cours (pas de clôture)</option>
              <option value="retour_domicile">Retour au domicile</option>
              <option value="hospitalisation">Hospitalisation</option>
              <option value="mutation">Mutation vers un autre établissement</option>
            </select>
            <p className="text-xs text-brand-slate mt-1.5">
              La clôture libère automatiquement le box (passage en nettoyage) et clôt le dossier : le patient
              n'est plus réaffectable.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
