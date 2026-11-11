import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Navbar({ userRole, userName, onLogout }) {
  return (
    <header className="bg-brand-navy text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo & Branding Dossi'Com */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-white text-brand-navy px-3 py-1 rounded-lg font-title font-bold text-xl">
            + Dossi'Com
          </div>
          <span className="hidden sm:inline text-xs text-blue-200">
            Vos dossiers santé, entre de bonnes mains.
          </span>
        </Link>

        {/* Navigation & Profil Utilisateur */}
        <div className="flex items-center space-x-4">
          {userRole ? (
            <>
              <div className="text-right text-sm">
                <p className="font-semibold">{userName || 'Utilisateur'}</p>
                <p className="text-xs text-brand-turquoise capitalize">Espace {userRole}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition"
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-brand-blue hover:bg-brand-darkTurquoise px-4 py-2 rounded text-sm font-semibold transition"
            >
              Extranet
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}