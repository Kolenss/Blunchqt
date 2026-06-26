'use client';

import { useState } from 'react';
import ScoreTable from '@/components/scoretable';

type SubjectKey = 'abnormal' | 'developmental' | 'assessment' | 'industrial';

interface SubjectConfig {
  name: string;
  endpoint: string;
  tableName: string;
  color1?: string;
  color2?: string;
  color3?: string;
}

const subjects: Record<SubjectKey, SubjectConfig> = {
  abnormal: {
    name: 'Abnormal Psychology',
    endpoint: 'abnormal_psychology_score',
    tableName: 'abnormal_psychology_score',
    color1: '#a4c2f4',
    color2: '#cfe2f3',
    color3: '#e8f1fc'
  },
  developmental: {
    name: 'Developmental Psychology',
    endpoint: 'developmental_psychology_score',
    tableName: 'developmental_psychology_score',
    color1: '#FC6c85',
    color2: '#fde4ea',
    color3: '#fde4ea'
  },
  assessment: {
    name: 'Psychological Assessment',
    endpoint: 'psychological_assessment_score',
    tableName: 'psychological_assessment_score',
    color1: '#b7d7a8',
    color2: '#d9ead3',
    color3: '#edf5e8'
  },
  industrial: {
    name: 'Industrial Psychology',
    endpoint: 'industrial_organizational_psychology_score',
    tableName: 'industrial_organizational_psychology_score',
    color1: '#fbbc04',
    color2: '#fff2cc',
    color3: '#fff9e6'
  }
};

export default function ScoresPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('abnormal');
  const config = subjects[selectedSubject];

  return (
    <div className="bg-ruled flex flex-col items-center font-sans min-h-screen p-4 md:p-8">
      <div className="w-full">
        <h1 className="font-kaushan text-4xl md:text-5xl lg:text-6xl text-black mb-6 md:mb-8 text-center">Summary Score Tracker</h1>

        {/* Subject Selector */}
        <div className="mb-6 flex justify-center">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as SubjectKey)}
            className="bg-white px-6 py-3 text-lg border-2 border-[#8A3D58] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-[#8A3D58] font-semibold shadow-md"
          >
            {Object.entries(subjects).map(([key, subject]) => (
              <option key={key} value={key}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pass key to force remount when subject changes */}
        <div className="w-full rounded-lg overflow-hidden overflow-x-auto">
          <ScoreTable 
            key={selectedSubject}
            title={config.name}
            endpoint={config.endpoint}
            tableName={config.tableName}
            color1={config.color1}
            color2={config.color2}
            color3={config.color3}
          />
        </div>
      </div>
    </div>
  );
}
