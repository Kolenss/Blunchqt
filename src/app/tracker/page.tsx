'use client';

import { useEffect, useState } from 'react';
import Tracker from '@/components/table';

type SubjectKey = 'abnormal' | 'developmental' | 'assessment' | 'industrial';

interface SubjectConfig {
  name: string;
  color1: string;
  color2: string;
  color3: string;
}

const subjects: Record<SubjectKey, SubjectConfig> = {
  abnormal: {
    name: 'Abnormal Psychology',
    color1: '#a4c2f4',
    color2: '#cfe2f3',
    color3: '#e8f1fc'
  },
  developmental: {
    name: 'Developmental Psychology',
    color1: '#FC6c85',
    color2: '#FC8EAC',
    color3: '#fde4ea'
  },
  assessment: {
    name: 'Psychology Assessment',
    color1: '#b7d7a8',
    color2: '#d9ead3',
    color3: '#edf5e8'
  },
  industrial: {
    name: 'Industrial Psychology',
    color1: '#fbbc04',
    color2: '#fff2cc',
    color3: '#fff9e6'
  }
};

export default function TrackerPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('abnormal');
  const config = subjects[selectedSubject];

  // Pre-select the subject when arriving from the dashboard (e.g. /tracker?subject=abnormal).
  useEffect(() => {
    const subject = new URLSearchParams(window.location.search).get('subject');
    if (subject && subject in subjects) {
      setSelectedSubject(subject as SubjectKey);
    }
  }, []);

  return (
    <div className="bg-ruled flex flex-col items-center font-sans min-h-screen p-4 md:p-8">
      <div className="w-full">
        <h1 className="font-kaushan text-4xl md:text-5xl lg:text-6xl text-[#8A3D58] mb-6 md:mb-8 text-center">
          Progress Tracker
        </h1>

        {/* Subject Selector */}
        <div className="mb-6 flex justify-center">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as SubjectKey)}
            className="px-6 py-3 text-lg border-2 bg-white border-[#8A3D58] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-[#8A3D58] font-semibold shadow-md"
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
          color3={config.color3}
        />
      </div>
    </div>
  );
}
