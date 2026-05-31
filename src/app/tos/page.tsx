'use client';

import { useState } from 'react';

interface TopicItem {
  id: string;
  text: string;
  progress: 'undone' | 'in progress' | 'done';
}

interface Section {
  id: string;
  title: string;
  weight: string;
  items: TopicItem[];
}

export default function TOSPage() {
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'A',
      title: 'A. MANIFESTATIONS OF BEHAVIOR',
      weight: '5% - 5 ITEMS',
      items: [
        {
          id: 'A.1',
          text: 'A.1. NORMALCY AND ABNORMALCY',
          progress: 'undone'
        },
        {
          id: 'A.1.1',
          text: '(1) RECOGNIZE NORMAL AND ABNORMAL MANIFESTATIONS OF BEHAVIOR',
          progress: 'undone'
        },
        {
          id: 'A.1.2',
          text: '(2) ASSESS ABNORMAL MANIFESTATIONS OF BEHAVIORS BASED ON THE SOCIAL CONTEXTS',
          progress: 'undone'
        }
      ]
    }
  ]);

  const handleProgressChange = (sectionId: string, itemId: string, newProgress: 'undone' | 'in progress' | 'done') => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, progress: newProgress } : item
          )
        };
      }
      return section;
    }));
  };

  const tables = [
    { title: 'Abnormal Psychology', weight: '20%', items: '100 items', hours: '3 hours' },
    { title: 'Developmental Psychology', weight: '20%', items: '100 items', hours: '3 hours' },
    { title: 'Psychology Assessment', weight: '20%', items: '100 items', hours: '3 hours' },
    { title: 'Industrial Psychology', weight: '20%', items: '100 items', hours: '3 hours' },
  ];

  return (
    <div 
      className="flex flex-col items-center bg-zinc-50 font-sans min-h-screen p-8"
      style={{ 
        backgroundImage: "url(/paperbg2.png)", 
        backgroundSize: "cover", 
        backgroundPosition: 'center', 
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-6xl space-y-8">
        <h1 className="font-kaushan text-5xl text-[#8A3D58] mb-8 text-center">TOS Summary</h1>

        {tables.map((table, tableIndex) => (
          <div key={tableIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header Row */}
            <table className="w-full">
              <thead>
                <tr className="bg-[#fbbc04]">
                  <th colSpan={4} className="px-6 py-4 text-center font-bold text-gray-800 text-lg">
                    {table.title}
                  </th>
                </tr>
                <tr className="bg-[#fbbc04]">
                  <th className="px-6 py-4 text-center font-semibold text-gray-800 w-1/4">
                    Weight<br/>{table.weight}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-800 w-1/4">
                    {table.items}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-800 w-1/4" colSpan={2}>
                    {table.hours}
                  </th>
                </tr>
                <tr className="bg-[#fff2cc]">
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Topics</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-800">Progress</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-800" colSpan={2}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <>
                    {/* Section Header */}
                    <tr key={section.id} className="bg-gray-100">
                      <td className="px-6 py-3 font-bold text-gray-800">{section.title}</td>
                      <td className="px-6 py-3 text-center font-semibold text-gray-700">{section.weight}</td>
                      <td className="px-6 py-3" colSpan={2}></td>
                    </tr>
                    {/* Section Items */}
                    {section.items.map((item, itemIndex) => (
                      <tr 
                        key={item.id}
                        className={`border-b ${itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                      >
                        <td className="px-6 py-3 text-gray-800">{item.text}</td>
                        <td className="px-6 py-3 text-center">
                          <select
                            value={item.progress}
                            onChange={(e) => handleProgressChange(section.id, item.id, e.target.value as 'undone' | 'in progress' | 'done')}
                            className={`px-3 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#8A3D58] ${
                              item.progress === 'done' ? 'bg-green-100 text-green-800' :
                              item.progress === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="undone">Undone</option>
                            <option value="in progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td className="px-6 py-3" colSpan={2}>
                          <input
                            type="text"
                            placeholder="Add notes..."
                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58]"
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
