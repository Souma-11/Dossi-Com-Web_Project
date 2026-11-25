import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIGS = {
  accueil: {
    label: 'Espace Accueil',
    subtitle: 'Enregistrement administratif et ouverture des passages',
    placeholder: 'accueil@dossicom.tn',
    badgeClass: 'bg-[#0B4F9E]/10 text-[#0B4F9E] border-[#0B4F9E]/25',
    dotClass: 'bg-[#0B4F9E]',
    buttonLabel: 'Accéder à l’Espace Accueil',
  },
  infirmier: {
    label: 'Espace Infirmier',
    subtitle: 'Évaluation clinique, triage P1 à P4 et alertes',
    placeholder: 'infirmier@dossicom.tn',
    badgeClass: 'bg-[#0E7C86]/10 text-[#0E7C86] border-[#0E7C86]/25',
    dotClass: 'bg-[#0E7C86]',
    buttonLabel: 'Accéder à l’Espace Infirmier',
  },
  medecin: {
    label: 'Espace Médecin',
    subtitle: 'Consultation médicale, examens et orientation',
    placeholder: 'medecin@dossicom.tn',
    badgeClass: 'bg-[#0B2A5B]/10 text-[#0B2A5B] border-[#0B2A5B]/25',
    dotClass: 'bg-[#0B2A5B]',
    buttonLabel: 'Accéder à l’Espace Médecin',
  },
  responsable: {
    label: 'Espace Responsable',
    subtitle: 'Supervision du service, box et équipes en garde',
    placeholder: 'responsable@dossicom.tn',
    badgeClass: 'bg-[#12304F]/10 text-[#12304F] border-[#12304F]/25',
    dotClass: 'bg-[#12304F]',
    buttonLabel: 'Accéder à l’Espace Responsable',
  },
  patient: {
    label: 'Espace Patient',
    subtitle: 'Suivi de votre passage aux urgences en temps réel',
    placeholder: 'patient@dossicom.tn',
    badgeClass: 'bg-[#1FAFB5]/15 text-[#0E7C86] border-[#1FAFB5]/30',
    dotClass: 'bg-[#1FAFB5]',
    buttonLabel: 'Accéder à l’Espace Patient',
  },
};

export default function LoginPage({ onLogin }) {
  const [searchParams] = useSearchParams();
  const rolePreselectionne = searchParams.get('role');
  const roleConfig = rolePreselectionne ? ROLE_CONFIGS[rolePreselectionne] || null : null;
  const afficherInscriptionPatient = !roleConfig || rolePreselectionne === 'patient';

  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifiant.trim() || !password) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = onLogin
        ? await onLogin({ identifiant, password, roleHint: rolePreselectionne })
        : await login({ identifiant, password, roleHint: rolePreselectionne });

      const destination = loggedUser?.role
        ? `/${loggedUser.role}`
        : rolePreselectionne
        ? `/${rolePreselectionne}`
        : '/patient';

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.message || 'Identifiant ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden flex-1 flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#E4ECF7] via-[#F4F8FC] to-[#DCE9F7]">
      {/* Décor animé d'arrière-plan */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden"
      >
        {/* Halos lumineux flottants */}
        <div className="extranet-orb-1 absolute -top-20 -left-20 w-[26rem] h-[26rem] rounded-full bg-[#1FAFB5]/25 blur-3xl" />
        <div className="extranet-orb-2 absolute -bottom-24 -right-16 w-[30rem] h-[30rem] rounded-full bg-[#0B4F9E]/20 blur-3xl" />
        <div className="extranet-orb-1 absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-[#0E7C86]/15 blur-3xl" />

        {/* Ondes concentriques derrière la carte */}
        <div className="extranet-pulse-ring absolute top-1/2 left-1/2 w-[32rem] h-[32rem] rounded-full border-2 border-[#1FAFB5]/35" />
        <div
          style={{ animationDelay: '2.5s' }}
          className="extranet-pulse-ring absolute top-1/2 left-1/2 w-[32rem] h-[32rem] rounded-full border-2 border-[#0B4F9E]/25"
        />

        {/* Tracé ECG continu pleine largeur */}
        <svg
          className="absolute top-1/2 left-0 w-full h-36 -translate-y-1/2 opacity-65"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60 H260 L285 60 L300 24 L318 98 L336 12 L354 84 L368 60 H680 L705 60 L720 28 L738 94 L756 14 L774 82 L788 60 H1100 L1125 60 L1140 24 L1158 98 L1176 12 L1194 84 L1208 60 H1440"
            stroke="#0E7C86"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="extranet-ecg-line"
          />
        </svg>

        {/* Croix médicales flottantes */}
        <svg
          className="extranet-cross hidden sm:block absolute top-[16%] left-[12%] w-8 h-8 text-[#0B4F9E]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <svg
          style={{ animationDelay: '1.5s' }}
          className="extranet-cross hidden sm:block absolute bottom-[20%] left-[17%] w-6 h-6 text-[#0E7C86]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <svg
          style={{ animationDelay: '0.8s' }}
          className="extranet-cross hidden sm:block absolute top-[22%] right-[14%] w-7 h-7 text-[#1FAFB5]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <svg
          style={{ animationDelay: '2.2s' }}
          className="extranet-cross hidden sm:block absolute bottom-[17%] right-[11%] w-9 h-9 text-[#0B2A5B]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>

      {/* Carte centrale Extranet */}
      <div className="relative z-10 dossi-card extranet-card-enter w-full max-w-md p-6 sm:p-8 space-y-6 bg-white/95 backdrop-blur-md shadow-xl">
        {/* En-tête : Logo officiel + Espace ciblé ou Extranet */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex flex-col items-center gap-2 mb-3">
            <svg
              className="w-12 h-12"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 18C10 14.6863 12.6863 12 16 12H25L29 16H44C47.3137 16 50 18.6863 50 22V44C50 47.3137 47.3137 50 44 50H16C12.6863 50 10 47.3137 10 44V18Z"
                stroke="#0B2A5B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30 25V39M23 32H37"
                stroke="#0B4F9E"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="51" cy="37" r="5" fill="#1FAFB5" />
              <path
                d="M43 50C43 45.5817 46.5817 43 51 43C55.4183 43 59 45.5817 59 50"
                fill="#1FAFB5"
              />
            </svg>
            <span
              style={{ fontFamily: 'var(--font-title)' }}
              className="text-2xl font-bold tracking-tight"
            >
              <span className="text-[#0B2A5B]">Dossi’</span>
              <span className="text-[#0E7C86]">Com</span>
            </span>
          </Link>

          {roleConfig ? (
            <>
              <div className="inline-flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${roleConfig.badgeClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${roleConfig.dotClass}`} />
                  Extranet · Profil présélectionné
                </span>
                <Link
                  to="/login"
                  title="Revenir à la connexion générique"
                  className="text-xs font-medium text-[#5B6675] hover:text-[#0B2A5B] underline"
                >
                  Changer
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-[#0B2A5B]">{roleConfig.label}</h1>
              <p className="text-sm text-[#5B6675] mt-1">{roleConfig.subtitle}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-[#0B2A5B]">Extranet</h1>
              <p className="text-sm text-[#5B6675] mt-1">
                Connexion unifiée · Redirection selon votre profil
              </p>
            </>
          )}
        </div>

        {/* Alerte d'erreur */}
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-[#C8102E]/10 border border-[#C8102E] px-4 py-3 text-sm font-medium text-[#C8102E]"
          >
            {error}
          </div>
        )}

        {/* Formulaire de connexion unique */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="identifiant"
              className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
            >
              Identifiant
            </label>
            <input
              id="identifiant"
              name="identifiant"
              type="text"
              autoComplete="username"
              placeholder={roleConfig ? roleConfig.placeholder : 'identifiant@dossicom.tn'}
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 pr-16 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-[#0B4F9E] hover:text-[#0B2A5B] cursor-pointer"
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 px-4 text-sm cursor-pointer disabled:opacity-60"
          >
            {loading
              ? 'Connexion en cours...'
              : roleConfig
              ? roleConfig.buttonLabel
              : 'Se connecter'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() =>
                setError(
                  'Veuillez contacter l’accueil ou le responsable du service pour réinitialiser votre accès.'
                )
              }
              className="text-xs font-medium text-[#0B4F9E] hover:underline cursor-pointer"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </form>

        {/* Séparateur & Création de compte patient (conditionnelle selon le rôle) */}
        <div className="border-t border-[#D5DEEA] pt-5 space-y-4">
          {afficherInscriptionPatient ? (
            <Link
              to="/register"
              className="btn-secondary block w-full py-2.5 px-4 text-sm text-center"
            >
              Créer un compte patient
            </Link>
          ) : (
            <p className="text-xs text-center text-[#5B6675] bg-[#EEF3F9]/80 rounded-lg px-3 py-2.5 border border-[#D5DEEA]">
              Accès réservé au personnel habilité. Votre compte est créé par le responsable du service.
            </p>
          )}

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5B6675] hover:text-[#0B2A5B] transition-colors"
            >
              <span aria-hidden="true">←</span>
              <span>Retour au tableau de bord public</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}