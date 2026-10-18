'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin } from 'lucide-react';
import { useAuth, homeFor } from '@/lib/auth';
import { api } from '@/lib/api';
import { wardOptions } from '@/lib/options';
import AuthCard from '@/components/AuthCard';
import Select from '@/components/ui/Select';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [wards, setWards] = useState([]);
  const [f, setF] = useState({ full_name: '', email: '', national_id: '', phone: '', ward_id: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { api('/wards').then(setWards).catch(() => {}); }, []);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const user = await register(f);
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : homeFor(user));
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <AuthCard title="Create your account" subtitle="Citizens can send and track requests to the county.">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="fn">Full name</label><input id="fn" className="input" value={f.full_name} onChange={set('full_name')} required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="em">Email</label><input id="em" type="email" className="input" value={f.email} onChange={set('email')} required /></div>
          <div><label className="label" htmlFor="nid">National ID number</label><input id="nid" className="input" value={f.national_id} onChange={set('national_id')} required /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="ph">Phone</label><input id="ph" className="input" value={f.phone} onChange={set('phone')} /></div>
          <div><label className="label" htmlFor="wd">Your ward</label>
            <Select id="wd" value={f.ward_id} onChange={(v) => setF({ ...f, ward_id: v })} options={wardOptions(wards)} placeholder="Select ward" icon={MapPin} searchable /></div>
        </div>
        <div><label className="label" htmlFor="pw">Password (8+ characters)</label><input id="pw" type="password" className="input" value={f.password} onChange={set('password')} minLength={8} required /></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="text-center text-sm text-ink-500">Already registered? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link></p>
      </form>
    </AuthCard>
  );
}
