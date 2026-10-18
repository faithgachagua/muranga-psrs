import { STATUS } from '@/lib/constants';

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.submitted;
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>
      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />{s.label}
    </span>
  );
}
