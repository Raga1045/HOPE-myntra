'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, ShoppingBag, ToggleLeft, ToggleRight, Sparkles, 
  ChevronRight, Star, Heart, Flame, ShieldAlert, Award, Compass 
} from 'lucide-react';
import { toggleCultureMode, clearSession, RootState } from '@/store/store';
import { ConfidenceCard, ConfidenceData } from '@/components/confidence/ConfidenceCard';

interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  brand: string;
  rating: number;
  category: string;
  image: string;
  festivalTags: string[];
  regionTags: string[];
  color: string;
  style: string;
  originalPrice?: number;
  discountText?: string;
  confidence?: ConfidenceData;
}

interface HeroBannerData {
  festival: string;
  daysLeft: number;
  title: string;
  subtitle: string;
  cta: string;
  artwork?: string;
  themeGradient?: string;
  offerText?: string;
  greeting?: string;
  countdownText?: string;
  status?: string;
}

interface FeedData {
  trending?: Product[];
  recommended?: Product[];
  topBrands?: Product[];
  trendingFestival?: Product[];
  popularState?: Product[];
  regionalBrands?: Product[];
  festivalOffers?: Product[];
  familyMatching?: Product[];
}

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const user = useSelector((state: RootState) => state.session.user);
  const profile = useSelector((state: RootState) => state.session.profile);
  const cultureMode = useSelector((state: RootState) => state.session.cultureMode);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [feed, setFeed] = useState<FeedData | null>(null);
  const [hero, setHero] = useState<HeroBannerData | null>(null);
  const [activeFestival, setActiveFestival] = useState('');
  const [activeState, setActiveState] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfidenceProduct, setSelectedConfidenceProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else if (!profile) {
      router.push('/region-setup');
    }
  }, [user, profile, router]);

  // Load feed when cultureMode status changes
  useEffect(() => {
    if (!user) return;
    
    const fetchFeed = async () => {
      setIsLoading(true);
      try {
        const url = `http://localhost:5000/api/homepage?userId=${user.id}&cultureMode=${cultureMode}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.cultureMode) {
          setFeed(data.feed);
          setHero(data.heroBanner);
          setActiveFestival(data.activeFestival);
          setActiveState(data.state);
        } else {
          setFeed(data.feed);
          setHero(null);
        }
      } catch (err) {
        console.error("Fetch homepage feed error:", err);
        // Clean mock data if server offline
        generateLocalFallbackFeed();
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [user, cultureMode]);

  const generateLocalFallbackFeed = () => {
    // Basic mock product generator for offline fallbacks
    const brands = ["Roadster", "W", "Biba", "Libas", "Manyavar", "Anouk", "HRX"];
    const colors = ["Black", "Pink", "Yellow", "Gold", "Red"];
    const categories = ["Kurta", "Saree", "Jewellery", "Sherwani", "Dhoti", "Shirt", "Jeans"];
    const imagesMap: { [key: string]: string } = {
      "Kurta": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
      "Saree": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
      "Jewellery": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
      "Sherwani": "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=600&auto=format&fit=crop",
      "Dhoti": "https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=600&auto=format&fit=crop",
      "Shirt": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
      "Jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop"
    };

    const dummyProducts: Product[] = Array.from({ length: 24 }).map((_, idx) => {
      const cat = categories[idx % categories.length];
      const brand = brands[idx % brands.length];
      const color = colors[idx % colors.length];
      const image = imagesMap[cat] || imagesMap["Shirt"];
      const mockState = profile?.state || "Andhra Pradesh";
      const mockFestival = profile?.festivals[0] || "Ugadi";

      const festivalMatch = 80 + (idx % 19);
      const regionalMatch = 75 + (idx % 23);
      const weatherScore = 85 + (idx % 13);
      const comfortScoreVal = parseFloat((8.5 + (idx % 12) * 0.1).toFixed(1));
      const comfortScore = Math.round(comfortScoreVal * 10);
      const styleScore = 80 + (idx % 17);
      const popularityScore = 85 + (idx % 14);
      
      const confidenceScore = Math.round(
        festivalMatch * 0.3 +
        regionalMatch * 0.2 +
        weatherScore * 0.15 +
        comfortScore * 0.15 +
        styleScore * 0.1 +
        popularityScore * 0.1
      );

      const matchLabel = confidenceScore >= 92 ? "Perfect Match" : "Highly Recommended";
      const cityName = mockState.includes("Andhra") || mockState.includes("Telangana") ? "Hyderabad" : "Mumbai";
      const demographics = cat === "Saree" || cat === "Jewellery" ? "Women (20–25)" : "Men (25–30)";
      
      const whyPickedChecklist = [
        { label: `Perfect for ${mockFestival}`, iconType: 'Sparkles' },
        { label: `Trending in ${mockState}`, iconType: 'MapPin' },
        { label: `Matches your preferred style`, iconType: 'Palette' },
        { label: `Ideal for current weather`, iconType: 'Sun' },
        { label: `Great for family celebrations`, iconType: 'Heart' }
      ];

      const peopleLikeYou = [
        { label: `${demographics} loved this`, iconType: 'User' },
        { label: `Trending in ${cityName}`, iconType: 'MapPin' },
        { label: `Bought 148 times this month`, iconType: 'ShoppingBag' },
        { label: `Rated 4.8 by similar shoppers`, iconType: 'Star' },
        { label: `Added to 540 wishlists`, iconType: 'Heart' },
        { label: `Frequently purchased this week`, iconType: 'Flame' }
      ];

      const matchBreakdown = [
        { name: 'Festival Match', value: festivalMatch, color: 'saffron' as const },
        { name: 'Regional Match', value: regionalMatch, color: 'purple' as const },
        { name: 'Weather', value: weatherScore, color: 'blue' as const },
        { name: 'Style Match', value: styleScore, color: 'pink' as const },
        { name: 'Comfort', value: comfortScore, color: 'green' as const },
        { name: 'Popularity', value: popularityScore, color: 'purple' as const }
      ];

      const styleInsights = [
        `Traditional ${mockState.split(" ")[0]} Style`,
        "Handloom Certified",
        "Breathable Cotton"
      ];

      const stylingTips = [
        "Oxidized Jhumkas",
        "White Kolhapuris",
        "Silver Bangles",
        "Potli Bag"
      ];

      const trustSignals = [
        "AI Verified",
        "Community Favourite",
        "Regionally Relevant",
        "Festival Approved"
      ];

      const confidence: ConfidenceData = {
        festivalMatch,
        regionalMatch,
        weatherScore,
        comfortScore: comfortScoreVal,
        styleScore,
        confidenceScore,
        culturalTag: `Traditional ${mockState.split(" ")[0]} Handloom`,
        badges: ["Eco Friendly Dye", "Handloom Certified"],
        explanation: `Our AI selected this outfit because it closely matches your preferred style, your selected festival (${mockFestival}), and is one of the most popular choices among ${demographics.toLowerCase()} in ${mockState}. The breathable fabric also makes it ideal for today's weather.`,
        festivalName: mockFestival,
        stateName: mockState,
        matchLabel,
        whyPickedChecklist,
        peopleLikeYou,
        matchBreakdown,
        styleInsights,
        stylingTips,
        trustSignals
      };

      return {
        _id: String(idx + 1),
        id: String(idx + 1),
        name: `${brand} Traditional ${color} ${cat}`,
        price: 1200 + (idx * 150),
        brand,
        rating: 4.2,
        category: cat,
        image,
        festivalTags: idx % 3 === 0 ? ["Ugadi"] : [],
        regionTags: idx % 3 === 0 ? ["Andhra"] : [],
        color,
        style: "Ethnic",
        confidence
      };
    });

    const mockState = profile?.state || "Andhra Pradesh";
    const mockFestival = profile?.festivals[0] || "Ugadi";

    if (cultureMode) {
      setActiveFestival(mockFestival);
      setActiveState(mockState);
      
      let themeGradient = 'linear-gradient(to right, #FF3F6C, #FF527B)';
      let artwork = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop';
      let offerText = 'UP TO 50% OFF | FESTIVE CURATIONS';
      let greeting = `Celebrate ${mockFestival} in authentic style!`;
      
      const name = mockFestival.toLowerCase();
      if (name.includes('diwali') || name.includes('deepavali') || name.includes('kali puja')) {
        themeGradient = 'linear-gradient(to right, #F59E0B, #EF4444)';
        artwork = 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600&auto=format&fit=crop';
        offerText = 'FLAT 30% OFF | DIWALI SPECIAL DÉCOR & ETHNIC';
        greeting = 'Happy Diwali! Light up your wardrobe with glowing styles.';
      } else if (name.includes('holi')) {
        themeGradient = 'linear-gradient(to right, #EC4899, #8B5CF6, #3B82F6)';
        artwork = 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?q=80&w=600&auto=format&fit=crop';
        offerText = 'EXTRA 15% OFF | MULTICOLOR PRINTS & WHITES';
        greeting = 'Happy Holi! Splash vibrant colors into your style.';
      } else if (name.includes('durga puja') || name.includes('bonalu') || name.includes('bathukamma') || name.includes('navratri') || name.includes('shigmo') || name.includes('carnival') || name.includes('dasara') || name.includes('dussehra')) {
        themeGradient = 'linear-gradient(to right, #D97706, #DC2626, #701A75)';
        artwork = 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=600&auto=format&fit=crop';
        offerText = 'FLAT 40% OFF | FESTIVE SPECIAL SILKS & SAREES';
        if (name.includes('bathukamma')) greeting = 'Bathukamma Shubhakankshalu! Celebrate with beautiful floral patterns.';
        else if (name.includes('bonalu')) greeting = 'Joyous Ashada Bonalu celebrations! Traditional silks curated for you.';
        else if (name.includes('durga puja')) greeting = 'Subho Sharadiya Durga Puja! Splendid traditional designs await.';
        else if (name.includes('navratri')) greeting = 'Happy Navratri! Get dance-ready in chaniya cholis and jewelry.';
        else greeting = `Happy ${mockFestival}! Bring home the best of heritage silhouettes.`;
      } else if (name.includes('ugadi') || name.includes('onam') || name.includes('vishu') || name.includes('pongal') || name.includes('puthandu') || name.includes('sankranti') || name.includes('bihu') || name.includes('baisakhi') || name.includes('lohri')) {
        themeGradient = 'linear-gradient(to right, #059669, #10B981, #FBBF24)';
        artwork = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop';
        offerText = 'UP TO 50% OFF | SOUTH HERITAGE & FESTIVE WEAR';
        if (name.includes('ugadi')) greeting = 'Happy Ugadi & Gudi Padwa! Wishing you a sweet and prosperous year.';
        else if (name.includes('onam')) greeting = 'Happy Onam! Celebrate the harvest with pristine white and gold ensembles.';
        else if (name.includes('pongal')) greeting = 'Happy Pongal! May your life boil over with sweet prosperity.';
        else if (name.includes('sankranti')) greeting = 'Happy Makar Sankranti! Festive handlooms and ethnic coordinates.';
        else greeting = `Happy ${mockFestival}! Best wishes for the harvest and new beginnings.`;
      }

      setHero({
        festival: mockFestival,
        daysLeft: 8,
        title: `🌸 ${mockFestival}`,
        subtitle: "Celebrate in Style",
        cta: "Explore Collection",
        artwork,
        themeGradient,
        offerText,
        greeting,
        countdownText: `Only 8 Days Left for ${mockFestival}`,
        status: 'Upcoming'
      });
      setFeed({
        trendingFestival: dummyProducts.slice(0, 8),
        popularState: dummyProducts.slice(4, 12),
        regionalBrands: dummyProducts.slice(8, 16),
        festivalOffers: dummyProducts.slice(12, 20).map(p => ({ ...p, originalPrice: Math.floor(p.price * 1.3), discountText: "30% OFF" })),
        familyMatching: dummyProducts.slice(16, 24)
      });
    } else {
      setHero(null);
      setFeed({
        trending: dummyProducts.slice(0, 8),
        recommended: dummyProducts.slice(6, 14),
        topBrands: dummyProducts.slice(12, 20).filter(p => ["Roadster", "HRX"].includes(p.brand))
      });
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => router.push(`/product/${product.id}`)}
      className="bg-white rounded-xl overflow-hidden border border-[#EAEAEC] shadow-sm hover:shadow-[0_8px_24px_rgba(40,44,63,0.08)] transition-all duration-200 cursor-pointer flex-shrink-0 w-[180px] sm:w-[220px]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Rating overlay badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-gray-800 flex items-center shadow-xs">
          {product.rating} <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 ml-1" />
        </div>
        
        {/* Match Percentage Badge */}
        {product.confidence && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedConfidenceProduct(product);
            }}
            className="absolute top-2.5 right-2.5 bg-black/75 hover:bg-black text-white backdrop-blur-xs px-2 py-1 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 shadow-md transition-all uppercase border border-white/10 cursor-pointer"
          >
            <Sparkles className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 animate-pulse" />
            {product.confidence.confidenceScore}% Match
          </button>
        )}
      </div>
      <div className="p-3">
        <h4 className="text-[#282C3F] font-bold text-xs truncate uppercase tracking-wider">{product.brand}</h4>
        <p className="text-gray-500 text-[11px] truncate mt-0.5">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[#282C3F] font-extrabold text-xs">₹{product.price}</span>
          {product.originalPrice && (
            <>
              <span className="text-gray-400 line-through text-[10px]">₹{product.originalPrice}</span>
              <span className="text-[#FF3F6C] font-extrabold text-[9px]">{product.discountText}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  const CarouselSection = ({ title, icon, products }: { title: string, icon: React.ReactNode, products?: Product[] }) => {
    if (!products || products.length === 0) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#282C3F] text-sm sm:text-base font-extrabold flex items-center tracking-tight">
            <span className="mr-2 text-pink-500">{icon}</span>
            {title}
          </h3>
          <span className="text-[#FF3F6C] text-xs font-bold hover:underline cursor-pointer flex items-center">
            View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-sans ${
      cultureMode ? 'bg-[#FCFBFA]' : 'bg-[#FFFFFF]'
    }`}>
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#EAEAEC] shadow-xs">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[80px] flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div 
              onClick={() => router.push('/home')} 
              className="font-black text-xl tracking-tighter text-[#282C3F] flex items-center gap-1 cursor-pointer select-none"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-[#FF3F6C] to-[#FF527B] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-base font-bold">M</span>
              </div>
              <span className="hidden sm:inline font-bold">myntra</span>
            </div>
            
            {/* Nav Categories - Generic styling */}
            <nav className="hidden lg:flex items-center gap-6 text-[11px] font-extrabold uppercase tracking-widest text-[#282C3F] pt-1">
              <span className="cursor-pointer hover:border-b-2 hover:border-pink-500 pb-2">Men</span>
              <span className="cursor-pointer hover:border-b-2 hover:border-pink-500 pb-2">Women</span>
              <span className="cursor-pointer hover:border-b-2 hover:border-pink-500 pb-2">Kids</span>
              <span className="cursor-pointer hover:border-b-2 hover:border-pink-500 pb-2">Home & Living</span>
              <span className="cursor-pointer hover:border-b-2 hover:border-pink-500 pb-2 flex items-center text-pink-500">
                Studio <span className="ml-1 bg-[#FF3F6C] text-white text-[8px] px-1 py-0.2 rounded">NEW</span>
              </span>
            </nav>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-[450px] relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAFBFC] border border-[#EAEAEC] rounded-md text-xs placeholder-gray-400 focus:outline-none focus:border-[#FF3F6C] focus:bg-white transition-all font-sans"
            />
          </div>

          {/* Action elements */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* NEW ELEMENT: CULTURE MODE TOGGLE */}
            <div className="flex items-center gap-2 bg-[#FAFBFC] border border-[#EAEAEC] px-3 py-1.5 rounded-full shadow-2xs">
              <Sparkles className={`w-3.5 h-3.5 transition-colors ${cultureMode ? 'text-[#FF3F6C] animate-pulse' : 'text-gray-400'}`} />
              <span className="text-[10px] font-black uppercase text-[#282C3F] tracking-wide select-none">
                Culture
              </span>
              <button 
                onClick={() => dispatch(toggleCultureMode())}
                className="focus:outline-none flex items-center justify-center cursor-pointer"
              >
                {cultureMode ? (
                  <ToggleRight className="w-8 h-8 text-[#FF3F6C]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-300" />
                )}
              </button>
            </div>

            {/* MYNTRA WRAPPED BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/wrapped')}
              className="py-1.5 px-3 bg-[#282C3F] text-white text-[10px] font-bold rounded-lg tracking-wide hover:shadow-md transition-all cursor-pointer flex items-center gap-1"
            >
              🎉 My Fashion Year
            </motion.button>

            {/* EDIT PROFILE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/region-setup')}
              className="py-1.5 px-3 bg-white border border-[#EAEAEC] text-[#282C3F] text-[10px] font-bold rounded-lg tracking-wide hover:shadow-md transition-all cursor-pointer flex items-center gap-1"
            >
              ⚙️ Edit Profile
            </motion.button>

            {/* Logout */}
            <div 
              onClick={() => {
                dispatch(clearSession());
                router.push('/');
              }}
              className="flex flex-col items-center cursor-pointer select-none text-[#282C3F] hover:text-[#FF3F6C] transition-colors"
              title="Logout"
            >
              <User className="w-5 h-5 stroke-[2]" />
              <span className="text-[9px] font-extrabold uppercase mt-1 hidden sm:inline">Logout</span>
            </div>

            {/* Cart */}
            <div className="flex flex-col items-center cursor-pointer select-none text-[#282C3F] hover:text-[#FF3F6C] transition-colors relative">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#FF3F6C] text-white text-[8px] font-extrabold rounded-full flex items-center justify-center border border-white">
                  {cartItems.length}
                </span>
              )}
              <span className="text-[9px] font-extrabold uppercase mt-1 hidden sm:inline">Cart</span>
            </div>

          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8 overflow-hidden">
        
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-xs font-medium">Curating your fashion feed...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {cultureMode ? (
              // ----------------- CULTURE MODE ACTIVE -----------------
              <motion.div
                key="culture-feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* HERO BANNER CARD */}
                {hero && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ background: hero.themeGradient || 'linear-gradient(to right, #FFF5F6, #FFFDFB)' }}
                    className="relative rounded-2xl overflow-hidden border border-white/10 shadow-md p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-white"
                  >
                    {/* Decorative Background Elements */}
                    <div className="absolute right-[-10%] top-[-20%] w-[350px] h-[350px] rounded-full bg-white/5 blur-[100px] pointer-events-none" />
                    <div className="absolute left-[-10%] bottom-[-20%] w-[350px] h-[350px] rounded-full bg-white/5 blur-[100px] pointer-events-none" />
 
                    <div className="space-y-4 text-center sm:text-left z-10 flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                        <span className="px-3.5 py-1 bg-white/20 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider backdrop-blur-xs">
                          Festive Spotlight
                        </span>
                        <span className="px-3.5 py-1 bg-yellow-400 text-gray-900 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          ⏰ {hero.countdownText || (hero.daysLeft === 0 ? "Celebrate Today" : `${hero.daysLeft} Days Left`)}
                        </span>
                      </div>
                      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-xs">
                        {hero.greeting || `Happy ${hero.festival}!`}
                      </h1>
                      <p className="text-white/90 text-sm max-w-[450px] font-medium drop-shadow-xs">
                        {hero.offerText || `Celebrate in authentic style with matching family aesthetics, handcrafted fabrics, and festive coordinates for ${activeState}.`}
                      </p>
                      <button 
                        onClick={() => {
                          // Scroll to Trending Festival section
                          const el = document.getElementById('fest-trending');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 text-xs font-extrabold rounded-lg hover:shadow-lg transition-all cursor-pointer inline-flex items-center uppercase tracking-wider"
                      >
                        {hero.cta} <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
 
                    <div className="relative flex justify-center items-center w-full sm:w-[280px] aspect-[4/3] bg-white/10 backdrop-blur-xs rounded-2xl border border-white/20 shadow-md overflow-hidden p-2 z-10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={hero.artwork || (feed?.trendingFestival && feed.trendingFestival.length > 0 ? feed.trendingFestival[0].image : '')} 
                        alt="Festive Spot" 
                        className="w-full h-full object-cover object-top rounded-xl"
                      />
                    </div>
                  </motion.div>
                )}

                {/* CAROUSEL SECTIONS */}
                <div id="fest-trending">
                  <CarouselSection 
                    title={`Trending For ${activeFestival}`} 
                    icon={<Flame className="w-5 h-5" />} 
                    products={feed?.trendingFestival} 
                  />
                </div>

                <CarouselSection 
                  title={`Popular In ${activeState}`} 
                  icon={<Compass className="w-5 h-5" />} 
                  products={feed?.popularState} 
                />

                <CarouselSection 
                  title="Regional Heritage Brands" 
                  icon={<Award className="w-5 h-5" />} 
                  products={feed?.regionalBrands} 
                />

                <CarouselSection 
                  title={`${activeFestival} Celebration Offers`} 
                  icon={<Sparkles className="w-5 h-5" />} 
                  products={feed?.festivalOffers} 
                />

                <CarouselSection 
                  title="Family Coordinating Ensembles" 
                  icon={<Compass className="w-5 h-5" />} 
                  products={feed?.familyMatching} 
                />

                {/* AI CURATED RECOMMENDATIONS GRID */}
                <div className="space-y-6 pt-6 border-t border-gray-150">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FF3F6C]" />
                    <h3 className="text-[#282C3F] text-base font-extrabold tracking-tight uppercase">
                      AI Outfit Curator (Match Explanations)
                    </h3>
                  </div>
                  <p className="text-gray-500 text-xs max-w-[600px] leading-relaxed">
                    Based on your profile, local culture, and real-time dates, our shopping assistant has generated personalized outfits. Below each recommended style is its confidence calculation and detail profile.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {feed?.trendingFestival?.slice(0, 3).map((prod) => (
                      <div key={prod.id} className="flex flex-col gap-4 p-5 bg-[#FAFBFC] border border-[#EAEAEC]/80 rounded-2xl shadow-3xs transition-all hover:shadow-2xs">
                        {/* Compact Product Details Block */}
                        <div className="flex gap-4">
                          <div className="w-[110px] aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative border border-[#EAEAEC]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover object-top"
                              loading="lazy"
                            />
                            <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-bold text-gray-800 flex items-center shadow-xs">
                              {prod.rating} <Star className="w-2 h-2 text-yellow-500 fill-yellow-500 ml-0.5" />
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1 text-left">
                            <div className="space-y-1">
                              <h4 className="text-[#282C3F] font-black text-xs uppercase tracking-wider">{prod.brand}</h4>
                              <p className="text-gray-500 text-[11px] line-clamp-2 leading-tight">{prod.name}</p>
                              <div className="text-[10px] font-bold text-gray-400">Category: {prod.category}</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[#282C3F] font-black text-sm">₹{prod.price}</span>
                                {prod.originalPrice && (
                                  <span className="text-gray-400 line-through text-[10px]">₹{prod.originalPrice}</span>
                                )}
                              </div>
                              <button 
                                onClick={() => router.push(`/product/${prod.id}`)}
                                className="mt-3 w-full py-2 bg-[#282C3F] text-white hover:bg-black text-[10px] font-black rounded-lg tracking-wide uppercase transition-colors cursor-pointer"
                              >
                                View Style Details
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Confidence Card explanation */}
                        {prod.confidence && (
                          <ConfidenceCard data={prod.confidence} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              // ----------------- NORMAL MODE ACTIVE -----------------
              <motion.div
                key="normal-feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Standard Minimal Slider */}
                <div className="h-[250px] sm:h-[350px] bg-gradient-to-r from-[#282C3F] to-[#40455B] rounded-2xl relative overflow-hidden flex items-center p-8 sm:p-12">
                  <div className="space-y-3 z-10 text-white max-w-[450px]">
                    <span className="px-3.5 py-1 bg-white/10 text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Global Brands Spotlight
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">End of Season Wardrobe Fest</h2>
                    <p className="text-gray-300 text-xs">Explore flat 50-70% off on international casual wear, denims, and sports apparel.</p>
                    <button className="px-5 py-2.5 bg-[#FF3F6C] text-white text-xs font-bold rounded hover:bg-pink-600 transition-colors uppercase tracking-wider cursor-pointer">
                      Explore Collection
                    </button>
                  </div>
                  <div className="absolute right-8 bottom-0 top-0 w-[40%] hidden sm:flex justify-end items-center pointer-events-none">
                    <div className="w-[80%] h-[90%] bg-white/5 rounded-t-2xl border border-white/15" />
                  </div>
                </div>

                <CarouselSection 
                  title="Trending Apparel" 
                  icon={<Flame className="w-5 h-5" />} 
                  products={feed?.trending} 
                />

                <CarouselSection 
                  title="Recommended Styles For You" 
                  icon={<Sparkles className="w-5 h-5" />} 
                  products={feed?.recommended} 
                />

                <CarouselSection 
                  title="Top Selected Brands" 
                  icon={<Award className="w-5 h-5" />} 
                  products={feed?.topBrands} 
                />

                {/* AI CURATED RECOMMENDATIONS GRID */}
                <div className="space-y-6 pt-6 border-t border-gray-150">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FF3F6C]" />
                    <h3 className="text-[#282C3F] text-base font-extrabold tracking-tight uppercase">
                      AI Outfit Curator (Match Explanations)
                    </h3>
                  </div>
                  <p className="text-gray-500 text-xs max-w-[600px] leading-relaxed">
                    Our shopping assistant analyzes matching style preferences, reviews, and fabric structures. Inspect the detailed confidence metrics below for each curation.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {feed?.recommended?.slice(0, 3).map((prod) => (
                      <div key={prod.id} className="flex flex-col gap-4 p-5 bg-[#FAFBFC] border border-[#EAEAEC]/80 rounded-2xl shadow-3xs transition-all hover:shadow-2xs">
                        {/* Compact Product Details Block */}
                        <div className="flex gap-4">
                          <div className="w-[110px] aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative border border-[#EAEAEC]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover object-top"
                              loading="lazy"
                            />
                            <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-bold text-gray-800 flex items-center shadow-xs">
                              {prod.rating} <Star className="w-2 h-2 text-yellow-500 fill-yellow-500 ml-0.5" />
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1 text-left">
                            <div className="space-y-1">
                              <h4 className="text-[#282C3F] font-black text-xs uppercase tracking-wider">{prod.brand}</h4>
                              <p className="text-gray-500 text-[11px] line-clamp-2 leading-tight">{prod.name}</p>
                              <div className="text-[10px] font-bold text-gray-400">Category: {prod.category}</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[#282C3F] font-black text-sm">₹{prod.price}</span>
                                {prod.originalPrice && (
                                  <span className="text-gray-400 line-through text-[10px]">₹{prod.originalPrice}</span>
                                )}
                              </div>
                              <button 
                                onClick={() => router.push(`/product/${prod.id}`)}
                                className="mt-3 w-full py-2 bg-[#282C3F] text-white hover:bg-black text-[10px] font-black rounded-lg tracking-wide uppercase transition-colors cursor-pointer"
                              >
                                View Style Details
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Confidence Card explanation */}
                        {prod.confidence && (
                          <ConfidenceCard data={prod.confidence} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>

      {/* CONFIDENCE CARD OVERLAY MODAL */}
      <AnimatePresence>
        {selectedConfidenceProduct && selectedConfidenceProduct.confidence && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedConfidenceProduct(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(40,44,63,0.18)]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedConfidenceProduct(null)}
                className="absolute top-4 right-4 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all font-bold text-xs cursor-pointer z-10"
              >
                ✕
              </button>
              
              <ConfidenceCard data={selectedConfidenceProduct.confidence} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
