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
       setErrorMsg("Please enter both email and password.");
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
          <p className="text-sm text-[#5c5b55] font-light mb-12">
            Please enter your details to access your atelier account.
          </p>

          <form className="space-y-8 flex flex-col">
            {/* Email Address */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                Email Address
              </label>
              <input 
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
