"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, PawPrint, Globe, Send } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, loading: authLoading, login, register } = useAuth();
  const router = useRouter();

  function redirectByRole(role: string) {
    if (role === "admin") router.push("/admin");
    else if (role === "vet") router.push("/vet-dashboard");
    else router.push("/dashboard");
  }

  useEffect(() => {
    if (!authLoading && user) redirectByRole(user.role);
  }, [user, authLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") return;
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { user } = await login(email, password);
        redirectByRole(user.role);
      } else {
        const { user } = await register(name, email, password);
        redirectByRole(user.role);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left visual panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[#4399E1] to-[#192A51] p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#FFA9AC] rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="w-fit block">
            <Image src="/logo-dark.png" alt="PetCare" width={140} height={40} className="h-10 w-auto brightness-0 invert" />
          </Link>
        </div>
        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center">
            <PawPrint size={52} className="text-[#FFA9AC]" />
          </div>
          <h2 className="text-3xl font-extrabold leading-tight">
            {mode === "login" ? "Welcome Back!" : mode === "signup" ? "Join PetCare Today" : "Reset Your Password"}
          </h2>
          <p className="text-white/80 text-base leading-relaxed max-w-sm">
            {mode === "login"
              ? "Access your orders, vet appointments, and personalized pet care recommendations."
              : mode === "signup"
              ? "Create your account and get access to premium pet products, trusted vets, and care guides."
              : "No worries! Enter your email and we'll send you a reset link."}
          </p>
          <div className="flex flex-col gap-3">
            {["10,000+ Happy Pet Owners", "50+ Trusted Veterinarians", "200+ Premium Products"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/80">
                <span className="w-5 h-5 bg-[#FFA9AC]/40 rounded-full flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/50">© 2025 PetCare.uz · Uzbekistan&apos;s #1 Pet Platform</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <Link href="/" className="lg:hidden flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#4399E1] transition">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="hidden lg:flex" />
          <button onClick={toggle} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#DDEDFF] dark:hover:bg-[#1e3060] text-[#6b7a99] dark:text-[#8fa4c8] transition">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Image src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"} alt="PetCare" width={130} height={36} className="h-9 w-auto" />
          </div>

          {mode !== "forgot" && (
            <div className="flex bg-[#f8faff] dark:bg-[#1a2744] rounded-2xl p-1 mb-8">
              {(["login", "signup"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 text-sm font-semibold py-2.5 rounded-xl transition capitalize ${mode === m ? "bg-white dark:bg-[#162035] text-[#4399E1] shadow-sm" : "text-[#6b7a99] dark:text-[#8fa4c8] hover:text-[#4399E1]"}`}
                >
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-bold text-[#192A51] dark:text-white mb-1">
            {mode === "login" ? "Sign in to your account" : mode === "signup" ? "Create your account" : "Forgot password?"}
          </h2>
          <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8] mb-8">
            {mode === "login" ? "Enter your credentials to continue" : mode === "signup" ? "It only takes a minute — join free!" : "We'll send a reset link to your email"}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-[#192A51] dark:text-white block mb-1.5">Full Name</label>
                <div className="flex items-center bg-[#f8faff] dark:bg-[#1a2744] border border-border rounded-xl px-3.5 gap-2.5 focus-within:border-[#4399E1] transition">
                  <User size={16} className="text-[#6b7a99] shrink-0" />
                  <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Your full name" className="flex-1 py-3 text-sm bg-transparent outline-none text-[#192A51] dark:text-white placeholder:text-[#6b7a99]" required />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#192A51] dark:text-white block mb-1.5">Email Address</label>
              <div className="flex items-center bg-[#f8faff] dark:bg-[#1a2744] border border-border rounded-xl px-3.5 gap-2.5 focus-within:border-[#4399E1] transition">
                <Mail size={16} className="text-[#6b7a99] shrink-0" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="flex-1 py-3 text-sm bg-transparent outline-none text-[#192A51] dark:text-white placeholder:text-[#6b7a99]" required />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#192A51] dark:text-white">Password</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-[#FFA9AC] hover:underline font-medium">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="flex items-center bg-[#f8faff] dark:bg-[#1a2744] border border-border rounded-xl px-3.5 gap-2.5 focus-within:border-[#4399E1] transition">
                  <Lock size={16} className="text-[#6b7a99] shrink-0" />
                  <input value={password} onChange={e => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="••••••••" className="flex-1 py-3 text-sm bg-transparent outline-none text-[#192A51] dark:text-white placeholder:text-[#6b7a99]" required />
                  <button type="button" onClick={() => setShow(s => !s)} className="text-[#6b7a99] hover:text-[#4399E1] transition shrink-0">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 accent-[#4399E1] rounded" />
                <span className="text-sm text-[#6b7a99] dark:text-[#8fa4c8]">Remember me for 30 days</span>
              </label>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full bg-[#4399E1] hover:bg-[#2d84d0] disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md shadow-[#4399E1]/30"
            >
              {submitting ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>

            {mode === "forgot" && (
              <button type="button" onClick={() => setMode("login")} className="flex items-center justify-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#4399E1] transition">
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            )}
          </form>

          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-[#6b7a99]">or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm font-medium text-[#192A51] dark:text-white hover:bg-[#f8faff] dark:hover:bg-[#1a2744] transition">
                  <Globe size={16} className="text-[#4399E1]" /> Google
                </button>
                <button className="flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm font-medium text-[#192A51] dark:text-white hover:bg-[#f8faff] dark:hover:bg-[#1a2744] transition">
                  <Send size={16} className="text-[#4399E1]" /> Telegram
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
