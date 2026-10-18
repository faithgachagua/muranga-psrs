'use client';
import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

/**
 * Accessible select (listbox) that replaces the native <select>.
 *
 * options: [{ value, label, icon?, group?, hint? }]   value is always a string
 * onChange receives the selected value (not an event)
 * searchable: adds a filter box, handy for long lists such as wards
 * Keyboard: Arrow keys, Home/End, Enter/Space to pick, Esc to close, type to filter when searchable.
 */
export default function Select({
  value, onChange, options, placeholder = 'Select…', id, searchable = false, icon: LeadIcon,
  disabled = false, className = '', 'aria-label': ariaLabel,
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const list = useRef(null);
  const search = useRef(null);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => `${o.label} ${o.group || ''} ${o.hint || ''}`.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const close = (refocus = true) => { setOpen(false); setQuery(''); if (refocus) trigger.current?.focus(); };
  const openMenu = () => {
    if (disabled) return;
    const r = trigger.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    setUp(below < 300 && r.top > below);
    setActive(Math.max(options.findIndex((o) => o.value === value), 0));
    setOpen(true);
  };
  const choose = (o) => { onChange(o.value); close(); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!root.current?.contains(e.target)) close(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => { if (open) (searchable ? search.current : list.current)?.focus(); }, [open, searchable]);
  useEffect(() => { if (open) list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [active, open, filtered]);
  useEffect(() => { setActive(0); }, [query]);

  const onMenuKey = (e) => {
    const last = filtered.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, last)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Home' && !searchable) { e.preventDefault(); setActive(0); }
    else if (e.key === 'End' && !searchable) { e.preventDefault(); setActive(last); }
    else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) { e.preventDefault(); if (filtered[active]) choose(filtered[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close(false);
  };

  const onTriggerKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!open) openMenu(); }
  };

  const optId = (i) => `${uid}-opt-${i}`;
  const SelIcon = selected?.icon || LeadIcon;

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        ref={trigger} id={id} type="button" role="combobox" disabled={disabled}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={`${uid}-list`} aria-label={ariaLabel}
        onClick={() => (open ? close() : openMenu())} onKeyDown={onTriggerKey}
        className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-left text-sm outline-none transition focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:opacity-60 ${open ? 'border-brand-600 ring-2 ring-brand-100' : 'border-ink-200 hover:border-ink-300'}`}
      >
        {SelIcon && <SelIcon className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />}
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-ink-800' : 'text-ink-400'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div onKeyDown={onMenuKey}
          className={`absolute left-0 z-40 w-full min-w-[13rem] overflow-hidden rounded-xl border border-ink-100 bg-white shadow-xl ${up ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}>
          {searchable && (
            <div className="relative border-b border-ink-100 p-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input ref={search} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" aria-label="Search options"
                aria-controls={`${uid}-list`} aria-activedescendant={filtered.length ? optId(active) : undefined}
                className="w-full rounded-md border border-ink-200 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-brand-600" />
            </div>
          )}
          <ul ref={list} id={`${uid}-list`} role="listbox" tabIndex={-1} aria-activedescendant={filtered.length ? optId(active) : undefined}
            className="max-h-64 overflow-auto p-1 outline-none">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-ink-500">No matches</li>}
            {filtered.map((o, i) => {
              const OIcon = o.icon;
              const isSel = o.value === value;
              return (
                <Fragment key={o.value}>
                  {o.group && o.group !== filtered[i - 1]?.group && (
                    <li role="presentation" className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{o.group}</li>
                  )}
                  <li id={optId(i)} role="option" aria-selected={isSel} data-active={i === active}
                    onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(o)}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ${i === active ? 'bg-brand-50 text-brand-800' : 'text-ink-700'} ${isSel ? 'font-semibold' : ''}`}>
                    {OIcon && <OIcon className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />}
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {isSel && <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />}
                  </li>
                </Fragment>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
