import { useState } from 'react';

const MOIS_FR = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

const EMPTY_PARTS = { day: '', month: '', year: '' };

function parseIsoDate(iso) {
  if (!iso || typeof iso !== 'string') {
    return EMPTY_PARTS;
  }
  const [year = '', month = '', day = ''] = iso.split('-');
  return { day, month, year };
}

function getDaysInMonth(month, year) {
  if (!month) return 31;
  const m = parseInt(month, 10);
  const y = year ? parseInt(year, 10) : 2000;
  return new Date(y, m, 0).getDate();
}

export default function BirthDateField({
  id = 'dateNaissance',
  value = '',
  onChange,
  required = false,
  minYear = 1905,
  maxYear = new Date().getFullYear(),
}) {
  const [draft, setDraft] = useState(EMPTY_PARTS);

  // Si value est renseignée (YYYY-MM-DD), on l'affiche directement ; sinon on utilise le brouillon en cours
  const parts = value ? parseIsoDate(value) : draft;

  const maxDays = getDaysInMonth(parts.month, parts.year);
  const days = Array.from({ length: maxDays }, (_, idx) =>
    String(idx + 1).padStart(2, '0')
  );

  const years = Array.from(
    { length: Math.max(1, maxYear - minYear + 1) },
    (_, idx) => String(maxYear - idx)
  );

  const handlePartChange = (field, nextVal) => {
    const updated = { ...parts, [field]: nextVal };

    if (updated.day) {
      const allowedDays = getDaysInMonth(updated.month, updated.year);
      if (parseInt(updated.day, 10) > allowedDays) {
        updated.day = String(allowedDays).padStart(2, '0');
      }
    }

    if (updated.year && updated.month && updated.day) {
      setDraft(EMPTY_PARTS);
      onChange?.(`${updated.year}-${updated.month}-${updated.day}`);
    } else {
      setDraft(updated);
      if (value) {
        onChange?.('');
      }
    }
  };

  const selectBaseClass =
    'w-full appearance-none rounded-xl border border-[#D5DEEA] bg-white pl-3 pr-7 py-2.5 text-sm transition-colors focus:border-[#0E7C86] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 cursor-pointer';

  return (
    <div className="grid grid-cols-[0.85fr_1.35fr_1.05fr] gap-2">
      {/* Jour */}
      <div className="relative">
        <select
          id={id}
          aria-label="Jour de naissance"
          value={parts.day}
          required={required}
          onChange={(e) => handlePartChange('day', e.target.value)}
          className={`${selectBaseClass} ${
            parts.day ? 'text-[#0F172A] font-medium' : 'text-[#5B6675]'
          }`}
        >
          <option value="">Jour</option>
          {days.map((d) => (
            <option key={d} value={d} className="text-[#0F172A]">
              {d}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6675]"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Mois */}
      <div className="relative">
        <select
          aria-label="Mois de naissance"
          value={parts.month}
          required={required}
          onChange={(e) => handlePartChange('month', e.target.value)}
          className={`${selectBaseClass} ${
            parts.month ? 'text-[#0F172A] font-medium' : 'text-[#5B6675]'
          }`}
        >
          <option value="">Mois</option>
          {MOIS_FR.map((m) => (
            <option key={m.value} value={m.value} className="text-[#0F172A]">
              {m.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6675]"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Année (strictement <= année en cours) */}
      <div className="relative">
        <select
          aria-label="Année de naissance"
          value={parts.year}
          required={required}
          onChange={(e) => handlePartChange('year', e.target.value)}
          className={`${selectBaseClass} ${
            parts.year ? 'text-[#0F172A] font-medium' : 'text-[#5B6675]'
          }`}
        >
          <option value="">Année</option>
          {years.map((y) => (
            <option key={y} value={y} className="text-[#0F172A]">
              {y}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6675]"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}