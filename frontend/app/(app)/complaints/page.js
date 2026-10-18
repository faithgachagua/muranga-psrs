'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus2, Search, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtDate } from '@/lib/constants';
import { statusOptions } from '@/lib/options';
import StatusBadge from '@/components/StatusBadge';
import Select from '@/components/ui/Select';
import EmptyArt from '@/components/art/EmptyArt';

export default function MyRequests() {
  const [list, setList] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => {
    setQ(new URLSearchParams(window.location.search).get('q') || '');
    api('/complaints/mine').then(setList).catch(() => setList([]));
  }, []);
  if (!list) return <p className="text-sm text-ink-500">Loading…</p>;
  const term = q.trim().toLowerCase();
  const rows = list.filter((c) => (!status || c.status === status) && (!term || `${c.reference} ${c.title} ${c.sector_name}`.toLowerCase().includes(term)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">My requests</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input className="input w-56 pl-9" placeholder="Search requests" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search requests" /></div>
          <Select className="w-48" value={status} onChange={setStatus} options={statusOptions('All statuses')} icon={Tag} aria-label="Filter by status" />
          <Link href="/submit" className="btn-primary"><FilePlus2 className="h-4 w-4" aria-hidden="true" />New request</Link>
        </div>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-ink-50"><tr><th className="th">Reference</th><th className="th">Title</th><th className="th">Sector</th><th className="th">Status</th><th className="th">Date</th><th className="th"></th></tr></thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((c) => (<tr key={c.id}><td className="td font-medium">{c.reference}</td><td className="td">{c.title}</td><td className="td">{c.sector_name}</td>
              <td className="td"><StatusBadge status={c.status} /></td><td className="td">{fmtDate(c.created_at)}</td>
              <td className="td"><Link className="btn-outline px-3 py-1.5" href={`/complaints/${c.id}`}>View</Link></td></tr>))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="py-10 text-center"><EmptyArt className="mx-auto w-32" /><p className="text-sm text-ink-500">No requests match this filter.</p></div>}
      </div>
    </div>
  );
}
