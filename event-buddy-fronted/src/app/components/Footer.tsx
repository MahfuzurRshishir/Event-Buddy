export default function Footer() {
  return (
    <footer className=" mt-8 py-4 px-6 text-sm text-gray-500 bg-blue-100">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-center gap-2">
        <span className="font-bold text-2xl text-purple-1000 justify-self-start">Event buddy.</span>
        <div className="flex gap-4 justify-self-end">
          <a href="/dashboard" className="text-purple-1000 font-bold hover:underline">Home</a>
          <a href="/signin" className="text-purple-1000 font-bold hover:underline">Sign In</a>
          <a href="/signup" className="text-purple-1000 font-bold hover:underline">Sign Up</a>
          <a href="#" className="text-purple-1000 font-bold hover:underline">Privacy Policy</a>
        </div>
        <div className="md:col-span-2 my-6 border-t"></div>
        <span className="md:col-span-2 text-center">© 2025 Event buddy. All rights reserved.</span>
      </div>
    </footer>
  );
}

