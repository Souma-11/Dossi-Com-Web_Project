import { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  Users,
  Save,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { DEMO_PASSAGES } from '../data/demoData';
import Toast from '../components/common/Toast';

const PRIORITY_STYLES = {
  P1: 'bg-[#C8102E] text-white',
  P2: 'bg-orange-700 text-white',
  P3: 'bg-amber-400 text-[#0B2A5B]',
  P4: 'bg-[#0E7C86] text-white',
};

export default function InfirmierDashboard() {
  const [passages, setPassages] = useState(DEMO_PASSAGES);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    let isMounted = true;
    api
      .get('/dossiers')
      .then((res) => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          setPassages(res.data);
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

  const handlePriorityChange = (id, newPriority) => {
    setPassages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, priorite: newPriority } : p))
    );
  };

  const handleSaveTriage = (dossier) => {
    setToast({
      message: `Triage enregistré pour ${dossier.numero_dossier} (${dossier.patient_prenom} ${dossier.patient_nom}) — Priorité ${dossier.priorite}.`,
      type: 'success',
    });
  };

  const handleToggleAggravation = (id) => {
    setPassages((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextState = !p.aggravation;
        setToast({
          message: nextState
            ? `ALERTE AGGRAVATION activée pour ${p.numero_dossier} (${p.patient_prenom} ${p.patient_nom}) !`
            : `Alerte d'aggravation acquittée pour ${p.numero_dossier}.`,
          type: nextState ? 'alert' : 'success',
        });
        return {
          ...p,
          aggravation: nextState,
          priorite: nextState ? 'P1' : p.priorite,
          alerte_motif: nextState
            ? p.alerte_motif || 'Dégradation brutale des constantes vitales signalée'
            : '',
        };
      })
    );
  };

  const criticalAlerts = passages.filter((p) => p.aggravation);
  const p1Count = passages.filter((p) => p.priorite === 'P1').length;
  const displayedPassages =
    filterPriority === 'ALL'
      ? passages
      : passages.filter((p) => p.priorite === filterPriority);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-h-[calc(100vh-8.5rem)] flex flex-col justify-between">
      <div className="space-y-6">
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />

        {/* BANDEAU CRITIQUE AGGRAVATION EN TÊTE DE PAGE */}
        {criticalAlerts.length > 0 && (
          <section
            aria-label="Alertes critiques d'aggravation"
            className="rounded-[12px] bg-red-50 border-2 border-[#C8102E] p-5 shadow-md space-y-3"
          >
            <div className="flex items-center gap-2.5 text-[#C8102E]">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <h2 className="font-display font-bold text-lg uppercase tracking-wide">
                Alerte Critique — Aggravation clinique ({criticalAlerts.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {criticalAlerts.map((alertItem) => (
                <div
                  key={alertItem.id}
                  className="bg-white border-l-4 border-[#C8102E] rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#C8102E] text-white text-sm font-bold">
                        AGGRAVATION • {alertItem.priorite}
                      </span>
                      <span className="font-mono font-bold text-sm text-[#0B2A5B]">
                        {alertItem.numero_dossier}
                      </span>
                      <span className="font-bold text-base text-[#0F172A]">
                        {alertItem.patient_prenom} {alertItem.patient_nom} ({alertItem.age} ans)
                      </span>
                      <span className="text-sm font-semibold text-[#0B4F9E]">
                        — {alertItem.box}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#991B1B]">
                      {alertItem.alerte_motif || alertItem.motif_admission}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAggravation(alertItem.id)}
                    className="dc-btn-outline border-[#C8102E] text-[#C8102E] hover:bg-red-50 shrink-0 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Acquitter l&apos;alerte
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* En-tête de l'espace Infirmier */}
        <div className="dc-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="dc-h1">Espace Infirmier — Triage P1–P4 et constantes</h1>
            <p className="text-sm text-[#334155] mt-1">
              Évaluation clinique initiale, réévaluation des priorités et surveillance des alertes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-[8px] bg-red-50 border border-[#C8102E] text-right">
              <span className="text-sm text-[#991B1B] font-semibold block">
                Urgences vitales (P1)
              </span>
              <span className="font-display font-bold text-2xl text-[#C8102E]">
                {String(p1Count).padStart(2, '0')}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1] text-right">
              <span className="text-sm text-[#334155] font-semibold block">
                Patients en attente
              </span>
              <span className="font-display font-bold text-2xl text-[#0B2A5B]">
                {String(passages.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* File de triage */}
        <div className="dc-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="dc-h2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0E7C86]" />
              File de triage ({String(displayedPassages.length).padStart(2, '0')} patients)
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'P1', 'P2', 'P3', 'P4'].map((prio) => (
                <button
                  key={prio}
                  type="button"
                  onClick={() => setFilterPriority(prio)}
                  className={`px-3 py-1.5 rounded-[8px] text-sm font-semibold border transition-colors ${
                    filterPriority === prio
                      ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]'
                      : 'bg-white text-[#0B2A5B] border-[#CBD5E1] hover:bg-[#EEF3F9]'
                  }`}
                >
                  {prio === 'ALL' ? 'Tous' : prio}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="h-12 bg-slate-200 rounded w-full" />
              ))}
            </div>
          ) : displayedPassages.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-[#334155] mx-auto" />
              <p className="font-bold text-base text-[#0B2A5B]">Aucun patient à trier</p>
              <p className="text-sm text-[#334155]">
                Aucun dossier ne correspond au filtre de priorité sélectionné.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[780px] text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#EEF3F9] text-[#0B2A5B] text-sm font-bold">
                    <th className="py-3.5 px-4">Dossier</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Motif</th>
                    <th className="py-3.5 px-4">Constantes</th>
                    <th className="py-3.5 px-4">Priorité</th>
                    <th className="py-3.5 px-4 text-right">Actions de triage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]">
                  {displayedPassages.map((p) => (
                    <tr
                      key={p.id}
                      className={p.aggravation ? 'bg-red-50/70' : 'hover:bg-[#EEF3F9]/50'}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B2A5B]">
                        {p.numero_dossier}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        {p.patient_prenom} {p.patient_nom} ({p.age} ans)
                      </td>
                      <td className="py-3.5 px-4 text-[#334155]">{p.motif_admission}</td>
                      <td className="py-3.5 px-4 text-sm font-medium text-[#0F172A]">
                        {p.constantes
                          ? `TA ${p.constantes.ta} • FC ${p.constantes.fc} • SpO₂ ${p.constantes.spo2}`
                          : 'En cours'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-sm font-bold inline-flex items-center gap-1 ${
                              PRIORITY_STYLES[p.priorite] || 'bg-slate-200 text-slate-900'
                            }`}
                          >
                            {p.priorite === 'P1' && <AlertTriangle className="w-3.5 h-3.5" />}
                            {p.priorite}
                          </span>
                          <select
                            aria-label={`Priorité pour ${p.patient_prenom} ${p.patient_nom}`}
                            value={p.priorite}
                            onChange={(e) => handlePriorityChange(p.id, e.target.value)}
                            className="border border-[#94A3B8] rounded-[8px] px-2.5 py-1.5 text-sm font-semibold bg-white text-[#0B2A5B]"
                          >
                            <option value="P1">P1 — Vitale</option>
                            <option value="P2">P2 — Absolue</option>
                            <option value="P3">P3 — Relative</option>
                            <option value="P4">P4 — Rapide</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveTriage(p)}
                            className="dc-btn-primary py-1.5 px-3 text-sm"
                          >
                            <Save className="w-4 h-4" />
                            Enregistrer le triage
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAggravation(p.id)}
                            className={`py-1.5 px-3 rounded-[8px] text-sm font-semibold border inline-flex items-center gap-1.5 ${
                              p.aggravation
                                ? 'bg-[#C8102E] text-white border-[#C8102E]'
                                : 'bg-white text-[#C8102E] border-[#C8102E] hover:bg-red-50'
                            }`}
                          >
                            <ShieldAlert className="w-4 h-4" />
                            {p.aggravation ? 'Critique' : 'Aggravation'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Référentiel clinique P1–P4 pour équilibrer le bas de page */}
      <div className="dc-card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <div className="p-3 rounded-[8px] bg-red-50 border border-[#C8102E]/40">
          <strong className="text-[#C8102E] block">P1 — Urgence vitale</strong>
          <span className="text-[#334155]">Prise en charge immédiate (0 min)</span>
        </div>
        <div className="p-3 rounded-[8px] bg-orange-50 border border-orange-400">
          <strong className="text-orange-800 block">P2 — Urgence absolue</strong>
          <span className="text-[#334155]">Évaluation médicale sous 15 min</span>
        </div>
        <div className="p-3 rounded-[8px] bg-amber-50 border border-amber-400">
          <strong className="text-amber-900 block">P3 — Urgence relative</strong>
          <span className="text-[#334155]">Prise en charge sous 45 min</span>
        </div>
        <div className="p-3 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
          <strong className="text-[#0B2A5B] block">P4 — Consultation rapide</strong>
          <span className="text-[#334155]">Circuit court sans détresse</span>
        </div>
      </div>
    </div>
  );
}