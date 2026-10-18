'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, ClipboardCheck, FilePlus2, Home, Leaf, LogOut, Menu, Search, User, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { IMAGES } from '@/lib/images';
import Brand from './Brand';

const CITIZEN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/submit', label: 'Submit request', icon: FilePlus2 },
  { href: '/complaints', label: 'My requests', icon: ClipboardCheck },
  { href: '/notifications', label: 'Notifications', icon: Bell, badge: true },
];
const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/complaints', label: 'All requests', icon: ClipboardCheck },
  { href: '/notifications', label: 'Notifications', icon: Bell, badge: true },
];

function Sidebar({ nav, active, unread, logout, onNavigate }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden text-white"
      style={{ backgroundColor: '#081f4a', backgroundImage: `linear-gradient(180deg, #081f4a 0%, #0b2d66 42%, rgba(11,45,102,.55) 100%), url(${IMAGES.sidebar})`, backgroundSize: 'cover', backgroundPosition: 'center bottom' }}>
      <div className="p-5"><Link href="/" onClick={onNavigate} aria-label="Home"><Brand light /></Link></div>
      <nav className="space-y-1.5 px-3" aria-label="Main">
        {nav.map(({ href, label, icon: Icon, badge }) => (
          <Link key={href} href={href} onClick={onNavigate} aria-current={active(href) ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition ${active(href) ? 'bg-brand-600 shadow-lg' : 'text-blue-50 hover:bg-white/10'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {badge && unread > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold">{unread}</span>}
          </Link>
        ))}
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium text-blue-50 transition hover:bg-white/10">
          <LogOut className="h-5 w-5" aria-hidden="true" />Log out</button>
      </nav>
      <p className="mt-auto flex items-center gap-3 p-6 text-sm italic text-white/90 drop-shadow">
        <Leaf className="h-6 w-6 shrink-0 text-green-400" aria-hidden="true" /><span>A prosperous county,<br />a brighter future</span></p>
    </div>
  );
}

export default function Shell({ children }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }, [ready, user, router]);
  useEffect(() => { setOpen(false); setMenu(false); }, [path]);
  useEffect(() => {
    if (!user) return;
    const load = () => api('/notifications/unread-count').then((d) => setUnread(d.count)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user, path]);
  useEffect(() => {
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  if (!ready || !user) return <div className="p-10 text-sm text-ink-500">Loading…</div>;
  const isAdmin = user.role === 'admin';
  const nav = isAdmin ? ADMIN_NAV : CITIZEN_NAV;
  const active = (href) => (href === '/admin' || href === '/dashboard' ? path === href : path.startsWith(href));
  const search = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`${isAdmin ? '/admin/complaints' : '/complaints'}?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block"><Sidebar nav={nav} active={active} unread={unread} logout={logout} /></aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 z-10 rounded-lg p-2 text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
            <Sidebar nav={nav} active={active} unread={unread} logout={logout} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-blue-100 bg-white px-4 lg:px-8">
          <button className="rounded-lg p-2 text-ink-600 hover:bg-ink-50 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <form onSubmit={search} className="relative max-w-xl flex-1" role="search">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-600" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search requests"
              placeholder="Search requests, reference numbers…"
              className="w-full rounded-xl border border-transparent bg-blue-50/70 py-3 pl-12 pr-4 text-sm outline-none placeholder:text-ink-500 focus:border-blue-300 focus:bg-white" />
          </form>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <Link href="/notifications" className="relative rounded-full p-2 text-navy-700 hover:bg-ink-50" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
              <Bell className="h-6 w-6" />
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">{unread}</span>}
            </Link>
            <div ref={menuRef} className="relative">
              <button onClick={() => setMenu(!menu)} aria-expanded={menu} aria-haspopup="menu" className="flex items-center gap-3 rounded-xl p-1 hover:bg-ink-50">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white"><User className="h-5 w-5" aria-hidden="true" /></span>
                <span className="hidden text-left leading-tight sm:block"><span className="block text-sm font-semibold text-navy-900">{user.full_name}</span>
                  <span className="block text-xs text-ink-500">{isAdmin ? 'County administrator' : 'Resident'}</span></span>
                <ChevronDown className={`hidden h-4 w-4 text-ink-500 transition sm:block ${menu ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {menu && (
                <div role="menu" className="absolute right-0 mt-2 w-48 rounded-xl border border-blue-100 bg-white p-1 shadow-xl">
                  <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"><LogOut className="h-4 w-4" aria-hidden="true" />Log out</button>
                </div>)}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8"><div className="mx-auto max-w-6xl">{children}</div></main>
      </div>
    </div>
  );
}
