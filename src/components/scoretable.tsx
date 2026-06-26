'use client';

import { useState, useCallback } from 'react';
import {
  type Score,
  fetchScores as fetchScoresAPI,
  updateScore as updateScoreAPI,
  addScore as addScoreAPI,
  deleteScore as deleteScoreAPI,
} from '@/lib/api';
import { earnCoin } from '@/lib/coins';
import { useWS } from '@/lib/use-ws';

interface ScoreTableProps {
  title: string;
  endpoint: string;
  tableName: string;
  color1?: string;
  color2?: string;
  color3?: string;
}

export default function ScoreTable({ title, endpoint, tableName, color1, color2, color3 }: ScoreTableProps) {
  const [newRow, setNewRow] = useState({
    drill: '',
    drill_date: '',
    score: '',
    mistakes: '',
    total: '',
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fallbackFetch = useCallback(
    () => fetchScoresAPI(endpoint),
    [endpoint],
  );

  const { data: scores, setData: setScores, loading } = useWS<Score>({
    path: `/ws/scores/${tableName}`,
    fallbackFetch,
  });

  const accent = color1 || '#fbbc04';
  const accentSoft = color3 || '#fff9e6';

  const handleFieldChange = async (id: number, field: string, value: string | number) => {
    try {
      const { ok } = await updateScoreAPI({ id, table: tableName, field, value });
      if (!ok) throw new Error('Failed to update score');

      setScores(prev => prev.map(s => {
        if (s.id === id) {
          const updatedScore = { ...s, [field]: (field === 'drill_date' || field === 'drill') ? value : Number(value) };
          if (field === 'score' || field === 'mistakes' || field === 'total') {
            updateScoreAPI({ id, table: tableName, field: 'average', value: '' });
          }
          return updatedScore;
        }
        return s;
      }));
    } catch (err) {
      console.error('Error updating score:', err);
      alert('Failed to update score. Make sure the server is running.');
    }
  };

  const handleAddRow = async () => {
    try {
      const score = Number(newRow.score);
      const mistakes = Number(newRow.mistakes);
      const total = Number(newRow.total);

      const { ok, data } = await addScoreAPI({
        table: tableName,
        drill: newRow.drill,
        drill_date: newRow.drill_date || null,
        score,
        mistakes,
        total,
      });

      if (!ok || (data as { error?: string }).error) {
        throw new Error((data as { error?: string }).error || 'Failed to add score');
      }

      if (total > 0 && data) {
        const average = score / total;
        const points = Math.round(5 * average);
        if (points > 0) {
          const inserted = Array.isArray(data) ? data : (data as { data?: Score[] }).data;
          const newId = inserted && Array.isArray(inserted) && inserted.length > 0 ? inserted[0].id : 0;
          earnCoin({
            source_type: 'score_add',
            source_table: tableName,
            source_id: newId,
            source_field: 'score',
            amount: points,
          });
        }
      }

      setNewRow({ drill: '', drill_date: '', score: '', mistakes: '', total: '' });
    } catch (err) {
      console.error('Error adding score:', err);
    }
  };

  const handleDeleteRow = async (id: number) => {
    try {
      const { ok } = await deleteScoreAPI(tableName, id);
      if (!ok) throw new Error('Failed to delete score');
      setScores(prev => prev.filter(s => s.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting score:', err);
      alert('Failed to delete score. Make sure the server is running.');
    }
  };

  const inputCls = 'w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 text-sm';

  return (
    <div className="flex flex-col items-center font-sans p-2 md:p-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] underline" style={{ color: accent }}>
              Score Tracker
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-0.5" style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}>
              {title}
            </h1>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl md:text-3xl font-extrabold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}>
              {scores.length}
            </div>
            <div className="text-[11px]" style={{ color: '#867274' }}>drills logged</div>
          </div>
        </div>

        {loading && scores.length === 0 ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[88px] rounded-[12px] animate-pulse border" style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: '#ecdeed' }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {scores.map(score => {
              const avg = typeof score.average === 'number' ? score.average : Number(score.average);
              return (
                <div
                  key={score.id}
                  className="rounded-[12px] px-4 py-3 border"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#ecdeed', boxShadow: '0 1px 4px rgba(138,61,88,0.06)' }}
                >
                  {/* Top: drill name + delete */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={score.drill}
                      onChange={(e) => handleFieldChange(score.id, 'drill', e.target.value)}
                      className="flex-1 text-base font-bold bg-transparent border-0 border-b focus:outline-none focus:border-b-2 px-1 py-0.5"
                      style={{ color: '#201923', borderColor: '#ecdeed' }}
                    />
                    {deletingId === score.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDeleteRow(score.id)} className="p-1.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/25 transition-all" title="Confirm delete">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => setDeletingId(null)} className="p-1.5 rounded-full bg-gray-500/10 text-gray-500 hover:bg-gray-500/25 transition-all" title="Cancel">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(score.id)} className="p-1.5 rounded-full opacity-40 hover:opacity-100 hover:bg-red-500/10 text-gray-600 hover:text-red-600 transition-all" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                      </button>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#867274' }}>
                      Date
                      <input
                        type="date"
                        value={score.drill_date ? new Date(score.drill_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFieldChange(score.id, 'drill_date', e.target.value)}
                        className={`${inputCls} mt-1 font-normal normal-case`}
                        style={{ borderColor: '#d9c1c2', color: '#534344' }}
                      />
                    </label>
                    <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#867274' }}>
                      Score
                      <input
                        type="number"
                        value={score.score}
                        onChange={(e) => handleFieldChange(score.id, 'score', e.target.value)}
                        className={`${inputCls} mt-1 text-center font-semibold`}
                        style={{ borderColor: '#d9c1c2', color: '#201923' }}
                      />
                    </label>
                    <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#867274' }}>
                      Mistakes
                      <input
                        type="number"
                        value={score.mistakes}
                        onChange={(e) => handleFieldChange(score.id, 'mistakes', e.target.value)}
                        className={`${inputCls} mt-1 text-center font-semibold text-red-600`}
                        style={{ borderColor: '#d9c1c2' }}
                      />
                    </label>
                    <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#867274' }}>
                      Total
                      <input
                        type="number"
                        value={score.total}
                        onChange={(e) => handleFieldChange(score.id, 'total', e.target.value)}
                        className={`${inputCls} mt-1 text-center font-semibold`}
                        style={{ borderColor: '#d9c1c2', color: '#201923' }}
                      />
                    </label>
                    <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#867274' }}>
                      Average
                      <div className="mt-1 px-2 py-1 rounded-md text-center font-bold text-sm" style={{ backgroundColor: '#dce5ab', color: '#3f5417' }}>
                        {Number.isFinite(avg) ? avg.toFixed(2) : '0.00'}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add new drill card */}
            <div className="rounded-[12px] px-4 py-3 border-2 border-dashed" style={{ backgroundColor: accentSoft, borderColor: accent }}>
              <p className="text-sm font-bold mb-3" style={{ color: '#201923' }}>Add a drill</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                <input type="text" placeholder="Drill name" value={newRow.drill} onChange={(e) => setNewRow({ ...newRow, drill: e.target.value })} className={`${inputCls} col-span-2 sm:col-span-1`} style={{ borderColor: '#d9c1c2', color: '#201923' }} />
                <input type="date" value={newRow.drill_date} onChange={(e) => setNewRow({ ...newRow, drill_date: e.target.value })} className={inputCls} style={{ borderColor: '#d9c1c2', color: '#534344' }} />
                <input type="number" placeholder="Score" value={newRow.score} onChange={(e) => setNewRow({ ...newRow, score: e.target.value })} className={`${inputCls} text-center`} style={{ borderColor: '#d9c1c2', color: '#201923' }} />
                <input type="number" placeholder="Mistakes" value={newRow.mistakes} onChange={(e) => setNewRow({ ...newRow, mistakes: e.target.value })} className={`${inputCls} text-center`} style={{ borderColor: '#d9c1c2', color: '#201923' }} />
                <input type="number" placeholder="Total" value={newRow.total} onChange={(e) => setNewRow({ ...newRow, total: e.target.value })} className={`${inputCls} text-center`} style={{ borderColor: '#d9c1c2', color: '#201923' }} />
              </div>
              <button
                onClick={handleAddRow}
                className="w-full sm:w-auto px-6 py-2 text-white rounded-full text-sm font-bold transition-all hover:bg-[#76353f] active:scale-95"
                style={{ backgroundColor: '#934652' }}
              >
                Add Drill
              </button>
            </div>

            {scores.length === 0 && (
              <p className="text-center py-4 text-gray-500">No scores yet — add your first drill above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
