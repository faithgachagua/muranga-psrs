'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, CheckSquare, Clock, ClipboardList, Settings, Star, TrendingUp, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, qs } from '@/lib/api';
import { fmtDate, STATUS } from '@/lib/constants';
import Filters from '@/components/Filters';
import StatusBadge from '@/components/StatusBadge';
import StatCard from '@/components/StatCard';
import { CheckPadArt, ClipboardArt, GearsArt, SearchDocArt } from '@/components/art/StatArt';

const EMPTY = { sector_id: '', ward_id: '', status: '', from: '', to: '' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState(EMPTY);
  const [sectors, setSectors] = useState([]);
  const [wards, setWards] = useState([]);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => { if (user?.role === 'citizen') router.replace('/dashboard'); }, [user, router]);
  useEffect(() => { api('/sectors').then(setSectors); api('/wards').then(setWards); }, []);
  useEffect(() => {
    if (!user || user.role === 'citizen') return;
    api(`/admin/stats${qs(filters)}`).then(setStats);
    api(`/admin/complaints${qs({ ...filters, limit: 6 })}`).then((d) => setRecent(d.rows));
  }, [filters, user]);

  if (!user || !stats) return <p className="text-sm text-ink-500">Loading…</p>;
  const cards = [
    { tone: 'blue', label: 'Total requests', value: stats.total, icon: ClipboardList, Art: ClipboardArt },
    { tone: 'purple', label: 'Submitted / under review', value: stats.counts.submitted + stats.counts.under_review, icon: Clock, Art: SearchDocArt },
    { tone: 'green', label: 'In progress', value: stats.counts.in_progress, icon: Settings, Art: GearsArt },
    { tone: 'amber', label: 'Resolved', value: stats.counts.resolved, icon: CheckSquare, Art: CheckPadArt },
    { tone: 'red', label: 'Rejected', value: stats.counts.rejected, icon: XCircle },
  ];
  const withData = stats.status.filter((s) => s.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Requests overview</h1>
        <p className="text-sm text-ink-500">All sectors across Murang'a County.</p>
      </div>

      <Filters value={filters} onChange={setFilters} sectors={sectors} wards={wards} showSector />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center gap-4"><span className="icon-tile"><TrendingUp className="h-5 w-5" aria-hidden="true" /></span>
          <div><div className="text-sm text-ink-500">Resolution rate</div><div className="font-heading text-2xl font-bold text-ink-900">{stats.resolutionRate}%</div></div></div>
        <div className="card flex items-center gap-4"><span className="icon-tile bg-amber-50 text-amber-500"><Star className="h-5 w-5" aria-hidden="true" /></span>
          <div><div className="text-sm text-ink-500">Average citizen rating</div>
            <div className="font-heading text-2xl font-bold text-ink-900">{stats.rating.n ? `${stats.rating.avg} / 5` : 'No ratings yet'}<span className="ml-2 font-sans text-sm font-normal text-ink-500">{stats.rating.n ? `${stats.rating.n} ratings` : ''}</span></div></div></div>
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold text-ink-900">Open vs resolved cases</h2>
        <div className="flex h-3 overflow-hidden rounded-full bg-ink-100" role="img" aria-label={`${stats.open} open and ${stats.counts.resolved} resolved`}>
          <div className="bg-sky-500" style={{ width: `${(stats.open / ((stats.open + stats.counts.resolved) || 1)) * 100}%` }} />
          <div className="bg-green-600" style={{ width: `${(stats.counts.resolved / ((stats.open + stats.counts.resolved) || 1)) * 100}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-sm text-ink-600">
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden="true" /><b className="text-ink-900">{stats.open}</b> open (submitted, under review, in progress)</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-600" aria-hidden="true" /><b className="text-ink-900">{stats.counts.resolved}</b> resolved</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card"><h2 className="mb-2 font-semibold text-ink-900">By status</h2>
          <div className="h-64"><ResponsiveContainer><PieChart>
            <Pie data={withData} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {withData.map((s) => <Cell key={s.key} fill={STATUS[s.key].color} />)}</Pie>
            <Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div>

        <div className="card"><h2 className="mb-2 font-semibold text-ink-900">Requests over time</h2>
          <div className="h-64"><ResponsiveContainer><LineChart data={stats.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaee" /><XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
            <Line type="monotone" dataKey="count" name="Requests" stroke="#1c9a47" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div></div>

        <div className="card"><h2 className="mb-2 font-semibold text-ink-900">By sector</h2>
          <div className="h-72"><ResponsiveContainer><BarChart data={stats.bySector} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaee" /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} /><Tooltip />
            <Bar dataKey="count" name="Requests" fill="#12397a" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div></div>

        <div className="card"><h2 className="mb-2 font-semibold text-ink-900">By ward (top 10)</h2>
          <div className="h-72"><ResponsiveContainer><BarChart data={stats.byWard}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaee" /><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
            <Bar dataKey="count" name="Requests" fill="#22a851" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      </div>

      <div className="card p-0">
        <div className="flex items-center justify-between p-5 pb-3"><h2 className="font-semibold text-ink-900">Latest requests</h2>
          <Link href="/admin/complaints" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">View all<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        <div className="overflow-x-auto"><table className="w-full">
          <thead className="bg-ink-50"><tr><th className="th">Reference</th><th className="th">Title</th><th className="th">Sector</th><th className="th">Ward</th><th className="th">Status</th><th className="th">Date</th><th className="th"></th></tr></thead>
          <tbody className="divide-y divide-ink-100">
            {recent.map((c) => (<tr key={c.id}><td className="td font-medium">{c.reference}</td><td className="td">{c.title}</td><td className="td">{c.sector_name}</td><td className="td">{c.ward_name}</td>
              <td className="td"><StatusBadge status={c.status} /></td><td className="td">{fmtDate(c.created_at)}</td>
              <td className="td"><Link className="btn-outline px-3 py-1.5" href={`/complaints/${c.id}`}>Open</Link></td></tr>))}
            {recent.length === 0 && <tr><td className="td text-ink-500" colSpan={7}>No requests match these filters.</td></tr>}
          </tbody></table></div>
      </div>
    </div>
  );
}
