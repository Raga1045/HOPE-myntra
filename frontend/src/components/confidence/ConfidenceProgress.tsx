'use client';

import React, { useEffect, useState } from 'react';

export function ConfidenceProgress({ percentage }: { percentage: number }) {
  const [currentPercent, setCurrentPercent] = useState(0);
  const radius = 32;
  const stroke = 5.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPercent(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const strokeDashoffset = circumference - (currentPercent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center flex-shrink-0 select-none">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <defs>
          <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3F6C" />
            <stop offset="100%" stopColor="#FF527B" />
          </linearGradient>
        </defs>
        {/* Background Circle Track */}
        <circle
          stroke="#F5F5F6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Animated Gradient Circle */}
        <circle
          stroke="url(#pinkGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)' 
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[12px] font-black text-[#282C3F] tracking-tighter">
          {currentPercent}%
        </span>
      </div>
    </div>
  );
}
