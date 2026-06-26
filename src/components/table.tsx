'use client';

import { useState } from 'react';
import { earnCoin } from '@/lib/coins';
import {
  type TrackerTopic,
  fetchTrackerTopics,
  updateTrackerTopic,
} from '@/lib/api';
import { useWS } from '@/lib/use-ws';
import { useCallback } from 'react';

interface Subject {
  title: string;
  color1?: string;
  color2?: string;
  color3?: string;
}

type CheckField = 'is_read' | 'is_youtube' | 'is_drills';

// Read / YouTube / Drills glyphs from the Option B mockup.
const ICONS: Record<CheckField, React.ReactNode> = {
  is_read: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 012.5 1h11A1.5 1.5 0 0115 2.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 13.5v-11zM2.5 2a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-11z" /><path d="M4 5h8v1H4zm0 3h8v1H4zm0 3h5v1H4z" /></svg>
  ),
  is_youtube: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 011.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 01-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 01-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 010 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 011.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 017.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z" /></svg>
  ),
  is_drills: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H2zm6 2.5a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5zm.5 2.5a.5.5 0 000 1h4a.5.5 0 000-1h-4zm-6 0a.5.5 0 000 1h2a.5.5 0 000-1H2.5zm0 2a.5.5 0 000 1h4a.5.5 0 000-1h-4zM8 9a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4A.5.5 0 018 9z" /></svg>
  ),
};

export default function Tracker({ title, color1, color2, color3 }: Subject) {
  const subjectKey = title.toLowerCase().replace(' ', '_');
  const [openDates, setOpenDates] = useState<Set<number>>(new Set());

  const fallbackFetch = useCallback(
    () => fetchTrackerTopics(subjectKey),
    [subjectKey],
  );

  const { data: topics, setData: setTopics, loading } = useWS<TrackerTopic>({
    path: `/ws/tracker/${subjectKey}`,
    fallbackFetch,
  });

  const completedTopics = topics.filter(t => t.is_read).length;
  const totalTopics = topics.length;
  const completedPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  const accent = color1 || '#a4c2f4';
  const accentSoft = color3 || '#e8f1fc';

  const handleCheckboxChange = async (topicId: number, field: CheckField, currentValue: boolean) => {
    try {
      const { ok } = await updateTrackerTopic({
        id: topicId,
        subject: subjectKey,
        field,
        value: !currentValue,
      });

      if (ok) {
        setTopics(prev => prev.map(topic =>
          topic.id === topicId ? { ...topic, [field]: !currentValue } : topic
        ));

        if (!currentValue) {
          earnCoin({
            source_type: 'tracker_checkbox',
            source_table: subjectKey,
            source_id: topicId,
            source_field: field,
          });
        }
      }
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleDateChange = async (topicId: number, field: 'date_started' | 'date_finished', value: string) => {
    try {
      const { ok } = await updateTrackerTopic({ id: topicId, subject: subjectKey, field, value });
      if (ok) {
        setTopics(prev => prev.map(topic =>
          topic.id === topicId ? { ...topic, [field]: value } : topic
        ));
      }
    } catch (error) {
      console.error('Error updating date:', error);
    }
  };

  const toggleDates = (id: number) => {
    setOpenDates(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-full flex flex-col items-center font-sans p-2 md:p-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      <div className="w-full max-w-3xl">

        {/* Header: eyebrow + title + percentage */}
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] underline" style={{ color: accent }}>
              Progress Tracker
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-0.5" style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}>
              {title}
            </h1>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl md:text-3xl font-extrabold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}>
              {completedPercentage.toFixed(0)}%
            </div>
            <div className="text-[11px]" style={{ color: '#867274' }}>{completedTopics} of {totalTopics} complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden mb-5" style={{ backgroundColor: '#f2e4f3' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${completedPercentage}%`, background: 'linear-gradient(90deg, #934652, #d97f8b)' }} />
        </div>

        {/* Topic cards */}
        {loading && topics.length === 0 ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[60px] rounded-[10px] animate-pulse border" style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: '#ecdeed' }} />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No topics found</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topics.map(topic => {
              const done = topic.is_read;
              const datesOpen = openDates.has(topic.id);
              return (
                <div
                  key={topic.id}
                  className="rounded-[10px] px-4 py-3 border transition-shadow hover:shadow-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#ecdeed', boxShadow: '0 1px 4px rgba(138,61,88,0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    {/* Check circle → toggles Read/completion */}
                    <button
                      onClick={() => handleCheckboxChange(topic.id, 'is_read', topic.is_read)}
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border-2"
                      style={done
                        ? { backgroundColor: '#934652', borderColor: '#934652' }
                        : { backgroundColor: 'transparent', borderColor: '#d9c1c2' }}
                      title="Mark as read"
                    >
                      {done && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </button>

                    {/* Topic title */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: done ? '#934652' : '#201923', textDecoration: done ? 'line-through' : 'none' }}
                      >
                        {topic.topic}
                      </p>
                    </div>

                    {/* Action icon buttons */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {(['is_read', 'is_youtube', 'is_drills'] as CheckField[]).map(field => {
                        const active = topic[field];
                        return (
                          <button
                            key={field}
                            onClick={() => handleCheckboxChange(topic.id, field, topic[field])}
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                            style={{ backgroundColor: active ? accent : accentSoft, color: active ? '#1a2a4a' : '#8a9fbf' }}
                            title={field === 'is_read' ? 'Read' : field === 'is_youtube' ? 'YouTube' : 'Drills'}
                          >
                            {ICONS[field]}
                          </button>
                        );
                      })}
                      {/* Dates toggle */}
                      <button
                        onClick={() => toggleDates(topic.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                        style={{ backgroundColor: datesOpen ? color2 || '#cfe2f3' : accentSoft, color: '#534344' }}
                        title="Dates"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Collapsible date inputs (preserves the original date fields) */}
                  {datesOpen && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t" style={{ borderColor: '#f2e4f3' }}>
                      <label className="flex-1 text-xs" style={{ color: '#534344' }}>
                        <span className="block mb-1 font-semibold">Date Started</span>
                        <input
                          type="date"
                          value={topic.date_started || ''}
                          onChange={(e) => handleDateChange(topic.id, 'date_started', e.target.value)}
                          className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 text-sm"
                          style={{ borderColor: '#d9c1c2', color: '#201923' }}
                        />
                      </label>
                      <label className="flex-1 text-xs" style={{ color: '#534344' }}>
                        <span className="block mb-1 font-semibold">Date Finished</span>
                        <input
                          type="date"
                          value={topic.date_finished || ''}
                          onChange={(e) => handleDateChange(topic.id, 'date_finished', e.target.value)}
                          className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 text-sm"
                          style={{ borderColor: '#d9c1c2', color: '#201923' }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
