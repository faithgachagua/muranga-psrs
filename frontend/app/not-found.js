'use client';
import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';
import StatusPage from '@/components/StatusPage';
import { useAuth, homeFor } from '@/lib/auth';

export default function NotFound() {
  const auth = useAuth();
  const user = auth?.user;
  return (
    <StatusPage icon={Compass} code="404" title="We couldn't find that page"
      message="The link may be broken or the page may have moved. Check the address, or head back to somewhere familiar.">
      <Link href={user ? homeFor(user) : '/'} className="btn-primary"><Home className="h-4 w-4" aria-hidden="true" />{user ? 'Go to my dashboard' : 'Back to home'}</Link>
      <Link href="/track" className="btn-outline"><Search className="h-4 w-4" aria-hidden="true" />Track a request</Link>
    </StatusPage>
  );
}
