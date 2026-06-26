'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchProgress, type ProgressData } from '@/lib/api';
import { getCoinBalance } from '@/lib/coins';

const SUBJECTS = [
  { key: 'ABNORMAL PSYCHOLOGY', label: 'Abnormal Psych', short: 'AB', color: '#d97f8b' },
  { key: 'DEVELOPMENTAL PSYCHOLOGY', label: 'Dev Psychology', short: 'DP', color: '#adb680' },
  { key: 'PSYCHOLOGICAL ASSESSMENT', label: 'Psych Assessment', short: 'PA', color: '#c28b88' },
  { key: 'INDUSTRIAL ORGANIZATIONAL PSYCHOLOGY', label: 'I/O Psychology', short: 'IO', color: '#934652' },
];

const DAILY_TASKS = [
  { id: 1, label: 'Study Abnormal Psychology materials', done: true },
  { id: 2, label: 'Review flashcards', done: true },
  { id: 3, label: 'Claim daily login sticker', done: false },
];

const REWARDS = [
  { name: 'Garden Sticker Pack', price: 150, emoji: '🌸' },
  { name: 'Quill Pen Skin', price: 300, emoji: '🪶' },
];

function getLevelFromCoins(coins: number) {
  return Math.floor(coins / 50) + 1;
}

export default function Dashboard() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [coins, setCoins] = useState(0);
  const [tasks, setTasks] = useState(DAILY_TASKS);

  useEffect(() => {
    fetchProgress().then(setData);
    getCoinBalance().then(setCoins);
  }, []);

  const totalAll = data ? SUBJECTS.reduce((sum, s) => sum + (data[s.key]?.total ?? 0), 0) : 0;
  const completedAll = data ? SUBJECTS.reduce((sum, s) => sum + (data[s.key]?.completed ?? 0), 0) : 0;
  const overallPct = totalAll > 0 ? (completedAll / totalAll) * 100 : 0;

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  const level = getLevelFromCoins(coins);
  const completedTasks = tasks.filter(t => t.done).length;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: '#fff7fc',
        fontFamily: 'var(--font-jakarta), sans-serif',
      }}
    >
      {/* ── Header ────────────────────────────────── */}
      <header
        className="w-full px-6 lg:px-16 py-4 flex items-center justify-between border-b"
        style={{ borderColor: '#ecdeed', background: '#ffffff' }}
      >
        <div className="flex items-center gap-3 pl-10 lg:pl-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: '#934652' }}
          >
            BP
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#201923' }}>Blunch P. Lobetania</p>
            <p className="text-xs" style={{ color: '#534344' }}>Blossoming Scholar · Level {level}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Coin Balance */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: '#fdeffe', color: '#934652' }}
          >
            <Image src="/coin.png" alt="coins" width={16} height={16} className="w-4 h-4" />
            <span>{coins} coins</span>
          </div>

          {/* Notifications */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f7eaf8] transition-colors"
            aria-label="Notifications"
          >
            <svg width="18" height="18" fill="none" stroke="#534344" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Settings */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f7eaf8] transition-colors"
            aria-label="Settings"
          >
            <svg width="18" height="18" fill="none" stroke="#534344" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 lg:px-16 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Hero greeting */}
          <div
            className="rounded-2xl p-6 lg:p-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #934652 0%, #d97f8b 100%)' }}
          >
            <div className="relative z-10">
              <p
                className="text-white/80 text-sm font-medium mb-1"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                Good day, scholar 🌸
              </p>
              <h1
                className="text-white text-2xl lg:text-4xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Unified Dashboard
              </h1>
              <p className="text-white/80 text-sm">Your study garden is growing beautifully.</p>
            </div>
            {/* Decorative circles */}
            <div
              className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
              style={{ background: '#ffd9dc' }}
            />
            <div
              className="absolute -right-4 -bottom-12 w-56 h-56 rounded-full opacity-10"
              style={{ background: '#ffd9dc' }}
            />
          </div>

          {/* Daily Reflection */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: '#ffffff', borderColor: '#ecdeed' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}
              >
                Daily Reflection
              </h2>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: '#dce5ab', color: '#434a1f' }}
              >
                {completedTasks}/{tasks.length} done
              </span>
            </div>
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      borderColor: task.done ? '#934652' : '#d9c1c2',
                      background: task.done ? '#934652' : 'transparent',
                    }}
                  >
                    {task.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm transition-colors"
                    style={{ color: task.done ? '#867274' : '#201923', textDecoration: task.done ? 'line-through' : 'none' }}
                  >
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Study Focus */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: '#ffffff', borderColor: '#ecdeed' }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}
            >
              Current Study Focus
            </h2>
            <div
              className="rounded-xl p-5"
              style={{ background: '#fff7fc' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#934652' }}>
                    Abnormal Psychology
                  </p>
                  <h3 className="font-semibold text-base" style={{ color: '#201923', fontFamily: 'var(--font-playfair), serif' }}>
                    Chapter 4: Mood Disorders
                  </h3>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: '#ffd9dc', color: '#762f3b' }}
                >
                  85%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full mb-4" style={{ background: '#ecdeed' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: '85%', background: 'linear-gradient(90deg, #934652, #d97f8b)' }}
                />
              </div>
              <Link
                href="/tracker/abnormal"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#934652' }}
              >
                Continue Reading
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Subject Progress Grid */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: '#ffffff', borderColor: '#ecdeed' }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}
            >
              Subject Mastery
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {SUBJECTS.map(s => {
                const d = data?.[s.key];
                const total = d?.total ?? 0;
                const completed = d?.completed ?? 0;
                const pct = total > 0 ? (completed / total) * 100 : 0;
                return (
                  <div
                    key={s.key}
                    className="rounded-xl p-4"
                    style={{ background: '#fff7fc', border: '1px solid #ecdeed' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: s.color }}
                      >
                        {s.short}
                      </div>
                      <p className="text-xs font-semibold" style={{ color: '#534344' }}>{s.label}</p>
                    </div>
                    <div className="w-full h-1.5 rounded-full mb-1" style={{ background: '#ecdeed' }}>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${pct}%`, background: s.color }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: '#867274' }}>{pct.toFixed(0)}% · {completed}/{total}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-6">

          {/* Overall Progress */}
          <div
            className="rounded-2xl p-6 border flex flex-col items-center"
            style={{ background: '#ffffff', borderColor: '#ecdeed' }}
          >
            <h2
              className="text-lg font-semibold mb-4 self-start"
              style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}
            >
              Overall Mastery
            </h2>
            <div className="relative w-44 h-44 flex-shrink-0">
              <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={radius} stroke="#ecdeed" strokeWidth="20" fill="none" />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="#d97f8b"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: '#934652', fontFamily: 'var(--font-playfair), serif' }}>
                  {overallPct.toFixed(0)}%
                </span>
                <span className="text-xs" style={{ color: '#867274' }}>mastered</span>
              </div>
            </div>
            <p className="text-sm mt-3 text-center" style={{ color: '#534344' }}>
              {completedAll} of {totalAll} topics complete
            </p>
          </div>

          {/* Level & XP */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: 'linear-gradient(135deg, #fdeffe 0%, #f7eaf8 100%)', borderColor: '#ecdeed' }}
          >
            <h2
              className="text-lg font-semibold mb-3"
              style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}
            >
              Your Garden Level
            </h2>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: '#934652' }}
              >
                🌺
              </div>
              <div className="flex-1">
                <p className="font-bold text-xl" style={{ color: '#934652' }}>Level {level}</p>
                <p className="text-xs" style={{ color: '#534344' }}>Blossoming Scholar</p>
                <div className="w-full h-1.5 rounded-full mt-2" style={{ background: '#ecdeed' }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(coins % 50) / 50 * 100}%`, background: '#934652' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: '#867274' }}>{coins % 50}/50 to Level {level + 1}</p>
              </div>
            </div>
          </div>

          {/* Quick Nav */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: '#ffffff', borderColor: '#ecdeed' }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}
            >
              Quick Access
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tracker', href: '/tracker', emoji: '📚' },
                { label: 'Scores', href: '/scores', emoji: '📊' },
                { label: 'TOS Summary', href: '/tos', emoji: '📋' },
                { label: 'DSM-5', href: '/dsm5', emoji: '🧠' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all hover:scale-[1.03] active:scale-95"
                  style={{ background: '#fff7fc', border: '1px solid #ecdeed' }}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: '#534344' }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Rewards Preview */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: '#ffffff', borderColor: '#ecdeed' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}
              >
                Reward Shop
              </h2>
              <Link
                href="/"
                className="text-xs font-semibold"
                style={{ color: '#934652' }}
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {REWARDS.map(r => {
                const canAfford = coins >= r.price;
                return (
                  <div
                    key={r.name}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: '#fff7fc', border: '1px solid #ecdeed' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#201923' }}>{r.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Image src="/coin.png" alt="coins" width={12} height={12} className="w-3 h-3" />
                          <span className="text-xs" style={{ color: '#867274' }}>{r.price} coins</span>
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={!canAfford}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                      style={{
                        background: canAfford ? '#934652' : '#ecdeed',
                        color: canAfford ? '#ffffff' : '#867274',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {canAfford ? 'Redeem' : 'Soon'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
