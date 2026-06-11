'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SubItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href: string;
  active?: boolean;
  subItems?: SubItem[];
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { name: 'Summary', href: '/', active: true },
    { name: 'Tracker', href: '/tracker' },
    { name: 'TOS Summary', href: '/tos' },
    { name: 'Score Tracker', href: '/scores' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'DSM-5', href: '/dsm5' },
    { name: 'PRC Requirements', href: '/prc' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#8A3D58] text-white rounded-md hover:bg-[#6d2f45] transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 transition-all"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-[#8A3D58] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
