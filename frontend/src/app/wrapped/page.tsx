'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Share2, Sparkles, 
  ShoppingBag, CheckCircle2, TrendingUp, Award, Palette
} from 'lucide-react';
import { RootState } from '@/store/store';
import { generateStyleInsights, StyleInsights } from './wrappedDemoData';

// Custom Counter component for Year in Numbers card
const Counter = ({ value, prefix = "", suffix = "", duration = 1.2 }: { value: number; prefix?: string; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    
    const totalMs = duration * 1000;
    const step = Math.ceil(end / 40); // 40 steps of animation
    const incrementTime = Math.max(12, Math.floor(totalMs / 40));
    
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
};

// Confetti particle effect component using pure Framer Motion
const Confetti = () => {
  const pieces = Array.from({ length: 90 });
  const colors = ["#FF3F6C", "#03A685", "#FFB400", "#9C4DFF", "#FF6AA2", "#3B82F6"];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((_, i) => {
        const x = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const duration = Math.random() * 2.0 + 1.6;
        const size = Math.random() * 8 + 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = Math.random() > 0.5 ? "rounded-full" : "rotate-45";
        
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${x}%`, opacity: 1, rotate: 0 }}
            animate={{ 
              y: "110vh", 
              rotate: Math.random() * 360 + 180,
              opacity: [1, 1, 0.7, 0] 
            }}
            transition={{
              duration,
              delay,
              ease: "linear",
              repeat: Infinity
            }}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: color,
            }}
            className={shape}
          />
        );
      })}
    </div>
  );
};

export default function MyntraWrapped() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.session.user);
  
  const [insights, setInsights] = useState<StyleInsights | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const SLIDE_DURATION = 8000; // 6 seconds per slide
  const totalSlides = 8; // 1 Welcome slide + 7 Card slides
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Generate style insights based on currently logged-in user name/email mapping
    const userInsights = generateStyleInsights(user.email || "", user.name || "");
    setInsights(userInsights);
    setIsLoading(false);
  }, [user, router]);

  // Story Autoplayer Loop
  useEffect(() => {
    if (isLoading || isPaused || !insights) return;

    setProgress(0);
    const stepTime = 40;
    const totalSteps = SLIDE_DURATION / stepTime;
    let currentStep = 0;

    progressInterval.current = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / totalSteps) * 100;
      setProgress(currentProgress);

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval.current!);
        handleNextSlide();
      }
    }, stepTime);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentSlide, isLoading, isPaused, insights]);

  const handleNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.push('/home');
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleSlideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width * 0.3) {
      handlePrevSlide();
    } else {
      handleNextSlide();
    }
  };

  const handleShare = () => {
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  if (isLoading || !insights) {
    return (
      <div className="fixed inset-0 bg-[#0c0d12] flex flex-col justify-center items-center gap-4 z-50">
        <div className="w-12 h-12 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-white text-xs font-black uppercase tracking-widest">Style Intelligence Engine</p>
          <p className="text-gray-400 text-[10px] font-bold">Assembling style history vector...</p>
        </div>
      </div>
    );
  }

  // Visual helpers based on derived theme
  const theme = {
    cardBg: `bg-gradient-to-b ${insights.palette.gradient}`,
    textAccent: insights.styleDNA.archetype.includes("Streetwear") ? "text-[#39FF14]" : "text-[#E6C587]",
    textAccentMuted: insights.styleDNA.archetype.includes("Streetwear") ? "text-[#39FF14]/80" : "text-[#E6C587]/80",
    badgeBg: insights.styleDNA.archetype.includes("Streetwear") 
      ? "bg-green-500/10 border-green-500/30 text-green-300" 
      : "bg-amber-400/10 border-amber-400/30 text-amber-300",
    glow: insights.styleDNA.archetype.includes("Streetwear")
      ? "shadow-[0_20px_50px_rgba(57,255,20,0.06)]"
      : "shadow-[0_20px_50px_rgba(230,197,135,0.06)]"
  };

  // Rendering distinct shapes for the DNA slide
  const renderDNAShape = () => {
    if (insights.styleDNA.archetype.includes("Streetwear")) {
      return (
        <div className="relative w-40 h-40 flex items-center justify-center">
          <motion.div 
            animate={{ rotateX: 360, rotateY: 180 }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
            className="absolute w-36 h-36 border-2 border-green-500/25 rounded-full"
          />
          <motion.div 
            animate={{ rotateX: 180, rotateY: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            className="absolute w-36 h-20 border border-cyan-400/25 rounded-full"
          />
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-green-500/10 to-transparent flex items-center justify-center backdrop-blur-md border border-green-400/35 shadow-2xl">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative w-40 h-40 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            className="absolute w-36 h-36 border border-amber-400/20 rounded-full border-dashed"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 18, ease: "linear", repeat: Infinity }}
            className="absolute w-28 h-28 border border-[#FF3F6C]/20 rounded-full"
          />
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/10 to-transparent flex items-center justify-center backdrop-blur-md border border-amber-400/30 shadow-2xl">
            <Sparkles className="w-8 h-8 text-amber-300" />
          </div>
        </div>
      );
    }
  };

  const slides = [
    // SLIDE 0: Welcome Screen (✨ Your Fashion Journey 2026)
    (
      <div className={`relative flex flex-col items-center justify-between h-full p-8 text-center text-white ${theme.cardBg} overflow-hidden`}>
        {/* Decorative background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#FF3F6C]/5 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[90px] pointer-events-none" />
        
        <div className="pt-24 space-y-2 z-10">
          <span className="px-3.5 py-1 bg-white/5 border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xs">
            Myntra Wrapped 2026
          </span>
        </div>

        <div className="my-auto flex flex-col items-center space-y-6 z-10">
          <motion.div
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1.2, bounce: 0.4 }}
            className={`w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl ${theme.glow}`}
          >
            <Sparkles className={`w-12 h-12 ${theme.textAccent}`} />
          </motion.div>
          
          <div className="space-y-2.5">
            <h1 className="text-3.5xl sm:text-4xl font-black tracking-tight uppercase leading-none drop-shadow-md">
              ✨ Your Fashion<br />Journey 2026
            </h1>
            <p className="text-gray-400 text-xs font-semibold tracking-wide">
              Every outfit tells a story. This is yours.
            </p>
          </div>
        </div>

        <div className="pb-16 z-10 w-full">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
            className={`w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl cursor-pointer ${
              insights.styleDNA.archetype.includes("Streetwear")
                ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-gray-950 shadow-green-500/10'
                : 'bg-gradient-to-r from-[#FF3F6C] to-[#E6C587] text-white shadow-pink-500/10'
            }`}
          >
            Let's relive your style story
          </motion.button>
        </div>
      </div>
    ),

    // SLIDE 1: Style DNA (Card 1)
    (
      <div className={`relative flex flex-col items-center justify-between h-full p-8 text-center text-white ${theme.cardBg} overflow-hidden`}>
        <div className="pt-24 z-10">
          <span className={`px-3 py-1 ${theme.badgeBg} border text-[9px] font-black uppercase tracking-widest rounded-full`}>
            AI Style DNA
          </span>
        </div>

        <div className="my-auto space-y-6 z-10 flex flex-col items-center w-full">
          {renderDNAShape()}
          
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Identity Archetype</span>
            <h1 className={`text-2.5xl font-black uppercase tracking-tight leading-none ${theme.textAccent}`}>
              {insights.styleDNA.archetype}
            </h1>
            <div className="flex gap-1.5 justify-center flex-wrap pt-2">
              {insights.styleDNA.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-extrabold text-gray-300 uppercase tracking-wide">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="px-4 py-2.5 border-l border-white/20 bg-white/2 backdrop-blur-xs text-left max-w-[260px]">
            <p className="text-[11px] text-gray-400 font-bold italic leading-relaxed">
              "{insights.styleDNA.quote}"
            </p>
          </div>
        </div>

        <div className="pb-16 z-10 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            Confidence index: <span className={theme.textAccent}>{insights.styleDNA.confidence}%</span>
          </p>
        </div>
      </div>
    ),

    // SLIDE 2: Signature Palette (Card 2)
    (
      <div className={`relative flex flex-col items-center justify-between h-full p-8 text-center text-white ${theme.cardBg} overflow-hidden`}>
        <div className="pt-24 z-10">
          <span className={`px-3 py-1 ${theme.badgeBg} border text-[9px] font-black uppercase tracking-widest rounded-full`}>
            Signature Color Palette
          </span>
        </div>

        <div className="my-auto space-y-7 z-10 w-full flex flex-col items-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <motion.div
              animate={{ 
                borderRadius: ["42% 58% 70% 30% / 45% 45% 55% 55%", "70% 30% 52% 48% / 60% 40% 60% 40%", "42% 58% 70% 30% / 45% 45% 55% 55%"],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className={`absolute w-32 h-32 bg-gradient-to-tr ${insights.palette.gradient} opacity-50 blur-md`}
            />
            <div className="absolute inset-0 flex gap-2.5 items-center justify-center">
              {insights.palette.colors.map(color => (
                <div key={color} className="flex flex-col items-center gap-1.5">
                  <div 
                    style={{ backgroundColor: color.toLowerCase() === 'ivory' ? '#FDFBF7' : (color.toLowerCase() === 'maroon' ? '#800020' : (color.toLowerCase() === 'gold' ? '#D4AF37' : color.toLowerCase())) }}
                    className="w-8 h-8 rounded-full border border-white/20 shadow-md" 
                  />
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-300">{color}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 select-none text-center">
            <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Top Wardrobe Tones</h2>
            <p className="text-xs font-semibold leading-relaxed max-w-[240px] mx-auto text-gray-300">
              {insights.palette.quote}
            </p>
          </div>
        </div>

        <div className="pb-16 z-10 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Liquid morphing color model
        </div>
      </div>
    ),

    // SLIDE 3: Celebration Journey (Card 3)
    (
      <div className={`relative flex flex-col items-center justify-between h-full p-8 text-center text-white ${theme.cardBg} overflow-hidden`}>
        <div className="pt-24 z-10">
          <span className={`px-3 py-1 ${theme.badgeBg} border text-[9px] font-black uppercase tracking-widest rounded-full`}>
            Celebration Journey
          </span>
        </div>

        <div className="my-auto space-y-6 z-10 w-full text-left px-4">
          <div className="space-y-1 text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Favourite Occasion</span>
            <h1 className={`text-2.5xl font-black uppercase tracking-tight ${theme.textAccent}`}>
              {insights.celebration.favourite}
            </h1>
          </div>

          {/* Timeline Tree */}
          <div className="relative pl-6 border-l border-white/10 space-y-4 py-2 max-w-[280px] mx-auto text-xs font-bold text-gray-300">
            {insights.celebration.timeline.map((event, idx) => (
              <div key={event} className="relative">
                <span className={`absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full border border-white/30 ${
                  event === insights.celebration.favourite ? (insights.styleDNA.archetype.includes("Streetwear") ? 'bg-green-400' : 'bg-amber-400') : 'bg-gray-800'
                }`} />
                <h4 className="font-extrabold text-white text-[11px] tracking-wide uppercase">{event}</h4>
                <p className="text-[9.5px] text-gray-400">Outfit: {insights.celebration.items[idx] || "Signature Selection"}</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-center italic text-gray-400 max-w-[240px] mx-auto font-semibold pt-1">
            "{insights.celebration.quote}"
          </p>
        </div>

        <div className="pb-16 z-10 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Occasion highlights engine
        </div>
      </div>
    ),

    // SLIDE 4: Brand Chemistry (Card 4)
    (
      <div className={`relative flex flex-col items-center justify-between h-full p-8 text-center text-white ${theme.cardBg} overflow-hidden`}>
        <div className="pt-24 z-10">
          <span className={`px-3 py-1 ${theme.badgeBg} border text-[9px] font-black uppercase tracking-widest rounded-full`}>
            Brand Chemistry
          </span>
        </div>

        <div className="my-auto space-y-5 z-10 w-full flex flex-col items-center">
          <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Top Styling Partners</h2>
          
          <div className="space-y-3.5 w-full max-w-[280px]">
            {insights.brands.map((brand, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.12 }}
                key={brand.name}
                className="p-3.5 bg-white/3 backdrop-blur-xs border border-white/5 rounded-2xl flex justify-between items-center gap-3 shadow-xs"
              >
                <div className="text-left space-y-0.5 max-w-[170px]">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wide">{brand.name}</h4>
                  <p className="text-[9px] text-gray-400 leading-snug">{brand.reason}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[12px] font-black tracking-tight ${theme.textAccent}`}>{brand.compatibility}%</span>
                  <span className="block text-[7px] text-gray-500 font-extrabold uppercase">Match</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pb-16 z-10 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Compatibility index matrices
        </div>
      </div>
    ),

    // SLIDE 5: Year in Numbers (Card 5)
    (
      <div className={`relative flex flex-col items-center justify-between h-full p-8 text-center text-white ${theme.cardBg} overflow-hidden`}>
        <div className="pt-24 z-10">
          <span className={`px-3 py-1 ${theme.badgeBg} border text-[9px] font-black uppercase tracking-widest rounded-full`}>
            Year in Numbers
          </span>
        </div>

        <div className="my-auto space-y-6 z-10 w-full text-left px-4">
          <div className="grid grid-cols-2 gap-4 max-w-[300px] mx-auto">
            <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-1.5">
              <span className={`text-3.5xl font-black tracking-tighter ${theme.textAccent} block leading-none`}>
                <Counter value={insights.metrics.orders} />
              </span>
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-tight">Completed Orders</p>
            </div>
            
            <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-1.5">
              <span className={`text-2.5xl font-black tracking-tight ${theme.textAccent} block leading-none`}>
                <Counter value={Math.floor(insights.metrics.investment / 100)} prefix="₹" suffix="00" />
              </span>
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-tight">Style Investment</p>
            </div>

            <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-1.5">
              <span className={`text-3.5xl font-black tracking-tighter ${theme.textAccent} block leading-none`}>
                <Counter value={insights.metrics.categories} />
              </span>
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-tight">Categories Explored</p>
            </div>

            <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-1.5">
              <span className={`text-3.5xl font-black tracking-tighter ${theme.textAccent} block leading-none`}>
                <Counter value={insights.metrics.brands} />
              </span>
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-tight">Brands Explored</p>
            </div>
          </div>
        </div>

        <div className="pb-16 z-10 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Animated portfolio parameters
        </div>
      </div>
    ),

    // SLIDE 6: Fashion Highlights (Card 6)
    (
      <div className={`relative flex flex-col items-center justify-between h-full p-8 text-center text-white ${theme.cardBg} overflow-hidden`}>
        <div className="pt-24 z-10">
          <span className={`px-3 py-1 ${theme.badgeBg} border text-[9px] font-black uppercase tracking-widest rounded-full`}>
            Fashion Highlights
          </span>
        </div>

        <div className="my-auto space-y-6 z-10 w-full text-left max-w-[280px] mx-auto">
          {/* Highlight metrics */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Favorite Silhouette</span>
              <span className={`text-xs font-black uppercase tracking-wide ${theme.textAccent}`}>
                {insights.highlights.silhouette}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Favorite Aesthetic</span>
              <span className={`text-xs font-black uppercase tracking-wide ${theme.textAccent}`}>
                {insights.highlights.aesthetic}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Most Loved Collection</span>
              <span className={`text-xs font-black uppercase tracking-wide ${theme.textAccent}`}>
                {insights.highlights.collection}
              </span>
            </div>
          </div>

          {/* Style evolution connector */}
          <div className="pt-3">
            <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest block mb-2">Style Evolution Path</span>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-300 uppercase">
              {insights.highlights.evolution.map((stage, i) => (
                <React.Fragment key={stage}>
                  <span className={i === insights.highlights.evolution.length - 1 ? theme.textAccent : 'text-gray-300'}>{stage}</span>
                  {i < insights.highlights.evolution.length - 1 && <span className="text-gray-600">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="pb-16 z-10 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Personal silhouette profile
        </div>
      </div>
    ),

    // SLIDE 7: Summary Card (Card 7)
    (
      <div className={`relative flex flex-col items-center justify-between h-full p-8 text-center text-white ${theme.cardBg} overflow-hidden`}>
        {/* Confetti Trigger */}
        <Confetti />

        <div className="pt-20 text-center w-full z-10 space-y-1">
          <p className={`text-[10px] font-black uppercase tracking-widest ${theme.textAccent}`}>Your Fashion Story</p>
          <h2 className="text-white text-xs font-semibold">2026 Wrapped Summary</h2>
        </div>

        {/* Instax Card Frame */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[280px] bg-[#FFFFFF] text-[#282C3F] rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          {/* Card Border gradient accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            insights.styleDNA.archetype.includes("Streetwear") ? 'from-green-500 to-cyan-500' : 'from-amber-400 to-[#FF3F6C]'
          }`} />

          {/* Logo header */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
            <span className="text-[9px] font-black tracking-tight text-gray-800 uppercase">MYNTRA WRAPPED 2026</span>
            <div className="w-4.5 h-4.5 bg-[#FF3F6C] rounded flex items-center justify-center text-white text-[9px] font-black font-mono">M</div>
          </div>

          {/* Summary Narrative */}
          <div className="my-auto py-3 text-left space-y-2.5">
            <div className="space-y-0.5">
              <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wide">Identity DNA</span>
              <h2 className="text-[#FF3F6C] text-[15px] font-black uppercase tracking-tight leading-none">
                {insights.styleDNA.archetype}
              </h2>
            </div>
            
            <p className="text-[10px] text-gray-600 font-bold leading-relaxed">
              {insights.story}
            </p>

            {/* Badges */}
            <div className="flex gap-1 flex-wrap pt-1.5">
              {insights.metrics.badges.map(badge => (
                <span key={badge} className="px-1.5 py-0.5 bg-pink-50 border border-pink-100 text-[#FF3F6C] text-[7.5px] font-black rounded uppercase">
                  ★ {badge}
                </span>
              ))}
            </div>
          </div>

          {/* User profile footer */}
          <div className="flex items-center gap-2 border-t border-gray-100 pt-2.5">
            <div className="w-6.5 h-6.5 bg-pink-100 rounded-full flex items-center justify-center text-[#FF3F6C] text-[10px] font-black">
              {(user?.name || "Guest").slice(0, 2).toUpperCase()}
            </div>
            <div className="text-[8.5px] leading-tight text-left">
              <p className="font-black text-gray-800">{user?.name || "Guest"}</p>
              <p className="text-gray-400">@myntra_story_2026</p>
            </div>
          </div>
        </motion.div>

        {/* Share buttons */}
        <div className="space-y-2.5 w-full pb-4 z-10 px-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className={`w-full py-3 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase tracking-wider ${
              insights.styleDNA.archetype.includes("Streetwear") ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-gray-950 shadow-green-500/10' : 'bg-gradient-to-r from-[#FF3F6C] to-[#E6C587] shadow-pink-500/10'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> SHARE INSTAGRAM STORY
          </motion.button>
          
          <button
            onClick={() => router.push('/home')}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-bold rounded-xl transition-colors cursor-pointer"
          >
            See you in Wrapped 2027
          </button>
        </div>

        {/* Share Toast */}
        <AnimatePresence>
          {shareSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 bg-white text-[#282C3F] text-xs font-bold px-4 py-3 rounded-full border border-gray-100 shadow-2xl flex items-center gap-2 z-55"
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-[#03A685]" /> Shared to Instagram Story!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B10] flex items-center justify-center select-none font-sans overflow-hidden">
      {/* Main Story Container Frame */}
      <div className="relative w-full max-w-[420px] h-full sm:h-[88vh] sm:rounded-2xl sm:border border-white/10 overflow-hidden shadow-2xl bg-black flex flex-col justify-between">
        
        {/* 1. TOP PROGRESS INDICATORS */}
        <div className="absolute top-4 left-0 right-0 z-40 px-3 flex gap-1">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            let slideProgress = 0;
            if (idx < currentSlide) slideProgress = 100;
            else if (idx === currentSlide) slideProgress = progress;
            
            return (
              <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-[40ms]" 
                  style={{ width: `${slideProgress}%` }}
                />
              </div>
            );
          })}
        </div>
 
        {/* 2. HEADER BAR (Close Button) */}
        <div className="absolute top-8 left-0 right-0 z-40 px-4 flex justify-between items-center text-white/80">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#FF3F6C] px-2 py-0.5 rounded text-white shadow-xs animate-pulse">
              AI Wrapped
            </span>
          </div>
          <button 
            onClick={() => router.push('/home')}
            className="p-1 rounded-full bg-black/40 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3. SLIDE WRAPPER PANEL */}
        <div 
          onClick={handleSlideClick}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex-1 w-full h-full relative cursor-pointer"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {slides[currentSlide]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. FOOTER TAPPING CHEVRONS (Desktop Helper) */}
        <div className="absolute bottom-6 left-4 right-4 z-40 hidden sm:flex justify-between items-center pointer-events-none opacity-40">
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
            className={`w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center pointer-events-auto cursor-pointer ${
              currentSlide === 0 ? 'invisible' : ''
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
            className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center pointer-events-auto cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
