"use client";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, ShoppingCart, User, Menu, X, Globe, Heart } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Vet Booking", href: "/vets" },
  { label: "Learn", href: "/learn" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "UZ">("EN");
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0f1825]/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0">
          {theme === "dark" ? (
            <Image src="/logo-dark.png" alt="PetCare" width={140} height={40} className="h-10 w-auto" priority />
          ) : (
            <Image src="/logo-light.png" alt="PetCare" width={140} height={40} className="h-10 w-auto" priority />
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#192A51] dark:text-[#c8d8f0] hover:text-[#4399E1] dark:hover:text-[#4399E1] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(l => l === "EN" ? "UZ" : "EN")}
            className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#6b7a99] dark:text-[#8fa4c8] hover:text-[#4399E1] px-2 py-1 rounded-lg hover:bg-[#DDEDFF] dark:hover:bg-[#1e3060] transition"
          >
            <Globe size={14} />
            {lang}
          </button>

          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#DDEDFF] dark:hover:bg-[#1e3060] text-[#6b7a99] dark:text-[#8fa4c8] hover:text-[#4399E1] transition"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link
            href="/dashboard"
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-[#DDEDFF] dark:hover:bg-[#1e3060] text-[#6b7a99] dark:text-[#8fa4c8] hover:text-[#FFA9AC] transition"
          >
            <Heart size={18} />
          </Link>

          <Link
            href="/shop"
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#DDEDFF] dark:hover:bg-[#1e3060] text-[#6b7a99] dark:text-[#8fa4c8] hover:text-[#4399E1] transition"
          >
            <ShoppingCart size={18} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#4399E1] text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={user.role === "admin" ? "/admin" : user.role === "vet" ? "/vet-dashboard" : "/dashboard"}
                className="flex items-center gap-1.5 bg-[#DDEDFF] dark:bg-[#1e3060] text-[#4399E1] text-sm font-semibold px-4 py-2 rounded-full transition hover:bg-[#4399E1] hover:text-white"
              >
                <User size={14} />
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={logout}
                className="text-xs text-[#6b7a99] hover:text-red-400 transition font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="hidden md:flex items-center gap-1.5 bg-[#4399E1] hover:bg-[#2d84d0] text-white text-sm font-semibold px-4 py-2 rounded-full transition"
            >
              <User size={14} />
              Sign In
            </Link>
          )}

          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#DDEDFF] dark:hover:bg-[#1e3060] text-[#192A51] dark:text-white transition"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white dark:bg-[#0f1825] px-4 py-4 flex flex-col gap-3">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-[#192A51] dark:text-[#c8d8f0] hover:text-[#4399E1] transition py-2 border-b border-border last:border-0"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href={user.role === "admin" ? "/admin" : user.role === "vet" ? "/vet-dashboard" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-[#4399E1] text-white text-sm font-semibold px-4 py-2.5 rounded-full"
              >
                <User size={14} /> {user.role === "admin" ? "Admin Panel" : user.role === "vet" ? "Vet Dashboard" : "Dashboard"}
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm text-red-400 font-medium py-1">Sign Out</button>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 bg-[#4399E1] text-white text-sm font-semibold px-4 py-2.5 rounded-full"
            >
              <User size={14} />
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
