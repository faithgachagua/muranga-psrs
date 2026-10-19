import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Brand from './Brand';
import { IMAGES } from '@/lib/images';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[46%] flex-col overflow-hidden bg-navy-900 p-10 lg:flex"
        style={{ backgroundImage: `url(${IMAGES.loginPanel})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-900/40" />
        <div className="relative z-10"><Brand light size={48} /></div>
        <div className="relative z-10 mt-auto max-w-md pb-[22%]">
          <h1 className="text-4xl font-bold leading-tight text-white drop-shadow">Report it. Track it. See it fixed.</h1>
          <p className="mt-4 text-blue-50 drop-shadow">Send a request to the county under the right sector, follow every step, and rate how it was handled.</p>
        </div>
        <p className="absolute inset-x-10 bottom-8 z-10 flex items-center gap-2 text-sm text-blue-100 drop-shadow"><ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />Your details are only used to handle your requests.</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to home</Link>
          <div className="mb-6 lg:hidden"><Brand /></div>
          <h2 className="text-2xl font-bold text-navy-900">{title}</h2>
          <p className="mb-6 mt-1 text-sm text-ink-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
