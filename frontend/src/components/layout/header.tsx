'use client';

import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const { pathname } = useLocation();

  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="text-xl font-bold text-white">
              ODIN<span className="text-blue-500">Exchange</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                pathname === '/'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Exchange
            </Link>
            <Link
              to="/track"
              className={`text-sm font-medium transition ${
                pathname.startsWith('/track')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Track Order
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
