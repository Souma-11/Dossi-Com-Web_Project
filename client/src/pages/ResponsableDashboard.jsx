import { LayoutDashboard, Users, Clock, Bed, TrendingUp } from 'lucide-react';

export default function ResponsableDashboard() {
  // Données fictives pour la gestion des lits
  const lits = [
    { id: 'Box 1', status: 'occupé', patient: 'Jean Dupont' },
    { id: 'Box 2', status: 'occupé', patient: 'Émilie Moreau' },
    { id: 'Box 3', status: 'libre', patient: null },
    { id: 'Box 4', status: 'nettoyage', patient: null },
    { id: 'Déchoquage', status: 'occupé', patient: 'Patient Inconnu' },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-title text-2xl text-brand-navy flex items-center gap-2">
          <LayoutDashboard className="text-brand-turquoise" />
          Espace Responsable - Supervision
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          Pilotage de l'activité du service et gestion des ressources.
        </p>
      </div>

      {/* Statistiques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full text-brand-blue">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-slate">Patients totaux (24h)</p>
            <p className="text-2xl font-bold text-brand-navy">142</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-full text-orange-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-slate">Temps moyen (Urgence relative)</p>
            <p className="text-2xl font-bold text-brand-navy">3h 15</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full text-green-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-slate">Taux de saturation</p>
            <p className="text-2xl font-bold text-brand-navy">85%</p>
          </div>
        </div>
      </div>

      {/* Gestion des Lits / Box */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-bold text-lg text-brand-navy mb-4 flex items-center gap-2">
          <Bed className="text-brand-slate" />
          État des Box / Lits
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {lits.map((lit) => (
            <div 
              key={lit.id} 
              className={`border rounded-lg p-4 text-center ${
                lit.status === 'libre' ? 'border-green-300 bg-green-50' : 
                lit.status === 'occupé' ? 'border-red-300 bg-red-50' : 
                'border-yellow-300 bg-yellow-50'
              }`}
            >
              <h3 className="font-bold text-brand-navy">{lit.id}</h3>
              <p className={`text-xs font-semibold mt-1 uppercase ${
                lit.status === 'libre' ? 'text-green-600' : 
                lit.status === 'occupé' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {lit.status}
              </p>
              {lit.patient && (
                <p className="text-xs text-brand-slate mt-2 truncate">{lit.patient}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}