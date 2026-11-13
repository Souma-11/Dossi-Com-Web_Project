import { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, Clock, Building2 } from 'lucide-react';
import api from '../services/api';
import { DEMO_PASSAGES, computeServiceStats } from '../data/demoData';

export default function ResponsableDashboard() {
  const [passages, setPassages] = useState(DEMO_PASSAGES);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/dossiers')
      .then((res) => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          setPassages(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = computeServiceStats(passages);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-h-[calc(100vh-8.5rem)]">
      <div className="dc-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="dc-h1">Espace Responsable — Supervision du service</h1>
          <p className="text-sm text-[#334155] mt-1">
            Pilotage des capacités d&apos;accueil, occupation des box et suivi global des flux.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1] text-sm font-bold text-[#0B2A5B] self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#0E7C86]" />
          Supervision active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dc-card p-5 border-l-4 border-l-[#0B4F9E]">
          <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
            <span>Saturation du service</span>
            <Activity className="w-5 h-5 text-[#0B4F9E]" />
          </div>
          <div className="font-display font-bold text-3xl text-[#0B2A5B]">{stats.saturation}%</div>
        </div>

        <div className="dc-card p-5 border-l-4 border-l-[#0E7C86]">
          <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
            <span>Patients en attente</span>
            <Users className="w-5 h-5 text-[#0B4F9E]" />
          </div>
          <div className="font-display font-bold text-3xl text-[#0B2A5B]">
            {String(stats.patientsEnAttente).padStart(2, '0')}
          </div>
        </div>

        <div className="dc-card p-5 border-l-4 border-l-[#0E7C86]">
          <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
            <span>Box libres / Total</span>
            <Building2 className="w-5 h-5 text-[#0B4F9E]" />
          </div>
          <div className="font-display font-bold text-3xl text-[#0B2A5B]">
            {stats.boxLibres} / {stats.capaciteTotale}
          </div>
        </div>

        <div className="dc-card p-5 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
            <span>Attente moyenne</span>
            <Clock className="w-5 h-5 text-[#0B4F9E]" />
          </div>
          <div className="font-display font-bold text-3xl text-[#0B2A5B]">
            {stats.attenteMoyenne} min
          </div>
        </div>
      </div>

      <div className="dc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#CBD5E1]">
          <h2 className="dc-h2">
            Occupation des salles et dossiers en cours ({String(passages.length).padStart(2, '0')})
          </h2>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#EEF3F9] text-[#0B2A5B] text-sm font-bold">
                <th className="py-3.5 px-4">Salle / Box</th>
                <th className="py-3.5 px-4">Dossier</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Priorité</th>
                <th className="py-3.5 px-4">Durée d&apos;attente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]">
              {passages.map((p) => (
                <tr key={p.id} className="hover:bg-[#EEF3F9]/50">
                  <td className="py-3.5 px-4 font-bold text-[#0B2A5B]">{p.box}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#0B4F9E]">
                    {p.numero_dossier}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                    {p.patient_prenom} {p.patient_nom}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#0B2A5B]">{p.priorite}</td>
                  <td className="py-3.5 px-4 font-medium text-[#334155]">{p.attente_min} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}