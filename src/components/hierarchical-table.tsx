'use client';

import React, { useState, useEffect } from 'react';

interface Topic {
  id: number;
  subject: string;
  main_topic: string;
  sub_topic: string | null;
  topic: string;
  status: 'undone' | 'inprogress' | 'done';
  comment: string | null;
}

interface HierarchicalTableProps {
  subject: string;
  weight?: string;
  totalItems?: string;
  duration?: string;
}

interface GroupedTopics {
  [mainTopic: string]: {
    [subTopic: string]: Topic[];
  };
}

export default function HierarchicalTable({ 
  subject, 
  weight = '20%', 
  totalItems = '100 items', 
  duration = '3 Hours' 
}: HierarchicalTableProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/topics?subject=${encodeURIComponent(subject)}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [subject]);

  const handleStatusChange = async (id: number, newStatus: 'undone' | 'inprogress' | 'done') => {
    try {
      const response = await fetch('http://localhost:8000/update_topic_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      
      setTopics(topics.map(topic => 
        topic.id === id ? { ...topic, status: newStatus } : topic
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCommentChange = async (id: number, comment: string) => {
    try {
      const response = await fetch('https://blunchqt-1.onrender.com/update_topic_comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, comment })
      });
      if (!response.ok) throw new Error('Failed to update comment');
      
      setTopics(topics.map(topic => 
        topic.id === id ? { ...topic, comment } : topic
      ));
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const groupTopics = (): GroupedTopics => {
    const grouped: GroupedTopics = {};
    
    topics.forEach(topic => {
      if (!grouped[topic.main_topic]) {
        grouped[topic.main_topic] = {};
      }
      
      const subTopic = topic.sub_topic || 'General';
      if (!grouped[topic.main_topic][subTopic]) {
        grouped[topic.main_topic][subTopic] = [];
      }
      
      grouped[topic.main_topic][subTopic].push(topic);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">Loading topics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  const groupedTopics = groupTopics();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead>
          {/* Title Row */}
          <tr style={{ backgroundColor: '#fbbc04' }}>
            <th colSpan={3} className="px-4 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-lg md:text-xl">
              {subject.toUpperCase()}
            </th>
          </tr>
          {/* Info Row */}
          <tr style={{ backgroundColor: '#fff2cc' }}>
            <th className="px-4 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-800 text-sm md:text-base">
              Weight: {weight}
            </th>
            <th className="px-4 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-800 text-sm md:text-base">
              {totalItems}
            </th>
            <th className="px-4 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-800 text-sm md:text-base">
              {duration}
            </th>
          </tr>
          {/* Column Headers */}
          <tr style={{ backgroundColor: '#fff2cc' }}>
            <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Topics</th>
            <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Progress</th>
            <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Notes</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedTopics).map(([mainTopic, subTopics]) => (
            <React.Fragment key={mainTopic}>
              {/* Main Topic Row */}
              <tr style={{ backgroundColor: '#fbbc04' }}>
                <td colSpan={3} className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-800 text-sm md:text-base">
                  {mainTopic}
                </td>
              </tr>
              
              {/* Sub Topics and Topics */}
              {Object.entries(subTopics).map(([subTopic, topicList]) => (
                <React.Fragment key={`${mainTopic}-${subTopic}`}>
                  {/* Sub Topic Row */}
                  {subTopic !== 'General' && (
                    <tr style={{ backgroundColor: '#fff2cc' }}>
                      <td colSpan={3} className="px-4 md:px-6 py-2 md:py-3 font-semibold text-gray-700 text-sm md:text-base">
                        {subTopic}
                      </td>
                    </tr>
                  )}
                  
                  {/* Individual Topics */}
                  {topicList.map((topic, index) => (
                    <tr 
                      key={topic.id}
                      className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-4 md:px-6 py-2 md:py-3 text-gray-800 text-sm md:text-base">
                        {topic.topic}
                      </td>
                      <td className="px-4 md:px-6 py-2 md:py-3 text-center">
                        <select
                          value={topic.status}
                          onChange={(e) => handleStatusChange(topic.id, e.target.value as 'undone' | 'inprogress' | 'done')}
                          className={`px-2 md:px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-sm md:text-base ${
                            topic.status === 'done' ? 'bg-green-100 text-green-800' :
                            topic.status === 'inprogress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="undone">Undone</option>
                          <option value="inprogress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td className="px-4 md:px-6 py-2 md:py-3">
                        <input
                          type="text"
                          placeholder="Add notes..."
                          value={topic.comment || ''}
                          onChange={(e) => handleCommentChange(topic.id, e.target.value)}
                          onBlur={(e) => handleCommentChange(topic.id, e.target.value)}
                          className="w-full px-2 md:px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-sm md:text-base"
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
