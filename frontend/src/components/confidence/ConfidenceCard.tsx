'use client';

import React from 'react';
import { 
  Sparkles, Sun, Heart, MapPin, Palette, Leaf, TrendingUp 
} from 'lucide-react';
import { ConfidenceProgress } from './ConfidenceProgress';
import { ConfidenceMetric } from './ConfidenceMetric';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ConfidenceExplanation } from './ConfidenceExplanation';

export interface ConfidenceData {
  festivalMatch: number;
  regionalMatch: number;
  weatherScore: number;
  comfortScore: number;
  styleScore: number;
  confidenceScore: number;
  culturalTag: string;
  badges: string[];
  explanation: string;
  festivalName: string;
  stateName: string;
}

export function ConfidenceCard({ data }: { data: ConfidenceData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(40,44,63,0.04)] overflow-hidden w-full text-left flex flex-col divide-y divide-gray-50/70 hover:shadow-[0_12px_32px_rgba(40,44,63,0.07)] transition-all duration-300">
      
      {/* Header section with radial progress */}
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF3F6C]" />
            <h3 className="text-[#282C3F] text-[11px] font-black uppercase tracking-wider">Confidence Card</h3>
          </div>
          <p className="text-gray-400 text-[9.5px] font-bold">Why this outfit is perfect for you.</p>
        </div>
        <ConfidenceProgress percentage={data.confidenceScore} />
      </div>

      {/* Highlights Checkmarks */}
      <div className="p-4 space-y-1.5 bg-[#FAFBFC]/30 select-none">
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-600">
          <span className="text-[#03A685] font-black text-xs">✔</span> Perfect for {data.festivalName}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-600">
          <span className="text-[#03A685] font-black text-xs">✔</span> Trending in {data.stateName}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-600">
          <span className="text-[#03A685] font-black text-xs">✔</span> Breathable Fabric for Current Weather
        </div>
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-600">
          <span className="text-[#03A685] font-black text-xs">✔</span> Matches Your Style Preference
        </div>
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-600">
          <span className="text-[#03A685] font-black text-xs">✔</span> Excellent Comfort Rating
        </div>
      </div>

      {/* Numerical Metrics grid */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <ConfidenceMetric 
          label="Festival Match" 
          value={`${data.festivalMatch}%`} 
          icon={<Sparkles className="w-3 h-3" />} 
        />
        <ConfidenceMetric 
          label="Regional Match" 
          value={`${data.regionalMatch}%`} 
          icon={<MapPin className="w-3 h-3" />} 
        />
        <ConfidenceMetric 
          label="Weather" 
          value={`${data.weatherScore}%`} 
          icon={<Sun className="w-3 h-3" />} 
        />
        <ConfidenceMetric 
          label="Comfort" 
          value={`${data.comfortScore}/10`} 
          icon={<Heart className="w-3 h-3" />} 
        />
        <ConfidenceMetric 
          label="Style" 
          value={`${data.styleScore}%`} 
          icon={<Palette className="w-3 h-3" />} 
        />
        <ConfidenceMetric 
          label="Popularity" 
          value="High" 
          icon={<TrendingUp className="w-3 h-3" />} 
        />
      </div>

      {/* Certification Badges */}
      <div className="p-4 flex flex-wrap gap-1.5 items-center">
        <ConfidenceBadge label={data.culturalTag} icon={<MapPin className="w-2.5 h-2.5" />} />
        {data.badges.map((b, i) => (
          <ConfidenceBadge key={i} label={b} icon={<Leaf className="w-2.5 h-2.5 text-[#03A685]" />} />
        ))}
      </div>

      {/* AI Assistant Explanation summary */}
      <div className="p-4 bg-[#FAFBFC]/30">
        <ConfidenceExplanation explanation={data.explanation} />
      </div>
    </div>
  );
}
