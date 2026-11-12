import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Shield } from 'lucide-react';

// Profils de démonstration préconfigurés
const MOCK_USERS = [
  { role: 'accueil', name: 'Sophie (Agent d\'accueil)', email: 'accueil@dossicom.fr' },
  { role: 'infirmier', name: 'Marc (IAO)', email: 'infirmier@dossicom.fr' },
  { role: 'medecin', name: 'Dr. Martin (Médecin)', email: 'medecin@dossicom.fr' },
  { role: 'responsable', name: 'Dr. Dubreuil (Chef de service)', email: 'responsable@dossicom.fr' },
  { role: 'patient', name: 'Jean Dupont (Patient)', email: 'patient@dossicom.fr' },
];

export default function LoginPage({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('medecin');
  const [password, setPassword] = useState('123456');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const userFound = MOCK_USERS.find((u) => u.role === selectedRole);
    if (userFound) {
      onLogin(userFound);
      navigate(`/${selectedRole}`);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-brand-bg rounded-full text-brand-blue mb-3">
          <Shield size={32} />
        </div>
        <h1 className="font-title text-2xl text-brand-navy">Espace Extranet Dossi'Com</h1>
        <p className="text-brand-slate text-sm mt-1">Connectez-vous à votre espace dédié</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
            Sélectionner un profil (Démo)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-brand-slate" size={18} />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-bg border border-gray-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
            >
              <option value="accueil">Accueil - Saisie Dossier</option>
              <option value="infirmier">Infirmier (IAO) - Tri & Constantes</option>
              <option value="medecin">Médecin - Prise en charge</option>
              <option value="responsable">Responsable - Pilotage & Lits</option>
              <option value="patient">Patient - Suivi individuel</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-brand-slate" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-bg border border-gray-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-brand-blue hover:bg-brand-navy text-white font-semibold rounded-lg shadow transition duration-150"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}