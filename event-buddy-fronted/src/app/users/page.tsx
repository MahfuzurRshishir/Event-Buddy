'use client';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RequireAuth from '../components/RequireAuth';
import { getDisplayName } from '../utils/auth';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import { absoluteImageUrl, getUserBookings, cancelBooking } from '../utils/api';

type Booking = {
  id: number;
  event: {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
    imageUrl?: string;
  };
};

export default function UsersDashboard() {
  const [name, setName] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const n = getDisplayName();
    if (n) setName(n);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getUserBookings();
        setBookings((data?.bookings || data || []).map((b: any) => ({
          id: b.id || b.bookingId || b._id,
          event: b.event || b.Event || b,
        })));
      } catch (e: any) {
        setError(e?.message || 'Failed to load your registrations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onCancel = async (bookingId: number) => {
    const ok = window.confirm('Cancel this registration?');
    if (!ok) return;
    try {
      setBusyId(bookingId);
      await cancelBooking(Number(bookingId));
      setBookings((prev) => prev.filter((b) => String(b.id) !== String(bookingId)));
    } catch (e: any) {
      window.alert(e?.message || 'Failed to cancel registration');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RequireAuth>
    <div className="min-h-screen flex flex-col bg-violet-50 text-indigo-950">
      <Header />

      <main className="flex-grow max-w-[1500px] mx-auto px-6 py-8">
        <h1 className="text-4xl font-semibold mb-2">Dashboard</h1>
        {name && <p className="opacity-80 mb-8">Welcome back, {name}! Here you can manage your event registrations.</p>}

        <h2 className="text-lg font-semibold mb-4">My Registered Events</h2>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="mb-8">You have no registrations yet.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white border border-indigo-100 rounded-xl p-4 flex gap-4 items-center">
                <img src={absoluteImageUrl(b.event?.imageUrl) || '/event-image.jpg'} alt={b.event?.title} className="w-28 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="text-sm text-blue-600 mb-1">{new Date(b.event.eventDate).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase()}</div>
                  <a href={`/event/${b.event.id}`} className="font-semibold hover:underline">{b.event.title}</a>
                  <div className="text-sm mt-1 flex gap-4 text-indigo-900">
                    <span className="flex items-center gap-1"><FiCalendar /> {new Date(b.event.eventDate).toLocaleDateString(undefined, { weekday: 'long' })}</span>
                    <span className="flex items-center gap-1"><FiClock /> {b.event.startTime} - {b.event.endTime}</span>
                    <span className="flex items-center gap-1"><FiMapPin /> {b.event.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => onCancel(b.id)}
                  disabled={busyId === b.id}
                  className="text-white text-xs px-[10px] py-2 rounded-md bg-red-500 shadow-md hover:bg-red-800 disabled:opacity-60"
                >
                  {busyId === b.id ? 'Cancelling...' : 'Cancel registration'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/dashboard" className="inline-block text-white px-5 py-2 rounded shadow-lg bg-gradient-to-b from-violet-300 to-blue-600 hover:from-violet-300 hover:to-blue-800 transition-colors">Browse more events</a>
        </div>
      </main>

      <Footer />
    </div>
    </RequireAuth>
  );
}
