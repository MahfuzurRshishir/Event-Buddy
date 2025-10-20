'use client';
import { useEffect, useState } from 'react';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { fetchEvents, deleteEvent } from '../utils/api';
import Footer from '../components/Footer';
import RequireAuth from '../components/RequireAuth';
import { getUser, logout } from '../utils/auth';

type EventRow = any;

const goToCreateEvent = () => {
  window.location.href = 'admin/create';
};

const goToEditEvent = (id?: number) => {
  window.location.href = `admin/edit/${id ?? ''}`;
};

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>('Admin');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchEvents();
        setEvents(data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const user = getUser();
    const name = user?.name || user?.fullName || user?.username || (user?.email ? String(user.email).split('@')[0] : null);
    if (name) setAdminName(name);
  }, []);

  const handleDelete = async (id: number | string) => {
    // ensure only admins attempt deletion on client-side
    const current = getUser();
    const role = current?.role || current?.Role || current?.ROLE;
    if (String(role).toUpperCase() !== 'ADMIN') {
      window.alert('You do not have permission to delete events.');
      return;
    }
    const ok = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
    if (!ok) return;
    try {
      const toDelete = events.find((e) => String(e.id) === String(id));
      const title = toDelete?.title || 'Event';
      // optimistic UI update
      const prevEvents = events;
      setEvents((prev) => prev.filter((e) => String(e.id) !== String(id)));
      // call API
      await deleteEvent(Number(id));
      // ensure server/client are in sync (best-effort)
      try {
        const fresh = await fetchEvents();
        setEvents(fresh || []);
      } catch (e) {
        // non-fatal
      }
      window.alert(`${title} deleted successfully.`);
    } catch (e: any) {
      // revert optimistic change
      try {
        const fresh = await fetchEvents();
        setEvents(fresh || []);
      } catch {
        // fallback: do nothing
      }
      window.alert(e?.message || 'Failed to delete the event.');
    }
  };

  return (
    <RequireAuth>
    <div className="min-h-screen flex flex-col bg-violet-50 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <button
          type="button"
          onClick={() => (window.location.href = '/admin')}
          className="text-2xl font-bold text-indigo-950 ml-4 hover:underline"
          aria-label="Go to admin home"
        >
          Event buddy.
        </button>
        <div className="flex items-center gap-4">
          <span className="text-indigo-950">Hello, {adminName}</span>
          <button
            onClick={() => {
              const ok = window.confirm('Are you sure you want to logout?');
              if (ok) logout();
            }}
            className="text-white px-4 py-1 rounded bg-gradient-to-b from-violet-300 to-blue-600 hover:from-violet-300 hover:to-blue-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full px-6 sm:px-10 lg:px-14 py-6">
        <div className="ml-4">
          <h2 className="text-5xl  text-indigo-950 leading-tight">Admin Dashboard</h2>
          <p className="text-2xl text-indigo-950 opacity-60 mt-6 mb-10">Manage events, view registrations, and monitor your platform.</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-indigo-950">Events Management</h3>
          <button onClick={goToCreateEvent} className="text-white px-4 py-2 rounded bg-gradient-to-b from-violet-300 to-blue-600 hover:from-violet-300 hover:to-blue-800 transition-colors">
            Create Event
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm text-indigo-950">
            <thead className="bg-gray-100 text-indigo-950">
              <tr>
                <th className="p-3 text-left border border-gray-200">Title</th>
                <th className="p-3 text-left border border-gray-200">Date</th>
                <th className="p-3 text-left border border-gray-200">Location</th>
                <th className="p-3 text-left border border-gray-200">Registrations</th>
                <th className="p-3 text-left border border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="p-4 text-red-600">{error}</td></tr>
              ) : (
                <>
                  {events.map((event) => (
                    <tr key={event.id} className="border-t border-gray-200 first:border-t-0 hover:bg-gray-50">
                      <td className="p-3 font-semibold">{event.title}</td>
                      <td className="p-3 font-semibold">{new Date(event.eventDate).toLocaleDateString()}</td>
                      <td className="p-3 font-semibold">{event.location}</td>
                      <td className="p-3 font-semibold">
                        {(event.bookedSeats || 0)} / {event.capacity}
                      </td>
                      <td className="p-3 flex gap-3 text-indigo-950">
                        <button className="hover:text-indigo-900 flex items-center gap-1" onClick={() => (window.location.href = `/event/${event.id}`)}>
                          <FiEye size={18} />
                        </button>
                        <button onClick={() => goToEditEvent(event.id)} className="hover:text-indigo-900 flex items-center gap-1">
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No events available.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
    </RequireAuth>
  );
}