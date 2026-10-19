'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

// Catches errors thrown while rendering any page outside the signed-in area
export default function ErrorPage({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <StatusPage icon={AlertTriangle} title="Something went wrong"
      message="We hit an unexpected problem loading this page. Please try again. If it keeps happening, come back in a few minutes."
      detail={error?.digest ? `Error reference: ${error.digest}` : null}>
      <button onClick={reset} className="btn-primary"><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</button>
      <Link href="/" className="btn-outline"><Home className="h-4 w-4" aria-hidden="true" />Back to home</Link>
    </StatusPage>
  );
}
