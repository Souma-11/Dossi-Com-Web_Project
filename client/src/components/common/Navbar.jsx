import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { urgenceService } from '../../services/urgenceService';

const ROLE_LABELS = {
  accueil: 'Espace Accueil',
  infirmier: 'Espace Infirmier',
  medecin: 'Espace Médecin',
  responsable: 'Espace Responsable',
  patient: 'Espace Patient',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  const role = user?.role || '';

  useEffect(() => {
    let isMounted = true;

    const loadAlertsCount = async () => {
      if (!role) {
        if (isMounted) setBadgeCount(0);
        return;
      }

      try {
        if (role === 'infirmier') {
          const data = await urgenceService.getInfirmierData();
          if (isMounted) setBadgeCount(data?.alertes?.length || 0);
        } else if (role === 'responsable') {
          const data = await urgenceService.getResponsableData();
          const nonLus = (data?.reclamations || []).filter(
            (r) => r.statut === 'Nouveau'
          ).length;
          if (isMounted) setBadgeCount(nonLus);
        } else if (isMounted) {
          setBadgeCount(0);
        }
      } catch {
        if (isMounted) setBadgeCount(0);
      }
    };

    loadAlertsCount();
    window.addEventListener('dossicom:db-updated', loadAlertsCount);
    return () => {
      isMounted = false;
      window.removeEventListener('dossicom:db-updated', loadAlertsCount);
    };
  }, [role]);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/', { replace: true });
  };

  // Navigation centrale limitée à 3 liens courts sur une seule ligne
  const getNavItems = () => {
    if (!user) {
      return [
        { to: '/', label: 'Accueil', end: true },
        { to: '/#service', label: 'Le service', isAnchor: true },
        { to: '/#espaces', label: 'Accès aux espaces', isAnchor: true },
      ];
    }

    switch (role) {
      case 'accueil':
        return [
          { to: '/accueil', label: 'Patients', end: true },
          { to: '/accueil/nouveau-patient', label: 'Nouveau patient' },
          { to: '/file-attente', label: 'File d’attente' },
        ];
      case 'infirmier':
        return [
          { to: '/infirmier', label: 'À trier', end: true, badge: badgeCount },
          { to: '/file-attente', label: 'File d’attente' },
          { to: '/infirmier/signalement', label: 'Signalement' },
        ];
      case 'medecin':
        return [
          { to: '/medecin', label: 'Mes dossiers', end: true },
          { to: '/file-attente', label: 'File d’attente' },
          { to: '/medecin/signalement', label: 'Signalement' },
        ];
      case 'responsable':
        return [
          {
            to: '/responsable',
            label: 'Supervision',
            end: true,
            badge: badgeCount,
          },
          { to: '/file-attente', label: 'File d’attente' },
          { to: '/', label: 'Tableau public', end: true },
        ];
      case 'patient':
        return [
          { to: '/patient', label: 'Mon passage', end: true },
          { to: '/', label: 'Situation du service', end: true },
        ];
      default:
        return [{ to: '/', label: 'Accueil', end: true }];
    }
  };

  const navItems = getNavItems();
  const homeDestination = user && role ? `/${role}` : '/';

  const linkClassName = ({ isActive }) =>
    `relative inline-flex items-center gap-2 whitespace-nowrap py-6 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'border-[#0B2A5B] text-[#0B2A5B] font-semibold'
        : 'border-transparent text-[#5B6675] hover:text-[#0B2A5B]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#D5DEEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* 1. Logo officiel Dossi'Com (identique sur tous les écrans) */}
        <Link
          to={homeDestination}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 shrink-0"
        >
          <svg
            className="w-9 h-9"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10 18C10 14.6863 12.6863 12 16 12H25L29 16H44C47.3137 16 50 18.6863 50 22V44C50 47.3137 47.3137 50 44 50H16C12.6863 50 10 47.3137 10 44V18Z"
              stroke="#0B2A5B"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M30 25V39M23 32H37"
              stroke="#0B4F9E"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="51" cy="37" r="5" fill="#1FAFB5" />
            <path
              d="M43 50C43 45.5817 46.5817 43 51 43C55.4183 43 59 45.5817 59 50"
              fill="#1FAFB5"
            />
          </svg>
          <span
            style={{ fontFamily: 'var(--font-title)' }}
            className="text-2xl font-bold tracking-tight whitespace-nowrap"
          >
            <span className="text-[#0B2A5B]">Dossi’</span>
            <span className="text-[#0E7C86]">Com</span>
          </span>
        </Link>

        {/* 2. Liens centraux sur une seule ligne (sans retour à la ligne) */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-8"
        >
          {navItems.map((item) =>
            item.isAnchor ? (
              <a
                key={item.to}
                href={item.to}
                className={`whitespace-nowrap py-6 text-sm font-medium transition-colors border-b-2 ${
                  location.hash === item.to.replace('/', '')
                    ? 'border-[#0B2A5B] text-[#0B2A5B] font-semibold'
                    : 'border-transparent text-[#5B6675] hover:text-[#0B2A5B]'
                }`}
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClassName}
              >
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#C8102E] text-white text-[11px] font-bold tabular-nums">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* 3. Zone droite : Extranet (visiteur) ou Profil + Déconnexion (connecté) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {!user ? (
            <Link
              to="/login"
              className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap"
            >
              Extranet
            </Link>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EEF3F9] border border-[#D5DEEA] text-xs font-semibold text-[#0B2A5B] whitespace-nowrap">
                <span className="dossi-live-dot w-2 h-2 rounded-full bg-[#0E7C86] text-[#1FAFB5]" />
                <span>{ROLE_LABELS[role] || role}</span>
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary px-4 py-2 text-sm whitespace-nowrap inline-flex items-center gap-2 hover:border-[#C8102E] hover:text-[#C8102E] cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Ouvrir le menu"
          className="md:hidden p-2 rounded-lg border border-[#D5DEEA] text-[#0B2A5B] hover:bg-[#EEF3F9] cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu déroulant mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#D5DEEA] bg-white px-4 py-4 space-y-3">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EEF3F9] text-xs font-semibold text-[#0B2A5B]">
              <span className="w-2 h-2 rounded-full bg-[#0E7C86]" />
              <span>{ROLE_LABELS[role] || role}</span>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {navItems.map((item) =>
              item.isAnchor ? (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[#5B6675] hover:bg-[#EEF3F9] hover:text-[#0B2A5B]"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-[#EEF3F9] text-[#0B2A5B] font-semibold'
                        : 'text-[#5B6675] hover:bg-[#EEF3F9] hover:text-[#0B2A5B]'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#C8102E] text-white text-xs font-bold tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            )}
          </nav>

          <div className="pt-2 border-t border-[#D5DEEA]">
            {!user ? (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary block w-full py-2.5 text-sm text-center"
              >
                Extranet
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary w-full py-2 text-sm text-[#C8102E] border-[#C8102E]/30 cursor-pointer"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}