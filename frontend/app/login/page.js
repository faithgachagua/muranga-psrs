'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, UserRound } from 'lucide-react';
import { useAuth, homeFor } from '@/lib/auth';
import AuthCard from '@/components/AuthCard';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const user = await login(identifier, password);
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : homeFor(user));
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <AuthCard title="Log in" subtitle="Use your email or national ID number.">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="id">Email or ID number</label>
          <div className="relative"><UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input id="id" className="input pl-9" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required /></div></div>
        <div><div className="flex items-center justify-between"><label className="label" htmlFor="pw">Password</label><Link href="/forgot-password" className="mb-1.5 text-sm font-medium text-brand-700 hover:underline">Forgot password?</Link></div>
          <div className="relative"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input id="pw" type={show ? 'text' : 'password'} className="input px-9" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-700">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="text-center text-sm text-ink-500">New here? <Link href="/register" className="font-semibold text-brand-700 hover:underline">Create a citizen account</Link></p>
      </form>
    </AuthCard>
  );
}
