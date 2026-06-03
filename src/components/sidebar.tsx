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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    { name: 'Summary', href: '/', active: true },
    { 
      name: 'Tracker', 
      href: '/tracker',
      subItems: [
        { name: 'Abnormal Psychology', href: '/tracker/abnormal' },
        { name: 'Developmental Psychology', href: '/tracker/developmental' },
        { name: 'Psychology Assessment', href: '/tracker/assessment' },
        { name: 'Industrial Psychology', href: '/tracker/industrial' },
      ]
    },
    { 
      name: 'TOS Summary', 
      href: '/tos',
      subItems: [
        { name: 'Abnormal Psychology', href: '/tos/abnormal' },
        { name: 'Developmental Psychology', href: '/tos/developmental' },
        { name: 'Psychological Assessment', href: '/tos/assessment' },
        { name: 'Industrial Psychology', href: '/tos/industrial' },
      ]
    },
    { 
      name: 'Score Tracker', 
      href: '/scores',
      subItems: [
        { name: 'Abnormal Psychology', href: '/scores/abnormal' },
        { name: 'Developmental Psychology', href: '/scores/developmental' },
        { name: 'Psychological Assessment', href: '/scores/assessment' },
        { name: 'Industrial Psychology', href: '/scores/industrial' },
      ]
    },
    { name: 'DSM-5', href: '/dsm5' },
    { name: 'Learning Materials', href: '/materials' },
    { name: 'Study Strategy', href: '/strategies' },
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
              <div key={item.name}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => {
                        setExpandedItems(prev => 
                          prev.includes(item.name) 
                            ? prev.filter(i => i !== item.name)
                            : [...prev, item.name]
                        );
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        item.active
                          ? 'bg-[#8A3D58] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{item.name}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedItems.includes(item.name) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedItems.includes(item.name) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
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
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
