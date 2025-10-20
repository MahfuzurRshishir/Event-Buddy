'use client';
import { useState } from 'react';
import { register } from '../utils/api';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!fullName || !email || !password) {
      setError('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await register(fullName, email, password);
      setSuccess('Account created. Please sign in.');
      setTimeout(() => (window.location.href = '/signin'), 1000);
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-violet-100 text-gray-800">
      <header className="flex items-center px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-700 ml-4">Event buddy.</h1>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="rounded-tl-4xl rounded-br-4xl w-full max-w-sm  shadow-2xl p-6 bg-white ">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign Up</h2>

          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-3 text-sm text-green-600">{success}</div>}


          <p className="mt-4 text-sm text-left text-gray-600">
            Already have an account?{' '}
            <a href="/signin" className="hover:text-blue-800 hover:underline">Sign in</a>
          </p>

          <p className="mt-4 text-sm text-left text-gray-600 pb-4 font-bold">Full Name</p>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full mb-3 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="mt-4 text-sm text-left text-gray-600 pb-4 font-bold">Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full mb-3 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="mt-4 text-sm text-left text-gray-600 pb-4 font-bold">Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full mb-4 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-white py-2 rounded-lg font-medium disabled:opacity-80 bg-gradient-to-b from-violet-300 to-blue-600 hover:from-violet-300 hover:to-blue-800 transition-colors"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>

        </div>
      </div>

    </div>
  );
}