export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// JSON helper that attaches the login token; pass `form` to send multipart data
export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  const res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/login')) {
      localStorage.removeItem('token'); localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => v !== '' && v != null && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export async function download(path, filename) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Download failed');
  const url = URL.createObjectURL(await res.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
