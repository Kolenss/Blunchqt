'use client';

import { useCallback } from 'react';
import { earnCoin } from '@/lib/coins';
import {
  type TrackerTopic,
  fetchTrackerTopics,
  updateTrackerTopic,
} from '@/lib/api';
import { useWS } from '@/lib/use-ws';

interface Subject {
    title: string;
    color1?: string;
    color2?: string;
    color3?: string;
}

export default function Tracker({title, color1, color2, color3}: Subject) {
  const subjectKey = title.toLowerCase().replace(' ', '_');

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
  const remainingPercentage = 100 - completedPercentage;

  const handleCheckboxChange = async (topicId: number, field: 'is_read' | 'is_youtube' | 'is_drills', currentValue: boolean) => {
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
      const { ok } = await updateTrackerTopic({
        id: topicId,
        subject: subjectKey,
        field,
        value,
      });

      if (ok) {
        setTopics(prev => prev.map(topic =>
          topic.id === topicId ? { ...topic, [field]: value } : topic
        ));
      }
    } catch (error) {
      console.error('Error updating date:', error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center font-sans min-h-screen p-4 md:p-8">
      <div className="w-full max-w-5xl">

        {loading && topics.length === 0 ? (
          <p className="text-gray-600">Loading topics...</p>
        ) : (
          <div className="w-full rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full border border-black">
              <thead className="bg-[#8A3D58] text-white">
                <tr style={{ backgroundColor: color1 || '#fbbc04' }}>
                  <th colSpan={6} className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-base md:text-lg">
                    {title}
                  </th>
                </tr>
                <tr style={{ backgroundColor: color2 || '#fff2cc' }}>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left font-semibold text-black text-xs md:text-base">Topic</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-black text-xs md:text-base">Read</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-black text-xs md:text-base">YouTube</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-black text-xs md:text-base">Drills</th>
                  <th className="hidden md:table-cell px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-black text-xs md:text-base">Date Started</th>
                  <th className="hidden md:table-cell px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-black text-xs md:text-base">Date Finished</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic, index) => (
                  <tr
                    key={topic.id}
                    className="border-b hover:brightness-95 transition-colors"
                    style={{ backgroundColor: index % 2 === 0 ? (color3 || '#f9fafb') : 'white' }}
                  >
                    <td className="px-2 md:px-6 py-2 md:py-4 text-gray-800 text-xs md:text-base">{topic.topic}</td>
                    <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                      <input
                        type="checkbox"
                        checked={topic.is_read}
                        onChange={() => handleCheckboxChange(topic.id, 'is_read', topic.is_read)}
                        className="w-4 h-4 md:w-5 md:h-5 accent-[#8A3D58] cursor-pointer"
                      />
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                      <input
                        type="checkbox"
                        checked={topic.is_youtube}
                        onChange={() => handleCheckboxChange(topic.id, 'is_youtube', topic.is_youtube)}
                        className="w-4 h-4 md:w-5 md:h-5 accent-[#8A3D58] cursor-pointer"
                      />
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                      <input
                        type="checkbox"
                        checked={topic.is_drills}
                        onChange={() => handleCheckboxChange(topic.id, 'is_drills', topic.is_drills)}
                        className="w-4 h-4 md:w-5 md:h-5 accent-[#8A3D58] cursor-pointer"
                      />
                    </td>
                    <td className="hidden md:table-cell px-2 md:px-6 py-2 md:py-4 text-center">
                      <input
                        type="date"
                        value={topic.date_started || ''}
                        onChange={(e) => handleDateChange(topic.id, 'date_started', e.target.value)}
                        className="w-full px-2 py-1 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-sm"
                      />
                    </td>
                    <td className="hidden md:table-cell px-2 md:px-6 py-2 md:py-4 text-center">
                      <input
                        type="date"
                        value={topic.date_finished || ''}
                        onChange={(e) => handleDateChange(topic.id, 'date_finished', e.target.value)}
                        className="w-full px-2 py-1 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {topics.length === 0 && (
              <p className="text-center py-8 text-gray-500">No topics found</p>
            )}
          </div>
        )}

        {/* Summary Section */}
        {topics.length > 0 && (
          <div className="mt-6 md:mt-8 w-full rounded-lg shadow-md p-4 md:p-6 bg-zinc-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="w-full md:flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-[#8A3D58] mb-3 md:mb-4">Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-black text-sm md:text-base">Number of Chapters:</span>
                    <span className="text-black text-sm md:text-base">{totalTopics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-black text-sm md:text-base">Completed Topics:</span>
                    <span className="text-black text-sm md:text-base">{completedTopics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-black text-sm md:text-base">Completed:</span>
                    <span className="text-black text-sm md:text-base">{completedPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-black text-sm md:text-base">Remaining:</span>
                    <span className="text-black text-sm md:text-base">{remainingPercentage.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <svg width="160" height="160" viewBox="0 0 200 200" className="w-32 h-32 md:w-[200px] md:h-[200px]">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="40" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke={color1 || '#fbbc04'} strokeWidth="40"
                    strokeDasharray={`${(completedPercentage / 100) * 502.65} 502.65`}
                    strokeDashoffset="0" transform="rotate(-90 100 100)" strokeLinecap="round" />
                  <text x="100" y="100" textAnchor="middle" dy="0.3em" fontSize="24" fontWeight="bold" fill="#374151">
                    {completedPercentage.toFixed(0)}%
                  </text>
                </svg>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded" style={{ backgroundColor: color1 || '#fbbc04' }}></div>
                    <span className="text-xs md:text-sm">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-300 rounded"></div>
                    <span className="text-xs md:text-sm">Remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
