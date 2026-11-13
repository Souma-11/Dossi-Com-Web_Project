import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal réutilisable — fenêtre d'action (Phase 4).
 * Utilisée par : TriageModal, ConsultationModal, LitModal.
 *
 * @param {boolean} open    - fenêtre visible ?
 * @param {string} title    - titre de la fenêtre
 * @param {string} subtitle - sous-titre optionnel
 * @param {func} onClose    - fermeture (croix, clic hors cadre, touche Échap)
 * @param {string} size     - 'md' (600px) | 'lg' (760px) | 'xl' (900px)
 * @param {node} children   - contenu
 * @param {node} footer     - pied de fenêtre (boutons d'action)
 */
export default function Modal({
  open,
  title,
  subtitle,
  onClose,
  size = 'md',
  children,
  footer,
}) {
  // Fermeture avec la touche Échap + blocage du scroll en arrière-plan
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = { md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size] || 'max-w-xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full ${sizeClass} bg-white rounded-xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-4rem)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <h2 className="font-title text-xl text-brand-navy">{title}</h2>
            {subtitle && <p className="text-sm text-brand-slate mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-bg text-brand-slate hover:text-brand-navy transition shrink-0"
            aria-label="Fermer la fenêtre"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corps défilable */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Pied de fenêtre (boutons) */}
        {footer && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">{footer}</div>
        )}
      </div>
    </div>
  );
}
