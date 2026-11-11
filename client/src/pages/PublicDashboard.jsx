import { Link } from 'react-router-dom';
import { Users, Activity, Clock, UserCheck } from 'lucide-react';

export default function PublicDashboard() {
  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-title text-3xl text-brand-navy">
          Service des urgences - Situation en temps réel
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          Données globales agrégées du service hospitalier.
        </p>
      </div>

      {/* 4 Indicateurs clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-blue">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-brand-slate">Saturation</span>
            <Activity className="text-brand-blue" size={24} />
          </div>
          <p className="text-2xl font-bold text-brand-navy mt-2">45%</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-turquoise">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-brand-slate">Médecins présents</span>
            <UserCheck className="text-brand-turquoise" size={24} />
          </div>
          <p className="text-2xl font-bold text-brand-navy mt-2">6</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-slate">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-brand-slate">Patients en attente</span>
            <Users className="text-brand-slate" size={24} />
          </div>
          <p className="text-2xl font-bold text-brand-navy mt-2">12</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-darkTurquoise">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-brand-slate">Attente moyenne</span>
            <Clock className="text-brand-darkTurquoise" size={24} />
          </div>
          <p className="text-2xl font-bold text-brand-navy mt-2">25 min</p>
        </div>
      </div>

      {/* Cartes d'accès Extranet par rôle */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-semibold text-xl text-brand-navy mb-4">Accès aux espaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['Accueil', 'Infirmier', 'Médecin', 'Responsable', 'Patient'].map((role) => (
            <div key={role} className="border p-4 rounded-lg text-center bg-brand-bg flex flex-col justify-between">
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
      </div>
    </div>
  );
}