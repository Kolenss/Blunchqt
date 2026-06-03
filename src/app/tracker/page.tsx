'use client';

import { useState } from 'react';
import Tracker from '@/components/table';

type SubjectKey = 'abnormal' | 'developmental' | 'assessment' | 'industrial';

interface SubjectConfig {
  name: string;
  color1: string;
  color2: string;
}

const subjects: Record<SubjectKey, SubjectConfig> = {
  abnormal: {
    name: 'Abnormal Psychology',
    color1: '#fbbc04',
    color2: '#fff2cc'
  },
  developmental: {
    name: 'Developmental Psychology',
    color1: '#34a853',
    color2: '#c8e6c9'
  },
  assessment: {
    name: 'Psychology Assessment',
    color1: '#4285f4',
    color2: '#c5e1f5'
  },
  industrial: {
    name: 'Industrial Psychology',
    color1: '#ea4335',
    color2: '#f4c2c2'
  }
};

export default function TrackerPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('abnormal');
  const config = subjects[selectedSubject];

  return (
    <div 
      className="flex flex-col items-center bg-zinc-50 font-sans min-h-screen p-4 md:p-8"
      style={{ 
        backgroundImage: "url(/smbg2.png)", 
        backgroundSize: "contain", 
        backgroundPosition: 'center', 
        backgroundRepeat: "repeat"
      }}
    >
      <div className="w-full">
        <h1 className="font-kaushan text-4xl md:text-5xl lg:text-6xl text-[#8A3D58] mb-6 md:mb-8 text-center">
          Progress Tracker
        </h1>

        {/* Subject Selector */}
        <div className="mb-6 flex justify-center">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as SubjectKey)}
            className="px-6 py-3 text-lg border-2 bg-white border-[#8A3D58] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A3D58] bg-transparent text-[#8A3D58] font-semibold shadow-md"
          >
            {Object.entries(subjects).map(([key, subject]) => (
              <option key={key} value={key}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pass key to force remount when subject changes */}
        <Tracker 
          key={selectedSubject} 
          title={config.name}
          color1={config.color1}
          color2={config.color2}
        />
      </div>
    </div>
  );
}
