'use client';

interface TableSkeletonProps {
  title: string;
  headers: string[];
  rows?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  showSummary?: boolean;
}

function SkeletonBar({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-gray-200 ${className}`}>
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}

export default function TableSkeleton({
  title,
  headers,
  rows = 8,
  color1,
  color2,
  color3,
  showSummary = false,
}: TableSkeletonProps) {
  return (
    <div>
      <div className="w-full rounded-lg shadow-md overflow-hidden">
        <table className="w-full border border-black">
          <thead>
            <tr style={{ backgroundColor: color1 || '#fbbc04' }}>
              <th
                colSpan={headers.length}
                className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-base md:text-lg"
              >
                {title}
              </th>
            </tr>
            <tr style={{ backgroundColor: color2 || '#fff2cc' }}>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-2 md:px-6 py-2 md:py-4 text-center font-semibold text-black text-xs md:text-base"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr
                key={i}
                className="border-b"
                style={{ backgroundColor: i % 2 === 0 ? (color3 || '#f9fafb') : 'white' }}
              >
                {headers.map((_, j) => (
                  <td key={j} className="px-2 md:px-6 py-3 md:py-4">
                    <SkeletonBar
                      className={j === 0 ? 'h-4 w-3/4' : 'h-4 w-10 mx-auto'}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showSummary && (
        <div className="mt-6 md:mt-8 w-full rounded-lg shadow-md p-4 md:p-6 bg-zinc-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="w-full md:flex-1 space-y-3">
              <SkeletonBar className="h-6 w-32" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-3/4" />
              <SkeletonBar className="h-4 w-3/4" />
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 md:w-[200px] md:h-[200px] rounded-full overflow-hidden">
                <div className="absolute inset-0 rounded-full border-[20px] md:border-[40px] border-gray-200" />
                <div className="absolute inset-0 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
