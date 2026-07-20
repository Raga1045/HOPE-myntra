'use client';

import React from 'react';

interface ConfidenceBadgeProps {
  label: string;
  icon?: React.ReactNode;
}

export function ConfidenceBadge({ label, icon }: ConfidenceBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F6] border border-[#FF3F6C]/10 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-[#FF3F6C] shadow-4xs transition-all duration-350 hover:scale-105 hover:bg-[#FF3F6C] hover:text-white cursor-default select-none">
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {label}
    </span>
  );
}
