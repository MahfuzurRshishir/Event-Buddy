'use client';
import { useEffect, useState } from 'react';
import { getUser, logout, getDisplayName } from '../utils/auth';

const Header = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const n = getDisplayName();
    if (n) setName(n);
    else setName(null);
  }, []);

  return (
    <header className="flex justify-between items-center px-6 py-4">
      <button
        type="button"
        onClick={() => {
          const u = getUser();
          const role = u?.role || u?.Role || u?.ROLE;
          const isAdmin = String(role).toUpperCase() === 'ADMIN';
          window.location.href = isAdmin ? '/admin' : '/dashboard';
        }}
        className="text-2xl font-bold text-blue-600 ml-4 hover:underline"
        aria-label="Go to home"
      >
        Event buddy.
      </button>
      <div className="flex items-center gap-4 mr-4">
        {name ? (
          <>
            <a href="/users" className="text-indigo-950 font-semibold hover:underline">{name}</a>
            <button
              onClick={() => {
                const ok = window.confirm('Are you sure you want to logout?');
                if (ok) logout();
              }}
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/signin" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded">Sign in</a>
            <a href="/signup" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded">Sign up</a>
          </>
        )}
      </div>
    </header>
  );
}

export default Header
