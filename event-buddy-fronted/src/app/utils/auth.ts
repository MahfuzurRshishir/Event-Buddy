export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

export function getUserRole(): 'user' | 'admin' | null {
  if (typeof window === 'undefined') return null;
  const role = localStorage.getItem('role');
  return role === 'admin' ? 'admin' : role === 'user' ? 'user' : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userName');
  window.location.href = '/dashboard';
}

// Additional auth utilities
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

export const getUser = (): any => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'ADMIN';
};

export const getDisplayName = (): string | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('userName');
  if (stored && stored.trim().length > 0) return stored;
  const u = getUser();
  if (!u) return null;
  const name =
    u.name ||
    u.fullName ||
    u.username ||
    (u.user && (u.user.fullName || u.user.name || u.user.username)) ||
    ((u.firstName || u.firstname) && (u.lastName || u.lastname)
      ? `${u.firstName || u.firstname} ${u.lastName || u.lastname}`
      : null) ||
    (u.email ? String(u.email).split('@')[0] : null);
  return name || null;
};