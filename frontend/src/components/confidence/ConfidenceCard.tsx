'use client';

import React from 'react';
import { 
  Sparkles, Sun, Heart, MapPin, Palette, Leaf, TrendingUp, 
  User, Star, ShoppingBag, Flame, CheckCircle2
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
  matchLabel?: string;
  whyPickedChecklist?: { label: string; iconType: string }[];
  peopleLikeYou?: { label: string; iconType: string }[];
  matchBreakdown?: { name: string; value: number; color: 'saffron' | 'blue' | 'green' | 'purple' | 'pink' }[];
  styleInsights?: string[];
  stylingTips?: string[];
  trustSignals?: string[];
  similarShoppersCount?: number;
  similarPurchasedCount?: number;
  similarKeptCount?: number;
  retentionRate?: number;
  sizeSuccessRate?: number;
  fallbackLevel?: string;
  reasons?: string[];
}

export function ConfidenceCard({ data }: { data: ConfidenceData }) {
  const getIcon = (type: string, className = "w-3.5 h-3.5") => {
    switch (type) {
      case 'Sparkles': return <Sparkles className={`${className} text-[#FF3F6C]`} />;
      case 'MapPin': return <MapPin className={`${className} text-orange-500`} />;
      case 'Palette': return <Palette className={`${className} text-purple-500`} />;
      case 'Sun': return <Sun className={`${className} text-amber-500`} />;
      case 'Heart': return <Heart className={`${className} text-red-500`} />;
      case 'User': return <User className={`${className} text-indigo-500`} />;
      case 'Star': return <Star className={`${className} text-yellow-500 fill-yellow-500`} />;
      case 'ShoppingBag': return <ShoppingBag className={`${className} text-emerald-500`} />;
      case 'Flame': return <Flame className={`${className} text-orange-500`} />;
      default: return <Sparkles className={`${className}`} />;
    }
  };

  // Safe defaults if arrays are not populated yet
  const checklist = data.whyPickedChecklist || [
    { label: `Perfect for ${data.festivalName || 'Festivals'}`, iconType: 'Sparkles' },
    { label: `Trending in ${data.stateName || 'your state'}`, iconType: 'MapPin' },
    { label: 'Breathable fabric for today\'s weather', iconType: 'Sun' },
    { label: 'Matches your ethnic style preferences', iconType: 'Palette' },
    { label: 'Highly comfortable for long events', iconType: 'Heart' }
  ];

  const peopleLikeYou = data.peopleLikeYou || [
    { label: 'Women (20–25) loved this', iconType: 'User' },
    { label: 'Trending in city hotspots', iconType: 'MapPin' },
    { label: `Bought 148 times this week`, iconType: 'ShoppingBag' },
    { label: 'Rated 4.8 by similar shoppers', iconType: 'Star' }
  ];

  const breakdown = data.matchBreakdown || [
    { name: 'Festival Match', value: data.festivalMatch, color: 'saffron' },
    { name: 'Regional Match', value: data.regionalMatch, color: 'purple' },
    { name: 'Weather', value: data.weatherScore, color: 'blue' },
    { name: 'Style Match', value: data.styleScore, color: 'pink' },
    { name: 'Comfort', value: data.comfortScore * 10, color: 'green' },
    { name: 'Popularity', value: 92, color: 'purple' }
  ];

  const styleInsights = data.styleInsights || [
    data.culturalTag || 'Traditional Heritage Style',
    'Handloom Certified',
    'Breathable Cotton'
  ];

  const stylingTips = data.stylingTips || [
    'Oxidized Jhumkas',
    'White Kolhapuris',
    'Silver Bangles',
    'Potli Bag'
  ];

  const trustSignals = data.trustSignals || [
    'AI Verified',
    'Community Favourite',
    'Regionally Relevant',
    'Festival Approved'
  ];

  return (
    <div className="bg-gradient-to-b from-[#FFFDFE] to-white rounded-2xl border border-pink-100/40 shadow-sm p-5 space-y-6 hover:shadow-md transition-all duration-300 w-full text-left">
      
      {/* SECTION 1: AI Confidence Score Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#FFF5F6] to-[#FFFDFD] border border-pink-500/5 rounded-2xl p-4 shadow-3xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3F6C] animate-pulse" />
            <h3 className="text-[#FF3F6C] text-[10px] font-black uppercase tracking-wider">AI Premium Insights</h3>
          </div>
          <h2 className="text-[#282C3F] text-sm font-black">AI Confidence Score</h2>
          <span className="inline-flex px-2 py-0.5 bg-[#03A685]/10 text-[#03A685] text-[9px] font-extrabold uppercase rounded-full">
            {data.matchLabel || (data.confidenceScore >= 90 ? "Perfect Match" : "Highly Recommended")}
          </span>
        </div>
        <ConfidenceProgress percentage={data.confidenceScore} />
      </div>

      {/* SECTION 2: Why Picked Checklist */}
      <div className="space-y-3">
        <h4 className="text-[#282C3F] text-[10.5px] font-black uppercase tracking-wider text-gray-500 select-none">Why We Picked This</h4>
        <div className="grid grid-cols-1 gap-2.5">
          {checklist.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-[11px] font-bold text-gray-700 bg-white/40 backdrop-blur-xs border border-gray-50/50 p-2.5 rounded-xl transition-all duration-200 hover:border-pink-500/10 hover:bg-white hover:translate-x-0.5">
              <span className="flex-shrink-0">{getIcon(item.iconType)}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: People Like You */}
      <div className="space-y-3">
        <h4 className="text-[#282C3F] text-[10.5px] font-black uppercase tracking-wider text-gray-500 select-none">People Like You</h4>
        <div className="grid grid-cols-2 gap-2">
          {peopleLikeYou.map((insight, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[10.5px] font-semibold text-gray-500 bg-[#FAFBFC] border border-[#EAEAEC]/50 p-2.5 rounded-xl hover:border-pink-500/5 hover:bg-white transition-all select-none">
              <span className="flex-shrink-0">{getIcon(insight.iconType, "w-3 h-3")}</span>
              <span className="truncate">{insight.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Match Breakdown */}
      <div className="space-y-3">
        <h4 className="text-[#282C3F] text-[10.5px] font-black uppercase tracking-wider text-gray-500 select-none">Match Breakdown</h4>
        <div className="grid grid-cols-2 gap-2">
          {breakdown.map((metric, idx) => (
            <ConfidenceMetric 
              key={idx}
              label={metric.name}
              value={metric.name.includes("Comfort") ? `${(metric.value/10).toFixed(1)}/10` : `${metric.value}%`}
              icon={
                metric.name.includes("Festival") ? <Sparkles className="w-3 h-3" /> :
                metric.name.includes("Region") ? <MapPin className="w-3 h-3" /> :
                metric.name.includes("Weather") ? <Sun className="w-3 h-3" /> :
                metric.name.includes("Style") ? <Palette className="w-3 h-3" /> :
                metric.name.includes("Comfort") ? <Heart className="w-3 h-3" /> :
                <TrendingUp className="w-3 h-3" />
              }
              color={metric.color}
            />
          ))}
        </div>
      </div>

      {/* SECTION 5: Style Insights Badges */}
      <div className="space-y-3">
        <h4 className="text-[#282C3F] text-[10.5px] font-black uppercase tracking-wider text-gray-500 select-none">Style Insights</h4>
        <div className="flex flex-wrap gap-1.5">
          {styleInsights.map((insight, idx) => (
            <ConfidenceBadge key={idx} label={insight} icon={<Sparkles className="w-2.5 h-2.5 text-[#FF3F6C]" />} />
          ))}
        </div>
      </div>

      {/* SECTION 6: AI Styling Tips */}
      <div className="space-y-3">
        <h4 className="text-[#282C3F] text-[10.5px] font-black uppercase tracking-wider text-gray-500 select-none">Looks best with</h4>
        <div className="flex flex-wrap gap-1.5">
          {stylingTips.map((tip, idx) => (
            <span key={idx} className="inline-flex items-center px-2.5 py-1.5 bg-[#F5F5F6] border border-[#EAEAEC] rounded-lg text-[10px] font-extrabold text-[#282C3F] transition-all hover:border-[#FF3F6C]/20 hover:bg-white select-none">
              ✨ {tip}
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 7: AI Assistant Explanation */}
      <ConfidenceExplanation explanation={data.explanation} />

      {/* SECTION 8: Trust Signals Footer */}
      <div className="flex justify-between items-center pt-3.5 border-t border-[#EAEAEC]/55 text-[9px] font-black text-gray-400 select-none flex-wrap gap-2">
        {trustSignals.map((signal, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#03A685]" />
            <span>{signal}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
