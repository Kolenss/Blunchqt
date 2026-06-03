'use client';

import HierarchicalTable from '@/components/hierarchical-table';

export default function IndustrialPsychologyTOS() {
  return (
    <div 
      className="flex flex-col items-center bg-zinc-50 font-sans min-h-screen p-4 md:p-8 overflow-x-hidden"
      style={{ 
        backgroundImage: "url(/paperbg2.png)", 
        backgroundSize: "cover", 
        backgroundPosition: 'center', 
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-6xl">
        <h1 className="font-kaushan text-4xl md:text-5xl lg:text-6xl text-[#8A3D58] mb-6 md:mb-8 text-center">
          Industrial Psychology TOS
        </h1>

        <HierarchicalTable 
          subject="INDUSTRIAL ORGANIZATIONAL PSYCHOLOGY"
          weight="20%"
          totalItems="100 items"
          duration="3 Hours"
          color1='#4285f4'
          color2='#cfe2f3'
        />
      </div>
    </div>
  );
}
