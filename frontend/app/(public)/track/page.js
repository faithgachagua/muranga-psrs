'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MapPin, Search, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtDate, fmtDateTime, STATUS } from '@/lib/constants';
import StatusBadge from '@/components/StatusBadge';
import EmptyArt from '@/components/art/EmptyArt';

const FLOW = ['submitted', 'under_review', 'in_progress', 'resolved'];

export default function Track() {
  const [ref, setRef] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function lookup(value) {
    setError(''); setData(null);
    if (!value.trim()) return;
    setBusy(true);
    try { setData(await api(`/track/${encodeURIComponent(value.trim())}`)); }
    catch (e) { setError(e.message); }
    setBusy(false);
  }

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('ref');
    if (r) { setRef(r); lookup(r); }
  }, []);

  const idx = data ? FLOW.indexOf(data.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink-900">Track a request</h1>
      <p className="mt-1 text-ink-500">Enter the reference number you received when you sent your request.</p>

      <form onSubmit={(e) => { e.preventDefault(); lookup(ref); }} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input className="input pl-9" placeholder="MCG-2026-000001" value={ref} onChange={(e) => setRef(e.target.value)} aria-label="Reference number" />
        </div>
        <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Track</button>
      </form>

      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      {!data && !error && !busy && <div className="mt-10 text-center"><EmptyArt className="mx-auto w-40" /><p className="mt-2 text-sm text-ink-500">Your request status will show here.</p></div>}

      {data && (
        <div className="card mt-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="text-sm text-ink-500">Reference</div><div className="font-heading text-xl font-bold text-ink-900">{data.reference}</div></div>
            <StatusBadge status={data.status} />
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-ink-500">Sector</dt><dd className="font-medium">{data.sector_name}</dd></div>
            <div><dt className="text-ink-500">Ward</dt><dd className="flex items-center gap-1 font-medium"><MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />{data.ward_name}</dd></div>
            <div><dt className="text-ink-500">Submitted</dt><dd className="font-medium">{fmtDate(data.created_at)}</dd></div>
          </dl>

          {data.status === 'rejected' ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600"><XCircle className="h-5 w-5" aria-hidden="true" />This request was not accepted. Log in to see the reason.</div>
          ) : (
            <ol className="grid grid-cols-4 gap-2">
              {FLOW.map((k, i) => {
                const done = i <= idx; const Icon = STATUS[k].icon;
                return (
                  <li key={k} className="text-center">
                    <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${done ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'}`}>
                      {done && i < idx ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}</div>
                    <div className={`mt-2 text-xs font-medium ${done ? 'text-ink-800' : 'text-ink-400'}`}>{STATUS[k].label}</div>
                  </li>);
              })}
            </ol>
          )}

          <div><h2 className="mb-3 text-sm font-semibold text-ink-900">History</h2>
            <ul className="space-y-2 text-sm">{data.updates.map((u, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2"><StatusBadge status={u.status} /><span className="text-xs text-ink-500">{fmtDateTime(u.created_at)}</span></li>))}</ul></div>
        </div>
      )}
    </div>
  );
}
