'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, BellRing, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtDateTime } from '@/lib/constants';
import EmptyArt from '@/components/art/EmptyArt';

export default function Notifications() {
  const [list, setList] = useState(null);
  const load = () => api('/notifications').then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  if (!list) return <p className="text-sm text-ink-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Notifications</h1>
        {list.some((n) => !n.is_read) && <button className="btn-outline" onClick={() => api('/notifications/read-all', { method: 'PATCH' }).then(load)}><CheckCheck className="h-4 w-4" aria-hidden="true" />Mark all as read</button>}
      </div>
      <div className="card divide-y divide-ink-100 p-0">
        {list.length === 0 && <div className="py-10 text-center"><EmptyArt className="mx-auto w-32" /><p className="text-sm text-ink-500">No notifications yet. Status changes on your requests show up here.</p></div>}
        {list.map((n) => (
          <Link key={n.id} href={n.complaint_id ? `/complaints/${n.complaint_id}` : '#'} onClick={() => api(`/notifications/${n.id}/read`, { method: 'PATCH' })}
            className={`flex gap-3 p-4 hover:bg-ink-50 ${n.is_read ? '' : 'bg-brand-50/60'}`}>
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.is_read ? 'bg-ink-100 text-ink-400' : 'bg-brand-100 text-brand-600'}`}>{n.is_read ? <Bell className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}</span>
            <span className="min-w-0 flex-1"><span className="flex justify-between gap-3"><span className="text-sm font-semibold text-ink-900">{n.title}</span><span className="shrink-0 text-xs text-ink-500">{fmtDateTime(n.created_at)}</span></span>
              <span className="block text-sm text-ink-600">{n.message}</span></span>
          </Link>))}
      </div>
    </div>
  );
}
