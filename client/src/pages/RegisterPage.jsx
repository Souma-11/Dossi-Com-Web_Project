import { useState } from 'react';

export default function RegisterPatient() {
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      // Appel vers l'API REST Node.js / Express (création compte + fiche patient)
      const response = await fetch('/api/auth/register-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Pour le cookie JWT HttpOnly
        body: JSON.stringify({
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          dateNaissance: formData.dateNaissance || null,
          telephone: formData.telephone.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création du compte.');
      }

      // Redirection vers l'Espace Patient après inscription réussie
      window.location.href = '/patient/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-8 sm:px-10">
        
        {/* En-tête & Logo Dossi'Com */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2 flex items-center justify-center">
            <svg
              className="w-12 h-12"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 18C14 14.6863 16.6863 12 20 12H28L32 16H44C47.3137 16 50 18.6863 50 22V44C50 47.3137 47.3137 50 44 50H20C16.6863 50 14 47.3137 14 44V18Z"
                fill="#0B2545"
              />
              <path
                d="M32 25V39M25 32H39"
                stroke="#00A896"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-[#0B2545]">Dossi’</span>
            <span className="text-[#00A896]">Com</span>
          </h1>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            Vos dossiers santé, entre de bonnes mains.
          </p>

          <h2 className="text-2xl font-bold text-[#0B2545] mt-5">
            Créer un compte patient
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md">
            Accédez au suivi de votre passage et à vos consignes en temps réel.
          </p>
        </div>

        {/* Encadré d'information */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-[#0B2545] shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>
          <p className="text-sm text-slate-700 leading-relaxed">
            Espace réservé aux patients. Les comptes du personnel soignant et
            administratif sont créés par le responsable du service.
          </p>
        </div>

        {/* Message d'erreur éventuel */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ligne 1 : Nom & Prénom (sans placeholder) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-bold text-[#0B2545] mb-1.5"
              >
                Nom *
              </label>
              <input
                id="nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                autoComplete="off"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              />
            </div>

            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-bold text-[#0B2545] mb-1.5"
              >
                Prénom *
              </label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                autoComplete="off"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              />
            </div>
          </div>

          {/* Ligne 2 : Date de naissance & Téléphone (sans placeholder) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dateNaissance"
                className="block text-sm font-bold text-[#0B2545] mb-1.5"
              >
                Date de naissance
              </label>
              <input
                id="dateNaissance"
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              />
            </div>

            <div>
              <label
                htmlFor="telephone"
                className="block text-sm font-bold text-[#0B2545] mb-1.5"
              >
                Téléphone *
              </label>
              <input
                id="telephone"
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                autoComplete="off"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              />
            </div>
          </div>

          {/* Ligne 3 : Identifiant (Email) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-[#0B2545] mb-1.5"
            >
              Identifiant (Email) *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="patient@exemple.tn"
              required
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
            />
          </div>

          {/* Ligne 4 : Mot de passe & Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[#0B2545] mb-1.5"
              >
                Mot de passe *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="........"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-[#0B2545] mb-1.5"
              >
                Confirmer *
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="........"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              />
            </div>
          </div>

          {/* Bouton de validation */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B2545] hover:bg-[#133863] disabled:opacity-60 text-white font-semibold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                />
                <circle cx="8.5" cy="7" r="4" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 8v6M23 11h-6"
                />
              </svg>
              <span>
                {loading ? 'Création en cours...' : 'Créer mon compte patient'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}