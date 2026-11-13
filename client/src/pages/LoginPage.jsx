import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      const role = loggedUser?.role?.toLowerCase();

      if (!role) {
        setError('Connexion réussie, mais aucun rôle n’est associé à ce compte.');
        return;
      }

      navigate(`/${role}`, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Serveur backend inaccessible. Vérifiez que le terminal server est démarré.');
      } else {
        setError(err.response?.data?.message || 'Identifiant ou mot de passe incorrect.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 min-h-[calc(100vh-8.5rem)] flex items-center justify-center">
      <div className="max-w-md w-full dc-card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/dossicom-logo-400.png"
            srcSet="/dossicom-logo-800.png 2x"
            alt="Dossi'Com"
            width="200"
            className="block mx-auto mb-4 w-[200px] h-auto"
          />
          <h1 className="dc-h1">Extranet</h1>
          <p className="text-sm font-medium text-[#334155]">Identifiant et mot de passe</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-[8px] bg-red-50 border border-[#C8102E] text-[#991B1B] font-semibold text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-bold text-[#0B2A5B] mb-1.5">
              Identifiant
            </label>
            <input
              id="login-email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@dossicom.tn"
              className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-bold text-[#0B2A5B] mb-1.5"
            >
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
            />
          </div>

          <button type="submit" disabled={loading} className="dc-btn-primary w-full">
            <LogIn className="w-4 h-4" />
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-[#334155]">
            Mot de passe oublié ? Contactez le responsable du service.
          </span>
        </div>

        <hr className="my-5 border-[#CBD5E1]" />

        <Link to="/register" className="dc-btn-outline w-full text-sm">
          <UserPlus className="w-4 h-4" />
          Créer un compte patient
        </Link>

        <div className="text-center mt-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0B4F9E] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord public
          </Link>
        </div>
      </div>
    </div>
  );
}