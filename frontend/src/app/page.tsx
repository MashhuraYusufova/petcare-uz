"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Search, Star, ArrowRight, ShoppingBag, Stethoscope, BookOpen, Heart, Award,
  ChevronRight, Bone, Gamepad2, Scissors, Pill, Home, GraduationCap,
  Fish, Cat, Bath, PawPrint, UserRound, Truck, RefreshCw, ShieldCheck,
  MessageCircle, Salad, Hospital, Dog, ShoppingCart
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const categories = [
  { icon: Bone, label: "Food & Treats", color: "bg-[#DDEDFF]", count: "240+ items" },
  { icon: Gamepad2, label: "Toys & Play", color: "bg-[#ffeef0]", count: "120+ items" },
  { icon: Scissors, label: "Grooming", color: "bg-[#f0fdf4]", count: "80+ items" },
  { icon: Pill, label: "Health & Meds", color: "bg-[#fff7ed]", count: "60+ items" },
  { icon: Home, label: "Beds & Homes", color: "bg-[#faf5ff]", count: "95+ items" },
  { icon: GraduationCap, label: "Training", color: "bg-[#ecfdf5]", count: "45+ items" },
];

const productsData = [
  { id: "69f09bb2f72189a2330da568", name: "Royal Canin Adult — Salmon Recipe", price: 89000, oldPrice: 120000, rating: 4.8, reviews: 234, tag: "Bestseller", img: "/prod-1.jpg", brand: "Royal Canin" },
  { id: "69f09bb2f72189a2330da569", name: "Cat Interactive Feather Toy Set", price: 45000, oldPrice: null, rating: 4.6, reviews: 89, tag: "New", img: "/prod-2.jpg", brand: "Zooplus" },
  { id: "69f09bb2f72189a2330da56a", name: "Beaphar Dog Shampoo Sensitive", price: 32000, oldPrice: 40000, rating: 4.7, reviews: 156, tag: "Sale", img: "/prod-3.jpg", brand: "Beaphar" },
  { id: "69f0bc1fa7e3bf3929a7f317", name: "Royal Canin Puppy Starter Kit", price: 120000, oldPrice: null, rating: 4.9, reviews: 78, tag: "Popular", img: "/prod-4.jpg", brand: "Royal Canin" },
];

const vets = [
  { name: "Dr. Malika Yusupova", spec: "Small Animal Surgery", rating: 4.9, exp: "8 yrs", clinic: "Tashkent Animal Clinic", avail: true },
  { name: "Dr. Bobur Rahimov", spec: "Dermatology & Nutrition", rating: 4.8, exp: "5 yrs", clinic: "Happy Paws Vet Center", avail: true },
  { name: "Dr. Nilufar Karimova", spec: "Exotic Animals", rating: 4.7, exp: "10 yrs", clinic: "Pet Health Hub", avail: false },
];

const blogs = [
  { title: "10 Foods Your Dog Should Never Eat", cat: "Nutrition", read: "5 min", Icon: Salad, date: "Apr 20" },
  { title: "How to Prepare Your Cat for a Vet Visit", cat: "Health", read: "4 min", Icon: Hospital, date: "Apr 18" },
  { title: "Understanding Dog Body Language", cat: "Behavior", read: "7 min", Icon: Dog, date: "Apr 15" },
];

const features = [
  { Icon: Truck, title: "Free Delivery", desc: "Orders over 100,000 sum" },
  { Icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
  { Icon: ShieldCheck, title: "Secure Payment", desc: "100% safe checkout" },
  { Icon: MessageCircle, title: "24/7 Support", desc: "Always here to help" },
];

export default function HomePage() {
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const addToCart = async (productId: string) => {
    if (!api.getToken()) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    setAddingToCart(productId);
    try {
      await api.post("/api/cart", { productId, quantity: 1 });
      toast.success("Added to cart");
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #DDEDFF 0%, #ffffff 50%, #ffeef0 100%)" }} className="dark:bg-[#0f1825] py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="flex flex-col gap-6">
            <div style={{ backgroundColor: "rgba(67,153,225,0.1)", color: "#4399E1", borderRadius: "999px" }} className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 w-fit">
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4399E1", display: "inline-block" }} />
              Uzbekistan&apos;s #1 Pet Platform
            </div>
            <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: "#192A51", lineHeight: 1.15 }} className="text-4xl sm:text-5xl dark:text-white">
              Everything Your <span style={{ color: "#4399E1" }}>Pet Needs</span>,{" "}
              <br />In One Place
            </h1>
            <p style={{ fontFamily: "'Montserrat', sans-serif", color: "#6b7a99", maxWidth: 420 }} className="text-base leading-relaxed dark:text-[#8fa4c8]">
              Shop premium pet products, book trusted vets, and access expert care guides — all on PetCare.uz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" style={{ backgroundColor: "#4399E1", color: "#ffffff", borderRadius: "999px", fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }} className="flex items-center gap-2 px-6 py-3 hover:bg-[#2d84d0] transition">
                <ShoppingBag size={18} /> Shop Now
              </Link>
              <Link href="/vets" style={{ border: "1.5px solid #FFA9AC", color: "#FFA9AC", borderRadius: "999px", fontWeight: 600, backgroundColor: "#ffffff", fontFamily: "'Montserrat', sans-serif" }} className="flex items-center gap-2 px-6 py-3 hover:bg-[#ffeef0] transition dark:bg-[#1a2744]">
                <Stethoscope size={18} /> Book a Vet
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-2">
              {[["10K+", "Happy Pets"], ["200+", "Products"], ["50+", "Vets"]].map(([num, lbl]) => (
                <div key={lbl}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: "#192A51" }} className="text-xl dark:text-white">{num}</p>
                  <p style={{ color: "#6b7a99", fontSize: 12 }} className="dark:text-[#8fa4c8]">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — real photo */}
          <div className="flex items-center justify-center">
            <img
              src="/hero-pets.png"
              alt="A dog and cat together"
              style={{ width: "100%", maxWidth: 480, height: "auto", borderRadius: 24, display: "block" }}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-12">
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e8eef7", borderRadius: 16, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }} className="dark:bg-[#1a2744]">
            <Search size={20} style={{ color: "#6b7a99", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search products, vets, or care tips..."
              style={{ flex: 1, padding: "16px 0", fontSize: 14, background: "transparent", outline: "none", color: "#192A51", fontFamily: "'Montserrat', sans-serif" }}
              className="dark:text-white placeholder:text-[#6b7a99]"
            />
            <button style={{ backgroundColor: "#4399E1", color: "#ffffff", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", flexShrink: 0 }} className="hover:bg-[#2d84d0] transition">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 bg-white dark:bg-[#0f1825]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#192A51] dark:text-white">Shop by Category</h2>
              <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8] mt-1">Find everything your pet needs</p>
            </div>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-[#4399E1] hover:underline">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.label}
                href="/shop"
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#f8faff] dark:bg-[#1a2744] hover:shadow-md hover:-translate-y-0.5 transition-all border border-transparent hover:border-[#4399E1]/20 group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} dark:bg-[#1e3060] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <cat.icon size={26} className="text-[#4399E1]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#192A51] dark:text-white">{cat.label}</p>
                  <p className="text-[11px] text-[#6b7a99] dark:text-[#8fa4c8] mt-0.5">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16 px-6 bg-[#f8faff] dark:bg-[#111d2e]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#192A51] dark:text-white">Popular Products</h2>
              <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8] mt-1">Top picks loved by pet owners</p>
            </div>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-[#4399E1] hover:underline">
              See All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsData.map(p => (
              <div key={p.id} className="bg-white dark:bg-[#1a2744] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border group">
                <div className="relative h-44 overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${p.tag === "Sale" || p.tag === "Popular" || p.tag === "Bestseller" ? "bg-[#FFA9AC] text-white" : "bg-[#4399E1] text-white"}`}>
                    {p.tag}
                  </span>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-[#1a2744] rounded-full flex items-center justify-center shadow hover:scale-110 transition opacity-0 group-hover:opacity-100">
                    <Heart size={14} className="text-[#FFA9AC]" />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <p className="text-[11px] text-[#6b7a99] dark:text-[#8fa4c8] font-medium">{p.brand}</p>
                  <p className="text-sm font-semibold text-[#192A51] dark:text-white leading-snug">{p.name}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} className={i < Math.floor(p.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-600"} />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#6b7a99]">({p.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <span className="text-base font-bold text-[#192A51] dark:text-white">{p.price.toLocaleString()} sum</span>
                      {p.oldPrice && <span className="ml-2 text-xs line-through text-[#6b7a99]">{p.oldPrice.toLocaleString()}</span>}
                    </div>
                    <button
                      onClick={() => addToCart(p.id)}
                      disabled={addingToCart === p.id}
                      className="bg-[#4399E1] hover:bg-[#2d84d0] text-white p-2 rounded-xl transition disabled:opacity-50"
                    >
                      <ShoppingCart size={14} className={addingToCart === p.id ? "animate-pulse" : ""} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vets */}
      <section className="py-16 px-6 bg-white dark:bg-[#0f1825]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#192A51] dark:text-white">Top Veterinarians</h2>
              <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8] mt-1">Trusted professionals near you</p>
            </div>
            <Link href="/vets" className="flex items-center gap-1 text-sm font-semibold text-[#4399E1] hover:underline">
              All Vets <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map(v => (
              <div key={v.name} className="bg-[#f8faff] dark:bg-[#1a2744] rounded-2xl p-6 flex flex-col gap-4 border border-border hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#DDEDFF] dark:bg-[#1e3060] flex items-center justify-center shrink-0">
                    <UserRound size={32} className="text-[#4399E1]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-[#192A51] dark:text-white">{v.name}</p>
                    <p className="text-xs text-[#4399E1] font-medium">{v.spec}</p>
                    <p className="text-xs text-[#6b7a99] dark:text-[#8fa4c8]">{v.clinic}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[#6b7a99]">
                    <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /> {v.rating}</span>
                    <span>· {v.exp} exp</span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v.avail ? "bg-[#ffeef0] text-[#FFA9AC] dark:bg-[#FFA9AC]/20 dark:text-[#FFA9AC]" : "bg-[#fee2e2] text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                    ● {v.avail ? "Available" : "Busy"}
                  </span>
                </div>
                <Link href="/vets" className="w-full text-center bg-[#FFA9AC] hover:bg-[#f08d90] text-white text-sm font-semibold py-2.5 rounded-xl transition">
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="py-16 px-6 bg-[#f8faff] dark:bg-[#111d2e]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#192A51] dark:text-white">Pet Care Tips</h2>
              <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8] mt-1">Expert advice for happy, healthy pets</p>
            </div>
            <Link href="/learn" className="flex items-center gap-1 text-sm font-semibold text-[#4399E1] hover:underline">
              All Articles <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {blogs.map(b => (
              <Link key={b.title} href="/learn" className="bg-white dark:bg-[#1a2744] rounded-2xl overflow-hidden border border-border hover:shadow-md transition group">
                <div className="bg-[#DDEDFF] dark:bg-[#1e3060] h-36 flex items-center justify-center">
                  <b.Icon size={56} className="text-[#4399E1]/60" />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold bg-[#DDEDFF] dark:bg-[#1e3060] text-[#4399E1] px-2 py-0.5 rounded-full">{b.cat}</span>
                    <span className="text-[11px] text-[#6b7a99]">{b.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#192A51] dark:text-white leading-snug group-hover:text-[#4399E1] transition">{b.title}</p>
                  <p className="text-[11px] text-[#6b7a99] flex items-center gap-1"><BookOpen size={11} /> {b.read} read</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Charity Banner */}
      <section className="py-14 px-6 bg-gradient-to-r from-[#4399E1] to-[#2d84d0] dark:from-[#192A51] dark:to-[#1e3060]">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 bg-[#FFA9AC]/30 rounded-full flex items-center justify-center">
            <Heart size={32} className="text-white fill-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Help Stray Animals in Uzbekistan</h2>
          <p className="text-white/80 text-sm max-w-lg">For every purchase you make, 2% goes to local animal shelters. Together we can make a difference.</p>
          <div className="flex gap-4">
            <Link href="/shop" className="bg-white text-[#4399E1] font-bold px-6 py-3 rounded-full hover:bg-[#f0f6ff] transition text-sm flex items-center gap-2">
              <ShoppingBag size={16} /> Shop & Donate
            </Link>
            <button className="border border-white/50 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition text-sm flex items-center gap-2">
              <Award size={16} /> Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-10 px-6 bg-white dark:bg-[#0f1825] border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {features.map(f => (
            <div key={f.title} className="flex flex-col items-center gap-2">
              <f.Icon size={28} className="text-[#4399E1]" />
              <p className="text-sm font-semibold text-[#192A51] dark:text-white">{f.title}</p>
              <p className="text-xs text-[#6b7a99] dark:text-[#8fa4c8]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
