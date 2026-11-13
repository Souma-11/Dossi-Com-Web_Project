import { useState, useEffect } from 'react';
import { UserPlus, Users, Clock, Search } from 'lucide-react';
import api from '../services/api';
import { DEMO_PASSAGES } from '../data/demoData';
import Toast from '../components/common/Toast';

export default function AccueilDashboard() {
  const [passages, setPassages] = useState(DEMO_PASSAGES);
  const [search, setSearch] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleCreatePassage = (e) => {
    e.preventDefault();
    const nextNum = String(passages.length + 1).padStart(4, '0');
    const newPassage = {
      id: Date.now(),
      numero_dossier: `UR-2026-${nextNum}`,
      patient_nom: nom.trim(),
      patient_prenom: prenom.trim(),
      age: Number(age) || 30,
      motif_admission: motif.trim(),
      priorite: 'P3',
      statut: 'en_attente',
      heure_arrivee: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attente_min: 1,
      box: 'En attente triage',
    };

    setPassages((prev) => [...prev, newPassage]);
    setNom('');
    setPrenom('');
    setAge('');
    setMotif('');
    setToastMessage(
      `Passage ${newPassage.numero_dossier} enregistré pour ${newPassage.patient_prenom} ${newPassage.patient_nom}.`
    );
  };

  const filteredPassages = passages.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.numero_dossier.toLowerCase().includes(query) ||
      p.patient_nom.toLowerCase().includes(query) ||
      p.patient_prenom.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-h-[calc(100vh-8.5rem)]">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <div className="dc-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="dc-h1">Espace Accueil — Enregistrement des passages</h1>
          <p className="text-sm text-[#334155] mt-1">
            Ouverture des dossiers d&apos;urgence et suivi de la file d&apos;attente en temps réel.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1] flex items-center gap-3 self-start sm:self-auto">
          <Users className="w-5 h-5 text-[#0B4F9E]" />
          <div>
            <span className="text-sm font-semibold text-[#334155] block">Patients en attente</span>
            <span className="font-display font-bold text-2xl text-[#0B2A5B]">
              {String(passages.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleCreatePassage} className="dc-card p-6 space-y-4">
          <h2 className="dc-h2 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0B4F9E]" />
            Nouveau passage
          </h2>

          <div>
            <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">Nom *</label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ben Ali"
              className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">Prénom *</label>
            <input
              type="text"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Sami"
              className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">Âge *</label>
            <input
              type="number"
              min="0"
              max="120"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="42"
              className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">
              Motif d&apos;admission *
            </label>
            <input
              type="text"
              required
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex. Douleur thoracique, chute..."
              className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
            />
          </div>

          <button type="submit" className="dc-btn-primary w-full">
            <UserPlus className="w-4 h-4" />
            Ouvrir le dossier
          </button>
        </form>

        <div className="lg:col-span-2 dc-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="dc-h2">
              File active ({String(passages.length).padStart(2, '0')} patients)
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#334155] absolute left-3 top-3" />
              <input
                type="text"
                aria-label="Rechercher un dossier ou un patient"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher dossier ou nom..."
                className="w-full pl-9 pr-3 py-2 border border-[#94A3B8] rounded-[8px] text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="h-12 bg-slate-200 rounded w-full" />
              ))}
            </div>
          ) : filteredPassages.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-[#334155] mx-auto" />
              <p className="font-bold text-base text-[#0B2A5B]">Aucun dossier trouvé</p>
              <p className="text-sm text-[#334155]">
                Aucun patient ne correspond à votre recherche « {search} ».
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[660px] text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#EEF3F9] text-[#0B2A5B] text-sm font-bold">
                    <th className="py-3.5 px-4">Rang</th>
                    <th className="py-3.5 px-4">Dossier</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Motif</th>
                    <th className="py-3.5 px-4">Arrivée</th>
                    <th className="py-3.5 px-4">Priorité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]">
                  {filteredPassages.map((p, index) => (
                    <tr key={p.id} className="hover:bg-[#EEF3F9]/50">
                      <td className="py-3.5 px-4 font-bold text-[#0B4F9E]">#{index + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B2A5B]">
                        {p.numero_dossier}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        {p.patient_prenom} {p.patient_nom} ({p.age} ans)
                      </td>
                      <td className="py-3.5 px-4 text-[#334155]">{p.motif_admission}</td>
                      <td className="py-3.5 px-4 font-medium text-[#334155]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#0B4F9E]" />
                          {p.heure_arrivee}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0B2A5B]">{p.priorite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}