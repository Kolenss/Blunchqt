'use client';

import { useEffect, useState } from 'react';
import SubProgress from './subprogress';
import { fetchProgress, type ProgressData } from '@/lib/api';

const SUBJECTS = [
    { key: 'ABNORMAL PSYCHOLOGY', label: 'ABPSYCH' },
    { key: 'DEVELOPMENTAL PSYCHOLOGY', label: 'DEV PSY' },
    { key: 'PSYCHOLOGICAL ASSESSMENT', label: 'PSY CAS' },
    { key: 'INDUSTRIAL ORGANIZATIONAL PSYCHOLOGY', label: 'I/O PSYCH' },
];

export default function Progress() {
    const [data, setData] = useState<ProgressData | null>(null);

    useEffect(() => {
        fetchProgress().then(setData);
    }, []);

    const totalAll = data
        ? SUBJECTS.reduce((sum, s) => sum + (data[s.key]?.total ?? 0), 0)
        : 0;
    const completedAll = data
        ? SUBJECTS.reduce((sum, s) => sum + (data[s.key]?.completed ?? 0), 0)
        : 0;
    const progress = totalAll > 0 ? (completedAll / totalAll) * 100 : 0;

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ backgroundImage: "url(/darkpink.png)", backgroundSize: "cover", backgroundPosition: 'center', backgroundRepeat: "no-repeat"}} className="lg:border lg:justify-between w-full flex flex-col min-h-fit py-8 lg:min-h-screen items-center justify-center">
            <div className="flex flex-col md:flex-row w-full max-w-7xl px-4 items-center justify-center gap-4 md:gap-8 lg:gap-16 py-4 lg:py-8">
                {/* Left - Titles */}
                <div className="flex flex-col items-center md:items-start gap-2 md:gap-4">
                    <p className="animate-slide-in-left font-kaushan text-3xl md:text-5xl lg:text-[80px] text-white text-center md:text-left">Progress Tracker</p>
                    <span className="animate-slide-in-left stagger-2 font-kaushan text-3xl md:text-5xl lg:text-[80px] text-white text-center md:text-left">Total Progress</span>
                </div>

                {/* Right - Donut Chart */}
                <div className="animate-scale-in stagger-3 relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0">
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 384 384">
                        <circle
                            cx="192"
                            cy="192"
                            r="120"
                            stroke="#852e50"
                            strokeWidth="60"
                            fill="none"
                        />
                        <circle
                            className="animate-donut-draw"
                            cx="192"
                            cy="192"
                            r="120"
                            stroke="#d0df9e"
                            strokeWidth="60"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-kaushan text-4xl md:text-5xl lg:text-7xl text-white">{progress.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full max-w-7xl px-4 gap-6 md:gap-8 lg:gap-10">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 lg:gap-6 p-3 md:p-5 lg:p-6 items-center justify-items-center">
                    {SUBJECTS.map((s, i) => {
                        const d = data?.[s.key];
                        const total = d?.total ?? 0;
                        const completed = d?.completed ?? 0;
                        const remaining = d?.remaining ?? 0;
                        const pct = total > 0 ? (completed / total) * 100 : 0;
                        return (
                            <SubProgress
                                key={s.key}
                                title={s.label}
                                total={total}
                                completed={completed}
                                remaining={remaining}
                                progress={pct}
                                index={i}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
