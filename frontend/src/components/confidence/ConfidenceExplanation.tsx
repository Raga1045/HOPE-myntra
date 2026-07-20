'use client';

import React from 'react';
import { Brain } from 'lucide-react';

export function ConfidenceExplanation({ explanation }: { explanation: string }) {
  return (
    <div className="bg-[#FFF9FA] border border-[#FF3F6C]/8 rounded-xl p-3.5 flex gap-2.5 items-start">
      <div className="p-1.5 bg-[#FF3F6C]/10 rounded-lg text-[#FF3F6C] flex-shrink-0 flex items-center justify-center">
        <Brain className="w-3.5 h-3.5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-[9.5px] font-black uppercase tracking-wider text-[#FF3F6C] select-none">AI Assistant Rationale</h4>
        <p className="text-gray-500 text-[10px] leading-relaxed font-medium italic">
          "{explanation}"
        </p>
      </div>
    </div>
  );
}
