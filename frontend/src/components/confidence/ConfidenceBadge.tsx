'use client';

import React from 'react';

interface ConfidenceBadgeProps {
  label: string;
  icon?: React.ReactNode;
}

export function ConfidenceBadge({ label, icon }: ConfidenceBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#EAEAEC] rounded-full text-[9px] font-extrabold uppercase tracking-wider text-[#282C3F] shadow-3xs transition-all duration-300 hover:scale-105 hover:border-[#FF3F6C]/25 hover:text-[#FF3F6C] cursor-default select-none">
      {icon && <span className="text-gray-400 hover:text-inherit transition-colors flex items-center justify-center">{icon}</span>}
      {label}
    </span>
  );
}
