'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchEvent, updateEvent, uploadEventImage } from '../../../utils/api';
import RequireAuth from '../../../components/RequireAuth';
import { FiUpload } from 'react-icons/fi';

export default function CreateEvent() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    location: '',
    price: '',
    capacity: '',
    tags: '',
  });
  const [original, setOriginal] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await fetchEvent(String(id));
        setOriginal(data);
        setForm({
          title: data?.title ?? '',
          description: data?.description ?? '',
          eventDate: data?.eventDate ? String(data.eventDate).slice(0, 10) : '',
          startTime: data?.startTime ?? '',
          endTime: data?.endTime ?? '',
          duration: data?.duration ?? '',
          location: data?.location ?? '',
          price: data?.price ?? '',
          capacity: data?.capacity ?? '',
          tags: Array.isArray(data?.tags) ? data.tags.join(', ') : (data?.tags ?? ''),
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
      <h1 className="text-2xl font-bold mb-4 text-indigo-950">Edit Event</h1>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            if (!id) throw new Error('Missing event id');
            setLoading(true);
            //  partial payload 
            const payload: any = {};
            const addIfChanged = (key: string, transform?: (v: any) => any) => {
              const curr = (form as any)[key];
              const orig = original ? (original as any)[key] : undefined;
              const val = transform ? transform(curr) : curr;
              // include if different from original or original is undefined and current not empty
              const isEmpty = val === '' || val === null || typeof val === 'undefined';
              const changed = JSON.stringify(val) !== JSON.stringify(orig);
              if (changed && !isEmpty) payload[key] = val;
            };
            addIfChanged('title');
            addIfChanged('description');
            addIfChanged('eventDate');
            addIfChanged('startTime');
            addIfChanged('endTime');
            addIfChanged('duration');
            addIfChanged('location');
            addIfChanged('price', (v) => (v === '' ? '' : Number(v)));
            addIfChanged('capacity', (v) => (v === '' ? '' : Number(v)));
            addIfChanged('tags', (v) =>
              String(v)
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
            );

            await updateEvent(Number(id), payload);
            if (file) {
              await uploadEventImage(Number(id), file);
            }
            router.push('/admin');
          } catch (err: any) {
            window.alert(err?.message || 'Failed to update event');
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <label className="block text-indigo-950 font-semibold mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-indigo-950 font-semibold mb-1">Date</label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-indigo-950 font-semibold mb-1">Time</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Start e.g. 09:00 AM"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="End e.g. 11:00 AM"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-indigo-950 font-semibold mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={4}
          ></textarea>
        </div>

        <div>
          <label className="block text-indigo-950 font-semibold mb-1">Event Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-indigo-950 font-semibold mb-1">Capacity</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-indigo-950 font-semibold mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
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
            <button type="button" className="bg-white text-gray-800 px-4 py-2 rounded  border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="text-white px-6 py-2 rounded bg-gradient-to-b from-violet-300 to-blue-600 hover:from-violet-300 hover:to-blue-800 transition-colors disabled:opacity-60 w-36">
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  </RequireAuth>
);
}