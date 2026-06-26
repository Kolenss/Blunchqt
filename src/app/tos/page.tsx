'use client';

import { useState } from 'react';
import HierarchicalTable from '@/components/hierarchical-table';

type SubjectKey = 'abnormal' | 'developmental' | 'assessment' | 'industrial';

interface SubjectConfig {
  name: string;
  subject: string;
  weight: string;
  totalItems: string;
  duration: string;
  color1: string;
  color2: string;
  color3: string;
}

const subjects: Record<SubjectKey, SubjectConfig> = {
  abnormal: {
    name: 'Abnormal Psychology',
    subject: 'ABNORMAL PSYCHOLOGY',
    weight: '20%',
    totalItems: '100 items',
    duration: '3 Hours',
    color1: '#a4c2f4',
    color2: '#cfe2f3',
    color3: '#e8f1fc'
  },
  developmental: {
    name: 'Developmental Psychology',
    subject: 'DEVELOPMENTAL PSYCHOLOGY',
    weight: '20%',
    totalItems: '100 items',
    duration: '3 Hours',
    color1: '#FC6c85',
    color2: '#FC8EAC',
    color3: '#fde4ea'
  },
  assessment: {
    name: 'Psychology Assessment',
    subject: 'PSYCHOLOGICAL ASSESSMENT',
    weight: '20%',
    totalItems: '100 items',
    duration: '3 Hours',
    color1: '#b7d7a8',
    color2: '#d9ead3',
    color3: '#edf5e8'
  },
  industrial: {
    name: 'Industrial Psychology',
    subject: 'INDUSTRIAL ORGANIZATIONAL PSYCHOLOGY',
    weight: '20%',
    totalItems: '100 items',
    duration: '3 Hours',
    color1: '#fbbc04',
    color2: '#fff2cc',
    color3: '#fff9e6'
  }
};

export default function TOSPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('abnormal');
  const config = subjects[selectedSubject];

  return (
    <div className="bg-ruled flex flex-col items-center font-sans min-h-screen p-4 md:p-8 overflow-x-hidden">
      <div className="w-full max-w-6xl">
        <h1 className="font-kaushan text-4xl md:text-5xl lg:text-6xl text-[#8A3D58] mb-6 md:mb-8 text-center">
          TOS Summary
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

        <HierarchicalTable 
          subject={config.subject}
          weight={config.weight}
          totalItems={config.totalItems}
          duration={config.duration}
          color1={config.color1}
          color2={config.color2}
          color3={config.color3}
        />
      </div>
    </div>
  );
}
