'use client';

import { useEffect, useState } from 'react';

interface DSM5Topic {
  id: number;
  sub_topic: string;
  topic: string;
  status: boolean;
  bgcolor: string;
}

export default function DSM5Page() {
  const [topics, setTopics] = useState<DSM5Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const completedTopics = topics.filter(topic => topic.status).length;
  const totalTopics = topics.length;
  const completedPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  const remainingPercentage = 100 - completedPercentage;

  useEffect(() => {
    async function fetchTopics() {
      try {
        const response = await fetch('https://blunchqt-1.onrender.com/dsm5_disorders');
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching DSM-5 topics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, []);

  const handleCheckboxChange = async (topicId: number, currentValue: boolean) => {
    try {
      const response = await fetch('https://blunchqt-1.onrender.com/update_dsm5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: topicId,
          field: 'status',
          value: !currentValue
        }),
      });

      if (response.ok) {
        setTopics(topics.map(topic => 
          topic.id === topicId ? { ...topic, status: !currentValue } : topic
        ));
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
    <div className="min-w-full flex flex-col items-center justify-center font-sans min-h-screen p-8 border" 
        style={{ 
        backgroundImage: "url(/smbg2.png)", 
        backgroundSize: "contain", 
        backgroundPosition: 'center', 
        backgroundRepeat: "repeat"
      }}>
      <div className="w-full max-w-3/4">
        
        {loading ? (
          <p className="text-gray-600">Loading topics...</p>
        ) : (
          <div className="w-full rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full border border-black">
              <thead className="bg-[#8A3D58] text-white">
                <tr style={{ backgroundColor: '#ea9999' }}>
                  <th colSpan={3} className="px-6 py-4 text-center font-bold text-gray-800 text-lg">
                    DSM-5 DISORDERS
                  </th>
                </tr>
                <tr style={{ backgroundColor: '#f4cccc' }}>
                  <th className="px-6 py-4 text-left font-semibold text-black">Sub Topic</th>
                  <th className="px-6 py-4 text-left font-semibold text-black">Topic</th>
                  <th className="px-6 py-4 text-center font-semibold text-black">Status</th>
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
                          className="px-6 py-4 text-gray-800 font-bold align-middle border-r-2 border-gray-400"
                          rowSpan={rowSpan}
                        >
                          {topic.sub_topic}
                        </td>
                      )}
                      <td className="px-6 py-4 text-gray-800">
                        {topic.topic}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={topic.status}
                          onChange={() => handleCheckboxChange(topic.id, topic.status)}
                          className="w-5 h-5 accent-[#8A3D58] cursor-pointer"
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

        {!loading && topics.length > 0 && (
          <div className="mt-8 w-full rounded-lg shadow-md p-6 bg-zinc-50">
            <div className="flex items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#8A3D58] mb-4">Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-black">Total:</span>
                    <span className='text-black'>{totalTopics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-black">Completed Topics:</span>
                    <span className='text-black'>{completedTopics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-black">Completed:</span>
                    <span className='text-black'>{completedPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-black">Remaining:</span>
                    <span className='text-black'>{remainingPercentage.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="40"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#ea9999"
                    strokeWidth="40"
                    strokeDasharray={`${(completedPercentage / 100) * 502.65} 502.65`}
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                    strokeLinecap="round"
                  />
                  <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="24"
                    fontWeight="bold"
                    fill="#374151"
                  >
                    {completedPercentage.toFixed(0)}%
                  </text>
                </svg>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ea9999' }}></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span className="text-sm">Remaining</span>
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
