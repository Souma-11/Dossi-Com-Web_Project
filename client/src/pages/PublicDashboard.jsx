import { Link } from 'react-router-dom';
import { Users, Activity, Clock, BedDouble, Phone } from 'lucide-react';
import useApi from '../hooks/useApi';

/**
 * Tableau de bord public — page d'entrée publique (Phase 4).
 * Situation du service en temps réel, SANS aucune donnée nominative.
 * Indicateurs fournis par GET /api/stats/public (public, agrégé, anonyme).
 */
export default function PublicDashboard() {
  const { data, loading, error } = useApi('/stats/public', { pollMs: 15000 });
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-title text-3xl text-brand-navy">
          Service des urgences — Situation en temps réel
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          Données globales agrégées du service hospitalier, mises à jour automatiquement.
        </p>
      </div>

      {/* Urgence vitale */}
      <div className="bg-red-50 border-2 border-priority-p1 text-red-800 p-4 rounded-lg flex items-center gap-3">
        <Phone size={22} className="shrink-0" />
        <p className="text-sm font-semibold">
          Urgence vitale ? N'attendez pas : appelez le <b>190</b> ou présentez-vous immédiatement à
          l'accueil des urgences.
        </p>
      </div>

      {/* 4 Indicateurs clés (temps réel) */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          Indicateurs momentanément indisponibles ({error})
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-blue">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-brand-slate">Saturation</span>
              <Activity className="text-brand-blue" size={24} />
            </div>
            <p className="text-2xl font-bold text-brand-navy mt-2">
              {loading ? '…' : `${stats?.saturation ?? 0}%`}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-turquoise">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-brand-slate">Box libres</span>
              <BedDouble className="text-brand-turquoise" size={24} />
            </div>
            <p className="text-2xl font-bold text-brand-navy mt-2">
              {loading ? '…' : `${stats?.boxLibres ?? 0} / ${stats?.boxTotal ?? 0}`}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-slate">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-brand-slate">Patients en attente</span>
              <Users className="text-brand-slate" size={24} />
            </div>
            <p className="text-2xl font-bold text-brand-navy mt-2">
              {loading ? '…' : stats?.patientsEnAttente ?? 0}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-darkTurquoise">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-brand-slate">Attente moyenne</span>
              <Clock className="text-brand-darkTurquoise" size={24} />
            </div>
            <p className="text-2xl font-bold text-brand-navy mt-2">
              {loading ? '…' : `${stats?.attenteMoyenne ?? 0} min`}
            </p>
          </div>
        </div>
      )}

      {/* Parcours type aux urgences */}
      <div className="bg-brand-bg p-5 rounded-lg border border-gray-200">
        <h2 className="font-bold text-brand-navy mb-2">Votre parcours aux urgences</h2>
        <p className="text-sm text-brand-slate">
          1. Accueil et enregistrement du dossier → 2. Triage par l'infirmier (niveau de priorité
          P1 à P4) → 3. Attente classée par priorité → 4. Consultation médicale → 5. Orientation
          (retour à domicile, hospitalisation ou transfert).
        </p>
      </div>

      {/* Cartes d'accès Extranet par rôle */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-semibold text-xl text-brand-navy mb-4">Accès aux espaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['Accueil', 'Infirmier', 'Médecin', 'Responsable', 'Patient'].map((role) => (
            <div
              key={role}
              className="border p-4 rounded-lg text-center bg-brand-bg flex flex-col justify-between"
            >
              <h3 className="font-bold text-brand-navy mb-2">{role}</h3>
              <Link
                to="/login"
                className="mt-2 w-full bg-brand-blue hover:bg-brand-navy text-white text-xs py-2 rounded font-semibold transition inline-block"
              >
                Se connecter
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-brand-slate mt-4 text-center">
          Seul le compte patient peut être créé en ligne — les comptes du personnel sont créés par le
          responsable du service.
        </p>
      </div>
    </div>
  );
}
