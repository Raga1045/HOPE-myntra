'use client';

import React, { useEffect, useState } from 'react';

interface ConfidenceMetricProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'saffron' | 'blue' | 'green' | 'purple' | 'pink';
}

export function ConfidenceMetric({ label, value, icon, color }: ConfidenceMetricProps) {
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    const target = isNaN(num) ? 90 : num;
    const timer = setTimeout(() => {
      setProg(target);
    }, 150);
    return () => clearTimeout(timer);
  }, [value]);

  const colorMap = {
    saffron: {
      bg: 'bg-amber-100/60',
      fill: 'bg-gradient-to-r from-amber-400 to-amber-500',
      text: 'text-amber-600',
      border: 'hover:border-amber-250'
    },
    blue: {
      bg: 'bg-sky-100/60',
      fill: 'bg-gradient-to-r from-sky-400 to-sky-500',
      text: 'text-sky-600',
      border: 'hover:border-sky-250'
    },
    green: {
      bg: 'bg-emerald-100/60',
      fill: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-250'
    },
    purple: {
      bg: 'bg-purple-100/60',
      fill: 'bg-gradient-to-r from-purple-400 to-purple-500',
      text: 'text-purple-600',
      border: 'hover:border-purple-250'
    },
    pink: {
      bg: 'bg-pink-100/60',
      fill: 'bg-gradient-to-r from-pink-400 to-pink-500',
      text: 'text-pink-600',
      border: 'hover:border-pink-250'
    }
  };

  const scheme = colorMap[color] || colorMap.pink;

  return (
    <div className={`flex flex-col gap-2 bg-white border border-[#EAEAEC]/50 p-3 rounded-xl transition-all duration-350 hover:shadow-2xs ${scheme.border} select-none`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
          <span className={scheme.text}>{icon}</span>
          <span>{label}</span>
        </div>
        <span className="text-[11px] font-black text-[#282C3F]">{value}</span>
      </div>
      
      {/* Progress Bar */}
      <div className={`w-full h-1 rounded-full ${scheme.bg} overflow-hidden`}>
        <div 
          className={`h-full rounded-full transition-all duration-1200 cubic-bezier(0.16, 1, 0.3, 1) ${scheme.fill}`}
          style={{ width: `${Math.min(100, Math.max(0, prog))}%` }}
        />
      </div>
    </div>
  );
}
