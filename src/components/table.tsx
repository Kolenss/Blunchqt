'use client';

import { useEffect, useState } from 'react';

interface Subject {
    title: string;
    color1?: string;
    color2?: string;
}

interface Topic {
  id: number;
  topic: string;
  is_read: boolean;
  is_youtube: boolean;
  is_drills: boolean;
  date_started: string | null;
  date_finished: string | null;
  created_at?: string;
}

export default function Tracker({title, color1, color2}: Subject) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const completedTopics = topics.filter(topics => topics.is_read).length;
  const totalTopics = topics.length;
  const completedPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  const remainingPercentage = 100 - completedPercentage;

  const handleCheckboxChange = async (topicId: number, field: 'is_read' | 'is_youtube' | 'is_drills', currentValue: boolean) => {
    try {
      const response = await fetch('https://blunchqt-1.onrender.com/update_topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: topicId,
          subject: title.toLowerCase().replace(' ', '_'),
          field: field,
          value: !currentValue
        }),
      });

      if (response.ok) {
        // Update local state
        setTopics(topics.map(topic => 
          topic.id === topicId ? { ...topic, [field]: !currentValue } : topic
        ));
      }
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleDateChange = async (topicId: number, field: 'date_started' | 'date_finished', value: string) => {
    try {
      const response = await fetch('https://blunchqt-1.onrender.com/update_topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: topicId,
          subject: title.toLowerCase().replace(' ', '_'),
          field: field,
          value: value
        }),
      });

      if (response.ok) {
        // Update local state
        setTopics(topics.map(topic => 
          topic.id === topicId ? { ...topic, [field]: value } : topic
        ));
      }
    } catch (error) {
      console.error('Error updating date:', error);
    }
  };

  useEffect(() => {
    async function fetchTopics() {
      try {
        const response = await fetch(`https://blunchqt-1.onrender.com/${title.toLowerCase().replace(' ', '_')}`);
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-50 font-sans min-h-screen p-8  " style={{ backgroundImage: "url(/paperbg2.png)", backgroundSize: "cover", backgroundPosition: 'center', backgroundRepeat: "no-repeat"}}>
      <div className="w-full max-w-3/4">
        <h1 className="font-kaushan text-5xl text-[#8A3D58] mb-8 text-center">Topic Tracker</h1>
        
        {loading ? (
          <p className="text-gray-600">Loading topics...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full border border-blac">
              <thead className="bg-[#8A3D58] text-white">
                <tr style={{ backgroundColor: color1 || '#fbbc04' }}>
                  <th colSpan={6} className="px-6 py-4 text-center font-bold text-gray-800 text-lg">
                    {title}
                  </th>
                </tr>
                <tr style={{ backgroundColor: color2 || '#fff2cc' }}>
                  <th className="px-6 py-4 text-left font-semibold text-black">Topic</th>
                  <th className="px-6 py-4 text-center font-semibold text-black">Read</th>
                  <th className="px-6 py-4 text-center font-semibold text-black">YouTube</th>
                  <th className="px-6 py-4 text-center font-semibold text-black">Drills</th>
                  <th className="px-6 py-4 text-center font-semibold text-black">Date Started</th>
                  <th className="px-6 py-4 text-center font-semibold text-black">Date Finished</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic, index) => (
                  <tr
                    key={topic.id}
                    className={`border-b ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-6 py-4 text-gray-800">{topic.topic}</td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={topic.is_read}
                        onChange={() => handleCheckboxChange(topic.id, 'is_read', topic.is_read)}
                        className="w-5 h-5 accent-[#8A3D58] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={topic.is_youtube}
                        onChange={() => handleCheckboxChange(topic.id, 'is_youtube', topic.is_youtube)}
                        className="w-5 h-5 accent-[#8A3D58] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={topic.is_drills}
                        onChange={() => handleCheckboxChange(topic.id, 'is_drills', topic.is_drills)}
                        className="w-5 h-5 accent-[#8A3D58] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="date"
                        value={topic.date_started || ''}
                        onChange={(e) => handleDateChange(topic.id, 'date_started', e.target.value)}
                        className="px-3 py-1 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58]"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="date"
                        value={topic.date_finished || ''}
                        onChange={(e) => handleDateChange(topic.id, 'date_finished', e.target.value)}
                        className="px-3 py-1 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58]"
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
        {!loading && topics.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between gap-8">
              {/* Summary Stats */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#8A3D58] mb-4">Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-black">Number of Chapters:</span>
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

              {/* Donut Chart */}
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
                    stroke={color1 || '#fbbc04'}
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
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: color1 || '#fbbc04' }}></div>
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
