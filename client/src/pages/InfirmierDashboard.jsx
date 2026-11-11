import { useState } from 'react';
import { ClipboardList, Activity, AlertCircle } from 'lucide-react';
import PriorityBadge from '../components/ui/PriorityBadge';

// Fausse base de données en attendant le backend
const MOCK_PATIENTS = [
  { id: 1, nom: 'Dupont', prenom: 'Jean', motif: 'Douleur thoracique', attente: '15 min' },
  { id: 2, nom: 'Martin', prenom: 'Sophie', motif: 'Entorse cheville', attente: '45 min' },
  { id: 3, nom: 'Leroy', prenom: 'Lucas', motif: 'Fièvre persistante', attente: '1h 20' },
];

export default function InfirmierDashboard() {
  const [patients] = useState(MOCK_PATIENTS);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-title text-2xl text-brand-navy flex items-center gap-2">
          <ClipboardList className="text-brand-turquoise" />
          Espace Infirmier (IAO) - File d'attente & Tri
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          Évaluation des patients et attribution des niveaux de priorité.
        </p>
      </div>

      {/* Liste des patients à trier */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-brand-navy">Patients en attente de tri ({patients.length})</h2>
          <AlertCircle size={20} className="text-brand-slate" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-xs uppercase text-brand-slate border-b">
                <th className="p-4">Patient</th>
                <th className="p-4">Motif</th>
                <th className="p-4">Attente</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-brand-bg transition">
                  <td className="p-4">
                    <p className="font-bold text-brand-navy">{patient.nom} {patient.prenom}</p>
                  </td>
                  <td className="p-4 text-sm text-brand-slate">{patient.motif}</td>
                  <td className="p-4 text-sm font-semibold text-brand-darkTurquoise">{patient.attente}</td>
                  <td className="p-4 text-center">
                    <button className="flex items-center justify-center gap-1 mx-auto bg-brand-blue hover:bg-brand-navy text-white text-xs font-bold py-1.5 px-3 rounded transition">
                      <Activity size={14} />
                      Évaluer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Légende des priorités avec notre composant réutilisable */}
      <div className="bg-brand-bg p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-bold text-brand-navy mb-3">Rappel des priorités (Test d'intégration du Badge) :</h3>
        <div className="flex flex-wrap gap-3">
          <PriorityBadge level="P1" />
          <PriorityBadge level="P2" />
          <PriorityBadge level="P3" />
          <PriorityBadge level="P4" />
        </div>
      </div>
    </div>
  );
}