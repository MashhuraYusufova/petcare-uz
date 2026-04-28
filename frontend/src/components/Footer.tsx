import Link from "next/link";
import { Heart } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#DDEDFF] dark:bg-[#0a1220] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-light.png" alt="PetCare" width={130} height={36} className="h-9 w-auto dark:hidden" />
            <Image src="/logo-dark.png" alt="PetCare" width={130} height={36} className="h-9 w-auto hidden dark:block brightness-0 invert" />
          </div>
          <p className="text-sm text-[#4399E1] dark:text-[#8fa4c8] leading-relaxed">
            Your all-in-one platform for pet products, vet appointments, and expert pet care advice.
          </p>
          <p className="text-xs text-[#192A51]/60 dark:text-[#6b7a99]">contact@petcare.uz · +998 71 123 45 67</p>
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-[#FFA9AC]">Platform</h4>
          {["Shop", "Vet Booking", "Learn", "Community"].map(l => (
            <Link key={l} href="#" className="text-sm text-[#192A51] dark:text-[#8fa4c8] hover:text-[#4399E1] dark:hover:text-white transition">{l}</Link>
          ))}
        </div>

        {/* Account */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-[#FFA9AC]">Account</h4>
          {["Sign In", "Sign Up", "Dashboard", "Orders", "Wishlist"].map(l => (
            <Link key={l} href="#" className="text-sm text-[#192A51] dark:text-[#8fa4c8] hover:text-[#4399E1] dark:hover:text-white transition">{l}</Link>
          ))}
        </div>

        {/* Support */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-[#FFA9AC]">Support</h4>
          {["Help Center", "Privacy Policy", "Terms of Service", "About Us"].map(l => (
            <Link key={l} href="#" className="text-sm text-[#192A51] dark:text-[#8fa4c8] hover:text-[#4399E1] dark:hover:text-white transition">{l}</Link>
          ))}
        </div>
      </div>

      <div className="border-t border-[#4399E1]/20 dark:border-white/10 py-5 px-6">
        <p className="text-center text-xs text-[#192A51]/60 dark:text-[#6b7a99] flex items-center justify-center gap-1">
          © 2025 PetCare.uz · Made with <Heart size={12} className="text-[#FFA9AC] fill-[#FFA9AC]" /> for pets everywhere
        </p>
      </div>
    </footer>
  );
}
