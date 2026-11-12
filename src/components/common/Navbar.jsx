import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logo from '../../assets/logo.jpg';

export default function Navbar({ userRole, userName, onLogout }) {
  return (
    <header className="bg-brand-navy text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo & Branding Dossi'Com */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Logo Dossi'Com"
            className="h-16 sm:h-20 w-auto rounded-xl object-contain shadow-md hover:opacity-95 transition"
          />
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