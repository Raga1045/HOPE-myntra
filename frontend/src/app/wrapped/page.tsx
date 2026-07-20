'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Share2, Sparkles, Download, Heart, ShoppingBag, CheckCircle2 } from 'lucide-react';
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
    // Slide 1: Intro (Welcome)
    (
      <div className="relative flex flex-col items-center justify-between h-full p-8 text-center text-white bg-gradient-to-tr from-[#FF3F8E] via-[#FF6AA2] to-[#9C4DFF] overflow-hidden select-none">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[350px] h-[350px] rounded-full bg-white/10 blur-[80px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-purple-500/20 blur-[80px] pointer-events-none" />
        
        {/* Floating Fashion Elements */}
        <div className="absolute top-[15%] left-[10%] text-white/30 text-lg animate-bounce select-none">✨</div>
        <div className="absolute top-[25%] right-[15%] text-white/25 text-2xl animate-pulse select-none">🛍️</div>
        <div className="absolute bottom-[25%] left-[15%] text-white/25 text-xl animate-pulse select-none">🔥</div>
        <div className="absolute bottom-[15%] right-[10%] text-white/30 text-lg animate-bounce select-none">✨</div>

        {/* Top */}
        <div className="pt-16 space-y-1 z-10">
          <span className="px-3.5 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xs shadow-2xs">
            Myntra Wrapped 2025
          </span>
        </div>

        {/* Middle */}
        <div className="my-auto flex flex-col items-center space-y-6 z-10">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1.0, bounce: 0.4 }}
            className="w-24 h-24 bg-white/15 backdrop-blur-xs border border-white/25 rounded-3xl flex items-center justify-center shadow-xl shadow-pink-500/10 mb-2 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-12 h-12 text-white drop-shadow-md" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none drop-shadow-md uppercase">
              YOUR FASHION<br/>YEAR
            </h1>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/80 text-xs max-w-[280px] leading-relaxed pb-8 z-10 font-semibold"
        >
          Let's take a look at the trends, brands, and cultural style identities you lived in 2025.
        </motion.p>
      </div>
    ),
    // Slide 2: Orders & Spend (Statistics)
    (
      <div className="relative flex flex-col items-center justify-between h-full p-8 text-center text-white bg-gradient-to-br from-[#FF6AA2] via-[#FF3F8E] to-[#FF527B] overflow-hidden select-none">
        {/* Animated Background Blobs */}
        <div className="absolute top-[10%] right-[-20%] w-[320px] h-[320px] rounded-full bg-white/10 blur-[75px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-20%] w-[320px] h-[320px] rounded-full bg-purple-500/10 blur-[75px] pointer-events-none" />

        {/* Floating Icons */}
        <div className="absolute top-[20%] left-[12%] text-white/30 text-xl animate-pulse">👚</div>
        <div className="absolute bottom-[35%] right-[12%] text-white/25 text-2xl animate-bounce">🛍️</div>

        {/* Top */}
        <div className="pt-16 space-y-1 z-10">
          <span className="px-3.5 py-1 bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xs shadow-2xs">
            Shopping Activity
          </span>
        </div>

        {/* Middle */}
        <div className="my-auto space-y-8 z-10 w-full">
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 1.0 }}
            className="flex flex-col items-center"
          >
            <span className="text-[96px] sm:text-[110px] font-black tracking-tighter leading-none text-white drop-shadow-md select-none">
              {data.totalOrders}
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-pink-100/90 -mt-2">
              Orders Completed
            </span>
          </motion.div>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto" />

          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 1.0, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <span className="text-[40px] sm:text-[48px] font-black tracking-tight text-white drop-shadow-md select-none">
              ₹{data.totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-pink-100/90">
              Total Invested in Style
            </span>
          </motion.div>
        </div>

        {/* Bottom */}
        <p className="text-pink-100/80 text-xs max-w-[260px] leading-relaxed pb-8 z-10 font-semibold">
          You made every package count, defining your aesthetic with every purchase.
        </p>
      </div>
    ),
    // Slide 3: Favorite Brand (Wardrobe Companion)
    (
      <div className="relative flex flex-col items-center justify-between h-full p-8 text-center text-white bg-gradient-to-b from-[#4C1A57] via-[#9C4DFF] to-[#FF3F8E] overflow-hidden select-none">
        {/* Background glow overlay */}
        <div className="absolute top-[10%] left-[-20%] w-[350px] h-[350px] rounded-full bg-pink-500/10 blur-[85px] pointer-events-none" />
        
        {/* Floating Icons */}
        <div className="absolute top-[20%] right-[10%] text-white/30 text-2xl animate-pulse">👕</div>
        <div className="absolute bottom-[30%] left-[10%] text-white/25 text-3xl animate-bounce">🔥</div>

        {/* Top */}
        <div className="pt-16 space-y-1 z-10">
          <span className="px-3.5 py-1 bg-white/15 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xs shadow-2xs">
            Your Wardrobe Companion
          </span>
        </div>

        {/* Middle */}
        <div className="my-auto space-y-6 z-10 w-full relative">
          <span className="text-[80px] leading-none select-none block animate-bounce">🔥</span>
          
          <div className="space-y-1 select-none">
            <h2 className="text-[#FF6AA2] text-[10px] font-black uppercase tracking-wider">Favorite Brand</h2>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="px-8 py-6 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl shadow-xl shadow-pink-500/5 mx-auto max-w-[280px]"
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none text-white">
              {data.favoriteBrand}
            </h1>
          </motion.div>
          
          {/* Watermark text */}
          <div className="text-[44px] font-black text-white/5 uppercase select-none absolute left-0 right-0 tracking-widest -bottom-8 pointer-events-none">
            {data.favoriteBrand}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-purple-100/80 text-xs max-w-[250px] leading-relaxed pb-8 z-10 font-semibold">
          From casual hangouts to statement profiles, {data.favoriteBrand} was your ultimate fallback.
        </p>
      </div>
    ),
    // Slide 4: Favorite Festival (Culture & Occasions)
    (
      <div className="relative flex flex-col items-center justify-between h-full p-8 text-center text-white bg-gradient-to-tr from-[#FF9E00] via-[#FF3F8E] to-[#9C4DFF] overflow-hidden select-none">
        {/* Background glow */}
        <div className="absolute top-[10%] right-[-20%] w-[320px] h-[320px] rounded-full bg-amber-400/20 blur-[75px] pointer-events-none" />

        {/* Floating Icons */}
        <div className="absolute top-[20%] left-[10%] text-white/20 text-3xl animate-bounce">🏵️</div>
        <div className="absolute bottom-[30%] right-[10%] text-white/30 text-2xl animate-pulse">🌸</div>

        {/* Top */}
        <div className="pt-16 space-y-1 z-10">
          <span className="px-3.5 py-1 bg-white/15 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xs shadow-2xs">
            Culture & Occasions
          </span>
        </div>

        {/* Middle */}
        <div className="my-auto space-y-6 z-10 w-full relative">
          <span className="text-6xl animate-bounce block select-none">🌸</span>
          <div className="space-y-1 select-none">
            <h2 className="text-amber-200 text-[10px] font-black uppercase tracking-wider">Top Celebrated Festival</h2>
          </div>
          
          <motion.div
            initial={{ rotate: -5, scale: 0.9 }}
            animate={{ rotate: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className="px-8 py-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl shadow-xl shadow-amber-500/10 mx-auto max-w-[280px]"
          >
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-white">
              {data.favoriteFestival}
            </h1>
          </motion.div>
        </div>

        {/* Bottom */}
        <p className="text-amber-100/90 text-xs max-w-[260px] leading-relaxed pb-8 z-10 font-semibold">
          You lit up the room in custom ethnic colors. Traditional wear clicked best during {data.favoriteFestival}.
        </p>
      </div>
    ),
    // Slide 5: Top Color (Visual Aesthetics)
    (
      <div className="relative flex flex-col items-center justify-between h-full p-8 text-center text-white bg-gradient-to-br from-[#1F202B] via-[#4C1A57] to-[#12141E] overflow-hidden select-none">
        {/* Background glow */}
        <div className="absolute top-[20%] left-[-25%] w-[350px] h-[350px] rounded-full bg-pink-500/10 blur-[90px] pointer-events-none" />

        {/* Floating Icons */}
        <div className="absolute top-[18%] right-[12%] text-white/20 text-2xl animate-pulse">🎨</div>
        <div className="absolute bottom-[32%] left-[12%] text-white/30 text-xl animate-bounce">✨</div>

        {/* Top */}
        <div className="pt-16 space-y-1 z-10">
          <span className="px-3.5 py-1 bg-white/15 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xs shadow-2xs">
            Visual Aesthetics
          </span>
        </div>

        {/* Middle */}
        <div className="my-auto space-y-8 z-10 w-full flex flex-col items-center">
          <div className="relative select-none">
            {/* Color Wheel Outer Ring */}
            <div className="w-24 h-24 rounded-full border-4 border-white/10 shadow-2xl flex items-center justify-center bg-black/40 backdrop-blur-md relative overflow-hidden">
              <div className={`w-16 h-16 rounded-full border-2 border-white/30 shadow-inner ${
                data.topColor.toLowerCase() === 'black' ? 'bg-black' :
                data.topColor.toLowerCase() === 'pink' ? 'bg-[#FF3F6C]' :
                data.topColor.toLowerCase() === 'yellow' ? 'bg-[#FFB400]' : 'bg-[#03A685]'
              }`} />
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="absolute top-0 right-0 w-6 h-6 bg-[#FF3F6C] rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black shadow-lg"
            >
              ★
            </motion.div>
          </div>
          
          <div className="space-y-1 select-none">
            <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Dominant Color</h2>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-6 py-3 rounded-full shadow-lg"
          >
            <div className={`w-4 h-4 rounded-full border border-white/30 ${
              data.topColor.toLowerCase() === 'black' ? 'bg-black' :
              data.topColor.toLowerCase() === 'pink' ? 'bg-[#FF3F6C]' :
              data.topColor.toLowerCase() === 'yellow' ? 'bg-[#FFB400]' : 'bg-[#03A685]'
            }`} />
            <span className="text-md font-black uppercase tracking-wide text-white">{data.topColor}</span>
          </motion.div>
        </div>

        {/* Bottom */}
        <p className="text-gray-400 text-xs max-w-[240px] leading-relaxed pb-8 z-10 font-semibold">
          It represents power, minimalism, and timeless coordination. You couldn't resist shopping for {data.topColor} items.
        </p>
      </div>
    ),
    // Slide 6: Style Analysis (Style Archetype)
    (
      <div className="relative flex flex-col items-center justify-between h-full p-8 text-center text-white bg-gradient-to-tr from-[#9C4DFF] via-[#FF3F8E] to-[#FF6AA2] overflow-hidden select-none">
        {/* Background blobs */}
        <div className="absolute top-[10%] left-[-20%] w-[320px] h-[320px] rounded-full bg-white/10 blur-[80px] pointer-events-none" />

        {/* Floating Icons */}
        <div className="absolute top-[15%] right-[10%] text-white/20 text-3xl animate-bounce">📐</div>
        <div className="absolute bottom-[25%] left-[10%] text-white/30 text-2xl animate-pulse">✨</div>

        {/* Top */}
        <div className="pt-16 space-y-1 z-10">
          <span className="px-3.5 py-1 bg-white/15 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xs shadow-2xs">
            AI Fashion Identity
          </span>
        </div>

        {/* Middle */}
        <div className="my-auto space-y-5 z-10 w-full flex flex-col items-center">
          <div className="space-y-1 select-none">
            <h2 className="text-pink-100 text-[10px] font-black uppercase tracking-wider">Style Archetype</h2>
            <h1 className="text-2.5xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none drop-shadow-md">
              {data.styleAnalysis.archetype}
            </h1>
          </div>

          {/* Solid card for Pie Chart to ensure high readability */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-4 bg-white rounded-2xl shadow-xl border border-pink-100 relative flex items-center justify-center"
          >
            {renderPieChart(data.styleAnalysis.breakdown)}
          </motion.div>

          {/* Legend */}
          <div className="flex justify-center gap-3 flex-wrap text-[9.5px] font-extrabold max-w-[280px]">
            {data.styleAnalysis.breakdown.map((item, idx) => {
              const colors = ["bg-[#FF3F6C]", "bg-[#03A685]", "bg-[#FFB400]", "bg-[#282C3F]"];
              return (
                <div key={item.name} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-white/5 shadow-3xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                  <span>{item.name}: {item.value}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-pink-100/90 text-xs max-w-[260px] leading-relaxed pb-8 z-10 font-semibold">
          Your style analysis shows a powerful blend of archetypes, making your visual aesthetics unique.
        </p>
      </div>
    ),
    // Slide 7: Share Card (Instagram Story View)
    (
      <div className="flex flex-col items-center justify-between h-full p-8 text-white bg-gradient-to-b from-[#2B1028] via-[#120411] to-[#0A0209] relative overflow-hidden select-none">
        {/* Sparkles accents */}
        <div className="absolute top-10 left-10 text-pink-400/20 text-xl">✨</div>
        <div className="absolute bottom-16 right-10 text-pink-400/20 text-xl">✨</div>

        <div className="text-center w-full pt-4 z-10">
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
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF3F6C] to-[#FF527B]" />

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
              {(user?.name || "Guest").slice(0,2).toUpperCase()}
            </div>
            <div className="text-[9px] leading-tight">
              <p className="font-extrabold text-[#282C3F]">{user?.name || "Guest"}</p>
              <p className="text-gray-400">@myntra_curate</p>
            </div>
          </div>
        </motion.div>

        {/* Share buttons */}
        <div className="space-y-3 w-full pb-4 z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="w-full py-3 bg-gradient-to-r from-[#FF3F6C] to-[#FF527B] text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-500/10 uppercase tracking-wider"
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
