export default function EmptyArt({ className = '' }) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="132" rx="70" ry="9" fill="#e8eaee" />
      <rect x="52" y="22" width="96" height="108" rx="12" fill="#fff" stroke="#d5d9e0" strokeWidth="2" />
      <rect x="80" y="14" width="40" height="16" rx="8" fill="#006b3a" />
      <rect x="68" y="50" width="64" height="7" rx="3.5" fill="#d6f0df" />
      <rect x="68" y="68" width="48" height="7" rx="3.5" fill="#e8eaee" />
      <rect x="68" y="86" width="56" height="7" rx="3.5" fill="#e8eaee" />
      <circle cx="140" cy="108" r="19" fill="#006b3a" />
      <path d="M131 108 L138 115 L150 101" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 110 C32 96 36 84 44 78 C50 90 50 102 40 110 Z" fill="#12864a" />
      <path d="M40 110 C40 98 42 90 44 78" fill="none" stroke="#006b3a" strokeWidth="1.5" />
    </svg>
  );
}
