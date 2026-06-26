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

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  done: { bg: '#dce5ab', text: '#434a1f', dot: '#5a6235', label: 'Done' },
  inprogress: { bg: '#fff2cc', text: '#7a5c00', dot: '#d4a017', label: 'In Progress' },
  undone: { bg: '#ecdeed', text: '#534344', dot: '#b6a3b7', label: 'Undone' },
};

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

  const accent = color1 || '#a4c2f4';
  const accentSoft = color3 || '#e8f1fc';

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

  const doneCount = topics.filter(t => t.status === 'done').length;
  const pct = topics.length > 0 ? (doneCount / topics.length) * 100 : 0;

  if (loading && topics.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[60px] rounded-[10px] animate-pulse border" style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: '#ecdeed' }} />
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="bg-white/90 rounded-xl shadow-md p-8 text-center w-full max-w-3xl mx-auto">
        <p className="text-gray-600">No topics found</p>
      </div>
    );
  }

  const groupedTopics = groupTopics();

  return (
    <div className="w-full max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      {/* Header */}
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] underline" style={{ color: accent }}>
            TOS Summary
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-0.5" style={{ fontFamily: 'var(--font-playfair), serif', color: '#201923' }}>
            {subject}
          </h1>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl md:text-3xl font-extrabold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#934652' }}>
            {pct.toFixed(0)}%
          </div>
          <div className="text-[11px]" style={{ color: '#867274' }}>{doneCount} of {topics.length} done</div>
        </div>
      </div>

      {/* Meta chips: weight / items / duration */}
      <div className="flex flex-wrap gap-2 mb-4 px-1">
        {[`Weight: ${weight}`, totalItems, duration].map(meta => (
          <span key={meta} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: color2 || '#cfe2f3', color: '#1a1a2e' }}>
            {meta}
          </span>
        ))}
      </div>

      {/* Grouped topic cards */}
      <div className="flex flex-col gap-5">
        {Object.entries(groupedTopics).map(([mainTopic, subTopics]) => (
          <div key={mainTopic} className="flex flex-col gap-2">
            {/* Main topic heading */}
            <div className="flex items-center gap-2 px-1">
              <span className="w-1.5 h-5 rounded-full" style={{ backgroundColor: accent }} />
              <h2 className="text-base md:text-lg font-bold" style={{ color: '#201923' }}>{mainTopic}</h2>
            </div>

            {Object.entries(subTopics).map(([subTopic, topicList]) => (
              <React.Fragment key={`${mainTopic}-${subTopic}`}>
                {subTopic !== 'General' && (
                  <div className="text-xs font-semibold uppercase tracking-wide px-1 pt-1" style={{ color: '#867274' }}>
                    {subTopic}
                  </div>
                )}

                {topicList.map(topic => {
                  const st = STATUS_STYLES[topic.status] || STATUS_STYLES.undone;
                  return (
                    <div
                      key={topic.id}
                      className="rounded-[10px] px-4 py-3 border flex flex-col gap-2.5"
                      style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#ecdeed', boxShadow: '0 1px 4px rgba(138,61,88,0.06)' }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: st.dot }} />
                        <p className="flex-1 text-sm font-medium" style={{ color: '#201923' }}>{formatTopicLabel(topic)}</p>
                        <select
                          value={topic.status}
                          onChange={(e) => handleStatusChange(topic.id, e.target.value as 'undone' | 'inprogress' | 'done')}
                          className="text-xs font-semibold px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 cursor-pointer flex-shrink-0"
                          style={{ backgroundColor: st.bg, color: st.text }}
                        >
                          <option value="undone">Undone</option>
                          <option value="inprogress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Add notes..."
                        value={topic.comment || ''}
                        onChange={(e) => handleCommentChange(topic.id, e.target.value)}
                        onBlur={(e) => handleCommentChange(topic.id, e.target.value)}
                        className="w-full text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2"
                        style={{ backgroundColor: accentSoft, color: '#201923' }}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
