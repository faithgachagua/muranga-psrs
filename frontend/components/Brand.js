export default function Brand({ light = false, size = 44 }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-heading font-bold text-white ring-2 ring-white/20"
        style={{ width: size, height: size, fontSize: size * 0.45 }} aria-hidden="true">M</div>
      <div className="leading-tight">
        <div className={`font-heading text-[15px] font-bold uppercase tracking-wide ${light ? 'text-white' : 'text-navy-900'}`}>Murang'a County</div>
        <div className={`text-xs ${light ? 'text-blue-100' : 'text-ink-500'}`}>Public Service Request System</div>
      </div>
    </div>
  );
}
