import { CheckCircle2, Hourglass, Send, Wrench, XCircle } from 'lucide-react';

// Colours follow the dashboard mockup: blue, purple, sky, green, red.
export const STATUS = {
  submitted:    { label: 'Submitted',    cls: 'bg-blue-100 text-blue-700',     color: '#2563eb', icon: Send },
  under_review: { label: 'Under Review', cls: 'bg-purple-100 text-purple-700', color: '#8b5cf6', icon: Hourglass },
  in_progress:  { label: 'In Progress',  cls: 'bg-sky-100 text-sky-700',       color: '#0ea5e9', icon: Wrench },
  resolved:     { label: 'Resolved',     cls: 'bg-green-100 text-green-700',   color: '#16a34a', icon: CheckCircle2 },
  rejected:     { label: 'Rejected',     cls: 'bg-red-100 text-red-600',       color: '#ef4444', icon: XCircle },
};
export const STATUS_KEYS = Object.keys(STATUS);
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtDateTime = (d) => new Date(d).toLocaleString('en-KE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
