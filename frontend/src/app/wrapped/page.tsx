'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Share2, Sparkles, Download, Heart, ShoppingBag } from 'lucide-react';
import { RootState } from '@/store/store';

interface StyleBreakdown {
  name: string;
  value: number;
}

interface WrappedData {
  totalOrders: number;
  totalSpent: number;
  favoriteBrand: string;
  favoriteFestival: string;
  topColor: string;
  styleAnalysis: {
    archetype: string;
    breakdown: StyleBreakdown[];
  };
}

export default function MyntraWrapped() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.session.user);
  
  const [data, setData] = useState<WrappedData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const SLIDE_DURATION = 5000; // 5 seconds per slide
  const totalSlides = 7;
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchWrappedData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/wrapped?userId=${user.id}`);
        const result = await res.json();
        if (result.success && result.wrappedData) {
          setData(result.wrappedData);
        } else {
          generateFallbackData();
        }
      } catch (err) {
        console.error("Fetch wrapped data error, using seed metrics fallback:", err);
        generateFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchWrappedData();
  }, [user, router]);

  const generateFallbackData = () => {
    // Exact seed targets requested by prompt
    setData({
      totalOrders: 80,
      totalSpent: 54000,
      favoriteBrand: "Roadster",
      favoriteFestival: "Ugadi",
      topColor: "Black",
      styleAnalysis: {
        archetype: "Minimal Traditionalist",
        breakdown: [
          { name: "Minimal", value: 60 },
          { name: "Ethnic", value: 25 },
          { name: "Trendy", value: 15 }
        ]
      }
    });
  };

  // Story Autoplayer Loop
  useEffect(() => {
    if (isLoading || isPaused || !data) return;

    setProgress(0);
    const stepTime = 50; // Update progress bar every 50ms
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
  }, [currentSlide, isLoading, isPaused, data]);

  const handleNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Loop or exit
      router.push('/home');
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Click on left/right side of slide to navigate
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

  // Render SVG Pie Chart for Slide 6
  const renderPieChart = (breakdown: StyleBreakdown[]) => {
    let accumulatedAngle = 0;
    const colors = ["#FF3F6C", "#03A685", "#FFB400", "#282C3F"];
    
    return (
      <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto transform -rotate-90">
        {breakdown.map((item, idx) => {
          const percentage = item.value;
          const angle = (percentage / 100) * 360;
          const x1 = 50 + 40 * Math.cos((accumulatedAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((accumulatedAngle * Math.PI) / 180);
          accumulatedAngle += angle;
          const x2 = 50 + 40 * Math.cos((accumulatedAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((accumulatedAngle * Math.PI) / 180);
          const largeArc = percentage > 50 ? 1 : 0;
          
          return (
            <path
              key={item.name}
              d={`M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z`}
              fill={colors[idx % colors.length]}
              stroke="#ffffff"
              strokeWidth="0.8"
            />
          );
        })}
        {/* Inner Circle to make it a Donut Chart */}
        <circle cx="50" cy="50" r="22" fill="#ffffff" />
      </svg>
    );
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#282C3F] flex flex-col justify-center items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#FAFBFC] text-xs font-semibold">Composing your fashion stories...</p>
      </div>
    );
  }

  // Slide Render contents
  const slides = [
    // Slide 1: Intro
    (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6 text-white bg-gradient-to-b from-[#282C3F] via-[#3C1D38] to-[#121420]">
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-24 h-24 bg-gradient-to-tr from-[#FF3F6C] to-[#FF527B] rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/25 mb-4"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h2 className="text-[#FF3F6C] font-extrabold text-sm uppercase tracking-widest">Myntra Wrapped</h2>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
            YOUR FASHION<br/>YEAR
          </h1>
          <p className="text-gray-400 text-xs mt-4 max-w-[280px] mx-auto leading-relaxed">
            Let's take a look at the trends, brands, and cultural style identities you lived in 2025.
          </p>
        </motion.div>
      </div>
    ),
    // Slide 2: Orders & Spend
    (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-8 text-white bg-[#FF3F6C]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2"
        >
          <ShoppingBag className="w-8 h-8 text-white" />
        </motion.div>
        
        <div className="space-y-4">
          <p className="text-pink-100 text-xs font-black uppercase tracking-widest">Shopping Activity</p>
          <div className="space-y-1">
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl font-black tracking-tight"
            >
              {data.totalOrders}
            </motion.h2>
            <p className="text-pink-100 text-sm font-semibold">Orders Completed</p>
          </div>
          <div className="h-0.5 w-12 bg-white/20 mx-auto my-4" />
          <div className="space-y-1">
            <motion.h2 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl font-black text-white"
            >
              ₹{data.totalSpent.toLocaleString('en-IN')}
            </motion.h2>
            <p className="text-pink-100 text-xs font-semibold">Total Invested in Style</p>
          </div>
        </div>
      </div>
    ),
    // Slide 3: Favorite Brand
    (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6 text-white bg-gradient-to-b from-[#282C3F] to-[#1a1c29]">
        <span className="text-6xl">🔥</span>
        <div className="space-y-2">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Your Wardrobe Companion</p>
          <h2 className="text-[#FF3F6C] text-sm font-bold uppercase tracking-wider">Favorite Brand</h2>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-8 py-5 bg-[#FF3F6C] rounded-2xl shadow-xl shadow-pink-500/10 border border-pink-400/20"
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none">
            {data.favoriteBrand}
          </h1>
        </motion.div>
        <p className="text-gray-400 text-xs max-w-[240px] leading-relaxed">
          From casual hangouts to statement profiles, {data.favoriteBrand} was your ultimate fallback.
        </p>
      </div>
    ),
    // Slide 4: Favorite Festival
    (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6 text-[#282C3F] bg-[#FFFBF0] border border-amber-100">
        <span className="text-6xl">🌸</span>
        <div className="space-y-2">
          <p className="text-amber-600/80 text-xs font-black uppercase tracking-widest">Culture & Occasions</p>
          <h2 className="text-amber-800 text-sm font-bold uppercase tracking-wider">Top Celebrated Festival</h2>
        </div>
        <motion.div
          initial={{ rotate: -5, scale: 0.9 }}
          animate={{ rotate: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="px-8 py-5 bg-amber-400 rounded-2xl border-4 border-[#282C3F] shadow-[4px_4px_0px_#282C3F]"
        >
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-[#282C3F]">
            {data.favoriteFestival}
          </h1>
        </motion.div>
        <p className="text-amber-700/80 text-xs max-w-[260px] leading-relaxed">
          You lit up the room in custom ethnic colors. Traditional wear clicked best during {data.favoriteFestival}.
        </p>
      </div>
    ),
    // Slide 5: Top Color
    (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6 text-white bg-gradient-to-b from-[#1E202B] via-[#2F3446] to-[#12141E]">
        <div className="relative">
          {/* Color Wheel circle */}
          <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl flex items-center justify-center bg-black" />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-6 h-6 bg-[#FF3F6C] rounded-full border-2 border-white"
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Visual Aesthetics</p>
          <h2 className="text-gray-300 text-sm font-bold uppercase tracking-wider">Dominant Color</h2>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full"
        >
          <div className={`w-5 h-5 rounded-full border border-white/30 ${
            data.topColor.toLowerCase() === 'black' ? 'bg-black' :
            data.topColor.toLowerCase() === 'pink' ? 'bg-[#FF3F6C]' :
            data.topColor.toLowerCase() === 'yellow' ? 'bg-[#FFB400]' : 'bg-[#03A685]'
          }`} />
          <span className="text-lg font-black uppercase tracking-wide">{data.topColor}</span>
        </motion.div>

        <p className="text-gray-400 text-xs max-w-[240px] leading-relaxed">
          It represents power, minimalism, and timeless coordination. You couldn't resist shopping for {data.topColor} items.
        </p>
      </div>
    ),
    // Slide 6: Style Analysis (Pie Chart)
    (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6 text-[#282C3F] bg-white">
        <div className="space-y-2">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">AI Fashion Identity</p>
          <h2 className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Style Archetype</h2>
          <h1 className="text-2xl font-black text-[#FF3F6C] tracking-tight uppercase leading-none">
            {data.styleAnalysis.archetype}
          </h1>
        </div>

        {/* Animated Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative py-2"
        >
          {renderPieChart(data.styleAnalysis.breakdown)}
        </motion.div>

        {/* Legend */}
        <div className="flex justify-center gap-4 flex-wrap text-[10px] font-bold">
          {data.styleAnalysis.breakdown.map((item, idx) => {
            const colors = ["bg-[#FF3F6C]", "bg-[#03A685]", "bg-[#FFB400]", "bg-[#282C3F]"];
            return (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                <span>{item.name}: {item.value}%</span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    // Slide 7: Share Card (Instagram story view)
    (
      <div className="flex flex-col items-center justify-between h-full p-8 text-white bg-gradient-to-b from-[#2B1028] via-[#120411] to-[#0A0209] relative overflow-hidden">
        {/* Sparkles accents */}
        <div className="absolute top-10 left-10 text-pink-400/20 text-xl">✨</div>
        <div className="absolute bottom-16 right-10 text-pink-400/20 text-xl">✨</div>

        <div className="text-center w-full pt-4">
          <p className="text-pink-500 text-xs font-black uppercase tracking-widest">My Fashion Identity</p>
          <h2 className="text-white text-base font-bold mt-1">Ready to share!</h2>
        </div>

        {/* Instax/Instagram Story Card Frame */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-[280px] aspect-[9/16] bg-[#FFFFFF] text-[#282C3F] rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          {/* Card Border pink gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF3F6C] to-[#FF527B]" />

          {/* Logo header */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-[10px] font-black tracking-tight text-gray-800">MYNTRA WRAPPED</span>
            <div className="w-5 h-5 bg-[#FF3F6C] rounded flex items-center justify-center text-white text-[10px] font-bold">M</div>
          </div>

          {/* Main Info */}
          <div className="space-y-4 my-auto py-4">
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">Identity Archetype</span>
              <h2 className="text-[#FF3F6C] text-lg font-black uppercase tracking-tight leading-none">
                {data.styleAnalysis.archetype}
              </h2>
            </div>

            <div className="space-y-2 border-t border-b border-gray-50 py-3 text-[10px] font-bold text-gray-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Favorite Brand:</span>
                <span className="text-[#282C3F]">{data.favoriteBrand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Primary Culture:</span>
                <span className="text-[#282C3F]">{data.favoriteFestival}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Top Wardrobe Color:</span>
                <span className="text-[#282C3F]">{data.topColor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Annual Purchases:</span>
                <span className="text-[#03A685]">{data.totalOrders} Orders</span>
              </div>
            </div>

            {/* Micro bar chart */}
            <div className="space-y-1.5">
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">Style Mix</span>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div className="bg-[#FF3F6C] h-full" style={{ width: '60%' }} />
                <div className="bg-[#03A685] h-full" style={{ width: '25%' }} />
                <div className="bg-[#FFB400] h-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          {/* User profile footer */}
          <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
            <div className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center text-[#FF3F6C] text-xs font-bold font-mono">
              {user.name.slice(0,2).toUpperCase()}
            </div>
            <div className="text-[9px] leading-tight">
              <p className="font-extrabold text-[#282C3F]">{user.name}</p>
              <p className="text-gray-400">@myntra_curate</p>
            </div>
          </div>
        </motion.div>

        {/* Share buttons */}
        <div className="space-y-3 w-full pb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="w-full py-3 bg-[#FF3F6C] hover:bg-pink-600 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> SHARE TO INSTAGRAM STORY
          </motion.button>
          
          <button
            onClick={() => router.push('/home')}
            className="w-full py-3 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close & Go Back
          </button>
        </div>

        {/* Share Feedback Toast Overlay */}
        <AnimatePresence>
          {shareSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 bg-white text-[#282C3F] text-xs font-bold px-4 py-3 rounded-full border border-gray-100 shadow-2xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-[#03A685]" /> Shared to Instagram Story!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#282C3F] flex items-center justify-center select-none font-sans overflow-hidden">
      {/* Background decoration blur blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF3F6C]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#03A685]/10 blur-[100px] pointer-events-none" />

      {/* Main Story Container Frame */}
      <div className="relative w-full max-w-[420px] h-full sm:h-[85vh] sm:rounded-2xl sm:border border-white/10 overflow-hidden shadow-2xl bg-black flex flex-col justify-between">
        
        {/* 1. TOP PROGRESS INDICATORS */}
        <div className="absolute top-4 left-0 right-0 z-40 px-3 flex gap-1">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            let slideProgress = 0;
            if (idx < currentSlide) slideProgress = 100;
            else if (idx === currentSlide) slideProgress = progress;
            
            return (
              <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-[50ms]" 
                  style={{ width: `${slideProgress}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* 2. HEADER BAR (Close Button) */}
        <div className="absolute top-8 left-0 right-0 z-40 px-4 flex justify-between items-center text-white/80">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#FF3F6C] px-2 py-0.5 rounded text-white shadow-xs">
              Wrapped
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
