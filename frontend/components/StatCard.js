import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const TONES = {
  blue:   { card: 'border-blue-200 bg-gradient-to-br from-white to-blue-50',     dot: 'bg-blue-500' },
  purple: { card: 'border-purple-200 bg-gradient-to-br from-white to-purple-50', dot: 'bg-purple-500' },
  green:  { card: 'border-green-200 bg-gradient-to-br from-white to-green-50',   dot: 'bg-green-600' },
  amber:  { card: 'border-amber-200 bg-gradient-to-br from-white to-amber-50',   dot: 'bg-amber-500' },
  red:    { card: 'border-red-200 bg-gradient-to-br from-white to-red-50',       dot: 'bg-red-500' },
  slate:  { card: 'border-ink-200 bg-gradient-to-br from-white to-ink-50',       dot: 'bg-ink-600' },
};

export default function StatCard({ tone = 'blue', icon: Icon, label, value, trend, Art }) {
  const t = TONES[tone];
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-tile ${t.card}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${t.dot}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
        <div className="pt-1 text-sm font-semibold text-ink-800">{label}</div>
      </div>
      <div className="mt-2 font-heading text-4xl font-bold text-navy-900">{value}</div>
      {trend && (
        <div className={`mt-1 flex items-center gap-1 text-xs ${trend.dir === 'up' ? 'text-green-700' : trend.dir === 'down' ? 'text-red-600' : 'text-ink-500'}`}>
          {trend.dir === 'up' && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
          {trend.dir === 'down' && <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
          <span className={trend.dir === 'flat' ? '' : 'font-semibold'}>{trend.text}</span>
        </div>
      )}
      {Art && <Art className="absolute bottom-3 right-3 h-16 w-16 opacity-90" />}
    </div>
  );
}
