'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, CheckSquare, Clock, ClipboardList, Eye, FilePlus2, FileText, Info, List, MapPin, Settings, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { fmtDate, STATUS, STATUS_KEYS } from '@/lib/constants';
import { IMAGES } from '@/lib/images';
import { sectorIcon } from '@/lib/sectors';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import EmptyArt from '@/components/art/EmptyArt';
import { CheckPadArt, ClipboardArt, GearsArt, SearchDocArt } from '@/components/art/StatArt';

const MEANINGS = {
  submitted: 'Received by the county administration.',
  under_review: 'The county team is checking the details.',
  in_progress: 'Work to fix the issue has started.',
  resolved: 'Fixed. You can now rate the service.',
  rejected: 'Not accepted. The reason is on the request.',
};

// Compares requests created this month with last month for the trend line on each card
function trendFor(list, match) {
  const now = new Date();
  const inMonth = (d, offset) => { const x = new Date(d); const t = new Date(now.getFullYear(), now.getMonth() - offset, 1); return x.getFullYear() === t.getFullYear() && x.getMonth() === t.getMonth(); };
  const rows = list.filter(match);
  const cur = rows.filter((c) => inMonth(c.created_at, 0)).length;
  const prev = rows.filter((c) => inMonth(c.created_at, 1)).length;
  if (cur === prev) return { dir: 'flat', text: 'No change' };
  const pct = prev === 0 ? 100 : Math.round(Math.abs((cur - prev) / prev) * 100);
  return cur > prev ? { dir: 'up', text: `${pct}% from last month` } : { dir: 'down', text: `${pct}% from last month` };
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'citizen') router.replace('/admin');
    else if (user) api('/complaints/mine').then(setList).catch(() => setList([]));
  }, [user, router]);

  if (!list) return <p className="text-sm text-ink-500">Loading…</p>;
  const is = (...s) => (c) => s.includes(c.status);
  const cards = [
    { tone: 'blue', icon: ClipboardList, label: 'Total requests', match: () => true, Art: ClipboardArt },
    { tone: 'purple', icon: Clock, label: 'Awaiting review', match: is('submitted', 'under_review'), Art: SearchDocArt },
    { tone: 'green', icon: Settings, label: 'In progress', match: is('in_progress'), Art: GearsArt },
    { tone: 'amber', icon: CheckSquare, label: 'Resolved', match: is('resolved'), Art: CheckPadArt },
  ];
  const needsRating = list.filter((c) => c.status === 'resolved' && !c.rating);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-navy-900 bg-cover bg-right p-6 shadow-tile sm:min-h-[12.5rem] sm:p-8" style={{ backgroundImage: `url(${IMAGES.dashboardBanner})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/30 to-transparent" />
        <div className="relative max-w-lg">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl"><span aria-hidden="true">👋</span><span>Welcome back, <span className="text-green-400">{user.full_name.split(' ')[0]}</span></span></h1>
          <p className="mt-3 text-blue-50">Report an issue, follow its progress and rate how it was handled.</p>
          <Link href="/submit" className="btn-primary mt-6 px-6 py-3 text-base"><FilePlus2 className="h-5 w-5" aria-hidden="true" />Submit a request<ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
        </div>
        <div className="pointer-events-none absolute right-8 top-6 hidden -rotate-6 text-right font-script text-3xl leading-8 text-white drop-shadow-lg md:block" aria-hidden="true">
          Murang'a County<br />Better Services<br />For You
          <svg viewBox="0 0 120 14" className="ml-auto mt-1 h-3 w-28" fill="none"><path d="M3 11 C30 2 70 2 117 6" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" /></svg>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ match, ...c }) => <StatCard key={c.label} {...c} value={list.filter(match).length} trend={trendFor(list, match)} />)}
      </div>

      {needsRating.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <Star className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <span>{needsRating.length} resolved request{needsRating.length > 1 ? 's' : ''} waiting for your rating.</span>
          <Link className="ml-auto font-semibold text-brand-700 hover:underline" href={`/complaints/${needsRating[0].id}`}>Rate now</Link>
        </div>
      )}

      <div className="card p-0">
        <div className="flex items-center justify-between p-5">
          <h2 className="flex items-center gap-3 text-xl font-bold text-navy-900"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><List className="h-5 w-5" aria-hidden="true" /></span>Recent requests</h2>
          <Link href="/complaints" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">View all<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        {list.length === 0 ? (
          <div className="px-5 pb-8 text-center"><EmptyArt className="mx-auto w-36" />
            <p className="text-sm text-ink-500">You have not sent any requests yet.</p>
            <Link href="/submit" className="btn-primary mt-4">Send your first request</Link></div>
        ) : (
          <div className="overflow-x-auto px-3 pb-3"><table className="w-full">
            <thead><tr className="bg-blue-50/70 [&>th:first-child]:rounded-l-xl [&>th:last-child]:rounded-r-xl"><th className="th">Reference</th><th className="th">Sector</th><th className="th">Ward</th><th className="th">Status</th><th className="th">Date</th><th className="th">Action</th></tr></thead>
            <tbody className="divide-y divide-blue-50">
              {list.slice(0, 5).map((c) => { const Icon = sectorIcon(c.sector_slug); return (
                <tr key={c.id}>
                  <td className="td"><span className="flex items-center gap-3 font-semibold text-navy-900"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><FileText className="h-5 w-5" aria-hidden="true" /></span>{c.reference}</span></td>
                  <td className="td"><span className="flex items-center gap-2"><Icon className="h-4 w-4 text-blue-500" aria-hidden="true" />{c.sector_name}</span></td>
                  <td className="td"><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-400" aria-hidden="true" />{c.ward_name}</span></td>
                  <td className="td"><StatusBadge status={c.status} /></td>
                  <td className="td"><span className="flex items-center gap-2 whitespace-nowrap"><CalendarDays className="h-4 w-4 text-ink-400" aria-hidden="true" />{fmtDate(c.created_at)}</span></td>
                  <td className="td"><Link className="btn-pill" href={`/complaints/${c.id}`}><Eye className="h-4 w-4" aria-hidden="true" />View</Link></td>
                </tr>); })}
            </tbody></table></div>
        )}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-navy-900"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white"><Info className="h-5 w-5" aria-hidden="true" /></span>What the statuses mean</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-blue-100">
          {STATUS_KEYS.map((k) => (
            <li key={k} className="lg:px-5 lg:first:pl-0 lg:last:pr-0">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-navy-900"><span className="h-3.5 w-3.5 rounded-full" style={{ background: STATUS[k].color }} aria-hidden="true" />{STATUS[k].label}</div>
              <p className="mt-1.5 text-sm text-ink-500">{MEANINGS[k]}</p>
            </li>))}
        </ul>
      </div>
    </div>
  );
}
