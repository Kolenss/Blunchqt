'use client';

import { useEffect, useState } from 'react';

interface Score {
  id: number;
  drills: string;
  date: string | null;
  score: number;
  mistakes: number;
  total: number;
  average: number;
}

interface ScoreTableProps {
  title: string;
  endpoint: string;
}

export default function ScoreTable({ title, endpoint }: ScoreTableProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/${endpoint}`);
        const data = await response.json();
        setScores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching scores:', error);
        setScores([]);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [endpoint]);

  return (
    <div 
      className="flex flex-col items-center bg-zinc-50 font-sans min-h-screen p-4 md:p-8 overflow-x-hidden"
      style={{ 
        backgroundImage: "url(/paperbg2.png)", 
        backgroundSize: "cover", 
        backgroundPosition: 'center', 
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-6xl">
        <h1 className="font-kaushan text-4xl md:text-5xl lg:text-6xl text-white mb-6 md:mb-8 text-center">Summary Score Tracker</h1>

        {loading ? (
          <p className="text-white text-center text-xl">Loading scores...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#fbbc04' }}>
                  <th colSpan={6} className="px-4 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-lg md:text-xl">
                    {title}
                  </th>
                </tr>
                <tr style={{ backgroundColor: '#fff2cc' }}>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-gray-800 text-sm md:text-base">Drills</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Date</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Score</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Mistakes</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Total</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Average</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr
                    key={score.id}
                    className={`border-b ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-800 text-sm md:text-base">{score.drills}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-600 text-sm md:text-base">
                      {score.date ? new Date(score.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-800 font-semibold text-sm md:text-base">{score.score}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-red-600 font-semibold text-sm md:text-base">{score.mistakes}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-800 font-semibold text-sm md:text-base">{score.total}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-green-600 font-semibold text-sm md:text-base">{score.average}%</td>
                  </tr>
                ))}
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
