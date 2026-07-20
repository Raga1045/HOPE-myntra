'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { setUser, setProfile, RootState } from '@/store/store';

export default function LoginPage() {
  const [email, setEmail] = useState('judge@myntra.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.session.user);

  useEffect(() => {
    // If user already logged in, go directly to home (or region setup if profile missing)
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        dispatch(setUser(data.user));
        
        // Fetch saved profile if any
        try {
          const profileRes = await fetch(`http://localhost:5000/api/profile/${data.user.id}`);
          const profileData = await profileRes.json();
          if (profileData.success && profileData.profile) {
            dispatch(setProfile(profileData.profile));
            router.push('/home');
          } else {
            router.push('/region-setup');
          }
        } catch (err) {
          console.warn("Profile fetch error during login:", err);
          router.push('/region-setup');
        }
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      // Client-side fallback if backend is offline during start
      const fallbackUser = { id: "1", name: "Judge User", email };
      dispatch(setUser(fallbackUser));
      router.push('/region-setup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF3F6C] opacity-5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF527B] opacity-5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-[420px] bg-[#FFFFFF] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EAEAEC] overflow-hidden"
      >
        {/* Banner Pink Header Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#FF3F6C] to-[#FF527B]" />

        <div className="p-8 sm:p-10">
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
              className="w-12 h-12 bg-gradient-to-br from-[#FF3F6C] to-[#FF527B] rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 mb-3"
            >
              <ShoppingBag className="text-white w-6 h-6" />
            </motion.div>
            <h2 className="text-[#282C3F] text-2xl font-bold font-sans tracking-tight">Welcome Back</h2>
            <p className="text-gray-400 text-xs mt-1">Experience personalized fashion like never before</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 text-red-500 text-xs px-3 py-2.5 rounded-lg border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4.5 h-4.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAFBFC] border border-[#EAEAEC] focus:border-[#FF3F6C] focus:bg-white rounded-lg text-sm text-[#282C3F] placeholder-gray-400 focus:outline-none transition-all duration-200 font-sans"
                  placeholder="Enter email e.g. judge@myntra.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4.5 h-4.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAFBFC] border border-[#EAEAEC] focus:border-[#FF3F6C] focus:bg-white rounded-lg text-sm text-[#282C3F] placeholder-gray-400 focus:outline-none transition-all duration-200 font-sans"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-gray-500 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#FF3F6C] focus:ring-[#FF3F6C] mr-2" />
                Remember me
              </label>
              <span className="text-[#FF3F6C] font-semibold hover:underline cursor-pointer">Forgot Password?</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF3F6C] to-[#FF527B] text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 flex items-center justify-center font-sans tracking-wide cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'LOGIN'
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400 font-sans">
            By logging in, you agree to Myntra's <span className="text-[#282C3F] hover:underline cursor-pointer">Terms of Use</span> & <span className="text-[#282C3F] hover:underline cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
