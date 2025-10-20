import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token if available
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle unauthorized globally
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (typeof window !== 'undefined' && (status === 401 || status === 403)) {
      try {
        alert('Need to login first');
      } catch {}
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/signin?next=${next}`;
    }
    return Promise.reject(new Error(getErrorMessage(error)));
  }
);

// Simple error normalizer
function getErrorMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  );
}

// Events API
export async function fetchEvents(): Promise<any> {
  const { data } = await http.get('/events/all');
  return data;
}

export async function fetchEvent(id: string): Promise<any> {
  const { data } = await http.get(`/events/${id}`);
  return data;
}

export async function fetchPaginatedEvents(page: number = 1, limit: number = 10, dateFilter?: string): Promise<any> {
  const { data } = await http.get('/events/pages/paginated', {
    params: { page, limit, dateFilter },
  });
  return data;
}

export async function searchEvents(q: string, page: number = 1, limit: number = 10): Promise<any> {
  const { data } = await http.get('/events/search/query', { params: { q, page, limit } });
  return data;
}

export async function createEvent(payload: any): Promise<any> {
  try {
    const { data } = await http.post('/events', payload);
    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateEvent(id: number, payload: any): Promise<any> {
  try {
    const { data } = await http.put(`/events/${id}`, payload);
    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteEvent(id: number): Promise<any> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { data } = await http.delete(`/events/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
}

export async function uploadEventImage(eventId: number, file: File): Promise<{ imageUrl: string }> {
  try {
    const form = new FormData();
    form.append('file', file);
    const { data } = await http.post(`/events/${eventId}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
}

// Auth API
export async function login(email: string, password: string): Promise<any> {
  try {
    const { data } = await http.post('/auth/login', { email, password });
    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
}

export async function register(fullName: string, email: string, password: string): Promise<any> {
  try {
    const { data } = await http.post('/auth/register', { fullName, email, password });
    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
}

export async function logout(): Promise<void> {
  try {
    await http.post('/auth/logout');
  } catch (error: any) {
    // ignore server logout failure, still clear client token
  }
}

// Bookings API
export async function bookSeats(eventId: number, seats: number): Promise<any> {
  try {
    const { data } = await http.post('/bookings/new-booking', { eventId, seats });
    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserBookings(): Promise<any> {
  const { data } = await http.get('/bookings/all-bookings');
  return data;
}

export async function cancelBooking(bookingId: number): Promise<any> {
  try {
    const { data } = await http.delete(`/bookings/cancel-booking/${bookingId}`);
    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
}

export { http };

// Utilities
export function absoluteImageUrl(relativeOrAbsolute?: string): string | undefined {
  if (!relativeOrAbsolute) return undefined;
  if (relativeOrAbsolute.startsWith('http')) return relativeOrAbsolute;
  return `${API_BASE_URL}${relativeOrAbsolute}`;
}