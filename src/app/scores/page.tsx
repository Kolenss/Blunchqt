'use client';

import { useEffect, useState } from 'react';

interface Score {
  id: number;
  topic: string;
  score: number;
  date_taken: string | null;
  remarks: string | null;
}

export default function ScoresPage() {
  const [selectedSubject, setSelectedSubject] = useState('abnormal_psychology');
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const subjects = [
    { value: 'abnormal_psychology', label: 'Abnormal Psychology' },
    { value: 'developmental_psychology', label: 'Developmental Psychology' },
    { value: 'psychological_assessment', label: 'Psychological Assessment' },
    { value: 'industrial_organizational_psychology', label: 'Industrial Psychology' },
  ];

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/${selectedSubject}_score`);
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
  }, [selectedSubject]);

  const selectedLabel = subjects.find(s => s.value === selectedSubject)?.label || '';

  return (
    <div 
      className="flex flex-col items-center bg-zinc-50 font-sans min-h-screen p-4 md:p-8 overflow-x-hidden"
      style={{ 
        backgroundImage: "url(/darkpink.png)", 
        backgroundSize: "cover", 
        backgroundPosition: 'center', 
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-6xl">
        <h1 className="font-kaushan text-4xl md:text-5xl lg:text-6xl text-white mb-6 md:mb-8 text-center">Summary Score Tracker</h1>

        {/* Dropdown */}
        <div className="mb-6 flex justify-center">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 md:px-6 py-2 md:py-3 text-base md:text-lg font-kaushan bg-white text-[#8A3D58] border-2 border-[#8A3D58] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A3D58] cursor-pointer"
          >
            {subjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-white text-center text-xl">Loading scores...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#fbbc04' }}>
                  <th colSpan={4} className="px-4 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-lg md:text-xl">
                    {selectedLabel}
                  </th>
                </tr>
                <tr style={{ backgroundColor: '#fff2cc' }}>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-gray-800 text-sm md:text-base">Topic</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Score</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Date Taken</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-gray-800 text-sm md:text-base">Remarks</th>
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
                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-800 text-sm md:text-base">{score.topic}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-800 font-semibold text-sm md:text-base">{score.score}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-600 text-sm md:text-base">
                      {score.date_taken ? new Date(score.date_taken).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 text-sm md:text-base">{score.remarks || '-'}</td>
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
