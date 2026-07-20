'use client';

import React from 'react';

interface ConfidenceMetricProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export function ConfidenceMetric({ label, value, icon }: ConfidenceMetricProps) {
  return (
    <div className="flex items-center justify-between text-[10.5px] font-bold text-gray-500 bg-[#FAFBFC] border border-[#EAEAEC]/60 px-3 py-2 rounded-xl transition-all duration-200 hover:border-gray-300/80 hover:bg-white hover:shadow-2xs select-none">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 flex items-center justify-center">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="text-[#282C3F] font-black">{value}</span>
    </div>
  );
}
