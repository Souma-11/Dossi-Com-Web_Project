import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const ESPACES = [
  {
    id: 'accueil',
    titre: 'Accueil',
    description: 'Enregistrement des patients et ouverture des passages.',
    image: '/images/accueil.jpg',
    fallbackGradient: 'from-[#0B2A5B] to-[#0B4F9E]',
  },
  {
    id: 'infirmier',
    titre: 'Infirmier',
    description: 'Évaluation clinique, triage P1 à P4 et gestion des alertes.',
    image: '/images/infirmier.jpg',
    fallbackGradient: 'from-[#0E7C86] to-[#1FAFB5]',
  },
  {
    id: 'medecin',
    titre: 'Médecin',
    description: 'Consultation des dossiers assignés, examens et orientation.',
    image: '/images/medecin.jpg',
    fallbackGradient: 'from-[#0B2A5B] to-[#12304F]',
  },
  {
    id: 'responsable',
    titre: 'Responsable',
    description: 'Supervision du service, comptes, salles et journal.',
    image: '/images/responsable.jpg',
    fallbackGradient: 'from-[#12304F] to-[#3B4A63]',
  },
  {
    id: 'patient',
    titre: 'Patient',
    description: 'Suivi de votre passage en temps réel et consignes.',
    image: '/images/patient.jpg',
    fallbackGradient: 'from-[#0B4F9E] to-[#0E7C86]',
  },
];

const ETAPES_PARCOURS = [
  {
    numero: '01',
    titre: 'Enregistré',
    detail: 'Accueil administratif et ouverture du dossier de passage.',
  },
  {
    numero: '02',
    titre: 'Triage',
    detail: 'Évaluation infirmière et attribution de la priorité (P1 à P4).',
  },
  {
    numero: '03',
    titre: 'En attente',
    detail: 'Suivi de votre position et estimation indicative en salle.',
  },
  {
    numero: '04',
    titre: 'Consultation',
    detail: 'Prise en charge médicale en salle et examens nécessaires.',
  },
  {
    numero: '05',
    titre: 'Orientation',
    detail: 'Remise des consignes de sortie ou orientation hospitalière.',
  },
];

// Extrait un entier depuis un nombre ou une chaîne ("85 %", "45 min", etc.)
function parseNumericValue(raw, fallback = 0) {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return Math.max(0, Math.round(raw));
  if (typeof raw === 'string') {
    const match = raw.match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  return fallback;
}

// Hook d'animation progressive des compteurs numériques (sans setState synchrone dans useEffect)
function useAnimatedNumber(target, duration = 650) {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const startValue = currentRef.current;
    if (startValue === target) return;

    let startTime = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + (target - startValue) * eased);

      currentRef.current = nextValue;
      setCurrent(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return current;
}

function EspaceCard({ espace }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="dossi-card group overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-md">
      <div>
        <div
          className={`relative h-40 w-full overflow-hidden bg-gradient-to-br ${espace.fallbackGradient}`}
        >
          {!imgError && (
            <img
              src={espace.image}
              alt={`Espace ${espace.titre}`}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2A5B]/55 via-transparent to-transparent" />
          <span className="absolute bottom-2.5 left-3.5 inline-block rounded-md bg-white/95 px-2.5 py-0.5 text-xs font-bold text-[#0B2A5B] shadow-sm">
            {espace.titre}
          </span>
        </div>

        <div className="p-4 pb-2">
          <h3 className="text-base font-bold text-[#0B2A5B]">
            Espace {espace.titre}
          </h3>
          <p className="text-xs text-[#5B6675] mt-1.5 leading-relaxed">
            {espace.description}
          </p>
        </div>
      </div>

      <div className="p-4 pt-3">
        <Link
          to={`/login?role=${espace.id}`}
          className="btn-secondary block w-full py-2 px-3 text-sm text-center"
        >
          Se connecter
        </Link>
      </div>
    </article>
  );
}

export default function PublicDashboard({ stats }) {
  const saturationVal = Math.min(100, parseNumericValue(stats?.saturation, 0));
  const medecinsVal = parseNumericValue(stats?.medecinsPresents, 0);
  const attenteVal = parseNumericValue(stats?.patientsAttente, 0);
  const delaiVal = parseNumericValue(stats?.attenteMoyenne, 0);

  const animSaturation = useAnimatedNumber(saturationVal);
  const animMedecins = useAnimatedNumber(medecinsVal);
  const animAttente = useAnimatedNumber(attenteVal);
  const animDelai = useAnimatedNumber(delaiVal);

  // Détermination dynamique des états selon les seuils du service
  const etatSaturation =
    saturationVal >= 90
      ? {
          cardClass: 'kpi-critical',
          valueColor: 'text-[#C8102E]',
          barColor: 'bg-[#C8102E]',
          badgeClass: 'bg-[#C8102E]/10 text-[#C8102E]',
          badgeText: saturationVal >= 100 ? 'Service complet' : 'Saturation max',
          isCritical: true,
        }
      : saturationVal >= 70
      ? {
          cardClass: 'kpi-warning',
          valueColor: 'text-[#B85C00]',
          barColor: 'bg-[#B85C00]',
          badgeClass: 'bg-[#B85C00]/10 text-[#B85C00]',
          badgeText: 'Affluence élevée',
          isCritical: false,
        }
      : {
          cardClass: 'kpi-navy',
          valueColor: 'text-[#0B2A5B]',
          barColor: 'bg-[#1FAFB5]',
          badgeClass: 'bg-[#EEF3F9] text-[#0E7C86]',
          badgeText: 'Capacité normale',
          isCritical: false,
        };

  const etatMedecins =
    medecinsVal > 0
      ? {
          cardClass: 'kpi-turquoise',
          valueColor: 'text-[#0B2A5B]',
          badgeClass: 'bg-[#1B7F4B]/10 text-[#1B7F4B]',
          badgeText: 'Équipe en garde',
          isActive: true,
        }
      : {
          cardClass: 'kpi-turquoise',
          valueColor: 'text-[#0B2A5B]',
          badgeClass: 'bg-[#EEF3F9] text-[#5B6675]',
          badgeText: 'En attente de données',
          isActive: false,
        };

  const etatAttente =
    attenteVal >= 20
      ? {
          cardClass: 'kpi-critical',
          valueColor: 'text-[#C8102E]',
          badgeClass: 'bg-[#C8102E]/10 text-[#C8102E]',
          badgeText: 'File saturée',
          isCritical: true,
        }
      : attenteVal >= 10
      ? {
          cardClass: 'kpi-warning',
          valueColor: 'text-[#B85C00]',
          badgeClass: 'bg-[#B85C00]/10 text-[#B85C00]',
          badgeText: 'Flux soutenu',
          isCritical: false,
        }
      : {
          cardClass: 'kpi-institutional',
          valueColor: 'text-[#0B2A5B]',
          badgeClass: 'bg-[#EEF3F9] text-[#0B4F9E]',
          badgeText: 'Flux régulier',
          isCritical: false,
        };

  const etatDelai =
    delaiVal >= 60
      ? {
          cardClass: 'kpi-critical',
          valueColor: 'text-[#C8102E]',
          badgeClass: 'bg-[#C8102E]/10 text-[#C8102E]',
          badgeText: 'Délai élevé',
          isCritical: true,
        }
      : delaiVal >= 30
      ? {
          cardClass: 'kpi-warning',
          valueColor: 'text-[#B85C00]',
          badgeClass: 'bg-[#B85C00]/10 text-[#B85C00]',
          badgeText: 'Délai modéré',
          isCritical: false,
        }
      : {
          cardClass: 'kpi-turquoise',
          valueColor: 'text-[#0B2A5B]',
          badgeClass: 'bg-[#EEF3F9] text-[#0E7C86]',
          badgeText: 'Prise en charge rapide',
          isCritical: false,
        };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Bandeau principal : Service des urgences avec tracé ECG animé */}
      <section
        id="service"
        className="animate-fade-up relative overflow-hidden bg-[#0B2A5B] text-white rounded-lg p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <svg
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[540px] h-28 hidden sm:block"
          viewBox="0 0 540 100"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="ecg-wave"
            d="M0 55 H160 L175 45 L188 55 H205 L218 18 L232 84 L246 34 L258 55 H285 L302 42 L318 55 H540"
            stroke="#1FAFB5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1FAFB5] mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1FAFB5] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1FAFB5]" />
            </span>
            <span>Suivi public agrégé · Sans donnée nominative</span>
          </div>

          <h1
            style={{ fontFamily: 'var(--font-title)', color: '#FFFFFF' }}
            className="text-3xl sm:text-4xl font-bold"
          >
            Service des urgences
          </h1>
          <p className="text-sm sm:text-base text-slate-200 mt-1">
            Situation du service en temps réel
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-[#0E7C86] hover:bg-[#1FAFB5] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Accéder à l’Extranet
          </Link>
        </div>
      </section>

      {/* 4 Indicateurs clés animés et réactifs selon les seuils */}
      <section
        aria-label="Indicateurs du service en temps réel"
        className="animate-fade-up"
        style={{ animationDelay: '80ms' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Saturation + Jauge animée */}
          <div className={`dossi-kpi p-5 flex flex-col justify-between ${etatSaturation.cardClass}`}>
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium text-[#5B6675]">
                  Saturation
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${etatSaturation.badgeClass}`}
                >
                  {etatSaturation.isCritical && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-ping" />
                  )}
                  {etatSaturation.badgeText}
                </span>
              </div>

              <p className={`text-3xl font-bold tabular-nums ${etatSaturation.valueColor}`}>
                {String(animSaturation).padStart(2, '0')} %
              </p>
            </div>

            <div
              className="w-full h-1.5 bg-[#EEF3F9] rounded-full overflow-hidden mt-3"
              role="progressbar"
              aria-valuenow={saturationVal}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Taux de saturation du service"
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${etatSaturation.barColor}`}
                style={{ width: `${saturationVal}%` }}
              />
            </div>
          </div>

          {/* 2. Médecins présents */}
          <div className={`dossi-kpi p-5 flex flex-col justify-between ${etatMedecins.cardClass}`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-[#5B6675]">
                Médecins présents
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${etatMedecins.badgeClass}`}
              >
                {etatMedecins.isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B7F4B]" />
                )}
                {etatMedecins.badgeText}
              </span>
            </div>

            <p className={`text-3xl font-bold tabular-nums ${etatMedecins.valueColor}`}>
              {String(animMedecins).padStart(2, '0')}
            </p>
          </div>

          {/* 3. Patients en attente */}
          <div className={`dossi-kpi p-5 flex flex-col justify-between ${etatAttente.cardClass}`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-[#5B6675]">
                Patients en attente
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${etatAttente.badgeClass}`}
              >
                {etatAttente.isCritical && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-ping" />
                )}
                {etatAttente.badgeText}
              </span>
            </div>

            <p className={`text-3xl font-bold tabular-nums ${etatAttente.valueColor}`}>
              {String(animAttente).padStart(2, '0')}
            </p>
          </div>

          {/* 4. Attente moyenne */}
          <div className={`dossi-kpi p-5 flex flex-col justify-between ${etatDelai.cardClass}`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-[#5B6675]">
                Attente moyenne
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${etatDelai.badgeClass}`}
              >
                {etatDelai.isCritical && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-ping" />
                )}
                {etatDelai.badgeText}
              </span>
            </div>

            <p className={`text-3xl font-bold tabular-nums ${etatDelai.valueColor}`}>
              {String(animDelai).padStart(2, '0')} min
            </p>
          </div>
        </div>
      </section>

      {/* Accès aux 5 espaces avec photos */}
      <section
        id="espaces"
        className="animate-fade-up space-y-4"
        style={{ animationDelay: '160ms' }}
      >
        <div className="flex items-center justify-between">
          <h2>Accès aux espaces</h2>
          <span className="text-caption hidden sm:inline">
            Connexion sécurisée selon votre profil
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ESPACES.map((espace) => (
            <EspaceCard key={espace.id} espace={espace} />
          ))}
        </div>
      </section>

      {/* Votre parcours aux urgences */}
      <section
        className="animate-fade-up dossi-card p-6 space-y-6"
        style={{ animationDelay: '240ms' }}
      >
        <div>
          <h2>Votre parcours aux urgences</h2>
          <p className="text-caption mt-1">
            Les 5 étapes de votre prise en charge au sein du service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {ETAPES_PARCOURS.map((etape, index) => (
            <div
              key={etape.numero}
              className="relative flex flex-col items-start md:items-center md:text-center p-4 rounded-lg bg-[#EEF3F9]/60 border border-[#D5DEEA] transition-colors hover:border-[#1FAFB5]"
            >
              <div className="w-9 h-9 rounded-full bg-[#0B2A5B] text-white font-bold text-sm flex items-center justify-center tabular-nums mb-3">
                {index + 1}
              </div>
              <h3 className="text-sm font-bold text-[#0B2A5B]">
                {etape.titre}
              </h3>
              <p className="text-xs text-[#5B6675] mt-1 leading-relaxed">
                {etape.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Encadré Urgence vitale : 190 */}
      <section
        aria-label="Numéro d'urgence vitale"
        className="animate-fade-up dossi-card border-l-4 border-l-[#C8102E] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ animationDelay: '320ms' }}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#C8102E]/10 text-[#C8102E] flex items-center justify-center shrink-0 mt-0.5">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[#C8102E] font-bold">
              Urgence vitale ? Appelez le 190
            </h2>
            <p className="text-sm text-[#5B6675] mt-1">
              En cas de détresse respiratoire, douleur thoracique intense,
              perte de connaissance ou hémorragie importante, contactez
              immédiatement le SAMU (190) ou présentez-vous directement à
              l’accueil des urgences.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}