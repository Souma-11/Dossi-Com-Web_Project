// Association stricte des couleurs définies dans la charte Dossi'Com
const priorityStyles = {
  P1: 'bg-priority-p1 text-white', // P1 Immédiate (Rouge)
  P2: 'bg-priority-p2 text-white', // P2 Très urgente (Orange assombri)
  P3: 'bg-priority-p3 text-white', // P3 Urgente (Bleu)
  P4: 'bg-priority-p4 text-white', // P4 Moins urgente (Gris)
};

const priorityLabels = {
  P1: 'P1 Immédiate',
  P2: 'P2 Très urgente',
  P3: 'P3 Urgente',
  P4: 'P4 Moins urgente',
};

export default function PriorityBadge({ level }) {
  const style = priorityStyles[level] || 'bg-gray-400 text-white';
  const label = priorityLabels[level] || level;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm ${style}`}>
      {label}
    </span>
  );
}