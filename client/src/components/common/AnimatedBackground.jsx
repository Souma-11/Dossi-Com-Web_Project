import { useLocation } from 'react-router-dom';

const VARIANT_PALETTES = {
  accueil: {
    orbTop: 'bg-[#0B4F9E]/20',
    orbBottom: 'bg-[#1FAFB5]/20',
    orbCenter: 'bg-[#0B2A5B]/10',
    ecgStroke: '#0B4F9E',
    ringBorder: 'border-[#0B4F9E]/20',
  },
  infirmier: {
    orbTop: 'bg-[#0E7C86]/22',
    orbBottom: 'bg-[#1FAFB5]/22',
    orbCenter: 'bg-[#0B4F9E]/12',
    ecgStroke: '#0E7C86',
    ringBorder: 'border-[#0E7C86]/25',
  },
  medecin: {
    orbTop: 'bg-[#0B2A5B]/18',
    orbBottom: 'bg-[#1FAFB5]/20',
    orbCenter: 'bg-[#0B4F9E]/12',
    ecgStroke: '#1FAFB5',
    ringBorder: 'border-[#1FAFB5]/25',
  },
  responsable: {
    orbTop: 'bg-[#12304F]/18',
    orbBottom: 'bg-[#0B4F9E]/18',
    orbCenter: 'bg-[#0E7C86]/12',
    ecgStroke: '#0B4F9E',
    ringBorder: 'border-[#0B4F9E]/20',
  },
  patient: {
    orbTop: 'bg-[#1FAFB5]/24',
    orbBottom: 'bg-[#0E7C86]/18',
    orbCenter: 'bg-[#0B4F9E]/10',
    ecgStroke: '#1FAFB5',
    ringBorder: 'border-[#1FAFB5]/25',
  },
  default: {
    orbTop: 'bg-[#1FAFB5]/20',
    orbBottom: 'bg-[#0B4F9E]/15',
    orbCenter: 'bg-[#0E7C86]/15',
    ecgStroke: '#0E7C86',
    ringBorder: 'border-[#1FAFB5]/20',
  },
};

function detectSpaceFromPath(pathname) {
  if (pathname.startsWith('/accueil')) return 'accueil';
  if (pathname.startsWith('/infirmier')) return 'infirmier';
  if (pathname.startsWith('/medecin')) return 'medecin';
  if (pathname.startsWith('/responsable')) return 'responsable';
  if (pathname.startsWith('/patient')) return 'patient';
  return 'default';
}

export default function AnimatedBackground({ variant }) {
  const { pathname } = useLocation();
  const activeKey = variant || detectSpaceFromPath(pathname);
  const palette = VARIANT_PALETTES[activeKey] || VARIANT_PALETTES.default;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none fixed inset-0 z-0 overflow-hidden bg-[#EEF3F9]"
    >
      {/* Grille médicale subtile */}
      <div className="bg-medical-grid absolute inset-0 opacity-85" />

      {/* Halos lumineux flottants */}
      <div
        className={`animate-float-slow absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl ${palette.orbTop}`}
      />
      <div
        className={`animate-float-slow-reverse absolute -right-24 -bottom-24 h-[28rem] w-[28rem] rounded-full blur-3xl ${palette.orbBottom}`}
      />
      <div
        className={`animate-float-slow absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${palette.orbCenter}`}
      />

      {/* Onde radar discrète au centre */}
      <div
        className={`bg-space-pulse absolute top-1/2 left-1/2 h-[34rem] w-[34rem] rounded-full border ${palette.ringBorder}`}
      />

      {/* Tracé ECG léger sur toute la largeur */}
      <svg
        className="absolute top-1/2 left-0 h-28 w-full -translate-y-1/2 opacity-25"
        viewBox="0 0 1440 120"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 H260 L285 60 L300 26 L318 96 L336 14 L354 82 L368 60 H680 L705 60 L720 30 L738 92 L756 16 L774 80 L788 60 H1100 L1125 60 L1140 26 L1158 96 L1176 14 L1194 82 L1208 60 H1440"
          stroke={palette.ecgStroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="bg-space-ecg"
        />
      </svg>

      {/* Croix médicales flottantes en périphérie */}
      <svg
        className="bg-space-cross hidden md:block absolute top-24 left-6 h-6 w-6 text-[#0B4F9E]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>

      <svg
        style={{ animationDelay: '2s' }}
        className="bg-space-cross hidden md:block absolute bottom-24 left-8 h-5 w-5 text-[#0E7C86]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>

      <svg
        style={{ animationDelay: '1.2s' }}
        className="bg-space-cross hidden md:block absolute top-28 right-7 h-6 w-6 text-[#1FAFB5]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>

      <svg
        style={{ animationDelay: '3.1s' }}
        className="bg-space-cross hidden md:block absolute bottom-28 right-6 h-7 w-7 text-[#0B2A5B]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </div>
  );
}