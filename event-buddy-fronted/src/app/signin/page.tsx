'use client';

import { useEffect, useState } from 'react';
import { login } from '../utils/api';
import { getUser, getDisplayName } from '../utils/auth';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const nxt = params.get('next');
    if (nxt) setNextPath(nxt);
    // Already logged in? Redirect
    const token = localStorage.getItem('token');
    if (token) {
      const user = getUser();
      const role = user?.role || user?.Role || user?.ROLE;
      if (nxt) {
        window.location.href = nxt;
      } else if (String(role).toUpperCase() === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    }
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      const res = await login(email, password);
      if (res?.token) {
        localStorage.setItem('token', res.token);
        // Store a friendly display name directly from API response
        try {
          const u = res.user || res.User || res.data?.user || res;
          const name =
            u?.fullName ||
            u?.name ||
            u?.username ||
            (u?.email ? String(u.email).split('@')[0] : null);
          if (name) localStorage.setItem('userName', name);
          if (u?.role) localStorage.setItem('role', String(u.role).toLowerCase());
        } catch {}
        // Fallback: if no userName stored yet, use email prefix so Header can display it
        if (!localStorage.getItem('userName') && email) {
          const fallback = String(email).split('@')[0];
          if (fallback) localStorage.setItem('userName', fallback);
        }
        const user = getUser();
        const role = user?.role || user?.Role || user?.ROLE;
        if (nextPath) {
          window.location.href = nextPath;
        } else if (String(role).toUpperCase() === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError('Login failed. Please try again');
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex flex-col bg-violet-100 text-gray-800">
      <header className="flex items-center px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-700 ml-4">Event buddy.</h1>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="rounded-tl-4xl rounded-br-4xl w-full max-w-sm  shadow-2xl p-6 bg-white ">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In</h2>

          {error && (
            <div className="mb-3 text-sm text-red-600">{error}</div>
          )}

          <p className="mt-4 text-sm text-left text-gray-600">
            New user?{' '}
            <a href="/signup" className="hover:text-blue-800 hover:underline pb-4">Create an account</a>
          </p>

          <p className="mt-4 text-sm text-left text-gray-600 pb-4 font-bold">
            Email
          </p>


          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full mb-3 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="mt-4 text-sm text-left text-gray-600 pb-4 font-bold">
            Password
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full mb-4 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-white py-2 rounded-lg font-medium disabled:opacity-80 bg-gradient-to-b from-violet-300 to-blue-600 hover:from-violet-300 hover:to-blue-800 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </div>
      </div>

    </div>
  );
}