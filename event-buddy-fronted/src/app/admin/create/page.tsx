'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createEvent, uploadEventImage } from '../../utils/api';
import { FiUpload } from 'react-icons/fi';
import RequireAuth from '../../components/RequireAuth';

export default function CreateEvent() {
  const router = useRouter();
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    location: '',
    price: 0,
    capacity: 0,
    tags: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-violet-50 text-indigo-950 flex items-start justify-center py-10 px-4">
        <div className="relative max-w-3xl w-full mx-auto p-6 bg-white rounded shadow">
          <button
            onClick={() => router.push('/admin')}
            className="absolute top-3 right-2 text-xl text-gray-500 hover:text-red-600 font-bold"
            aria-label="Close"
          >
            ✕
          </button>
          <h1 className="text-2xl font-bold mb-4 text-indigo-950">Create New Event</h1>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              try {
                setLoading(true);
                const payload = {
                  title: form.title,
                  description: form.description,
                  eventDate: form.eventDate,
                  startTime: form.startTime,
                  endTime: form.endTime,
                  duration: form.duration,
                  location: form.location,
                  price: Number(form.price) || 0,
                  capacity: Number(form.capacity) || 0,
                  tags: form.tags?.split(',').map((t: string) => t.trim()).filter(Boolean),
                };
                const created = await createEvent(payload);
                if (file && created?.id) {
                  await uploadEventImage(created.id, file);
                }
                router.push('/admin');
              } catch (err: any) {
                setError(err?.message || 'Failed to create event');
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="block text-indigo-950 font-semibold mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} type="text" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-indigo-950 font-semibold mb-1">Date</label>
                <input value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} type="date" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-indigo-950 font-semibold mb-1">Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} type="text" placeholder="Start e.g. 09:00 AM" className="w-full border border-gray-300 rounded px-3 py-2" />
                  <input value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} type="text" placeholder="End e.g. 11:00 AM" className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-indigo-950 font-semibold mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" rows={4}></textarea>
            </div>

            <div>
              <label className="block text-indigo-950 font-semibold mb-1">Event Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} type="text" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-indigo-950 font-semibold mb-1">Capacity</label>
                <input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} type="number" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-indigo-950 font-semibold mb-1">Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} type="text" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>

            <div>
              <label className="block text-indigo-950 font-semibold mb-1">Duration</label>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} type="text" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-indigo-950 font-semibold mb-1">Price</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div> 
              <label className="block text-indigo-950 font-semibold mb-1">Image</label>
              <div className="flex items-stretch gap-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) setFile(f);
                  }}
                  className={`flex-1  rounded-lg p-6 text-sm ${dragActive ? 'border-violet-500 bg-violet-50' : 'border-violet-300 bg-violet-50/40'}`}
                >
                  <div className="flex items-center gap-3 text-indigo-950">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <FiUpload className="text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-indigo-950 font-semibold">
                        Drag or <button type="button" className="text-indigo-700 underline" onClick={() => fileInputRef.current?.click()}>upload</button> the picture here
                      </div>
                      <div className="text-indigo-950 text-xs mt-1 font-semibold">Max 5MB | JPG, PNG</div>
                      {file && (
                        <div className="text-xs text-indigo-950 mt-2 font-semibold">Selected: <span className="font-semibold">{file.name}</span></div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="self-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Browse
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex gap-4 mt-6 justify-end">
                <button
                  type="button"
                  className="bg-white text-gray-800 px-4 py-2 rounded  border-gray-300 hover:bg-gray-50"
                  onClick={() => router.push('/admin')}
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="text-white px-6 py-2 rounded bg-gradient-to-b from-violet-300 to-blue-600 hover:from-violet-300 hover:to-blue-800 transition-colors disabled:opacity-60 w-36"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
              {error && (
                <div className="text-red-600 text-sm mt-2">{error}</div>
              )}
            </form>
          </div>
        </div>
      </RequireAuth>
    );
}