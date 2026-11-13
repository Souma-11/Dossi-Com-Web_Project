import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserRound, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTES } from '../utils/roleRoutes';

/**
 * Création de compte patient — seul le patient peut créer son compte (Objectif 2).
 * Les comptes du personnel restent créés par le responsable.
 * Le mot de passe est haché par bcrypt côté serveur (POST /api/auth/register).
 */
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      navigate(ROLE_ROUTES[result.user.role] || '/patient', { replace: true });
    } else {
      setError(result.error);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2 bg-brand-bg border border-gray-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition';

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      {/* En-tête */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-brand-bg rounded-full text-brand-blue mb-3">
          <Shield size={32} />
        </div>
        <h1 className="font-title text-2xl text-brand-navy">Créer un compte patient</h1>
        <p className="text-brand-slate text-sm mt-1">
          Suivez votre passage aux urgences en temps réel.
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Nom complet</label>
          <div className="relative">
            <UserRound className="absolute left-3 top-3 text-brand-slate" size={18} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              placeholder="Ex : Jean Dupont"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Adresse email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-brand-slate" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className={inputClass}
              placeholder="votre@email.fr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
            Mot de passe (8 caractères minimum)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-brand-slate" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <CheckCircle2 className="absolute left-3 top-3 text-brand-slate" size={18} />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-brand-blue hover:bg-brand-navy text-white font-semibold rounded-lg shadow transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? 'Création du compte…' : 'Créer mon compte'}
        </button>
      </form>

      {/* Liens */}
      <div className="mt-5 flex flex-col items-center gap-2 text-sm">
        <Link to="/login" className="text-brand-blue hover:underline font-semibold">
          J'ai déjà un compte — Se connecter
        </Link>
        <Link to="/" className="text-xs text-brand-slate hover:underline">
          ← Retour au tableau de bord public
        </Link>
      </div>
    </div>
  );
}
