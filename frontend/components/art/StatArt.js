const svg = (children) => (props) => (
  <svg viewBox="0 0 80 80" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" {...props}>{children}</svg>
);

export const ClipboardArt = svg(<>
  <rect x="18" y="14" width="40" height="52" rx="6" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />
  <rect x="28" y="9" width="20" height="10" rx="4" fill="#60a5fa" />
  <rect x="25" y="30" width="26" height="4" rx="2" fill="#93c5fd" /><rect x="25" y="40" width="20" height="4" rx="2" fill="#bfdbfe" />
  <circle cx="56" cy="56" r="12" fill="#22a851" /><path d="M50 56 L54.5 60.5 L62 52" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
</>);

export const SearchDocArt = svg(<>
  <rect x="14" y="12" width="40" height="52" rx="6" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" />
  <rect x="22" y="24" width="24" height="4" rx="2" fill="#c4b5fd" /><rect x="22" y="34" width="16" height="4" rx="2" fill="#ddd6fe" />
  <circle cx="52" cy="50" r="11" fill="#fff" stroke="#8b5cf6" strokeWidth="4" /><path d="M60 58 L70 68" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
</>);

export const GearsArt = svg(<>
  <g fill="#86efac" stroke="#22a851" strokeWidth="2"><circle cx="34" cy="44" r="17" /><circle cx="58" cy="24" r="10" /></g>
  <g stroke="#22a851" strokeWidth="5" strokeLinecap="round"><path d="M34 22v-4M34 66v-4M12 44h4M52 44h4M18 28l3 3M47 57l3 3M18 60l3-3M47 31l3-3" /><path d="M58 9v3M58 36v3M43 24h3M70 24h3" strokeWidth="4" /></g>
  <circle cx="34" cy="44" r="7" fill="#fff" stroke="#22a851" strokeWidth="2" /><circle cx="58" cy="24" r="4" fill="#fff" />
</>);

export const CheckPadArt = svg(<>
  <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"><path d="M40 4v6M18 12l4 4M62 12l-4 4M8 30h6M72 30h-6" /></g>
  <rect x="18" y="20" width="44" height="52" rx="6" fill="#fef3c7" stroke="#fbbf24" strokeWidth="2" />
  <rect x="30" y="15" width="20" height="10" rx="4" fill="#f59e0b" />
  <path d="M29 46 L37 54 L52 38" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
</>);
