'use client';
import { useEffect } from 'react';

// Last-resort boundary: replaces the root layout, so it brings its own html/body and plain styles
export default function GlobalError({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f7fc', color: '#1a2740', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: 'center', background: '#fff', border: '1px solid #dbeafe', borderRadius: 16, padding: 32 }}>
          <h1 style={{ margin: 0, fontSize: 22, color: '#081f4a' }}>Something went wrong</h1>
          <p style={{ color: '#5f6f8c', fontSize: 14, lineHeight: 1.5 }}>The site hit an unexpected problem. Please try again.</p>
          <button onClick={() => reset()} style={{ marginTop: 8, background: '#1c9a47', color: '#fff', border: 0, borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Try again</button>
          {error?.digest && <p style={{ color: '#8493ad', fontSize: 12, marginTop: 20 }}>Error reference: {error.digest}</p>}
        </div>
      </body>
    </html>
  );
}
