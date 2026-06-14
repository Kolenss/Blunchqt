'use client';

import React, { useCallback } from 'react';
import { earnCoin } from '@/lib/coins';
import {
  type TOSTopic,
  fetchTOSTopics,
  updateTOSStatus,
  updateTOSComment,
} from '@/lib/api';
import { useWS } from '@/lib/use-ws';
import TableSkeleton from '@/components/table-skeleton';

function formatTopicLabel(topic: TOSTopic) {
  const topicText = topic.topic.trim();
  const topicNumber = topic.topic_number?.trim();

  if (!topicNumber) return topicText;

  if (/^\(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\)\s*/.test(topicText)) {
    return topicText;
  }

  return `(${topicNumber}) ${topicText}`;
}

interface HierarchicalTableProps {
  subject: string;
  weight?: string;
  totalItems?: string;
  duration?: string;
  color1?: string;
  color2?: string;
  color3?: string;
}

interface GroupedTopics {
  [mainTopic: string]: {
    [subTopic: string]: TOSTopic[];
  };
}

export default function HierarchicalTable({
  subject,
  weight = '20%',
  totalItems = '100 items',
  duration = '3 Hours',
  color1,
  color2,
  color3,
}: HierarchicalTableProps) {
  const fallbackFetch = useCallback(
    () => fetchTOSTopics(subject),
    [subject],
  );

  const { data: topics, setData: setTopics, loading } = useWS<TOSTopic>({
    path: `/ws/topics/${encodeURIComponent(subject)}`,
    fallbackFetch,
  });

  const handleStatusChange = async (id: number, newStatus: 'undone' | 'inprogress' | 'done') => {
    try {
      const { ok } = await updateTOSStatus(id, newStatus);
      if (!ok) throw new Error('Failed to update status');

      setTopics(prev => prev.map(topic =>
        topic.id === id ? { ...topic, status: newStatus } : topic
      ));

      if (newStatus === 'done') {
        earnCoin({
          source_type: 'tos_status',
          source_table: 'topics',
          source_id: id,
          source_field: 'status',
        });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCommentChange = async (id: number, comment: string) => {
    try {
      const { ok } = await updateTOSComment(id, comment);
      if (!ok) throw new Error('Failed to update comment');

      setTopics(prev => prev.map(topic =>
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

  if (loading && topics.length === 0) {
    return (
      <TableSkeleton
        title={subject.toUpperCase()}
        headers={['Main Topic', 'Status', 'Comments']}
        rows={10}
        color1={color1}
        color2={color2}
        color3={color3}
      />
    );
  }

  if (topics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No topics found</p>
      </div>
    );
  }

  const groupedTopics = groupTopics();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
      <table className="w-full border-collapse min-w-[480px]">
        <thead>
          <tr style={{ backgroundColor: color1 }} className="border border-white">
            <th colSpan={3} className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-base md:text-xl border border-white">
              {subject.toUpperCase()}
            </th>
          </tr>
          <tr style={{ backgroundColor: color2 }} className="border border-white">
            <th className="px-2 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-800 text-xs md:text-base border border-white">
              Weight: {weight}
            </th>
            <th className="px-2 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-800 text-xs md:text-base border border-white">
              {totalItems}
            </th>
            <th className="px-2 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-800 text-xs md:text-base border border-white">
              {duration}
            </th>
          </tr>
          <tr style={{ backgroundColor: color2 }} className="border border-white">
            <th className="px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-gray-800 text-xs md:text-base border border-white">Topics</th>
            <th className="px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-gray-800 text-xs md:text-base border border-white w-28 md:w-auto">Progress</th>
            <th className="px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-gray-800 text-xs md:text-base border border-white">Notes</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedTopics).map(([mainTopic, subTopics]) => (
            <React.Fragment key={mainTopic}>
              <tr style={{ backgroundColor: color1 }} className="border border-white">
                <td colSpan={3} className="px-2 md:px-6 py-2 md:py-4 font-bold text-gray-800 text-xs md:text-base border border-white">
                  {mainTopic}
                </td>
              </tr>

              {Object.entries(subTopics).map(([subTopic, topicList]) => (
                <React.Fragment key={`${mainTopic}-${subTopic}`}>
                  {subTopic !== 'General' && (
                    <tr style={{ backgroundColor: color2 }} className="border border-white">
                      <td colSpan={3} className="px-2 md:px-6 py-2 md:py-3 font-semibold text-gray-700 text-xs md:text-base border border-white">
                        {subTopic}
                      </td>
                    </tr>
                  )}

                  {topicList.map((topic, index) => (
                    <tr
                      key={topic.id}
                      className="hover:brightness-95 transition-colors border border-white"
                      style={{ backgroundColor: index % 2 === 0 ? 'white' : (color3 || '#f9fafb') }}
                    >
                      <td className="px-2 md:px-6 py-2 md:py-3 text-gray-800 text-xs md:text-base border border-white">
                        {formatTopicLabel(topic)}
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-3 text-center border border-white">
                        <select
                          value={topic.status}
                          onChange={(e) => handleStatusChange(topic.id, e.target.value as 'undone' | 'inprogress' | 'done')}
                          className={`w-full px-1 md:px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-xs md:text-base ${
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
                      <td className="px-2 md:px-6 py-2 md:py-3 border border-white">
                        <input
                          type="text"
                          placeholder="Add notes..."
                          value={topic.comment || ''}
                          onChange={(e) => handleCommentChange(topic.id, e.target.value)}
                          onBlur={(e) => handleCommentChange(topic.id, e.target.value)}
                          className="w-full px-1 md:px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-xs md:text-base"
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
