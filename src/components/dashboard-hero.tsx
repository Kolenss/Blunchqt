'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchProgress, type ProgressData } from '@/lib/api';
import { getCoinBalance } from '@/lib/coins';
import { shopItems, type ShopItem } from '@/lib/shop-catalog';
import CountdownTimer from './countdown-timer';

// Mirrors the subject keys/labels used by the Progress tracker, plus the
// tracker page's dropdown key so "Continue Reading" can pre-select a subject.
const SUBJECTS = [
  { key: 'ABNORMAL PSYCHOLOGY', label: 'ABPSYCH', slug: 'abnormal', accent: '#934652' },
  { key: 'DEVELOPMENTAL PSYCHOLOGY', label: 'DEV PSY', slug: 'developmental', accent: '#5a6235' },
  { key: 'PSYCHOLOGICAL ASSESSMENT', label: 'PSY CAS', slug: 'assessment', accent: '#c28b88' },
  { key: 'INDUSTRIAL ORGANIZATIONAL PSYCHOLOGY', label: 'I/O PSYCH', slug: 'industrial', accent: '#adb680' },
];

const PAPER = "url('/figma/paper-texture.png')";

const INITIAL_TASKS = [
  { id: 1, label: 'Complete Abnormal Psych: Chapter 4', done: true },
  { id: 2, label: 'Review Developmental Milestones Flashcards', done: false },
  { id: 3, label: 'Claim Daily Login Stickers', done: false },
];

function SproutIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" />
      <path d="M12 12C12 8 9 6 4 6c0 4 3 6 8 6Z" />
      <path d="M12 12c0-3 2-5 6-5 0 3-2 5-6 5Z" />
    </svg>
  );
}

export default function DashboardHero() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [coins, setCoins] = useState(0);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  // Two random shop items shown as "Sweet Rewards". Picked on the client after
  // mount so the server/client render match (avoids a hydration mismatch).
  const [rewards, setRewards] = useState<ShopItem[]>([]);

  useEffect(() => {
    fetchProgress().then(setData);
    getCoinBalance().then(setCoins);
    setRewards([...shopItems].sort(() => Math.random() - 0.5).slice(0, 2));
    const onCoins = (e: Event) => setCoins((e as CustomEvent<number>).detail);
    window.addEventListener('blunch:coins-updated', onCoins);
    return () => window.removeEventListener('blunch:coins-updated', onCoins);
  }, []);

  // Same formula as the Progress tracker: completed / total * 100.
  const totalAll = data ? SUBJECTS.reduce((sum, s) => sum + (data[s.key]?.total ?? 0), 0) : 0;
  const completedAll = data ? SUBJECTS.reduce((sum, s) => sum + (data[s.key]?.completed ?? 0), 0) : 0;
  const overallPct = totalAll > 0 ? (completedAll / totalAll) * 100 : 0;

  const level = Math.floor(coins / 50) + 1;

  const openShop = () => window.dispatchEvent(new CustomEvent('blunch:open-shop'));
  const openHowToEarn = () => window.dispatchEvent(new CustomEvent('blunch:open-how-to-earn'));

  // Donut geometry for the Total Mastery card.
  const R = 70;
  const C = 2 * Math.PI * R;
  const dash = C - (overallPct / 100) * C;

  return (
    <div
      className="w-full"
      style={{
        fontFamily: 'var(--font-dm-sans), sans-serif',
        backgroundColor: '#fff7fc',
        backgroundImage: PAPER,
        backgroundSize: '410px 410px',
        backgroundPosition: 'top left',
      }}
    >
      {/* ── Top Navigation ──────────────────────────── */}
      <header
        className="sticky top-0 z-30 w-full flex items-center justify-between px-4 md:px-6 py-3 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: '#fff7fc' }}
      >
        <p
          className="pl-12 lg:pl-14 text-xl md:text-2xl italic tracking-tight"
          style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}
        >
          BlunchQT
        </p>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={openHowToEarn}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors hover:brightness-95"
            style={{ backgroundColor: '#dce5ab' }}
          >
            <Image src="/coin.png" alt="points" width={14} height={14} className="w-3.5 h-3.5" />
            <span className="text-xs font-medium tracking-wide" style={{ color: '#5e6738' }}>{coins} pts</span>
          </button>
          <div className="flex items-center px-3 py-1 rounded-full" style={{ backgroundColor: '#c28b88' }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4c2624' }}>Lv. {level}</span>
          </div>
          <div className="rounded-full overflow-hidden flex-shrink-0 w-10 h-10 border-2 shadow-sm" style={{ borderColor: '#d97f8b', backgroundColor: '#f7eaf8' }}>
            <Image src="/blunch.png" alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-10 flex flex-col gap-10 md:gap-12">

        {/* ── Countdown (top) ─────────────────────────── */}
        <CountdownTimer />

        {/* ── Hero: Scrapbook Portrait + Daily Reflection ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Polaroid */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="absolute -top-2 left-2 w-12 h-14 z-10 pointer-events-none">
              <Image src="/figma/floral-spray.svg" alt="" width={48} height={56} className="w-full h-full" />
            </div>
            <div className="-rotate-2">
              <div
                className="flex flex-col gap-4 p-4 rounded-[2px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.12),0px_8px_10px_-6px_rgba(0,0,0,0.1)] w-[290px] sm:w-[340px]"
                style={{ backgroundColor: '#e0cfc3' }}
              >
                <div className="relative border-[12px] border-white p-3">
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src="/blunch.png"
                      alt="Blunch P. Lobetania"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Heart ribbon accent */}
                  <div
                    className="absolute -top-5 -right-5 w-12 h-[72px] flex items-start justify-center pt-3 shadow-md"
                    style={{
                      backgroundColor: '#d97f8b',
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M12 21s-7-4.35-9.5-8.5C.5 9 2 5.5 5.5 5.5c2 0 3.2 1.2 3.8 2.2.6-1 1.8-2.2 3.8-2.2 3.5 0 5 3.5 3 7C19 16.65 12 21 12 21z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="italic text-lg" style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}>
                    Blunch P. Lobetania
                  </span>
                  <span className="italic text-sm opacity-70" style={{ color: '#934652' }}>Nov 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Greeting + Daily Reflection */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="-rotate-1 self-start px-4 py-1" style={{ backgroundColor: 'rgba(173,182,128,0.7)' }}>
              <span className="font-bold text-base" style={{ color: '#5e6738' }}>Welcome Back, Future RPm!</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}
            >
              Your educational garden is{' '}
              <span className="italic font-normal" style={{ color: '#5a6235' }}>blossoming</span> today.
            </h1>

            {/* Daily Reflection card */}
            <div
              className="relative rounded-lg border p-6 pt-7 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
              style={{ borderColor: 'rgba(217,193,194,0.3)', backgroundColor: '#ffffff', backgroundImage: PAPER, backgroundSize: '410px 410px', backgroundPosition: 'top left' }}
            >
              {/* Pin (correct 12:20 aspect so it isn't squashed) */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-[18px] h-[30px] drop-shadow-sm">
                <Image src="/figma/pin.svg" alt="" width={18} height={30} className="w-full h-full" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}>
                Daily Reflection
              </h2>
              <ul className="flex flex-col gap-3">
                {tasks.map(task => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                  >
                    <span
                      className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ borderColor: '#d97f8b', backgroundColor: task.done ? '#d97f8b' : 'transparent' }}
                    >
                      {task.done && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-sm md:text-base transition-opacity"
                      style={{ color: '#534344', opacity: task.done ? 0.6 : 1, textDecoration: task.done ? 'line-through' : 'none' }}
                    >
                      {task.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Mastery Overview (replaces the Progress component) ── */}
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}>
                Mastery Overview
              </h2>
              <p className="text-sm" style={{ color: '#534344' }}>Your overall academic growth</p>
            </div>
            <Link href="/tracker" className="flex items-center gap-1 text-sm font-bold whitespace-nowrap" style={{ color: '#934652' }}>
              View Detailed Stats
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Mastery — donut + totals (transferred from Progress) */}
            <div
              className="relative overflow-hidden rounded-3xl border flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: 'rgba(224,207,195,0.35)', borderColor: 'rgba(255,255,255,0.6)' }}
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(90,98,53,0.06)' }} />
              <div className="relative w-44 h-44">
                <svg className="-rotate-90 w-full h-full" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r={R} fill="none" stroke="#ece0d6" strokeWidth="18" />
                  <circle
                    cx="90" cy="90" r={R} fill="none" stroke="#5a6235" strokeWidth="18"
                    strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dash}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold leading-none" style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}>
                    {overallPct.toFixed(0)}%
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] mt-1" style={{ color: '#534344' }}>Total Mastery</span>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold" style={{ color: '#201923' }}>
                {completedAll} / {totalAll} topics complete
              </p>
              <p className="mt-1 text-sm italic" style={{ color: '#534344' }}>Small steps lead to grand journeys.</p>
            </div>

            {/* Subject cards — all subjects, with transferred detail numbers */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {SUBJECTS.map(s => {
                const d = data?.[s.key];
                const total = d?.total ?? 0;
                const completed = d?.completed ?? 0;
                const remaining = d?.remaining ?? Math.max(total - completed, 0);
                const pct = total > 0 ? (completed / total) * 100 : 0;
                return (
                  <Link
                    href={`/tracker?subject=${s.slug}`}
                    key={s.key}
                    className="rounded-2xl border p-5 flex flex-col gap-3 transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: '#ffffff', borderColor: 'rgba(217,193,194,0.3)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f7eaf8' }}>
                          <SproutIcon color={s.accent} />
                        </span>
                        <h4 className="text-base font-bold" style={{ color: '#201923' }}>{s.label}</h4>
                      </div>
                      <span className="text-lg font-bold" style={{ color: s.accent }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f2e4f3' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: s.accent }} />
                    </div>
                    {/* Detail numbers carried over from the old Progress cards */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { k: 'Done', v: completed },
                        { k: 'Left', v: remaining },
                        { k: 'Total', v: total },
                      ].map(stat => (
                        <div key={stat.k} className="rounded-lg py-1.5 text-center" style={{ backgroundColor: '#fff7fc' }}>
                          <p className="text-sm font-bold" style={{ color: '#934652' }}>{stat.v}</p>
                          <p className="text-[10px] uppercase tracking-wide" style={{ color: '#867274' }}>{stat.k}</p>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Sweet Rewards + Current Curriculum ──────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sweet Rewards — two random shop items */}
          <div
            className="rounded-[32px] border p-8 flex flex-col gap-8"
            style={{ borderColor: 'rgba(217,193,194,0.2)', backgroundColor: 'rgba(242,228,243,0.4)', backgroundImage: PAPER, backgroundSize: '410px 410px', backgroundPosition: 'top left' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}>
                  Sweet Rewards
                </h2>
                <button onClick={openHowToEarn} className="text-xs font-medium tracking-wide hover:underline" style={{ color: '#534344' }}>
                  How to earn points →
                </button>
              </div>
              <button onClick={openShop} className="flex items-center gap-2 bg-white border rounded-full px-4 py-2 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:brightness-95 transition" style={{ borderColor: 'rgba(217,127,139,0.2)' }}>
                <Image src="/coin.png" alt="points" width={18} height={18} className="w-4.5 h-4.5" />
                <span className="font-bold" style={{ color: '#934652' }}>{coins}</span>
              </button>
            </div>
            <div className="flex gap-4">
              {rewards.length === 0 && [0, 1].map(i => (
                <div key={i} className="flex-1 bg-white border rounded-2xl p-4 flex flex-col items-center animate-pulse" style={{ borderColor: '#fce7f3' }}>
                  <div className="w-full rounded-xl py-6 mb-3" style={{ backgroundColor: '#f7eaf8' }} />
                  <div className="h-3 w-20 rounded mb-2" style={{ backgroundColor: '#f2e4f3' }} />
                  <div className="h-5 w-12 rounded-full" style={{ backgroundColor: '#f2e4f3' }} />
                </div>
              ))}
              {rewards.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={openShop}
                  className="flex-1 bg-white border rounded-2xl p-4 flex flex-col items-center text-center drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-[1.03] active:scale-95 cursor-pointer"
                  style={{ borderColor: '#fce7f3' }}
                >
                  <div className="w-full rounded-xl flex items-center justify-center py-6 mb-3" style={{ backgroundColor: i % 2 === 0 ? 'rgba(220,229,171,0.3)' : 'rgba(217,127,139,0.18)' }}>
                    <Image src={r.image} alt={r.name} width={48} height={48} className="w-12 h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/shop/placeholder.svg' }} />
                  </div>
                  <p className="text-sm font-bold leading-tight min-h-[2.5em] flex items-center" style={{ color: '#201923' }}>{r.name}</p>
                  <span className="mt-1 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold" style={{ backgroundColor: '#d97f8b', color: '#5a1a27' }}>
                    <Image src="/coin.png" alt="" width={12} height={12} className="w-3 h-3" />
                    {r.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Curriculum */}
          <div
            className="relative overflow-hidden rounded-[32px] border p-8 flex flex-col gap-6"
            style={{ borderColor: 'rgba(217,193,194,0.2)', backgroundColor: 'rgba(220,229,171,0.2)', backgroundImage: PAPER, backgroundSize: '410px 410px', backgroundPosition: 'top left' }}
          >
            <h2 className="text-xl md:text-2xl font-semibold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}>
              Current Curriculum
            </h2>
            <div className="absolute -bottom-8 -right-8 w-28 h-28 pointer-events-none opacity-90">
              <Image src="/figma/botanical-corner.svg" alt="" width={110} height={104} className="w-full h-full" />
            </div>
            <div className="relative rounded-2xl border border-white bg-white/80 backdrop-blur-sm p-6 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: '#934652' }}>
                  In Progress
                </span>
                <span className="text-xs" style={{ color: '#534344' }}>Updated 2h ago</span>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold pt-1" style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}>
                Abnormal Psychology
              </h3>
              <p className="text-sm" style={{ color: '#534344' }}>
                Exploring the various psychological disorders through a modern clinical lens.
              </p>
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs font-bold" style={{ color: '#201923' }}>Chapter 4: Mood Disorders</span>
                <span className="text-xs font-bold" style={{ color: '#201923' }}>85%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: '#f7eaf8' }}>
                <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: '#934652' }} />
              </div>
              <Link
                href="/tracker?subject=abnormal"
                className="rounded-xl py-3 flex items-center justify-center gap-2 text-white font-bold text-sm md:text-base transition-opacity hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: '#5a6235' }}
              >
                Continue Reading
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
