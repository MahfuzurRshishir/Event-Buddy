'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiUsers } from 'react-icons/fi';
import { bookSeats, fetchEvent, absoluteImageUrl } from '../../utils/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { isAuthenticated } from '../../utils/auth';

export default function EventDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchEvent(String(id));
        setEvent(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleSeatSelect = (seat: number) => setSelectedSeats(seat);

  const handleBook = async () => {
    setMessage(null);
    try {
      setBookingLoading(true);
      // If not logged in, redirect to signin and come back to this event page
      if (!isAuthenticated()) {
        const next = `/event/${id}`;
        window.location.href = `/signin?next=${encodeURIComponent(next)}`;
        return;
      }
      const res = await bookSeats(Number(id), selectedSeats);
      setMessage(res?.message || 'Booked successfully');
      // Optimistically update local event counts so UI reflects new booking immediately
      setEvent((prev: any) => {
        if (!prev) return prev;
        const currentBooked = Number(prev.bookedSeats || 0);
        const capacity = Number(prev.capacity || 0);
        const newBooked = Math.min(capacity, currentBooked + selectedSeats);
        return { ...prev, bookedSeats: newBooked };
      });
    } catch (e: any) {
      setMessage(e?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!event) return <div className="p-6">Event not found</div>;

  const banner = absoluteImageUrl(event.imageUrl) || '/event-banner.jpg';

  return (
    <div className="min-h-screen bg-violet-50 text-indigo-950">
      {/* Header */}
      <Header />

      {/* Back Link */}
      <div className="max-w-[1200px] mx-auto px-6 mt-6">
        <button onClick={() => router.back()} className="flex items-center text-indigo-900 hover:underline mb-4 font-bold">
          <FiArrowLeft className="mr-1" /> Back to event
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Banner */}
        <img src={banner} alt="Event Banner" className="w-full h-80 object-cover rounded-xl shadow mb-6" />

        {/* Event Info */}
        <div className="flex gap-2 mb-2 text-xs">
          {(event.tags || []).map((t: string) => (
            <span key={t} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">{t}</span>
          ))}
        </div>
        <h1 className="text-3xl font-bold mb-4 text-indigo-950">{event.title}</h1>

        <div className="mb-6 border border-indigo-100 rounded-xl bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-indigo-100 text-sm">
            <div className="flex items-center gap-2 p-4">
              <FiCalendar className="text-blue-600" /> {new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 p-4">
              <FiClock className="text-blue-600" /> {event.startTime} - {event.endTime}
            </div>
            <div className="flex items-center gap-2 p-4">
              <FiMapPin className="text-blue-600" /> {event.location}
            </div>
          </div>
        </div>

        {/* Seat Selection */}
        <div className="mb-6 border border-indigo-100 rounded-xl p-5 bg-white">
          <h2 className="text-lg font-semibold mb-4">Select Number of Seats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((seat) => (
              <button
                key={seat}
                onClick={() => handleSeatSelect(seat)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-4 border rounded-lg transition-all ${selectedSeats === seat
                    ? 'border-violet-500 ring-2 ring-violet-200 text-indigo-950 bg-indigo-50'
                    : 'border-indigo-200 bg-white text-indigo-900 hover:border-indigo-300'
                  }`}
              >
                <FiUsers className="text-blue-600" />
                <div className="text-base font-semibold">{seat}</div>
                <div className="text-xs">Seat{seat > 1 ? 's' : ''}</div>
              </button>
            ))}
          </div>
          <button onClick={handleBook} disabled={bookingLoading} className="mt-5 text-white px-6 py-2 rounded bg-gradient-to-b from-violet-300 to-blue-600 hover:from-violet-300 hover:to-blue-800 transition-colors disabled:opacity-60">
            {bookingLoading ? 'Booking...' : `Book ${selectedSeats} Seat${selectedSeats > 1 ? 's' : ''}`}
          </button>
          {message && <div className="mt-2 text-sm text-indigo-900">{message}</div>}
        </div>

        {/* About */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">About this event</h2>
          <p className="leading-relaxed">{event.description}</p>
        </div>

        {/* Availability */}
        <div className="mt-8 text-sm flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded pb-8">
          <FiUsers className="text-blue-600" />
          <span>{Math.max(0, event.capacity - (event.bookedSeats || 0))} Spots Left ({event.bookedSeats || 0} registered)</span>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
