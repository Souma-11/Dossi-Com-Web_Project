import {
  Clock,
  CheckCircle2,
  FileText,
  Users,
  MapPin,
  Info,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_PASSAGES } from '../data/demoData';

const STEPS = [
  { id: 1, label: 'Enregistrement administratif à l’accueil', done: true },
  { id: 2, label: 'Évaluation et triage infirmier (Priorité P2)', done: true },
  { id: 3, label: 'En attente de consultation médicale', active: true },
  { id: 4, label: 'Consultation médicale et examens complémentaires', done: false },
  { id: 5, label: 'Décision d’orientation et remise du compte-rendu', done: false },
];

export default function PatientDashboard() {
  const { user } = useAuth();

  const dossierIndex = DEMO_PASSAGES.findIndex((p) => p.numero_dossier === 'UR-2026-0002');
  const monDossier = dossierIndex >= 0 ? DEMO_PASSAGES[dossierIndex] : DEMO_PASSAGES[1];
  const patientsAvantVous = Math.max(0, dossierIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-h-[calc(100vh-8.5rem)]">
      {/* Bandeau patient */}
      <div className="dc-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-mono font-bold text-[#0B4F9E] uppercase">
            Dossier {monDossier.numero_dossier}
          </span>
          <h1 className="dc-h1 mt-1">
            Bonjour, {user?.prenom || monDossier.patient_prenom}{' '}
            {user?.nom || monDossier.patient_nom}
          </h1>
          <p className="text-sm text-[#334155] mt-1">
            Suivi en temps réel de votre passage aux urgences hospitalières.
          </p>
        </div>

        <div className="px-4 py-3 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1] text-left md:text-right">
          <span className="text-sm font-semibold text-[#334155] block">Priorité clinique</span>
          <span className="font-display font-bold text-xl text-[#0B2A5B]">
            {monDossier.priorite} — Urgence absolue
          </span>
        </div>
      </div>

      {/* 3 cartes indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dc-card p-5 border-l-4 border-l-[#0B4F9E]">
          <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
            <span>Position dans la file</span>
            <Users className="w-5 h-5 text-[#0B4F9E]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#0B2A5B]">
            {String(patientsAvantVous).padStart(2, '0')} patient avant vous
          </div>
          <p className="text-sm text-[#334155] mt-1.5">
            Rang #{dossierIndex + 1} sur {String(DEMO_PASSAGES.length).padStart(2, '0')} dossiers
          </p>
        </div>

        <div className="dc-card p-5 border-l-4 border-l-[#0E7C86]">
          <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
            <span>Attente estimée</span>
            <Clock className="w-5 h-5 text-[#0B4F9E]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#0B2A5B]">
            {monDossier.attente_min} min
          </div>
          <p className="text-sm text-[#334155] mt-1.5">
            Arrivée enregistrée à {monDossier.heure_arrivee}
          </p>
        </div>

        <div className="dc-card p-5 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
            <span>Salle d&apos;orientation</span>
            <MapPin className="w-5 h-5 text-[#0B4F9E]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#0B2A5B]">{monDossier.box}</div>
          <p className="text-sm text-[#334155] mt-1.5">Motif : {monDossier.motif_admission}</p>
        </div>
      </div>

      {/* Grille 2 colonnes : Étapes du parcours + Consignes pratiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dc-card p-6">
          <h2 className="dc-h2 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0B4F9E]" />
            Avancement de votre prise en charge
          </h2>
          <div className="space-y-3">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-[8px] border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm ${
                  step.active
                    ? 'bg-[#EEF3F9] border-2 border-[#0B4F9E] font-bold text-[#0B2A5B]'
                    : step.done
                      ? 'bg-white border-[#CBD5E1] font-medium text-[#0F172A]'
                      : 'bg-slate-50 border-[#CBD5E1] text-[#334155]'
                }`}
              >
                <span>
                  {step.id}. {step.label}
                </span>
                {step.done && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B5E66]">
                    <CheckCircle2 className="w-4 h-4" />
                    Terminé
                  </span>
                )}
                {step.active && (
                  <span className="text-sm px-3 py-1 rounded-full bg-[#0B4F9E] text-white font-semibold self-start sm:self-auto">
                    Étape en cours
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="dc-card p-6 space-y-4">
          <h2 className="dc-h2 flex items-center gap-2">
            <Info className="w-5 h-5 text-[#0E7C86]" />
            Consignes pendant l&apos;attente
          </h2>

          <div className="space-y-3 text-sm text-[#334155]">
            <div className="p-3.5 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
              <strong className="text-[#0B2A5B] block mb-1">Restez à jeun</strong>
              Ne buvez pas et ne mangez pas avant l&apos;avis du médecin en cas d&apos;examen ou de
              radio.
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
              <strong className="text-[#0B2A5B] block mb-1">Documents à préparer</strong>
              Gardez votre pièce d&apos;identité, carte de soins et vos dernières ordonnances à
              portée de main.
            </div>

            <div className="p-3.5 rounded-[8px] bg-red-50 border border-[#C8102E] text-[#991B1B]">
              <strong className="flex items-center gap-1.5 text-[#C8102E] mb-1">
                <PhoneCall className="w-4 h-4" />
                Aggravation des symptômes
              </strong>
              Signalez immédiatement toute douleur nouvelle, malaise ou gêne respiratoire au poste
              infirmier.
            </div>

            <div className="pt-2 flex items-center gap-2 text-sm font-semibold text-[#0B2A5B]">
              <ShieldCheck className="w-4 h-4 text-[#0E7C86]" />
              Données médicales protégées
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}