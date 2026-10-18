'use client';
import { CalendarDays, LayoutGrid, MapPin, Search, Tag } from 'lucide-react';
import Select from './ui/Select';
import { sectorOptions, statusOptions, wardOptions } from '@/lib/options';

export default function Filters({ value, onChange, sectors, wards, showSector, showSearch }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v, page: 1 });
  const setEv = (k) => (e) => set(k)(e.target.value);
  return (
    <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {showSector && (
        <div className="lg:col-span-2"><label className="label">Sector</label>
          <Select value={value.sector_id} onChange={set('sector_id')} options={sectorOptions(sectors, 'All sectors')} icon={LayoutGrid} searchable /></div>)}
      <div><label className="label">Ward</label>
        <Select value={value.ward_id} onChange={set('ward_id')} options={wardOptions(wards, 'All wards')} icon={MapPin} searchable /></div>
      <div><label className="label">Status</label>
        <Select value={value.status} onChange={set('status')} options={statusOptions('All statuses')} icon={Tag} /></div>
      <div><label className="label">From</label>
        <div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input type="date" className="input pl-9" value={value.from} onChange={setEv('from')} /></div></div>
      <div><label className="label">To</label>
        <div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input type="date" className="input pl-9" value={value.to} onChange={setEv('to')} /></div></div>
      {showSearch && (
        <div className="sm:col-span-2 lg:col-span-6"><label className="label">Search</label>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input className="input pl-9" placeholder="Title or reference number" value={value.search} onChange={setEv('search')} /></div></div>)}
    </div>
  );
}
