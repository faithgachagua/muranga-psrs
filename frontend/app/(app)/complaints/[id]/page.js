'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, Save, Star, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { optimised, thumbnail } from '@/lib/photos';
import { fmtDateTime, STATUS } from '@/lib/constants';
import { sectorOptions, statusOptions } from '@/lib/options';
import { sectorIcon } from '@/lib/sectors';
import StatusBadge from '@/components/StatusBadge';
import Select from '@/components/ui/Select';

export default function RequestDetail() {
  const { id } = useParams();
  const isNew = useSearchParams().get('new');
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [error, setError] = useState('');
  const [sectors, setSectors] = useState([]);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => api(`/complaints/${id}`).then((d) => { setC(d); setStatus(d.status); }).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (user?.role === 'admin') api('/sectors').then(setSectors); }, [user]);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>;
  if (!c || !user) return <p className="text-sm text-ink-500">Loading…</p>;
  const staff = user.role !== 'citizen';
  const SectorIcon = sectorIcon(c.sector_slug);

  async function updateStatus() {
    setMsg('');
    try { await api(`/admin/complaints/${id}/status`, { method: 'PATCH', body: { status, note } }); setNote(''); setMsg('Status updated. The citizen has been notified.'); load(); }
    catch (e) { setMsg(e.message); }
  }
  async function reroute(sector_id) {
    try { await api(`/admin/complaints/${id}/sector`, { method: 'PATCH', body: { sector_id } }); setMsg('Request moved to the new sector.'); load(); }
    catch (e) { setMsg(e.message); }
  }
  async function sendFeedback() {
    setMsg('');
    try { await api(`/complaints/${id}/feedback`, { method: 'POST', body: { rating, comment } }); load(); }
    catch (e) { setMsg(e.message); }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href={staff ? '/admin/complaints' : '/complaints'} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to requests</Link>
      {isNew && <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm"><CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-600" aria-hidden="true" /><span>Request sent. Keep your reference number <b>{c.reference}</b> to follow its progress.</span></div>}

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><div className="text-sm text-ink-500">{c.reference}</div><h1 className="text-xl font-bold text-ink-900">{c.title}</h1></div>
          <StatusBadge status={c.status} />
        </div>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
          <div className="flex gap-2"><SectorIcon className="mt-0.5 h-4 w-4 text-brand-600" aria-hidden="true" /><div><dt className="text-ink-500">Sector</dt><dd className="font-medium">{c.sector_name}</dd></div></div>
          <div className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 text-brand-600" aria-hidden="true" /><div><dt className="text-ink-500">Ward</dt><dd className="font-medium">{c.ward_name} ({c.sub_county})</dd></div></div>
          <div className="flex gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-brand-600" aria-hidden="true" /><div><dt className="text-ink-500">Submitted</dt><dd className="font-medium">{fmtDateTime(c.created_at)}</dd></div></div>
          {staff && <div className="flex gap-2"><User className="mt-0.5 h-4 w-4 text-brand-600" aria-hidden="true" /><div><dt className="text-ink-500">Citizen</dt><dd className="font-medium">{c.citizen_name}</dd></div></div>}
          {c.location_details && <div className="sm:col-span-2"><dt className="text-ink-500">Location</dt><dd>{c.location_details}</dd></div>}
        </dl>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">{c.description}</p>
        {c.latitude != null && c.longitude != null && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-medium"><span>GPS location</span>
              <a href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 hover:underline">Open in Google Maps</a></div>
            <iframe title="Map of the reported location" loading="lazy" className="h-56 w-full rounded-xl border border-ink-100"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.longitude - 0.005}%2C${c.latitude - 0.003}%2C${c.longitude + 0.005}%2C${c.latitude + 0.003}&layer=mapnik&marker=${c.latitude}%2C${c.longitude}`} />
          </div>
        )}
        {c.photos.length > 0 && (
          <div className="mt-5"><div className="mb-2 text-sm font-medium">Photos</div>
            <div className="flex flex-wrap gap-3">{c.photos.map((p, i) => (
              <a key={p.id} href={optimised(p.url)} target="_blank" rel="noreferrer">
                <img src={thumbnail(p.url)} alt={`Photo ${i + 1} for ${c.reference}`} className="h-24 w-24 rounded-lg border border-ink-100 object-cover" /></a>))}</div></div>
        )}
      </div>

      {staff && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-ink-900">Update status</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select value={status} onChange={setStatus} options={statusOptions()} aria-label="Status" />
            <input className="input sm:col-span-2" placeholder={status === 'rejected' ? 'Reason for rejecting (required)' : 'Note for the citizen (optional)'} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary" onClick={updateStatus}><Save className="h-4 w-4" aria-hidden="true" />Save status</button>
            <Select className="w-72" value="" onChange={(v) => v && reroute(v)} placeholder="Move to another sector…" searchable aria-label="Move to another sector"
              options={sectorOptions(sectors.filter((s) => s.id !== c.sector_id))} />
            {msg && <span className="text-sm text-ink-600">{msg}</span>}
          </div>
        </div>
      )}

      {c.status === 'resolved' && !staff && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-ink-900">How did we do?</h2>
          {c.rating ? (
            <p className="text-sm">You rated this <b>{c.rating}/5</b>{c.feedback_comment ? `: "${c.feedback_comment}"` : ''}. Thank you.</p>
          ) : (<>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                <Star className={`h-8 w-8 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-ink-300'}`} /></button>))}</div>
            <textarea className="input h-20" placeholder="Tell us how the request was handled (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn-primary" disabled={!rating} onClick={sendFeedback}>Send rating</button>
            {msg && <p className="text-sm text-red-600">{msg}</p>}
          </>)}
        </div>
      )}
      {staff && c.rating && <div className="card flex items-center gap-2 text-sm"><Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />Citizen rating: <b>{c.rating}/5</b>{c.feedback_comment ? `: ${c.feedback_comment}` : ''}</div>}

      <div className="card">
        <h2 className="mb-4 font-semibold text-ink-900">Progress</h2>
        <ol className="space-y-5 border-l-2 border-ink-100 pl-6">
          {c.updates.map((u) => {
            const Icon = STATUS[u.status]?.icon;
            return (
              <li key={u.id} className="relative">
                <span className="absolute -left-[37px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: STATUS[u.status]?.color }}>{Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}</span>
                <div className="flex flex-wrap items-center gap-2"><StatusBadge status={u.status} /><span className="text-xs text-ink-500">{fmtDateTime(u.created_at)}</span></div>
                {u.note && <p className="mt-1 text-sm text-ink-600">{u.note}</p>}
              </li>);
          })}
        </ol>
      </div>
    </div>
  );
}
