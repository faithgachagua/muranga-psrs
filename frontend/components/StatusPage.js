import Brand from './Brand';

// Full-page layout shared by the 404 and error screens
export default function StatusPage({ icon: Icon, code, title, message, children, detail }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 p-6">
      <div className="mb-8"><Brand /></div>
      <div className="card w-full max-w-lg p-8 text-center sm:p-10">
        <span className="icon-tile mx-auto h-14 w-14 rounded-2xl"><Icon className="h-7 w-7" aria-hidden="true" /></span>
        {code && <p className="mt-5 font-heading text-6xl font-bold tracking-tight text-navy-900">{code}</p>}
        <h1 className={`${code ? 'mt-2 text-xl' : 'mt-5 text-2xl'} font-bold text-navy-900`}>{title}</h1>
        <p className="mt-2 text-sm text-ink-500">{message}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>
        {detail && <p className="mt-6 text-xs text-ink-400">{detail}</p>}
      </div>
    </div>
  );
}
