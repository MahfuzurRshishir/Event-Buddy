'use client';
import React, { useEffect, useState } from 'react';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Need to login first');
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/signin?next=${next}`;
      return;
    }
    setAuthorized(true);
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50 text-indigo-950">
        <div>Need to login first</div>
      </div>
    );
  }

  return <>{children}</>;
}
