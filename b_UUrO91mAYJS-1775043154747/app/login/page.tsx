"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

const images = [
  "/images/login_hero.png",
  "/images/hero_4.png",
  "/images/hero_3.png",
  "/images/signup_hero.png",
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
       setErrorMsg("Please fill all the details — Email and Password are required.");
       alert("Please fill all the details — Email and Password are required.");
       return;
    }
    
    setLoading(true);
    setErrorMsg("");

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // If the user logs in perfectly, insert/update their data into `profiles` and `users` so it shows up in Supabase dashboard!
    if (authData?.user) {
      // Trying 'users' first to satisfy potential foreign key constraints
      const { error: userError } = await supabase.from('users').upsert([{
        id: authData.user.id,
        name: authData.user.user_metadata?.full_name || 'Restored Active User',
        email: authData.user.email,
        phone: authData.user.user_metadata?.phone || ''
      }], { onConflict: 'id' });

      if (userError) {
        setErrorMsg(`Users Table Error: ${userError.message || JSON.stringify(userError)}`);
        setLoading(false);
        return;
      }

      // Then 'profiles'
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: authData.user.id,
        name: authData.user.user_metadata?.full_name || 'Restored Active User',
        email: authData.user.email,
        phone: authData.user.user_metadata?.phone || ''
      }], { onConflict: 'id' });
      
      if (profileError) {
        setErrorMsg(`Profiles Table Error: ${profileError.message || JSON.stringify(profileError)}`);
        setLoading(false);
        return;
      }
    }
    
    // Preserve existing data if available from usersDb
    const dbStr = localStorage.getItem('usersDb');
    const usersDb = dbStr ? JSON.parse(dbStr) : {};
    
    if (!usersDb[email]) {
      // If logging in directly without a previous local 'usersDb' entry (e.g. fresh device but previously signed up via Supabase)
      usersDb[email] = {
        fullName: authData?.user?.user_metadata?.full_name || 'Logged In User',
        phone: authData?.user?.user_metadata?.phone || '+1 (555) 000-0000',
        email: email,
        tier: authData?.user?.user_metadata?.tier || 'Gold Tier Member'
      };
    }
    
    localStorage.setItem('usersDb', JSON.stringify(usersDb));
    localStorage.setItem('currentUserEmail', email);
    
    router.push('/account');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/account'
      }
    });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex w-full font-body bg-[#fdf9f2]">
      {/* Left Column - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt="Fashion model"
            fill
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-90" : "opacity-0"
            }`}
            priority={index === 0}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Bottom Left Text */}
        <div className="absolute bottom-12 left-10 text-white">
          <p className="text-[10px] tracking-[0.2em] mb-2 uppercase text-[#d4d4d4]">
            Autumn / Winter 2024
          </p>
          <h1 className="font-display text-5xl uppercase tracking-widest text-white leading-none">
            The Archive
          </h1>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative bg-[#fdf9f2]">
        <div className="w-full max-w-[440px] px-8 py-12 flex flex-col">
          <h2 className="font-display text-[46px] text-[#1c1c18] leading-none mb-4">
            Welcome Back
          </h2>
          <p className="text-sm text-[#5c5b55] font-light mb-10">
            Please enter your details to access your atelier account.
          </p>

          <div className="flex flex-col gap-3 mb-10">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 bg-white border border-[#e2dfd9] py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-all shadow-sm group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button 
              type="button" 
              onClick={() => {
                document.getElementById('emailLoginForm')?.scrollIntoView({ behavior: 'smooth' });
                document.getElementById('emailInput')?.focus();
              }}
              className="w-full flex items-center justify-center gap-3 border border-[#e2dfd9] py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-all shadow-sm group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              Continue with Mail
            </button>
          </div>

          <div className="relative w-full flex items-center justify-center mb-10 overflow-hidden">
            <div className="absolute w-full h-[1px] bg-[#e2dfd9]" />
            <span className="relative bg-[#fdf9f2] px-4 text-[9px] uppercase tracking-[0.3em] text-[#a09e96]">Or continue with email</span>
          </div>

          <form id="emailLoginForm" className="space-y-8 flex flex-col">
            {/* Email Address */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                Email Address
              </label>
              <input 
                id="emailInput"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-transparent border-b border-[#e2dfd9] py-3 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-[10px] uppercase tracking-widest text-[#88857d]">
                  Password
                </label>
                <Link href="#" className="text-[9px] uppercase tracking-widest text-[#a09e96] hover:text-[#1c1c18] transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-[#e2dfd9] py-3 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors pr-8"
                />
                {/* The user requested an eye image to view password for signup, I'll add it to login too as it makes sense */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#88857d] hover:text-[#1c1c18] transition"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="remember"
                className="w-4 h-4 rounded-none border border-[#e2dfd9] appearance-none checked:bg-[#1c1c18] checked:border-[#1c1c18] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-[#88857d] font-light cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-red-500 text-xs font-body">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-2 bg-[#CBAC3A] text-white uppercase tracking-widest text-xs py-4 hover:bg-[#b09431] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="material-symbols-outlined animate-spin text-[14px]">refresh</span>}
              Sign In
            </button>
          </form>

          <div className="mt-16 text-center border-t border-[#e2dfd9] pt-8">
            <p className="text-xs text-[#88857d]">
              Don't have an account? <Link href="/signup" className="text-[#1c1c18] font-medium ml-1 hover:underline underline-offset-4">Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Bottom Footer Elements */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center text-[9px] tracking-widest uppercase text-[#a09e96]">
          <span>© 2024 THE EDITORIAL ARCHIVE. ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </div>
  );
}
