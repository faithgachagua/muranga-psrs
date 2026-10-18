'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import AuthCard from '@/components/AuthCard';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { setToken(new URLSearchParams(window.location.search).get('token') || ''); }, []);

  async function submit(e) {
    e.preventDefault(); setError('');
    if (password !== confirm) return setError('The two passwords do not match');
    setBusy(true);
    try { setMessage((await api('/auth/reset-password', { method: 'POST', body: { token, password } })).message); }
    catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Use at least 8 characters.">
      {message ? (
        <div className="space-y-4">
          <p className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />{message}</p>
          <Link href="/login" className="btn-primary w-full">Log in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {[['pw', 'New password', password, setPassword], ['pw2', 'Confirm new password', confirm, setConfirm]].map(([id, label, value, set]) => (
            <div key={id}><label className="label" htmlFor={id}>{label}</label>
              <div className="relative"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                <input id={id} type="password" className="input pl-9" value={value} onChange={(e) => set(e.target.value)} minLength={8} autoComplete="new-password" required /></div></div>))}
          {!token && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">This page needs the link from your email. <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link></p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={busy || !token}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Saving…' : 'Change password'}</button>
        </form>
      )}
    </AuthCard>
  );
}
