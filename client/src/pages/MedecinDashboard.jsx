import { useState, useEffect } from 'react';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  ClipboardList,
  Activity,
  FileText,
  ArrowRightCircle,
} from 'lucide-react';
import api from '../services/api';
import { DEMO_PASSAGES, DEMO_HISTORIQUE } from '../data/demoData';
import Toast from '../components/common/Toast';

const PRIORITY_BADGES = {
  P1: 'bg-[#C8102E] text-white',
  P2: 'bg-orange-700 text-white',
  P3: 'bg-amber-400 text-[#0B2A5B]',
  P4: 'bg-[#0E7C86] text-white',
};

export default function MedecinDashboard() {
  const [passages, setPassages] = useState(DEMO_PASSAGES);
  const [historique, setHistorique] = useState(DEMO_HISTORIQUE);
  const [activeTab, setActiveTab] = useState('file');
  const [selectedDossier, setSelectedDossier] = useState(DEMO_PASSAGES[0]);
  const [diagnostic, setDiagnostic] = useState('');
  const [examens, setExamens] = useState('');
  const [orientation, setOrientation] = useState('Retour à domicile');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    api
      .get('/dossiers')
      .then((res) => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          setPassages(res.data);
          setSelectedDossier(res.data[0]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCloturerPassage = (e) => {
    e.preventDefault();
    if (!selectedDossier) return;

    const closedItem = {
      ...selectedDossier,
      orientation,
      diagnostic,
      heure_sortie: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    const remaining = passages.filter((p) => p.id !== selectedDossier.id);
    setPassages(remaining);
    setHistorique((prev) => [closedItem, ...prev]);
    setSelectedDossier(remaining[0] || null);
    setDiagnostic('');
    setExamens('');
    setActiveTab('file');
    setToastMessage(`Dossier ${closedItem.numero_dossier} clôturé (${orientation}).`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-h-[calc(100vh-8.5rem)] flex flex-col justify-between">
      <div className="space-y-6">
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />

        {/* En-tête de l'espace Médecin */}
        <div className="dc-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="dc-h1">Espace Médecin — Consultations et orientation</h1>
            <p className="text-sm text-[#334155] mt-1">
              Prise en charge clinique par priorité P1–P4, prescription d&apos;examens et clôture des
              passages.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1] text-right self-start md:self-auto">
            <span className="text-sm font-semibold text-[#334155] block">Patients en attente</span>
            <span className="font-display font-bold text-2xl text-[#0B2A5B]">
              {String(passages.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Barre d'onglets responsive sans débordement à 375 px */}
        <div className="border-b border-[#CBD5E1] bg-white rounded-t-[10px] px-3 pt-2">
          <div role="tablist" className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'file'}
              onClick={() => setActiveTab('file')}
              className={`px-3.5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors flex items-center gap-2 ${
                activeTab === 'file'
                  ? 'border-[#0B4F9E] text-[#0B4F9E] font-bold'
                  : 'border-transparent text-[#334155] hover:text-[#0B2A5B]'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              File prioritaire ({String(passages.length).padStart(2, '0')})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'consultation'}
              onClick={() => setActiveTab('consultation')}
              className={`px-3.5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors flex items-center gap-2 ${
                activeTab === 'consultation'
                  ? 'border-[#0B4F9E] text-[#0B4F9E] font-bold'
                  : 'border-transparent text-[#334155] hover:text-[#0B2A5B]'
              }`}
            >
              <Stethoscope className="w-4 h-4 shrink-0" />
              Consultation en cours
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'historique'}
              onClick={() => setActiveTab('historique')}
              className={`px-3.5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors flex items-center gap-2 ${
                activeTab === 'historique'
                  ? 'border-[#0B4F9E] text-[#0B4F9E] font-bold'
                  : 'border-transparent text-[#334155] hover:text-[#0B2A5B]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Historique ({historique.length})
            </button>
          </div>
        </div>

        {/* Onglet 1 : File prioritaire */}
        {activeTab === 'file' && (
          <div className="dc-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="dc-h2">Patients classés par priorité clinique et ancienneté</h2>
              <span className="text-sm font-semibold text-[#334155]">
                {String(passages.length).padStart(2, '0')} dossiers actifs
              </span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3 animate-pulse">
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="h-12 bg-slate-200 rounded w-full" />
                ))}
              </div>
            ) : passages.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#0E7C86] mx-auto" />
                <p className="font-bold text-base text-[#0B2A5B]">
                  Aucun patient en attente de consultation
                </p>
                <p className="text-sm text-[#334155]">
                  Tous les dossiers prioritaires ont été pris en charge.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[740px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#EEF3F9] text-[#0B2A5B] text-sm font-bold">
                      <th className="py-3.5 px-4">Dossier</th>
                      <th className="py-3.5 px-4">Patient</th>
                      <th className="py-3.5 px-4">Priorité</th>
                      <th className="py-3.5 px-4">Motif</th>
                      <th className="py-3.5 px-4">Affectation</th>
                      <th className="py-3.5 px-4">Attente</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CBD5E1]">
                    {passages.map((p) => (
                      <tr key={p.id} className="hover:bg-[#EEF3F9]/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0B2A5B]">
                          {p.numero_dossier}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                          {p.patient_prenom} {p.patient_nom} ({p.age} ans)
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-sm font-bold ${
                              PRIORITY_BADGES[p.priorite] || 'bg-slate-200 text-slate-900'
                            }`}
                          >
                            {p.priorite}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#334155]">{p.motif_admission}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#0B2A5B]">{p.box}</td>
                        <td className="py-3.5 px-4 font-medium text-[#334155]">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#0B4F9E]" />
                            {p.attente_min} min
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDossier(p);
                              setActiveTab('consultation');
                            }}
                            className="dc-btn-primary py-1.5 px-3 text-sm"
                          >
                            Examiner
                            <ArrowRightCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Onglet 2 : Consultation en cours */}
        {activeTab === 'consultation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="dc-card p-6 space-y-4">
              <h2 className="dc-h2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0E7C86]" />
                Dossier sélectionné
              </h2>
              {selectedDossier ? (
                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
                    <span className="font-mono text-sm text-[#0B4F9E] font-bold block">
                      {selectedDossier.numero_dossier}
                    </span>
                    <span className="font-bold text-base text-[#0B2A5B] block mt-0.5">
                      {selectedDossier.patient_prenom} {selectedDossier.patient_nom} (
                      {selectedDossier.age} ans)
                    </span>
                    <p className="text-sm text-[#334155] mt-1.5">
                      {selectedDossier.motif_admission}
                    </p>
                  </div>

                  {selectedDossier.constantes && (
                    <div className="grid grid-cols-2 gap-2.5 text-sm">
                      <div className="p-3 rounded-[8px] border border-[#CBD5E1]">
                        <span className="text-[#334155] block">Tension</span>
                        <strong className="text-[#0B2A5B] text-base">
                          {selectedDossier.constantes.ta}
                        </strong>
                      </div>
                      <div className="p-3 rounded-[8px] border border-[#CBD5E1]">
                        <span className="text-[#334155] block">Fréq. cardiaque</span>
                        <strong className="text-[#0B2A5B] text-base">
                          {selectedDossier.constantes.fc}
                        </strong>
                      </div>
                      <div className="p-3 rounded-[8px] border border-[#CBD5E1]">
                        <span className="text-[#334155] block">SpO₂</span>
                        <strong className="text-[#0B2A5B] text-base">
                          {selectedDossier.constantes.spo2}
                        </strong>
                      </div>
                      <div className="p-3 rounded-[8px] border border-[#CBD5E1]">
                        <span className="text-[#334155] block">Température</span>
                        <strong className="text-[#0B2A5B] text-base">
                          {selectedDossier.constantes.temp}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#334155]">Aucun dossier sélectionné.</p>
              )}
            </div>

            <form onSubmit={handleCloturerPassage} className="lg:col-span-2 dc-card p-6 space-y-4">
              <h2 className="dc-h2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0B4F9E]" />
                Compte-rendu et orientation
              </h2>

              <div>
                <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">
                  Observations cliniques et diagnostic *
                </label>
                <textarea
                  rows="4"
                  required
                  value={diagnostic}
                  onChange={(e) => setDiagnostic(e.target.value)}
                  placeholder="Saisir l'examen clinique, le diagnostic retenu et les consignes..."
                  className="w-full border border-[#94A3B8] rounded-[8px] p-3 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">
                    Examens complémentaires
                  </label>
                  <input
                    type="text"
                    value={examens}
                    onChange={(e) => setExamens(e.target.value)}
                    placeholder="Ex. ECG, Bilan sanguin, Radio..."
                    className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">
                    Décision d&apos;orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] bg-white focus:border-[#0B4F9E]"
                  >
                    <option value="Retour à domicile">Retour à domicile</option>
                    <option value="Hospitalisation en service">Hospitalisation en service</option>
                    <option value="Surveillance UHCD">Surveillance UHCD</option>
                    <option value="Transfert spécialisé">Transfert spécialisé</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={!selectedDossier} className="dc-btn-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  Valider et clôturer le passage
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Onglet 3 : Historique */}
        {activeTab === 'historique' && (
          <div className="dc-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#CBD5E1]">
              <h2 className="dc-h2">Passages clôturés du jour</h2>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[640px] text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#EEF3F9] text-[#0B2A5B] text-sm font-bold">
                    <th className="py-3.5 px-4">Dossier</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Motif</th>
                    <th className="py-3.5 px-4">Orientation</th>
                    <th className="py-3.5 px-4">Sortie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]">
                  {historique.map((h) => (
                    <tr key={h.id}>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B2A5B]">
                        {h.numero_dossier}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        {h.patient_prenom} {h.patient_nom}
                      </td>
                      <td className="py-3.5 px-4 text-[#334155]">{h.motif_admission}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#0B5E66]">{h.orientation}</td>
                      <td className="py-3.5 px-4 text-[#334155]">{h.heure_sortie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bandeau de garde médicale */}
      <div className="dc-card p-4 bg-[#EEF3F9]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-[#334155]">
        <span>
          <strong className="text-[#0B2A5B]">Équipe médicale de garde :</strong> 4 praticiens actifs
          • Liaison laboratoire et imagerie opérationnelle.
        </span>
        <span className="font-semibold text-[#0B4F9E]">Protocole Urgences Dossi&apos;Com</span>
      </div>
    </div>
  );
}