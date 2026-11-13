import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTES } from '../utils/roleRoutes';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      const route = ROLE_ROUTES[result.user.role] || '/';
      navigate(route, { replace: true });
    } else {
      setError(result.error);
    }
  };

  // Remplissage rapide pour la démo
  const fillDemo = (email, pwd) => {
    setEmail(email);
    setPassword(pwd);
    setError('');
  };

  const demoUsers = [
    { label: '🏥 Accueil', email: 'accueil@dossicom.fr', password: 'Accueil@123' },
    { label: '💉 Infirmier', email: 'infirmier@dossicom.fr', password: 'Infirmier@123' },
    { label: '👨‍⚕️ Médecin', email: 'medecin@dossicom.fr', password: 'Medecin@123' },
    { label: '📊 Responsable', email: 'responsable@dossicom.fr', password: 'Resp@123' },
    { label: '🧑 Patient', email: 'patient@dossicom.fr', password: 'Patient@123' },
  ];

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      {/* En-tête */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-brand-bg rounded-full text-brand-blue mb-3">
          <Shield size={32} />
        </div>
        <h1 className="font-title text-2xl text-brand-navy">Espace Extranet Dossi'Com</h1>
        <p className="text-brand-slate text-sm mt-1">Connectez-vous avec vos identifiants</p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
            Adresse email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-brand-slate" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full pl-10 pr-4 py-2 bg-brand-bg border border-gray-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
              placeholder="votre@email.fr"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-brand-slate" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-10 py-2 bg-brand-bg border border-gray-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-2.5 text-brand-slate hover:text-brand-navy transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Bouton de connexion */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-brand-blue hover:bg-brand-navy text-white font-semibold rounded-lg shadow transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connexion en cours…
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      {/* Création de compte patient (seul le patient peut créer son compte) */}
      <div className="mt-4 text-center">
        <Link to="/register" className="text-sm text-brand-blue hover:underline font-semibold">
          Créer un compte patient
        </Link>
      </div>

      {/* Accès rapide démo */}
      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-xs text-center text-brand-slate font-semibold uppercase mb-3">
          Accès rapide — Comptes de démo
        </p>
        <div className="grid grid-cols-2 gap-2">
          {demoUsers.map(({ label, email: dEmail, password: dPwd }) => (
            <button
              key={dEmail}
              type="button"
              onClick={() => fillDemo(dEmail, dPwd)}
              className="text-xs py-1.5 px-2 rounded-lg border border-gray-200 hover:bg-brand-bg hover:border-brand-blue text-brand-navy transition text-left"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-brand-slate text-center mt-2 opacity-70">
          Cliquez sur un profil puis "Se connecter"
        </p>
      </div>

      {/* Lien retour */}
      <div className="mt-4 text-center">
        <Link to="/" className="text-xs text-brand-blue hover:underline">
          ← Retour à l'accueil public
        </Link>
      </div>
    </div>
  );
}
