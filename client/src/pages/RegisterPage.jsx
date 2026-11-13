import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RegisterPage() {
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

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        date_naissance: formData.dateNaissance || null,
        telephone: formData.telephone.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'patient',
      });

      await login(formData.email.trim(), formData.password);
      navigate('/patient');
    } catch (err) {
      const apiMsg = err.response?.data?.message || err.response?.data?.error;
      setError(apiMsg || 'Impossible de créer le compte. Vérifiez les informations saisies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 min-h-[calc(100vh-8.5rem)] flex items-center justify-center">
      <div className="max-w-lg w-full dc-card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/dossicom-logo-400.png"
            srcSet="/dossicom-logo-800.png 2x"
            alt="Dossi'Com"
            width="200"
            className="block mx-auto mb-4 w-[200px] h-auto"
          />
          <h1 className="dc-h1">Créer un compte patient</h1>
          <p className="text-sm text-[#334155] mt-1">
            Accédez au suivi de votre passage et à vos consignes en temps réel.
          </p>
        </div>

        <div className="mb-5 p-3.5 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1] text-sm text-[#0B2A5B] flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-[#0B4F9E] shrink-0 mt-0.5" />
          <span>
            Espace réservé aux patients. Les comptes du personnel soignant et administratif sont
            créés par le responsable du service.
          </span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">Nom *</label>
              <input
                type="text"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ben Ali"
                className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">Prénom *</label>
              <input
                type="text"
                name="prenom"
                required
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Ahmed"
                className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">
                Date de naissance
              </label>
              <input
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
                className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#0B4F9E]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">Téléphone *</label>
              <input
                type="tel"
                name="telephone"
                required
                value={formData.telephone}
                onChange={handleChange}
                placeholder="20 123 456"
                className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">
              Identifiant (Email) *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="patient@exemple.tn"
              className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0B2A5B] mb-1.5">Confirmer *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-[#94A3B8] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#475569] focus:border-[#0B4F9E]"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="dc-btn-primary w-full mt-2">
            <UserPlus className="w-4 h-4" />
            {loading ? 'Création du compte...' : 'Créer mon compte patient'}
          </button>
        </form>

        <hr className="my-5 border-[#CBD5E1]" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <Link to="/login" className="font-bold text-[#0B4F9E] hover:underline">
            Déjà inscrit ? Se connecter
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-semibold text-[#334155] hover:text-[#0B2A5B]"
          >
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord public
          </Link>
        </div>
      </div>
    </div>
  );
}