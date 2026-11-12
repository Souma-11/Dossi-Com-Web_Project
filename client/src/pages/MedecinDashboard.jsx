import { useState } from 'react';
import { Stethoscope, Eye } from 'lucide-react';
import PriorityBadge from '../components/ui/PriorityBadge';

// Liste fictive de patients déjà triés par l'infirmier (IAO)
const MOCK_PATIENTS = [
  { id: 1, nom: 'Dupont', prenom: 'Jean', motif: 'Douleur thoracique aigüe', priority: 'P1', temps: '5 min' },
  { id: 2, nom: 'Moreau', prenom: 'Émilie', motif: 'Coupure profonde au bras', priority: 'P2', temps: '20 min' },
  { id: 3, nom: 'Leroy', prenom: 'Lucas', motif: 'Fièvre persistante, toux', priority: 'P3', temps: '1h 10' },
];

export default function MedecinDashboard() {
  const [patients] = useState(MOCK_PATIENTS);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-title text-2xl text-brand-navy flex items-center gap-2">
          <Stethoscope className="text-brand-turquoise" />
          Espace Médecin - Consultations
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          Prise en charge médicale des patients triés.
        </p>
      </div>

      {/* Grille des patients sous forme de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map(patient => (
          <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition">
            
            {/* Informations du patient */}
            <div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-brand-navy">{patient.nom} {patient.prenom}</h3>
                <PriorityBadge level={patient.priority} />
              </div>
              <p className="text-sm text-brand-slate mb-2">
                <span className="font-semibold">Motif :</span> {patient.motif}
              </p>
              <p className="text-xs text-brand-darkTurquoise font-medium mb-4">
                En attente depuis : {patient.temps}
              </p>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button className="flex-1 flex items-center justify-center gap-1 bg-brand-blue hover:bg-brand-navy text-white text-xs font-bold py-2 rounded transition">
                <Stethoscope size={14} />
                Consulter
              </button>
              <button 
                title="Voir le dossier"
                className="flex items-center justify-center gap-1 bg-brand-bg hover:bg-gray-200 text-brand-navy text-xs font-bold py-2 px-3 rounded transition border border-gray-300"
              >
                <Eye size={16} />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}