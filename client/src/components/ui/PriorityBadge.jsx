const PRIORITES_CONFIG = {
  P1: {
    code: 'P1',
    label: 'Immédiate',
    patientLabel: 'Urgence immédiate',
    className: 'badge-p1',
  },
  P2: {
    code: 'P2',
    label: 'Très urgente',
    patientLabel: 'Prioritaire',
    className: 'badge-p2',
  },
  P3: {
    code: 'P3',
    label: 'Urgente',
    patientLabel: 'Prise en charge rapide',
    className: 'badge-p3',
  },
  P4: {
    code: 'P4',
    label: 'Moins urgente',
    patientLabel: 'Consultation standard',
    className: 'badge-p4',
  },
};

export function PriorityBadge({ level, simplified = false, size = 'md' }) {
  const key = typeof level === 'number' ? `P${level}` : String(level || '').toUpperCase();
  const config = PRIORITES_CONFIG[key];

  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EEF3F9] text-[#5B6675] border border-[#D5DEEA]">
        Non trié
      </span>
    );
  }

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold tracking-wide ${config.className} ${sizeClasses}`}
    >
      <svg
        className="w-3.5 h-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <span>
        {simplified
          ? config.patientLabel
          : `${config.code} ${config.label}`}
      </span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'maintenance' || normalized === 'hors_service') {
    return (
      <span className="badge-maintenance inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
        En maintenance
      </span>
    );
  }

  return (
    <span className="badge-valid inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold">
      <span className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
      Opérationnelle
    </span>
  );
}

export default PriorityBadge;