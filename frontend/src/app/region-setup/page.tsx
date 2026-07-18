'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Languages, Check, ArrowRight, UserCheck } from 'lucide-react';
import { setProfile, RootState } from '@/store/store';
const STATE_FESTIVALS: { [key: string]: string[] } = {
  "Andhra Pradesh": ["Ugadi", "Sankranti", "Dasara", "Diwali", "Christmas"],
  "Kerala": ["Vishu", "Onam", "Diwali", "Christmas"],
  "Tamil Nadu": ["Pongal", "Puthandu", "Dasara", "Diwali", "Christmas"],
  "Karnataka": ["Ugadi", "Dasara", "Diwali", "Christmas"],
  "Telangana": ["Ugadi", "Dasara", "Diwali", "Christmas"],
  "West Bengal": ["Durga Puja", "Poila Baisakh", "Diwali", "Christmas"],
  "Punjab": ["Baisakhi", "Lohri", "Diwali", "Christmas"],
  "Gujarat": ["Navratri", "Uttarayan", "Diwali", "Christmas"],
  "Maharashtra": ["Ganesh Chaturthi", "Navratri", "Diwali", "Christmas"],
  "Odisha": ["Raja Parba", "Durga Puja", "Diwali", "Christmas"]
};

const LANGUAGES = ["English", "Telugu", "Hindi"];

export default function RegionalOnboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.session.user);

  const [selectedState, setSelectedState] = useState('Andhra Pradesh');
  const [selectedFestivals, setSelectedFestivals] = useState<string[]>(['Ugadi', 'Diwali']);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect back to login page
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // When selected state changes, update default checked festivals for that state
  useEffect(() => {
    const availableFests = STATE_FESTIVALS[selectedState] || [];
    if (availableFests.length > 0) {
      // Pick first two festivals as defaults
      setSelectedFestivals(availableFests.slice(0, 2));
    } else {
      setSelectedFestivals([]);
    }
  }, [selectedState]);

  const handleFestivalToggle = (fest: string) => {
    if (selectedFestivals.includes(fest)) {
      setSelectedFestivals(selectedFestivals.filter(f => f !== fest));
    } else {
      setSelectedFestivals([...selectedFestivals, fest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    const profileData = {
      userId: user.id,
      state: selectedState,
      festivals: selectedFestivals,
      language: selectedLanguage
    };

    try {
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      
      if (data.success) {
        dispatch(setProfile(data.profile));
        router.push('/home');
      }
    } catch (err) {
      console.error("Save profile error:", err);
      // Fallback save locally if server offline
      dispatch(setProfile(profileData));
      router.push('/home');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-12 px-4 relative overflow-hidden flex flex-col justify-center items-center font-sans">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF3F6C] opacity-[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#03A685] opacity-[0.03] blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[650px] bg-[#FFFFFF] rounded-2xl shadow-[0_4px_30px_rgba(40,44,63,0.05)] border border-[#EAEAEC] overflow-hidden"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#FF3F6C] via-[#FF527B] to-[#03A685]" />

        <div className="p-8 sm:p-12">
          {/* Header Title Section */}
          <div className="text-center mb-10">
            <motion.h1
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-[#282C3F] text-3xl font-extrabold tracking-tight mb-3"
            >
              Tell us about your roots 🌏
            </motion.h1>
            <p className="text-gray-500 text-sm max-w-[450px] mx-auto">
              We'll personalize your Myntra shopping feed, recommended styles, and collections based on your local culture and festivals.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: HOME STATE DROPDOWN */}
            <div className="space-y-3">
              <label className="flex items-center text-[#282C3F] text-sm font-bold">
                <MapPin className="w-4 h-4 text-[#FF3F6C] mr-2" />
                Step 1: Choose Your Home State
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#FAFBFC] border border-[#EAEAEC] focus:border-[#FF3F6C] rounded-xl text-[#282C3F] text-sm font-medium focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {Object.keys(STATE_FESTIVALS).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-500 w-0 h-0" />
              </div>
            </div>

            {/* STEP 2: FESTIVALS CHECKBOX CARDS */}
            <div className="space-y-3">
              <label className="flex items-center text-[#282C3F] text-sm font-bold">
                <Calendar className="w-4 h-4 text-[#FF3F6C] mr-2" />
                Step 2: Select Festivals You Celebrate
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {(STATE_FESTIVALS[selectedState] || []).map((fest) => {
                    const isSelected = selectedFestivals.includes(fest);
                    return (
                      <motion.div
                        key={fest}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleFestivalToggle(fest)}
                        className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 select-none flex flex-col items-center justify-center relative overflow-hidden ${
                          isSelected
                            ? 'border-[#FF3F6C] bg-pink-50/20 shadow-[0_4px_12px_rgba(255,63,108,0.05)]'
                            : 'border-[#EAEAEC] hover:border-gray-300 bg-white'
                        }`}
                      >
                        {/* Selected Indicator Badge */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-4 h-4 bg-[#FF3F6C] rounded-full flex items-center justify-center text-white"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </motion.div>
                        )}
                        <span className="text-xl mb-1">
                          {fest === 'Ugadi' ? '🌸' :
                           fest === 'Sankranti' ? '🌾' :
                           fest === 'Dasara' ? '🏹' :
                           fest === 'Diwali' ? '🪔' :
                           fest === 'Christmas' ? '🎄' :
                           fest === 'Onam' ? '⛵' :
                           fest === 'Vishu' ? '🌼' :
                           fest === 'Pongal' ? '🏺' :
                           fest === 'Puthandu' ? '🍊' :
                           fest === 'Baisakhi' ? '🥁' :
                           fest === 'Lohri' ? '🔥' :
                           fest === 'Durga Puja' ? '🔱' :
                           fest === 'Navratri' ? '💃' :
                           fest === 'Ganesh Chaturthi' ? '🐘' :
                           fest === 'Raja Parba' ? '⛵' :
                           fest === 'Uttarayan' ? '🪁' : '🎉'}
                        </span>
                        <span className={`text-xs font-bold font-sans ${isSelected ? 'text-[#FF3F6C]' : 'text-[#282C3F]'}`}>
                          {fest}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* STEP 3: LANGUAGE SELECTION */}
            <div className="space-y-3">
              <label className="flex items-center text-[#282C3F] text-sm font-bold">
                <Languages className="w-4 h-4 text-[#FF3F6C] mr-2" />
                Step 3: Preferred Language
              </label>
              <div className="flex gap-3">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#FF3F6C] bg-pink-50/20 text-[#FF3F6C]'
                          : 'border-[#EAEAEC] bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading || selectedFestivals.length === 0}
              className={`w-full py-4 rounded-xl text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center font-sans tracking-wider cursor-pointer ${
                selectedFestivals.length === 0
                  ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-[#FF3F6C] via-[#FF527B] to-[#FF3F6C] hover:shadow-lg hover:shadow-pink-100'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  CREATE MY FASHION PROFILE
                  <ArrowRight className="w-4.5 h-4.5 ml-2 stroke-[2.5]" />
                </>
              )}
            </motion.button>

          </form>
        </div>
      </motion.div>
    </div>
  );
}
