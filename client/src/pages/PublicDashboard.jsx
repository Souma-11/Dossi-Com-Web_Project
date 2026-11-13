import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Stethoscope, Users, Clock, PhoneCall, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { DEMO_STATS } from '../data/demoData';

const SPACES = [
  {
    role: 'accueil',
    title: 'Accueil',
    desc: 'Enregistrement et ouverture des passages',
  },
  {
    role: 'infirmier',
    title: 'Infirmier',
    desc: 'Triage P1–P4 et suivi des alertes',
  },
  {
    role: 'medecin',
    title: 'Médecin',
    desc: 'Consultations, examens et orientation',
  },
  {
    role: 'responsable',
    title: 'Responsable',
    desc: 'Supervision, salles et personnel',
  },
  {
    role: 'patient',
    title: 'Patient',
    desc: 'Suivi de mon passage en temps réel',
  },
];

export default function PublicDashboard() {
  const [stats, setStats] = useState(DEMO_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/public/stats')
      .then((res) => {
        if (isMounted && res.data && Number(res.data.patientsEnAttente) > 0) {
          setStats((prev) => ({ ...prev, ...res.data }));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-h-[calc(100vh-8.5rem)]">
      {/* Bandeau principal */}
      <div className="dc-card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <img
          src="/dossicom-icone-512_2.png"
          alt="Dossi'Com"
          height="52"
          className="h-[52px] w-[52px] object-contain shrink-0"
        />
        <div>
          <h1 className="dc-h1">Service des urgences — Situation en temps réel</h1>
          <p className="text-sm text-[#334155] mt-1">
            Données globales agrégées du service hospitalier, sans aucune donnée nominative.
          </p>
        </div>
      </div>

      {/* Alerte urgence vitale */}
      <div
        role="alert"
        className="p-4 rounded-[10px] bg-red-50 border-2 border-[#C8102E] text-[#991B1B] text-sm font-semibold flex items-start sm:items-center gap-3"
      >
        <PhoneCall className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5 sm:mt-0" />
        <span>
          Urgence vitale ? N&apos;attendez pas : appelez le{' '}
          <strong className="underline text-[#C8102E]">190</strong> ou présentez-vous immédiatement à
          l&apos;accueil des urgences.
        </span>
      </div>

      {/* 4 cartes indicateurs avec Skeleton de chargement */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="dc-card p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-8 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dc-card p-5 border-l-4 border-l-[#0B4F9E]">
            <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
              <span>Saturation du service</span>
              <Activity className="w-5 h-5 text-[#0B4F9E]" />
            </div>
            <div className="font-display font-bold text-3xl text-[#0B2A5B]">
              {stats.saturation}%
            </div>
          </div>

          <div className="dc-card p-5 border-l-4 border-l-[#0E7C86]">
            <div className="flex items-center justify-between text-sm font-semibold text-[#334155] mb-2">
              <span>Box libres / Médecins</span>
              <Stethoscope className="w-5 h-5 text-[#0B4F9E]" />
            </div>
            <div className="font-display font-bold text-3xl text-[#0B2A5B]">
              {stats.boxLibres} / {stats.medecinsActifs}
            </div>
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
      )}

      {/* Parcours patient */}
      <div className="dc-card p-6">
        <h2 className="dc-h2 mb-4">Votre parcours aux urgences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm font-semibold text-[#0B2A5B]">
          <div className="p-4 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
            1. Accueil et enregistrement du dossier
          </div>
          <div className="p-4 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
            2. Triage par l&apos;infirmier (priorité P1 à P4)
          </div>
          <div className="p-4 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
            3. Attente classée par priorité clinique
          </div>
          <div className="p-4 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
            4. Consultation médicale et examens
          </div>
          <div className="p-4 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1]">
            5. Orientation (retour, hospitalisation, transfert)
          </div>
        </div>
      </div>

      {/* Accès aux 5 espaces */}
      <div className="dc-card p-6">
        <h2 className="dc-h2 mb-4">Accès aux espaces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SPACES.map((space) => (
            <div
              key={space.role}
              className="border border-[#CBD5E1] rounded-[10px] p-4 flex flex-col justify-between text-center bg-white"
            >
              <div>
                <h3 className="font-bold text-base text-[#0B2A5B]">{space.title}</h3>
                <p className="text-sm text-[#334155] mt-1.5 mb-4">{space.desc}</p>
              </div>
              <Link to={`/login?role=${space.role}`} className="dc-btn-primary w-full text-sm">
                Se connecter
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}