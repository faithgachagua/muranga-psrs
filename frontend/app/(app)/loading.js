// Shown inside the signed-in layout (sidebar and header stay visible) while a page loads
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="animate-pulse space-y-6 motion-reduce:animate-none">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-56 rounded-lg bg-ink-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl border border-blue-100 bg-white" />)}
      </div>
      <div className="h-72 rounded-2xl border border-blue-100 bg-white" />
    </div>
  );
}
