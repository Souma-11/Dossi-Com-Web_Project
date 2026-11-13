import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  accueil: 'Accueil',
  infirmier: 'Infirmier',
  medecin: 'Médecin',
  responsable: 'Responsable',
  patient: 'Patient',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `py-2 border-b-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'border-[#0B4F9E] text-[#0B4F9E] font-bold'
        : 'border-transparent text-[#0B2A5B] hover:text-[#0B4F9E]'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-3 py-2.5 rounded-[8px] text-sm font-semibold ${
      isActive
        ? 'bg-[#EEF3F9] text-[#0B4F9E] border-l-4 border-[#0B4F9E] font-bold'
        : 'text-[#0B2A5B] hover:bg-[#EEF3F9]'
    }`;

  return (
    <header className="bg-white border-b border-[#CBD5E1] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 shrink-0"
        >
          <img
            src="/dossicom-icone-512_2.png"
            alt="Logo Dossi'Com"
            height="40"
            className="h-[40px] w-[40px] object-contain"
          />
          <div className="leading-tight">
            <span className="font-display font-bold text-2xl tracking-tight text-[#0B2A5B] block">
              Dossi&apos;Com
            </span>
            <span className="text-sm font-medium text-[#0B5E66] hidden sm:block">
              Urgences Hospitalières
            </span>
          </div>
        </Link>

        {/* Navigation Desktop avec indicateur de page active */}
        <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Tableau de bord public
          </NavLink>

          {user?.role && (
            <NavLink to={`/${user.role}`} className={navLinkClass}>
              Mon espace ({ROLE_LABELS[user.role] || user.role})
            </NavLink>
          )}
        </nav>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#EEF3F9] border border-[#CBD5E1] text-sm font-semibold text-[#0B2A5B]">
                <User className="w-4 h-4 text-[#0B4F9E]" />
                <span>
                  {user.prenom || user.nom || user.email}
                  {user.role ? ` • ${ROLE_LABELS[user.role] || user.role}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="dc-btn-outline py-1.5 px-3 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" className="dc-btn-primary py-2 px-4 text-sm">
              <LogIn className="w-4 h-4" />
              Extranet
            </Link>
          )}
        </div>

        {/* Bouton Menu Burger Mobile (< 768px) */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="md:hidden p-2 rounded-[8px] border border-[#CBD5E1] text-[#0B2A5B] hover:bg-[#EEF3F9]"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Panneau Menu Mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#CBD5E1] px-4 py-4 space-y-3 shadow-md">
          <nav aria-label="Navigation mobile" className="space-y-1.5">
            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              className={mobileLinkClass}
            >
              Tableau de bord public
            </NavLink>

            {user?.role && (
              <NavLink
                to={`/${user.role}`}
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass}
              >
                Mon espace ({ROLE_LABELS[user.role] || user.role})
              </NavLink>
            )}
          </nav>

          <hr className="border-[#CBD5E1]" />

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#EEF3F9] text-sm font-semibold text-[#0B2A5B]">
                <User className="w-4 h-4 text-[#0B4F9E]" />
                <span>
                  {user.prenom || user.nom || user.email} (
                  {ROLE_LABELS[user.role] || user.role})
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="dc-btn-outline w-full text-sm"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="dc-btn-primary w-full text-sm"
            >
              <LogIn className="w-4 h-4" />
              Accéder à l&apos;Extranet
            </Link>
          )}
        </div>
      )}
    </header>
  );
}