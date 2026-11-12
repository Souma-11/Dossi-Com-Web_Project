import { Clock, Info, Activity } from 'lucide-react';
import PriorityBadge from '../components/ui/PriorityBadge';

export default function PatientDashboard() {
  // Données fictives du patient connecté
  const patientData = {
    nom: 'Dupont',
    prenom: 'Jean',
    statut: 'En attente de consultation',
    priorite: 'P3', // Affichera notre badge Bleu !
    tempsAttenteEstime: '1h 15',
    heureArrivee: '14h30',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête de bienvenue */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <h1 className="font-title text-2xl text-brand-navy mb-2">
          Bonjour {patientData.prenom} {patientData.nom}
        </h1>
        <p className="text-brand-slate text-sm">
          Bienvenue dans votre espace personnel Dossi'Com. Vous pouvez suivre l'avancée de votre prise en charge ici.
        </p>
      </div>

      {/* Statut actuel avec couleur de fond de la charte */}
      <div className="bg-brand-navy text-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity size={32} className="text-brand-turquoise" />
          <div>
            <p className="text-sm text-blue-200">Statut actuel</p>
            <p className="text-xl font-bold">{patientData.statut}</p>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-3 rounded-lg text-center flex flex-col items-center">
          <p className="text-xs text-blue-200 mb-2">Niveau d'urgence évalué par l'infirmier</p>
          <PriorityBadge level={patientData.priorite} />
        </div>
      </div>

      {/* Informations d'attente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start gap-4">
          <Clock className="text-brand-blue flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-brand-navy">Temps d'attente estimé</h3>
            <p className="text-3xl font-bold text-brand-darkTurquoise mt-2">{patientData.tempsAttenteEstime}</p>
            <p className="text-xs text-brand-slate mt-3 leading-relaxed">
              Ce temps est une estimation et peut varier en fonction de l'arrivée d'urgences vitales absolues (P1/P2) qui sont prioritaires.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 flex items-start gap-4">
          <Info className="text-brand-blue flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-brand-navy">Consignes importantes</h3>
            <ul className="text-sm text-brand-navy mt-3 space-y-2 list-disc list-inside">
              <li>Heure d'arrivée : <span className="font-bold">{patientData.heureArrivee}</span></li>
              <li>Merci de rester en salle d'attente.</li>
              <li>Gardez vos documents d'identité à portée de main.</li>
              <li>En cas d'aggravation de vos symptômes, signalez-le immédiatement à l'accueil.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}