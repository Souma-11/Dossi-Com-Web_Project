import { useState } from 'react';
import { UserPlus, FileText, CheckCircle, AlertTriangle, Clock, ListOrdered } from 'lucide-react';
import api from '../services/api';
import useApi from '../hooks/useApi';
import { STATUT_LABELS, dureeDepuis, heureFr } from '../utils/format';
import PriorityBadge from '../components/ui/PriorityBadge';

/**
 * Espace Accueil — Admission administrative des patients (Phase 4).
 * - Formulaire d'admission → POST /api/patients (crée le patient + le dossier d'urgence)
 * - File d'attente en LECTURE SEULE (aucune donnée médicale) → GET /api/patients
 * - Temps réel : la file se met à jour instantanément (Socket.io)
 */
export default function AccueilDashboard() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: 'M',
    telephone: '',
    motif: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // File d'attente temps réel (rechargée aussi toutes les 15 s en secours)
  const { data, loading, error: apiError } = useApi('/patients', { pollMs: 15000 });
  const patients = data?.patients || [];

  // File d'attente visible = passages non clôturés, du plus ancien au plus récent
  const fileActive = [...patients]
    .filter((p) => p.statut !== 'sorti')
    .sort((a, b) => new Date(a.dateArrivee) - new Date(b.dateArrivee));

  const setField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // L'âge est calculé à partir de la date de naissance saisie
    const age = formData.dateNaissance
      ? Math.floor((Date.now() - new Date(formData.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000))
      : null;

    if (age === null || Number.isNaN(age) || age < 0 || age > 130) {
      setError('Veuillez saisir une date de naissance valide.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/patients', {
        nom: formData.nom,
        prenom: formData.prenom,
        age,
        sexe: formData.sexe,
        telephone: formData.telephone,
        motifAdmission: formData.motif,
      });
      setSuccess(
        `Dossier ${response.data.patient.numeroDossier} créé ! ${response.data.patient.prenom} ${response.data.patient.nom} apparaît maintenant dans la file du tri IAO.`
      );
      setFormData({ nom: '', prenom: '', dateNaissance: '', sexe: 'M', telephone: '', motif: '' });
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Erreur lors de l\'enregistrement. Vérifiez que le serveur backend est démarré.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full p-2 border border-gray-300 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-title text-2xl text-brand-navy flex items-center gap-2">
          <UserPlus className="text-brand-turquoise" />
          Espace Accueil — Admission Patient
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          Création du dossier administratif à l'arrivée aux urgences. La recherche précède la création
          (éviter les doublons) : consultez la file ci-dessous.
        </p>
      </div>

      {/* Formulaire d'admission */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-3xl">
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600 shrink-0" />
            <div>
              <p className="font-bold">Dossier créé avec succès !</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3 text-sm">
            <AlertTriangle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-brand-navy mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setField('nom', e.target.value)}
                className={inputClass}
                placeholder="Ex : Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-navy mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setField('prenom', e.target.value)}
                className={inputClass}
                placeholder="Ex : Jean"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-brand-navy mb-1">Date de naissance *</label>
              <input
                type="date"
                required
                value={formData.dateNaissance}
                onChange={(e) => setField('dateNaissance', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-navy mb-1">Sexe *</label>
              <select
                value={formData.sexe}
                onChange={(e) => setField('sexe', e.target.value)}
                className={inputClass}
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-navy mb-1">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setField('telephone', e.target.value)}
                className={inputClass}
                placeholder="Ex : 06 12 34 56 78"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-navy mb-1">
              Motif principal (déclaré par le patient) *
            </label>
            <textarea
              required
              value={formData.motif}
              onChange={(e) => setField('motif', e.target.value)}
              className={`${inputClass} h-24 resize-none`}
              placeholder="Ex : Douleur thoracique depuis 2 heures…"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full bg-brand-blue hover:bg-brand-navy text-white font-bold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            <FileText size={18} />
            {isSubmitting ? 'Enregistrement…' : 'Enregistrer le dossier'}
          </button>
        </form>
      </div>

      {/* File d'attente — LECTURE SEULE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-brand-navy flex items-center gap-2">
            <ListOrdered size={18} className="text-brand-blue" />
            File d'attente — lecture seule ({fileActive.length})
          </h2>
          <Clock size={20} className="text-brand-slate" />
        </div>

        {apiError && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
            {apiError}
          </div>
        )}

        {loading ? (
          <p className="p-6 text-center text-sm text-brand-slate">Chargement de la file d'attente…</p>
        ) : fileActive.length === 0 ? (
          <p className="p-6 text-center text-sm text-brand-slate">
            Aucun patient en cours de prise en charge. Enregistrez une admission ci-dessus.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase text-brand-slate border-b">
                  <th className="p-3">Patient</th>
                  <th className="p-3">Arrivée</th>
                  <th className="p-3">Attente</th>
                  <th className="p-3">Motif déclaré</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Priorité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fileActive.map((patient) => (
                  <tr key={patient._id} className="hover:bg-brand-bg transition">
                    <td className="p-3">
                      <p className="font-bold text-brand-navy text-sm">
                        {patient.nom} {patient.prenom}
                      </p>
                      <p className="text-xs text-brand-slate">{patient.numeroDossier}</p>
                    </td>
                    <td className="p-3 text-sm text-brand-slate">{heureFr(patient.dateArrivee)}</td>
                    <td className="p-3 text-sm font-semibold text-brand-darkTurquoise">
                      {dureeDepuis(patient.dateArrivee)}
                    </td>
                    {/* Aucune donnée médicale détaillée pour l'accueil */}
                    <td className="p-3 text-sm text-brand-slate max-w-[220px] truncate">
                      {patient.dossierActif?.motifAdmission || '—'}
                    </td>
                    <td className="p-3 text-xs font-semibold text-brand-navy">
                      {STATUT_LABELS[patient.statut]}
                    </td>
                    <td className="p-3">
                      {patient.dossierActif?.priorite ? (
                        <PriorityBadge level={patient.dossierActif.priorite} />
                      ) : (
                        <span className="text-xs text-brand-slate italic">Non trié</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
