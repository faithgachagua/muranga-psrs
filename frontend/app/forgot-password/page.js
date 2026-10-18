'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import AuthCard from '@/components/AuthCard';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { setMessage((await api('/auth/forgot-password', { method: 'POST', body: { email } })).message); }
    catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <AuthCard title="Forgot your password?" subtitle="Enter your email address and we will send you a link to choose a new one.">
      {message ? (
        <div className="space-y-4">
          <p className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />{message}</p>
          <Link href="/login" className="btn-outline w-full">Back to log in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label" htmlFor="email">Email</label>
            <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input id="email" type="email" className="input pl-9" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div></div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Sending…' : 'Send reset link'}</button>
          <p className="text-center text-sm text-ink-500">Remembered it? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link></p>
        </form>
      )}
    </AuthCard>
  );
}
