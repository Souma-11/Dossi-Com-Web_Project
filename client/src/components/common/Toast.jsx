import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4500 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isAlert = type === 'alert';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] p-4 rounded-[10px] shadow-lg border-2 flex items-start gap-3 transition-all ${
        isAlert
          ? 'bg-red-50 border-[#C8102E] text-[#991B1B]'
          : 'bg-white border-[#0E7C86] text-[#0B2A5B]'
      }`}
    >
      {isAlert ? (
        <AlertTriangle className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-[#0E7C86] shrink-0 mt-0.5" />
      )}
      <p className="text-sm font-semibold flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer la notification"
        className="text-[#334155] hover:text-[#0B2A5B] p-0.5 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}