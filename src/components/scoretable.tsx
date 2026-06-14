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
import TableSkeleton from '@/components/table-skeleton';

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
    total: ''
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

      // Award coins based on average: 5 points * (score/total)
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

  return (
    <div className="flex flex-col items-center font-sans min-h-screen p-2 md:p-8 overflow-x-hidden">
      <div className="w-full max-w-6xl">

        {loading && scores.length === 0 ? (
          <TableSkeleton
            title={title}
            headers={['Drills', 'Date', 'Score', 'Mistakes', 'Total', 'Average', '']}
            color1={color1}
            color2={color2}
            color3={color3}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr style={{ backgroundColor: color1 || '#fbbc04' }}>
                  <th colSpan={7} className="px-4 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-lg md:text-xl">
                    {title}
                  </th>
                </tr>
                <tr style={{ backgroundColor: color2 || '#fff2cc' }}>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-gray-800 text-sm md:text-base">Drills</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Date</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Score</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Mistakes</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Total</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Average</th>
                  <th className="px-2 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base w-10"></th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr
                    key={score.id}
                    className="border-b hover:brightness-95 transition-colors"
                    style={{ backgroundColor: index % 2 === 0 ? (color3 || '#f9fafb') : 'white' }}
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-800 text-sm md:text-base">
                      <input
                        type="text"
                        value={score.drill}
                        onChange={(e) => handleFieldChange(score.id, 'drill', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-sm"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-600 text-sm md:text-base">
                      <input
                        type="date"
                        value={score.drill_date ? new Date(score.drill_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFieldChange(score.id, 'drill_date', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-center text-sm"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-800 font-semibold text-sm md:text-base">
                      <input
                        type="number"
                        value={score.score}
                        onChange={(e) => handleFieldChange(score.id, 'score', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-center text-sm font-semibold"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-red-600 font-semibold text-sm md:text-base">
                      <input
                        type="number"
                        value={score.mistakes}
                        onChange={(e) => handleFieldChange(score.id, 'mistakes', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-center text-sm font-semibold text-red-600"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-800 font-semibold text-sm md:text-base">
                      <input
                        type="number"
                        value={score.total}
                        onChange={(e) => handleFieldChange(score.id, 'total', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-center text-sm font-semibold"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-green-600 font-semibold text-sm md:text-base">
                      {typeof score.average === 'number' ? score.average.toFixed(2) : Number(score.average).toFixed(2)}%
                    </td>
                    <td className="px-1 md:px-2 py-3 md:py-4 text-center relative">
                      <div className="flex items-center justify-center gap-1">
                        {deletingId === score.id ? (
                          <div className="flex items-center gap-1 animate-in fade-in">
                            <button
                              onClick={() => handleDeleteRow(score.id)}
                              className="p-1.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/25 transition-all duration-200"
                              title="Confirm delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="p-1.5 rounded-full bg-gray-500/10 text-gray-500 hover:bg-gray-500/25 transition-all duration-200"
                              title="Cancel"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(score.id)}
                            className="p-1.5 rounded-full opacity-40 hover:opacity-100 hover:bg-red-500/10 text-gray-600 hover:text-red-600 transition-all duration-200"
                            title="Delete row"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* New Row for Adding Data */}
                <tr className=" border-t-2">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <input
                      type="text"
                      placeholder="Enter drill name"
                      value={newRow.drill}
                      onChange={(e) => setNewRow({ ...newRow, drill: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <input
                      type="date"
                      value={newRow.drill_date}
                      onChange={(e) => setNewRow({ ...newRow, drill_date: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <input
                      type="number"
                      placeholder="Score"
                      value={newRow.score}
                      onChange={(e) => setNewRow({ ...newRow, score: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <input
                      type="number"
                      placeholder="Mistakes"
                      value={newRow.mistakes}
                      onChange={(e) => setNewRow({ ...newRow, mistakes: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <input
                      type="number"
                      placeholder="Total"
                      value={newRow.total}
                      onChange={(e) => setNewRow({ ...newRow, total: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    />
                  </td>
                  <td colSpan={2} className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <button
                      onClick={handleAddRow}
                      className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            {scores.length === 0 && (
              <p className="text-center py-8 text-gray-500">No scores found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
