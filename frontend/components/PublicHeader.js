'use client';
import Link from 'next/link';
import { useState } from 'react';
import { LayoutDashboard, LogIn, Menu, UserPlus, X } from 'lucide-react';
import { useAuth, homeFor } from '@/lib/auth';
import Brand from './Brand';

const LINKS = [['/#how', 'How it works'], ['/#services', 'Sectors'], ['/track', 'Track a request']];

export default function PublicHeader() {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);

  const Actions = ready && user ? (
    <Link href={homeFor(user)} className="btn-primary"><LayoutDashboard className="h-4 w-4" aria-hidden="true" />Go to dashboard</Link>
  ) : (
    <>
      <Link href="/login" className="btn-outline"><LogIn className="h-4 w-4" aria-hidden="true" />Log in</Link>
      <Link href="/register" className="btn-primary"><UserPlus className="h-4 w-4" aria-hidden="true" />Register</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Home"><Brand /></Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-600 md:flex" aria-label="Main">
          {LINKS.map(([href, label]) => <Link key={href} href={href} className="hover:text-brand-700">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">{Actions}</div>
        <button className="rounded-lg p-2 hover:bg-ink-50 md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-blue-100 px-4 py-4 md:hidden">
          {LINKS.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block py-1 text-sm font-medium text-ink-700">{label}</Link>)}
          <div className="flex gap-2 pt-2">{Actions}</div>
        </div>
      )}
    </header>
  );
}
