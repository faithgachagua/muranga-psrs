// Branded loading indicator. Works in server and client components.
export default function PageLoader({ label = 'Loading…', fullScreen = false }) {
  return (
    <div role="status" aria-live="polite"
      className={`flex flex-col items-center justify-center gap-5 text-center ${fullScreen ? 'min-h-screen bg-ink-50 p-6' : 'min-h-[50vh] p-6'}`}>
      <div className="relative h-16 w-16" aria-hidden="true">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-blue-100 border-t-brand-600 motion-reduce:animate-none" />
        <span className="absolute inset-2.5 flex items-center justify-center rounded-full bg-brand-600 font-heading text-lg font-bold text-white">M</span>
      </div>
      <div>
        <p className="font-heading text-sm font-semibold uppercase tracking-wide text-navy-900">Murang'a County</p>
        <p className="mt-1 text-sm text-ink-500">{label}</p>
      </div>
    </div>
  );
}
