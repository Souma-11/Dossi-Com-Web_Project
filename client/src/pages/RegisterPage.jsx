import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onRegister }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    telephone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerPatient } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.nom.trim() ||
      !formData.prenom.trim() ||
      !formData.dateNaissance ||
      !formData.telephone.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      if (onRegister) {
        await onRegister(formData);
      } else {
        await registerPatient(formData);
      }
      navigate('/patient', { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          'Une erreur est survenue lors de la création de votre compte.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden flex-1 flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#EEF3F9] via-[#F7FAFD] to-[#E2EDF8]">
      {/* Décor animé d'arrière-plan */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden"
      >
        <div className="extranet-orb-1 absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1FAFB5]/15 blur-3xl" />
        <div className="extranet-orb-2 absolute -bottom-28 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#0B4F9E]/12 blur-3xl" />
        <div className="extranet-orb-1 absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#0E7C86]/10 blur-3xl" />

        {/* Tracé ECG continu */}
        <svg
          className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 opacity-35"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60 H320 L345 60 L360 28 L378 96 L396 14 L414 82 L428 60 H740 L765 60 L780 32 L798 92 L816 18 L834 80 L848 60 H1160 L1185 60 L1200 30 L1218 94 L1236 16 L1254 82 L1268 60 H1440"
            stroke="#1FAFB5"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="extranet-ecg-line"
          />
        </svg>

        {/* Croix médicales flottantes */}
        <svg
          className="extranet-cross hidden md:block absolute top-[18%] left-[10%] w-7 h-7 text-[#0B4F9E]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <svg
          style={{ animationDelay: '1.8s' }}
          className="extranet-cross hidden md:block absolute bottom-[22%] left-[15%] w-5 h-5 text-[#0E7C86]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <svg
          style={{ animationDelay: '0.9s' }}
          className="extranet-cross hidden md:block absolute top-[24%] right-[12%] w-6 h-6 text-[#1FAFB5]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <svg
          style={{ animationDelay: '2.6s' }}
          className="extranet-cross hidden md:block absolute bottom-[18%] right-[9%] w-8 h-8 text-[#0B2A5B]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>

      {/* Carte centrale Création de compte */}
      <div className="relative z-10 dossi-card extranet-card-enter w-full max-w-lg p-6 sm:p-8 space-y-6 bg-white/95 backdrop-blur-sm">
        {/* En-tête : Logo officiel + Titre */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex flex-col items-center gap-2 mb-3">
            <svg
              className="w-11 h-11"
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

          <h1 className="text-3xl font-bold text-[#0B2A5B]">
            Création de compte patient
          </h1>
          <p className="text-sm text-[#5B6675] mt-1">
            Accédez au suivi de votre passage et à vos consignes médicales
          </p>
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

        {/* Formulaire d'inscription patient */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
              >
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                autoComplete="family-name"
                required
                value={formData.nom}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
              />
            </div>

            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
              >
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                autoComplete="given-name"
                required
                value={formData.prenom}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dateNaissance"
                className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
              >
                Date de naissance
              </label>
              <input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                required
                value={formData.dateNaissance}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
              />
            </div>

            <div>
              <label
                htmlFor="telephone"
                className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
              >
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.telephone}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
            >
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-[#0B2A5B] mb-1.5"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 px-4 text-sm cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading ? 'Création du compte...' : 'Créer mon compte patient'}
          </button>
        </form>

        {/* Liens de navigation bas de carte */}
        <div className="border-t border-[#D5DEEA] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <Link
            to="/login"
            className="font-semibold text-[#0B4F9E] hover:underline"
          >
            Déjà inscrit ? Se connecter
          </Link>
          <Link
            to="/"
            className="text-[#5B6675] hover:text-[#0B2A5B] transition-colors"
          >
            ← Tableau de bord public
          </Link>
        </div>
      </div>
    </div>
  );
}