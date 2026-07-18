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
}

interface HeroBannerData {
  festival: string;
  daysLeft: number;
  title: string;
  subtitle: string;
  cta: string;
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

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

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
        style: "Ethnic"
      };
    });

    const mockState = profile?.state || "Andhra Pradesh";
    const mockFestival = profile?.festivals[0] || "Ugadi";

    if (cultureMode) {
      setActiveFestival(mockFestival);
      setActiveState(mockState);
      setHero({
        festival: mockFestival,
        daysLeft: 8,
        title: `🌸 ${mockFestival}`,
        subtitle: "Celebrate in Style",
        cta: "Explore Collection"
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
                    className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF5F6] via-[#FFFDFB] to-[#F3FAF8] border border-[#FF3F6C]/10 shadow-sm p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-6"
                  >
                    {/* Decorative Background Elements */}
                    <div className="absolute right-[-10%] top-[-20%] w-[350px] h-[350px] rounded-full bg-pink-100/30 blur-[100px] pointer-events-none" />
                    <div className="absolute left-[-10%] bottom-[-20%] w-[350px] h-[350px] rounded-full bg-teal-50/40 blur-[100px] pointer-events-none" />

                    <div className="space-y-4 text-center sm:text-left z-10 flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        <span className="px-3.5 py-1 bg-[#FF3F6C]/10 text-[#FF3F6C] text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                          Festive Spotlight
                        </span>
                        <span className="px-3.5 py-1 bg-[#FFB400]/10 text-[#FFB400] text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1">
                          ⏰ {hero.daysLeft} Days Left
                        </span>
                      </div>
                      <h1 className="text-3xl sm:text-5xl font-black text-[#282C3F] tracking-tight leading-none">
                        {hero.title}
                      </h1>
                      <p className="text-gray-500 text-sm max-w-[450px]">
                        Celebrate in authentic style with matching family aesthetics, handcrafted fabrics, and festive coordinates for {activeState}.
                      </p>
                      <button 
                        onClick={() => {
                          // Scroll to Trending Festival section
                          const el = document.getElementById('fest-trending');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-[#FF3F6C] to-[#FF527B] text-white text-xs font-extrabold rounded-lg hover:shadow-lg shadow-pink-100 transition-all cursor-pointer inline-flex items-center uppercase tracking-wider"
                      >
                        {hero.cta} <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>

                    <div className="relative flex justify-center items-center w-full sm:w-[280px] aspect-[4/3] bg-white rounded-2xl border border-[#EAEAEC] shadow-sm overflow-hidden p-2 z-10">
                      {/* Show first product image in carousel */}
                      {feed?.trendingFestival && feed.trendingFestival.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={feed.trendingFestival[0].image} 
                          alt="Festive Spot" 
                          className="w-full h-full object-cover object-top rounded-xl"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Sparkles className="w-8 h-8 text-[#FF3F6C] mx-auto mb-2 animate-bounce" />
                          <span className="text-xs font-bold text-[#282C3F]">Traditional Collections</span>
                        </div>
                      )}
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
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
