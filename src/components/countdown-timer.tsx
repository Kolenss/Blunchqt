'use client';

import { useEffect, useState } from 'react';

const TARGET = new Date('2026-08-19T00:00:00');

export default function CountdownTimer() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = TARGET.getTime() - Date.now();
      if (diff > 0) {
        setT({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const tiles = [
    { value: t.days, label: 'Days' },
    { value: t.hours, label: 'Hours' },
    { value: t.minutes, label: 'Mins' },
    { value: t.seconds, label: 'Secs' },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
      style={{ borderColor: 'rgba(255,255,255,0.5)', background: 'linear-gradient(110deg, #934652 0%, #b05a68 55%, #5a6235 140%)' }}
    >
      {/* soft glow accents */}
      <div className="absolute -top-10 -left-8 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,217,220,0.18)' }} />
      <div className="absolute -bottom-12 right-10 w-44 h-44 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(220,229,171,0.15)' }} />

      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#dce5ab' }}>Board Exam</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          Countdown to August 19
        </h2>
        <p className="text-sm text-white/70 mt-1">Every day in the garden counts.</p>
      </div>

      <div className="relative z-10 grid grid-cols-4 gap-2 sm:gap-3">
        {tiles.map(tile => (
          <div
            key={tile.label}
            className="flex flex-col items-center rounded-2xl px-3 sm:px-4 py-3 min-w-[64px] sm:min-w-[76px] backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums leading-none" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              {String(tile.value).padStart(2, '0')}
            </span>
            <span className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: '#ffd9dc' }}>
              {tile.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
