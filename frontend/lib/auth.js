'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('user') || 'null')); } catch {}
    setReady(true);
  }, []);

  const save = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };
  const login = async (identifier, password) => save(await api('/auth/login', { method: 'POST', body: { identifier, password } }));
  const register = async (data) => save(await api('/auth/register', { method: 'POST', body: data }));
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); window.location.href = '/login'; };

  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}

export const homeFor = (u) => (u?.role === 'citizen' ? '/dashboard' : '/admin');
