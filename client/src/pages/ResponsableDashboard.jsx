import { useState } from 'react';
import { LayoutDashboard, BedDouble, Users, TrendingUp, Wrench } from 'lucide-react';
import useApi from '../hooks/useApi';
import LitModal from '../components/lits/LitModal';
import PriorityBadge from '../components/ui/PriorityBadge';
import { LIT_STATUTS, STATUT_LABELS } from '../utils/format';

/**
 * Espace Responsable — Supervision (Phase 4).
 * - Indicateurs calculés sur les données RÉELLES (plus de chiffres fictifs)
 * - Grille des box : CLIC sur un box → fenêtre de changement d'état
 *   (libre → occupé → nettoyage) et affectation d'un patient
 * - Temps réel : les box changent d'état instantanément sur tous les postes
 */
export default function ResponsableDashboard() {
  const { data: dataPatients, loading: loadingPatients, error } = useApi('/patients', { pollMs: 15000 });
  const { data: dataLits, loading: loadingLits } = useApi('/lits', { pollMs: 15000 });
  const [modalLit, setModalLit] = useState(null);

  const patients = dataPatients?.patients || [];
  const lits = dataLits?.lits || [];

  // ─── Indicateurs (calculés côté client à partir des données réelles) ──────
  const patientsActifs = patients.filter((p) => p.statut !== 'sorti');
  const litsUtilisables = lits.filter((l) => l.statut !== 'maintenance');
  const litsOccupes = lits.filter((l) => l.statut === 'occupe');
  const saturation =
    litsUtilisables.length > 0
      ? Math.round((litsOccupes.length / litsUtilisables.length) * 100)
      : 0;
  const litsLibres = lits.filter((l) => l.statut === 'libre');
  const enNettoyage = lits.filter((l) => l.statut === 'nettoyage');
  const enMaintenance = lits.filter((l) => l.statut === 'maintenance');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-title text-2xl text-brand-navy flex items-center gap-2">
          <LayoutDashboard className="text-brand-turquoise" />
          Espace Responsable — Supervision
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          Pilotage de l'activité du service et gestion des ressources — données temps réel.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistiques temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full text-brand-blue">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-slate">Patients actifs</p>
            <p className="text-2xl font-bold text-brand-navy">{patientsActifs.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-full text-orange-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-slate">Taux de saturation</p>
            <p className="text-2xl font-bold text-brand-navy">{saturation}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <BedDouble size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-slate">Box libres</p>
            <p className="text-2xl font-bold text-brand-navy">{litsLibres.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-full text-slate-500">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-slate">Nettoyage / Maintenance</p>
            <p className="text-2xl font-bold text-brand-navy">
              {enNettoyage.length} / {enMaintenance.length}
            </p>
          </div>
        </div>
      </div>

      {/* Gestion des Lits / Box — clic sur un box pour le gérer */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-bold text-lg text-brand-navy mb-1 flex items-center gap-2">
          <BedDouble className="text-brand-slate" />
          État des Box / Lits
        </h2>
        <p className="text-xs text-brand-slate mb-4">
          Cliquez sur un box pour changer son état (libre → occupé → nettoyage) et y affecter un patient.
        </p>

        {loadingPatients || loadingLits ? (
          <p className="text-center text-sm text-brand-slate py-6">Chargement des ressources…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {lits.map((lit) => {
              const conf = LIT_STATUTS[lit.statut] || LIT_STATUTS.libre;
              const patient = lit.patientAffecte;
              return (
                <button
                  key={lit._id}
                  onClick={() => setModalLit(lit)}
                  className={`border-2 rounded-lg p-4 text-center transition hover:scale-[1.03] hover:shadow-md cursor-pointer ${conf.classes}`}
                >
                  <h3 className="font-bold text-brand-navy text-sm">{lit.numeroBox}</h3>
                  <p className="text-xs font-semibold mt-1 uppercase tracking-wide">{conf.label}</p>
                  {patient ? (
                    <div className="mt-2 text-xs text-brand-navy">
                      <p className="truncate font-bold">
                        {patient.nom} {patient.prenom}
                      </p>
                      {patient.dossierActif?.priorite && (
                        <div className="mt-1.5 flex justify-center">
                          <PriorityBadge level={patient.dossierActif.priorite} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-brand-slate mt-2 italic">—</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Patients actifs — vue synthétique pour l'affectation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-bold text-brand-navy">Patients actifs ({patientsActifs.length})</h2>
        </div>
        {patientsActifs.length === 0 ? (
          <p className="p-6 text-center text-sm text-brand-slate">Aucun patient actif.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase text-brand-slate border-b">
                  <th className="p-3">Patient</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Priorité</th>
                  <th className="p-3">Box</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patientsActifs.map((p) => (
                  <tr key={p._id} className="hover:bg-brand-bg transition">
                    <td className="p-3">
                      <p className="font-bold text-brand-navy text-sm">
                        {p.nom} {p.prenom}
                      </p>
                      <p className="text-xs text-brand-slate">{p.numeroDossier}</p>
                    </td>
                    <td className="p-3 text-xs font-semibold text-brand-navy">
                      {STATUT_LABELS[p.statut]}
                    </td>
                    <td className="p-3">
                      {p.dossierActif?.priorite ? (
                        <PriorityBadge level={p.dossierActif.priorite} />
                      ) : (
                        <span className="text-xs text-brand-slate italic">Non trié</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-brand-navy">
                      {p.litActuel?.numeroBox || <span className="text-brand-slate italic">Aucun</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fenêtre de gestion du box sélectionné */}
      <LitModal
        open={!!modalLit}
        lit={modalLit}
        patients={patients}
        onClose={() => setModalLit(null)}
        onSuccess={(message) => setModalLit(null) /* le temps réel rafraîchit les listes */}
      />
    </div>
  );
}
