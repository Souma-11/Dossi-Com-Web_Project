import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BirthDateField from '../components/common/BirthDateField';

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setError('Veuillez renseigner votre nom et votre prénom.');
      return;
    }

    if (!formData.dateNaissance) {
      setError('Veuillez sélectionner votre date de naissance complète (jour, mois et année).');
      return;
    }

    if (!formData.telephone.trim()) {
      setError('Veuillez renseigner un numéro de téléphone.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Veuillez renseigner une adresse e-mail valide.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    const payload = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      dateNaissance: formData.dateNaissance,
      date_naissance: formData.dateNaissance,
      telephone: formData.telephone.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: 'patient',
    };

    try {
      if (typeof auth?.register === 'function') {
        await auth.register(payload);
        navigate('/patient', { replace: true });
        return;
      }

      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || 'Impossible de créer le compte patient.'
        );
      }

      if (typeof auth?.login === 'function') {
        await auth.login(payload.email, payload.password, 'patient');
        navigate('/patient', { replace: true });
      } else {
        navigate('/login?role=patient', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l’inscription.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:border-[#0E7C86] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20';

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* Arrière-plan animé Extranet */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 z-0 overflow-hidden bg-[#EEF3F9]"
      >
        <div className="bg-medical-grid absolute inset-0 opacity-80" />
        <div className="extranet-orb-1 absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#1FAFB5]/20 blur-3xl" />
        <div className="extranet-orb-2 absolute -right-24 -bottom-24 h-[28rem] w-[28rem] rounded-full bg-[#0B4F9E]/15 blur-3xl" />
        <div className="extranet-pulse-ring absolute top-1/2 left-1/2 h-[32rem] w-[32rem] rounded-full border border-[#1FAFB5]/25" />

        <svg
          className="absolute top-1/2 left-0 h-28 w-full -translate-y-1/2 opacity-25"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60 H260 L285 60 L300 26 L318 96 L336 14 L354 82 L368 60 H680 L705 60 L720 30 L738 92 L756 16 L774 80 L788 60 H1100 L1125 60 L1140 26 L1158 96 L1176 14 L1194 82 L1208 60 H1440"
            stroke="#0E7C86"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="extranet-ecg-line"
          />
        </svg>

        <svg
          className="extranet-cross hidden md:block absolute top-24 left-12 h-6 w-6 text-[#0B4F9E]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <svg
          style={{ animationDelay: '1.8s' }}
          className="extranet-cross hidden md:block absolute bottom-24 right-14 h-7 w-7 text-[#1FAFB5]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>

      {/* Carte d'inscription patient */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-[#D5DEEA] bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-lg extranet-card-enter">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF3F9] border border-[#D5DEEA] px-3 py-1 text-xs font-semibold text-[#0E7C86] mb-3">
            <span className="h-2 w-2 rounded-full bg-[#1FAFB5]" />
            Espace Patient · Création de compte
          </span>

          <h1
            style={{ fontFamily: 'var(--font-title)' }}
            className="text-2xl sm:text-3xl font-bold text-[#0B2A5B]"
          >
            Créer un compte patient
          </h1>
          <p className="text-sm text-[#5B6675] mt-1">
            Accédez au suivi de votre passage et à vos consignes médicales
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-[#C8102E]/30 bg-[#C8102E]/10 px-4 py-3 text-xs sm:text-sm font-medium text-[#C8102E]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nom */}
            <div>
              <label
                htmlFor="nom"
                className="block text-xs font-semibold text-[#0B2A5B] mb-1.5"
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
                placeholder="Ex. Ben Salah"
                className={inputClass}
              />
            </div>

            {/* Prénom */}
            <div>
              <label
                htmlFor="prenom"
                className="block text-xs font-semibold text-[#0B2A5B] mb-1.5"
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
                placeholder="Ex. Amine"
                className={inputClass}
              />
            </div>

            {/* Date de naissance (Jour / Mois / Année <= année en cours) */}
            <div>
              <label
                htmlFor="dateNaissance"
                className="block text-xs font-semibold text-[#0B2A5B] mb-1.5"
              >
                Date de naissance
              </label>
              <BirthDateField
                id="dateNaissance"
                value={formData.dateNaissance}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, dateNaissance: val }));
                  if (error) setError('');
                }}
                required
              />
            </div>

            {/* Téléphone */}
            <div>
              <label
                htmlFor="telephone"
                className="block text-xs font-semibold text-[#0B2A5B] mb-1.5"
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
                placeholder="Ex. 20 123 456"
                className={inputClass}
              />
            </div>

            {/* Adresse e-mail */}
            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#0B2A5B] mb-1.5"
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
                placeholder="patient@exemple.tn"
                className={inputClass}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#0B2A5B] mb-1.5"
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
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[#0B2A5B] mb-1.5"
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
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm font-semibold mt-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Création du compte...' : 'Créer mon compte patient'}
          </button>
        </form>

        {/* Liens de pied de carte */}
        <div className="mt-6 pt-4 border-t border-[#D5DEEA] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5B6675]">
          <p>
            Déjà inscrit ?{' '}
            <Link
              to="/login?role=patient"
              className="font-semibold text-[#0B4F9E] hover:text-[#0B2A5B] underline-offset-2 hover:underline"
            >
              Se connecter
            </Link>
          </p>

          <Link
            to="/"
            className="font-medium text-[#5B6675] hover:text-[#0B2A5B] transition-colors"
          >
            ← Tableau de bord public
          </Link>
        </div>
      </div>
    </div>
  );
}