'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth, homeFor } from '@/lib/auth';

// Catches errors inside the signed-in area so the sidebar and header stay usable
export default function AppError({ error, reset }) {
  const auth = useAuth();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div role="alert" className="card mx-auto mt-10 max-w-lg p-8 text-center">
      <span className="icon-tile mx-auto h-14 w-14 rounded-2xl"><AlertTriangle className="h-7 w-7" aria-hidden="true" /></span>
      <h1 className="mt-5 text-xl font-bold text-navy-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-500">This page could not be loaded. Please try again.</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={reset} className="btn-primary"><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</button>
        <Link href={homeFor(auth?.user)} className="btn-outline">Go to dashboard</Link>
      </div>
      {error?.digest && <p className="mt-6 text-xs text-ink-400">Error reference: {error.digest}</p>}
    </div>
  );
}
