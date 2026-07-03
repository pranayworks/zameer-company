"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/toast-context";

const images = [
  "/images/login_hero.png",
  "/images/hero_4.png",
  "/images/hero_3.png",
  "/images/signup_hero.png",
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
        setSessionChecked(true);
      } else {
        // Parse possible hash parameters if redirect carries error info
        const hash = window.location.hash;
        if (hash.includes("error=")) {
          const params = new URLSearchParams(hash.replace("#", "?"));
          const desc = params.get("error_description") || "The reset link is invalid or has expired.";
          setErrorMsg(desc);
          setSessionChecked(true);
        } else {
          // Wait a short moment to let Supabase SDK finish parsing the URL hash/query session
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              setHasSession(true);
            } else {
              setErrorMsg("Secure reset session not found. Please request a new reset link from the Sign In page.");
            }
            setSessionChecked(true);
          }, 1200);
        }
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg("Please fill in both password fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your inputs.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    showToast("Password updated successfully! Redirecting...", "success");

    // Clear active session to force login with the new password
    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

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
            New Password
          </h2>
          <p className="text-sm text-[#5c5b55] font-light mb-10">
            Define a secure password for your Atelier account.
          </p>

          {!sessionChecked ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <span className="material-symbols-outlined animate-spin text-4xl text-[#CBAC3A]">refresh</span>
              <p className="text-xs uppercase tracking-widest text-[#88857d]">Establishing secure session...</p>
            </div>
          ) : errorMsg && !hasSession ? (
            <div className="space-y-8">
              <div className="bg-red-500/10 text-red-700 p-6 border-l-4 border-red-500 shadow-md space-y-3">
                <span className="material-symbols-outlined text-3xl">error</span>
                <p className="font-headline text-[10px] uppercase tracking-[0.3em]">Session Expired or Invalid</p>
                <p className="font-body text-xs leading-relaxed font-medium">
                  {errorMsg}
                </p>
              </div>
              <Link 
                href="/login"
                className="w-full block text-center bg-[#1c1c18] text-white uppercase tracking-widest text-[10px] font-bold py-4 hover:bg-[#CBAC3A] transition-all shadow-lg"
              >
                Return to Login
              </Link>
            </div>
          ) : success ? (
            <div className="bg-[#1c1c18] text-[#a3851a] p-6 border border-[#a3851a]/30 shadow-lg text-center space-y-4">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
              <p className="font-headline text-[10px] uppercase tracking-[0.3em]">Update Completed</p>
              <p className="font-body text-xs text-white/95 leading-relaxed font-medium">
                Your password has been changed successfully! Redirecting you back to the Sign In page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 flex flex-col">
              {/* New Password */}
              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-[#e2dfd9] py-3 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors pr-8"
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

              {/* Confirm Password */}
              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-widest text-[#88857d] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-[#e2dfd9] py-3 text-sm placeholder:text-[#cccac0] text-[#1c1c18] focus:outline-none focus:border-[#1c1c18] transition-colors pr-8"
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

              {errorMsg && (
                <p className="text-red-500 text-xs font-body border-l-2 border-red-500 pl-3">{errorMsg}</p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#CBAC3A] text-white uppercase tracking-widest text-[10px] font-bold py-4 hover:bg-[#1c1c18] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading && <span className="material-symbols-outlined animate-spin text-[14px]">refresh</span>}
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Bottom Footer Elements */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center text-[9px] tracking-widest uppercase text-[#a09e96]">
          <span>© 2024 THE EDITORIAL ARCHIVE. ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </div>
  );
}
