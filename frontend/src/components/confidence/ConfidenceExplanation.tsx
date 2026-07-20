'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export function ConfidenceExplanation({ explanation }: { explanation: string }) {
  return (
    <div className="relative bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFFDFD] border border-[#FF3F6C]/10 rounded-2xl p-4 flex gap-3.5 items-start shadow-2xs overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-pink-100/20 blur-xl pointer-events-none" />
      
      <div className="p-2.5 bg-gradient-to-tr from-[#FF3F6C] to-[#FF527B] rounded-xl text-white flex-shrink-0 flex items-center justify-center shadow-xs">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-[#FF3F6C] select-none">AI Assistant Explanation</h4>
        <p className="text-gray-600 text-[10.5px] leading-relaxed font-semibold italic">
          "{explanation}"
        </p>
      </div>
    </div>
  );
}
