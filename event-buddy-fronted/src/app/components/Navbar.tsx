import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold">Evently</Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/signin" className="text-blue-600">Sign in</Link>
        <Link href="/signup" className="text-green-600">Sign up</Link>
      </div>
    </nav>
  );
}