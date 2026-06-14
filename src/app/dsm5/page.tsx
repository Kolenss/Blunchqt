'use client';

import { useCallback } from 'react';
import { earnCoin } from '@/lib/coins';
import {
  type DSM5Topic,
  fetchDSM5Topics,
  updateDSM5,
} from '@/lib/api';
import { useWS } from '@/lib/use-ws';
import TableSkeleton from '@/components/table-skeleton';

export default function DSM5Page() {
  const fallbackFetch = useCallback(() => fetchDSM5Topics(), []);

  const { data: topics, setData: setTopics, loading } = useWS<DSM5Topic>({
    path: '/ws/dsm5',
    fallbackFetch,
  });

  const completedTopics = topics.filter(topic => topic.status).length;
  const totalTopics = topics.length;
  const completedPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  const remainingPercentage = 100 - completedPercentage;

  const handleCheckboxChange = async (topicId: number, currentValue: boolean) => {
    try {
      const { ok } = await updateDSM5(topicId, 'status', !currentValue);

      if (ok) {
        setTopics(prev => prev.map(topic =>
          topic.id === topicId ? { ...topic, status: !currentValue } : topic
        ));

        if (!currentValue) {
          earnCoin({
            source_type: 'dsm5_checkbox',
            source_table: 'dsm5_disorders',
            source_id: topicId,
            source_field: 'status',
          });
        }
      }
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const getRowSpan = (subTopic: string, currentIndex: number) => {
    if (!shouldRenderSubTopic(currentIndex)) return 0;
    let count = 1;
    for (let i = currentIndex + 1; i < topics.length; i++) {
      if (topics[i].sub_topic === subTopic) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const shouldRenderSubTopic = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    return topics[currentIndex].sub_topic !== topics[currentIndex - 1].sub_topic;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center font-sans min-h-screen p-4 md:p-8"
        style={{
        backgroundImage: "url(/smbg2.png)",
        backgroundSize: "contain",
        backgroundPosition: 'center',
        backgroundRepeat: "repeat"
      }}>
      <div className="w-full max-w-5xl">

        {loading && topics.length === 0 ? (
          <TableSkeleton
            title="DSM-5 DISORDERS"
            headers={['Sub Topic', 'Topic', 'Status']}
            rows={10}
            color1="#ea9999"
            color2="#f4cccc"
            showSummary
          />
        ) : (
          <div className="w-full rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full border border-black">
              <thead className="bg-[#8A3D58] text-white">
                <tr style={{ backgroundColor: '#ea9999' }}>
                  <th colSpan={3} className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-base md:text-lg">
                    DSM-5 DISORDERS
                  </th>
                </tr>
                <tr style={{ backgroundColor: '#f4cccc' }}>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left font-semibold text-black text-xs md:text-base">Sub Topic</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left font-semibold text-black text-xs md:text-base">Topic</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-black text-xs md:text-base">Status</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic, index) => {
                  const renderSubTopic = shouldRenderSubTopic(index);
                  const rowSpan = renderSubTopic ? getRowSpan(topic.sub_topic, index) : 0;

                  return (
                    <tr
                      key={topic.id}
                      className="border-b hover:opacity-90 transition-colors"
                      style={{ backgroundColor: topic.bgcolor }}
                    >
                      {renderSubTopic && (
                        <td
                          className="px-2 md:px-6 py-2 md:py-4 text-gray-800 font-bold align-middle border-r-2 border-gray-400 text-xs md:text-base"
                          rowSpan={rowSpan}
                        >
                          {topic.sub_topic}
                        </td>
                      )}
                      <td className="px-2 md:px-6 py-2 md:py-4 text-gray-800 text-xs md:text-base">
                        {topic.topic}
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                        <input
                          type="checkbox"
                          checked={topic.status}
                          onChange={() => handleCheckboxChange(topic.id, topic.status)}
                          className="w-4 h-4 md:w-5 md:h-5 accent-[#8A3D58] cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {topics.length === 0 && (
              <p className="text-center py-8 text-gray-500">No topics found</p>
            )}
          </div>
        )}

        {topics.length > 0 && (
          <div className="mt-6 md:mt-8 w-full rounded-lg shadow-md p-4 md:p-6 bg-zinc-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="w-full md:flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-[#8A3D58] mb-3 md:mb-4">Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-black text-sm md:text-base">Total:</span>
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
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#ea9999" strokeWidth="40"
                    strokeDasharray={`${(completedPercentage / 100) * 502.65} 502.65`}
                    strokeDashoffset="0" transform="rotate(-90 100 100)" strokeLinecap="round" />
                  <text x="100" y="100" textAnchor="middle" dy="0.3em" fontSize="24" fontWeight="bold" fill="#374151">
                    {completedPercentage.toFixed(0)}%
                  </text>
                </svg>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded" style={{ backgroundColor: '#ea9999' }}></div>
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
