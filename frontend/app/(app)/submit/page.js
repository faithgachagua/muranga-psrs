'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2, LocateFixed, MapPin, Send, Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import { sectorOptions, wardOptions } from '@/lib/options';
import { sectorIcon } from '@/lib/sectors';
import Select from '@/components/ui/Select';

const STEPS = ['Basic information', 'Description & photos', 'Review & send'];

export default function Submit() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sectors, setSectors] = useState([]);
  const [wards, setWards] = useState([]);
  const [f, setF] = useState({ sector_id: '', ward_id: '', title: '', description: '', location_details: '' });
  const [point, setPoint] = useState(null);
  const [locating, setLocating] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    Promise.all([api('/sectors'), api('/wards')]).then(([s, w]) => {
      setSectors(s); setWards(w);
      const slug = new URLSearchParams(window.location.search).get('sector');
      const match = s.find((x) => x.slug === slug);
      if (match) setF((prev) => ({ ...prev, sector_id: String(match.id) }));
    });
  }, []);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const sector = sectors.find((s) => String(s.id) === f.sector_id);
  const ward = wards.find((w) => String(w.id) === f.ward_id);

  function next() {
    setError('');
    if (step === 0 && (!f.sector_id || !f.ward_id || !f.title.trim())) return setError('Choose a sector and ward, and add a title.');
    if (step === 1 && !f.description.trim()) return setError('Describe the issue so the county can act on it.');
    setStep(step + 1);
  }

  function locate() {
    setError('');
    if (!navigator.geolocation) return setError('This browser cannot share your location.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setPoint({ latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }); setLocating(false); },
      (err) => {
        setLocating(false);
        setError(err.code === 1 ? 'Location access was blocked. Allow it in your browser settings or describe the place instead.' : 'We could not get your location. Try again or describe the place instead.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function pick(e) {
    const chosen = [...e.target.files];
    e.target.value = '';
    if (files.length + chosen.length > 5) return setError('You can attach up to 5 photos.');
    if (chosen.some((x) => x.size > 5 * 1024 * 1024)) return setError('Each photo must be 5 MB or smaller.');
    setError(''); setFiles([...files, ...chosen]);
  }

  async function submit() {
    setBusy(true); setError('');
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => form.append(k, v));
    if (point) { form.append('latitude', point.latitude); form.append('longitude', point.longitude); }
    files.forEach((x) => form.append('photos', x));
    try { const c = await api('/complaints', { method: 'POST', form }); router.push(`/complaints/${c.id}?new=1`); }
    catch (e) { setError(e.message); setBusy(false); }
  }

  const SectorIcon = sector ? sectorIcon(sector.slug) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-ink-900">Send a request</h1>
      <p className="mb-6 mt-1 text-sm text-ink-500">It is filed under the sector you choose and sent to the county administration. You will be notified when its status changes.</p>

      <ol className="mb-6 grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2 text-sm">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-navy-700 text-white' : 'bg-ink-100 text-ink-500'}`}>
              {i < step ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}</span>
            <span className={`hidden sm:block ${i === step ? 'font-semibold text-ink-900' : 'text-ink-500'}`}>{s}</span>
          </li>))}
      </ol>

      <div className="card space-y-5">
        {step === 0 && (<>
          <div><label className="label" htmlFor="sector">Sector</label>
            <Select id="sector" value={f.sector_id} onChange={(v) => setF({ ...f, sector_id: v })} options={sectorOptions(sectors)} placeholder="Select a sector" searchable />
            {sector && <p className="mt-1.5 text-xs text-ink-500">{sector.description}</p>}</div>
          <div><label className="label" htmlFor="ward">Ward where the issue happened</label>
            <Select id="ward" value={f.ward_id} onChange={(v) => setF({ ...f, ward_id: v })} options={wardOptions(wards)} placeholder="Select a ward" icon={MapPin} searchable /></div>
          <div><label className="label" htmlFor="title">Title</label><input id="title" className="input" maxLength={120} placeholder="e.g. Broken streetlight near Murang'a stage" value={f.title} onChange={set('title')} /></div>
        </>)}

        {step === 1 && (<>
          <div><label className="label" htmlFor="desc">Description</label>
            <textarea id="desc" className="input h-32" maxLength={500} value={f.description} onChange={set('description')} placeholder="What is the problem, and since when?" />
            <div className="text-right text-xs text-ink-400">{f.description.length}/500</div></div>
          <div><label className="label" htmlFor="loc">Exact location (optional)</label>
            <div className="relative"><MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input id="loc" className="input pl-9" value={f.location_details} onChange={set('location_details')} placeholder="Landmark, village or road name" /></div></div>
          <div><span className="label">GPS location (optional)</span>
            {point ? (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                <MapPin className="h-4 w-4" aria-hidden="true" />Location captured ({point.latitude}, {point.longitude})
                <button type="button" className="ml-auto font-semibold underline" onClick={() => setPoint(null)}>Remove</button>
              </div>
            ) : (
              <button type="button" className="btn-outline" onClick={locate} disabled={locating}>
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" aria-hidden="true" />}{locating ? 'Finding your location…' : 'Use my current location'}</button>
            )}
            <p className="mt-1.5 text-xs text-ink-500">Best used when you are at the place you are reporting.</p></div>
          <div><span className="label">Photos (optional)</span>
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 px-4 py-6 text-center transition hover:border-brand-500 hover:bg-brand-50">
              <Upload className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <span className="text-sm font-medium text-ink-800">Click to upload photos</span>
              <span className="text-xs text-ink-500">JPG, PNG or WEBP. Up to 5 photos, 5 MB each.</span>
              <input type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={pick} className="sr-only" />
            </label>
            <ul className="mt-3 flex flex-wrap gap-3">{files.map((x, i) => (
              <li key={i} className="relative">
                <img src={previews[i]} alt={x.name} className="h-20 w-20 rounded-lg border border-ink-100 object-cover" />
                <button type="button" className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-ink-500 shadow hover:text-red-600" aria-label={`Remove ${x.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5" /></button></li>))}</ul></div>
        </>)}

        {step === 2 && (
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-ink-500">Sector</dt><dd className="flex items-center gap-2 font-medium">{SectorIcon && <SectorIcon className="h-4 w-4 text-brand-600" aria-hidden="true" />}{sector?.name}</dd></div>
            <div><dt className="text-ink-500">Ward</dt><dd className="font-medium">{ward?.name} ({ward?.sub_county})</dd></div>
            <div className="sm:col-span-2"><dt className="text-ink-500">Title</dt><dd className="font-medium">{f.title}</dd></div>
            <div className="sm:col-span-2"><dt className="text-ink-500">Description</dt><dd className="whitespace-pre-wrap">{f.description}</dd></div>
            {f.location_details && <div className="sm:col-span-2"><dt className="text-ink-500">Location</dt><dd>{f.location_details}</dd></div>}
            {point && <div className="sm:col-span-2"><dt className="text-ink-500">GPS location</dt><dd>{point.latitude}, {point.longitude}</dd></div>}
            <div className="sm:col-span-2"><dt className="text-ink-500">Photos</dt><dd>{files.length ? `${files.length} attached` : 'None attached'}</dd></div>
          </dl>
        )}

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <div className="flex justify-between border-t border-ink-100 pt-4">
          <button className="btn-outline" onClick={() => (step ? setStep(step - 1) : router.back())}><ArrowLeft className="h-4 w-4" aria-hidden="true" />{step ? 'Back' : 'Cancel'}</button>
          {step < 2 ? <button className="btn-primary" onClick={next}>Continue<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            : <button className="btn-primary" onClick={submit} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" aria-hidden="true" />}{busy ? 'Sending…' : 'Send request'}</button>}
        </div>
      </div>
    </div>
  );
}
