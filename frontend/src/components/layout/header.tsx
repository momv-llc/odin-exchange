import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition">
          ODIN Exchange
        </Link>
        <nav className="flex gap-6">
          <Link href="/" className="text-gray-300 hover:text-white transition">
            Exchange
          </Link>
          <Link href="/track" className="text-gray-300 hover:text-white transition">
            Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
}
