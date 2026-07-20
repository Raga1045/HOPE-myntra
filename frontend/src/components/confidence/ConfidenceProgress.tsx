'use client';

import React, { useEffect, useState } from 'react';

export function ConfidenceProgress({ percentage }: { percentage: number }) {
  const [currentPercent, setCurrentPercent] = useState(0);
  const radius = 28;
  const stroke = 4.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    // Animate the percentage count on mount
    const timer = setTimeout(() => {
      setCurrentPercent(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const strokeDashoffset = circumference - (currentPercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0 select-none">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {/* Background Circle Track */}
        <circle
          stroke="rgba(0,0,0,0.04)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Animated Progress Circle */}
        <circle
          stroke="#03A685" // Stripe/Airbnb-style emerald green
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' 
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-[10px] font-black text-[#282C3F] tracking-tighter">
        {currentPercent}%
      </div>
    </div>
  );
}
