"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

const images = [
  "/images/signup_hero.png",
  "/images/hero_3.png",
  "/images/hero_4.png",
  "/images/login_hero.png",
];

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          tier: 'Gold Tier Member',
        }
      }
    });

    if (error) {
       setErrorMsg(error.message);
       setLoading(false);
       return;
    }

    if (data?.user) {
      // Use 'upsert' instead of 'insert' to prevent duplicate key errors if account partially exists
      const { error: userError } = await supabase.from('users').upsert([{
        id: data.user.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      }], { onConflict: 'id' });

      if (userError) {
        console.error("User sync error message:", userError.message || userError);
      }

      // Use 'upsert' instead of 'insert' for the profile as well
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: data.user.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      }], { onConflict: 'id' });
      
      if (profileError) {
        console.error("Profile sync error message:", profileError.message || profileError);
        setErrorMsg(`Database Profile insertion failed: ${profileError.message || JSON.stringify(profileError)}`);
        setLoading(false);
        return;
      }
    }

    
    // Using local storage mapping for immediate visual sync if desired
    const dbStr = localStorage.getItem('usersDb');
    const usersDb = dbStr ? JSON.parse(dbStr) : {};
    
    usersDb[formData.email] = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      tier: 'Gold Tier Member',
    };
    
    localStorage.setItem('usersDb', JSON.stringify(usersDb));
    localStorage.setItem('currentUserEmail', formData.email);
    
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
        
        {/* Top Left Text */}
        <div className="absolute top-10 left-10 text-white font-display uppercase tracking-[0.3em] font-medium text-lg">
          THE ARCHIVE
        </div>

        {/* Bottom Left Text */}
        <div className="absolute bottom-12 left-10 text-white">
          <p className="text-xs tracking-[0.2em] mb-4 uppercase">
            Autumn / Winter Series 24
          </p>
          <h1 className="font-display text-5xl leading-tight font-medium">
            The Modern Atelier:<br />
            Curated<br />
            Transcendence
          </h1>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative bg-[#fdf9f2]">
        <div className="w-full max-w-[440px] px-8 py-12 flex flex-col">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#88857d] mb-4">
            Join the inner circle
          </p>
          <h2 className="font-display text-[46px] text-[#1c1c18] leading-none mb-4">
            Create Account
          </h2>
          <p className="text-sm text-[#5c5b55] font-light mb-10 leading-relaxed">
            Experience a curated journey into the world of heritage craft and contemporary design.
          </p>

          <form className="space-y-6 flex flex-col">
            {/* Full Name & Phone Number (Added per instructions) */}
            <div className="flex gap-4">
              <div className="w-1/2 group">
                <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="ELIAS VAN DER ROHE"
                  className="w-full bg-transparent border-b border-[#e2dfd9] py-2 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors"
                />
              </div>
              <div className="w-1/2 group">
                <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                  Phone No.
                </label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-transparent border-b border-[#e2dfd9] py-2 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="atelier@thearchive.com"
                className="w-full bg-transparent border-b border-[#e2dfd9] py-2 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors"
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="flex gap-4">
              <div className="w-1/2 group relative">
                <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-[#e2dfd9] py-2 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors pr-8"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#88857d] hover:text-[#1c1c18] transition"
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              
              <div className="w-1/2 group relative">
                <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-[#e2dfd9] py-2 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors pr-8"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#88857d] hover:text-[#1c1c18] transition"
                  >
                    {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-4">
              <input 
                type="checkbox" 
                id="terms"
                className="mt-1 w-4 h-4 rounded-none border border-[#e2dfd9] appearance-none checked:bg-[#1c1c18] checked:border-[#1c1c18] relative cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#5c5b55] font-light mt-1">
                I agree to the <Link href="#" className="underline decoration-[#e2dfd9] underline-offset-4 hover:text-[#1c1c18] transition">Terms & Conditions</Link> and <Link href="#" className="underline decoration-[#e2dfd9] underline-offset-4 hover:text-[#1c1c18] transition">Privacy Policy</Link>.
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
              className="w-full mt-8 bg-[#876E0E] text-white uppercase tracking-widest text-xs py-4 hover:bg-[#6c580a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="material-symbols-outlined animate-spin text-[14px]">refresh</span>}
              Create Account
            </button>
          </form>

          {/* Added Social Auth as requested */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-[#e2dfd9]"></div>
              <span className="text-[10px] uppercase tracking-widest text-[#88857d]">Or</span>
              <div className="h-[1px] flex-1 bg-[#e2dfd9]"></div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-3 border border-[#e2dfd9] py-3 text-sm text-[#1c1c18] hover:bg-[#f6f2e8] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              Continue with Google
            </button>
            
            <button className="w-full flex items-center justify-center gap-3 border border-[#e2dfd9] py-3 text-sm text-[#1c1c18] hover:bg-[#f6f2e8] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              Continue with Mail
            </button>
          </div>

          <p className="mt-12 text-center text-xs text-[#5c5b55]">
            Already have an account? <Link href="/login" className="text-[#1c1c18] hover:underline hover:decoration-[#1c1c18] underline-offset-4">Login</Link>
          </p>

        </div>

        {/* Bottom Footer Elements */}
        <div className="absolute bottom-10 left-12 right-12 flex justify-between text-[10px] tracking-widest uppercase text-[#a09e96]">
          <span>© 2024 THE ARCHIVE</span>
          <div className="space-x-8">
            <Link href="#" className="hover:text-[#1c1c18] transition">Help</Link>
            <Link href="#" className="hover:text-[#1c1c18] transition">Global</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
