'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, qs } from '@/lib/api';
import { fmtDate } from '@/lib/constants';
import Filters from '@/components/Filters';
import StatusBadge from '@/components/StatusBadge';

export default function AllRequests() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ sector_id: '', ward_id: '', status: '', from: '', to: '', search: '', page: 1 });
  const [sectors, setSectors] = useState([]);
  const [wards, setWards] = useState([]);
  const [data, setData] = useState({ rows: [], total: 0, pages: 1 });

  useEffect(() => {
    api('/sectors').then(setSectors); api('/wards').then(setWards);
    const q = new URLSearchParams(window.location.search).get('q'); // from the header search box
    if (q) setFilters((f) => ({ ...f, search: q }));
  }, []);
  useEffect(() => { if (user && user.role !== 'citizen') api(`/admin/complaints${qs(filters)}`).then(setData); }, [filters, user]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-ink-900">All requests</h1>
      <Filters value={filters} onChange={setFilters} sectors={sectors} wards={wards} showSector showSearch />
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-ink-50"><tr><th className="th">Reference</th><th className="th">Title</th><th className="th">Resident</th><th className="th">Sector</th><th className="th">Ward</th><th className="th">Status</th><th className="th">Date</th><th className="th"></th></tr></thead>
          <tbody className="divide-y divide-ink-100">
            {data.rows.map((c) => (<tr key={c.id}><td className="td font-medium">{c.reference}</td><td className="td">{c.title}</td><td className="td">{c.citizen_name}</td><td className="td">{c.sector_name}</td><td className="td">{c.ward_name}</td>
              <td className="td"><StatusBadge status={c.status} /></td><td className="td">{fmtDate(c.created_at)}</td>
              <td className="td"><Link className="btn-outline px-3 py-1.5" href={`/complaints/${c.id}`}>Open</Link></td></tr>))}
            {data.rows.length === 0 && <tr><td className="td text-ink-500" colSpan={8}>No requests match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-ink-600">
        <span>{data.total} request{data.total === 1 ? '' : 's'}</span>
        <div className="flex items-center gap-2">
          <button className="btn-outline px-3" aria-label="Previous page" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}><ChevronLeft className="h-4 w-4" /></button>
          <span>Page {data.page || 1} of {data.pages}</span>
          <button className="btn-outline px-3" aria-label="Next page" disabled={filters.page >= data.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
