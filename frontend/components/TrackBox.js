'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';

export default function TrackBox({ initial = '' }) {
  const router = useRouter();
  const [ref, setRef] = useState(initial);
  const go = (e) => { e.preventDefault(); if (ref.trim()) router.push(`/track?ref=${encodeURIComponent(ref.trim())}`); };
  return (
    <form onSubmit={go} className="flex gap-2" role="search">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input className="input pl-9" placeholder="Reference number, e.g. MCG-2026-000001" value={ref} onChange={(e) => setRef(e.target.value)} aria-label="Request reference number" />
      </div>
      <button className="btn-primary">Track<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
    </form>
  );
}
