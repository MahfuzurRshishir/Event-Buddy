'use client';
import { useEffect, useState } from 'react';
import { fetchPaginatedEvents, absoluteImageUrl, searchEvents } from '../utils/api';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getUser } from '../utils/auth';
import EventCard from '../components/EventCard';

export default function Dashboard() {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [previous, setPrevious] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upPage, setUpPage] = useState(1);
  const [prevPage, setPrevPage] = useState(1);
  const UP_LIMIT = 6;
  const PREV_LIMIT = 3;
  const [upHasNext, setUpHasNext] = useState(true);
  const [prevHasNext, setPrevHasNext] = useState(true);
  const [query, setQuery] = useState('');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (query && query.trim().length > 0) {
          const s = await searchEvents(query, upPage, UP_LIMIT);
          const upArr = s?.events || s?.data || s || [];
          setUpcoming(upArr);
          setUpHasNext((upArr?.length || 0) === UP_LIMIT);
          setPrevious([]);
          setPrevHasNext(false);
        } else {
          const [u, p] = await Promise.all([
            fetchPaginatedEvents(upPage, UP_LIMIT, 'upcoming'),
            fetchPaginatedEvents(prevPage, PREV_LIMIT, 'previous'),
          ]);
          const upArr = u?.events || u?.data || [];
          const prevArr = p?.events || p?.data || [];
          setUpcoming(upArr);
          setPrevious(prevArr);
          setUpHasNext((upArr?.length || 0) === UP_LIMIT);
          setPrevHasNext((prevArr?.length || 0) === PREV_LIMIT);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [upPage, prevPage, query]);

  useEffect(() => {
    // pick up query from URL on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('query') || '';
      if (q && q !== query) setQuery(q);
    }
    const u = getUser();
    if (u) {
      const n =
        u.name ||
        u.fullName ||
        u.username ||
        (u.user && (u.user.fullName || u.user.name || u.user.username)) ||
        ((u.firstName || u.firstname) && (u.lastName || u.lastname)
          ? `${u.firstName || u.firstname} ${u.lastName || u.lastname}`
          : null) ||
        (u.email ? String(u.email).split('@')[0] : null);
       // window.alert(n);
      setUserName(n || null);
    } else {
      setUserName(null);
    }
  }, []);

  const Pagination = ({ page, setPage, hasNext }: { page: number; setPage: (n: number) => void; hasNext: boolean }) => {
    const pages = [page - 1, page, ...(hasNext ? [page + 1] : [])].filter((n) => n > 0);
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button onClick={() => setPage(Math.max(1, page - 1))} className="h-8 w-8 flex items-center justify-center rounded border">‹</button>
        {pages.map((n) => (
          <button
            key={n}
            onClick={() => {
              if (n > page && !hasNext) return; // block forward when last page
              setPage(n);
            }}
            disabled={n > page && !hasNext}
            className={`h-8 w-8 flex items-center justify-center rounded border ${n === page ? 'bg-blue-600 text-white border-blue-600' : ''} ${n > page && !hasNext ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {n}
          </button>
        ))}
        <button onClick={() => hasNext && setPage(page + 1)} disabled={!hasNext} className="h-8 w-8 flex items-center justify-center rounded border disabled:opacity-50">›</button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-violet-50 text-gray-800">
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-b from-white via-blue-50 to-blue-200">
          <div className="max-w-[1200px] mx-auto px-6 py-12 text-center">
            {userName && (
              <p className="text-indigo-950 font-semibold mb-3">Welcome, {userName}</p>
            )}
            <h2 className="text-6xl font-semibold leading-tight tracking-wide mb-2">
              Discover
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Amazing</span> Events
            </h2>
            <p className="text-gray-700 mb-1">Find and book events that match your interests. From tech conferences to music festivals,</p>
            <p className="text-gray-700 mb-6">we've got you covered.</p>
            <p className="text-gray-800 text-lg mt-9 mb-6 font-semibold">Find your Next event</p>
            <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events"
                className="w-full sm:w-96 p-3 border border-gray-200 bg-gray-50 text-indigo-950 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => (window.location.href = `/dashboard?query=${encodeURIComponent(query)}`)} className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
                Search Events
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow max-w-[1200px] mx-auto p-6 bg-violet-50">
        {/* Upcoming */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-blue-600">Upcoming Events</h3>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((ev) => (
                  <EventCard
                    key={ev.id}
                    title={ev.title}
                    date={ev.eventDate}
                    location={ev.location}
                    seatsLeft={Math.max(0, ev.capacity - (ev.bookedSeats || 0))}
                    totalSeats={ev.capacity}
                    time={`${ev.startTime}${ev.endTime ? ` - ${ev.endTime}` : ''}`}
                    imageUrl={absoluteImageUrl(ev.imageUrl) || '/event-image.jpg'}
                    tags={(ev.tags || ['Conference']).slice(0,3)}
                    description={ev.description}
                    onClick={() => (window.location.href = `/event/${ev.id}`)}
                  />
                ))}
              </div>
              <Pagination page={upPage} setPage={setUpPage} hasNext={upHasNext} />
            </>
          )}
        </section>

        {/* Previous */}
        {(!query || query.trim().length === 0) && previous.length > 0 && (
          <section>
            <h3 className="text-2xl font-semibold mb-6 text-blue-600">Previous Events</h3>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {previous.map((ev) => (
                    <EventCard
                      key={ev.id}
                      title={ev.title}
                      date={ev.eventDate}
                      location={ev.location}
                      seatsLeft={Math.max(0, ev.capacity - (ev.bookedSeats || 0))}
                      totalSeats={ev.capacity}
                      time={`${ev.startTime}${ev.endTime ? ` - ${ev.endTime}` : ''}`}
                      imageUrl={absoluteImageUrl(ev.imageUrl) || '/event-image.jpg'}
                      tags={(ev.tags || ['Conference']).slice(0,3)}
                      description={ev.description}
                      onClick={() => (window.location.href = `/event/${ev.id}`)}
                    />
                  ))}
                </div>
                <Pagination page={prevPage} setPage={setPrevPage} hasNext={prevHasNext} />
              </>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>

  );
}
