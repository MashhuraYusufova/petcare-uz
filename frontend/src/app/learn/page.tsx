"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, BookOpen, Clock, ArrowRight, Salad, Hospital, Dog, Scissors, Pill, Home, GraduationCap, PawPrint } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Article {
  id: string;
  title: string;
  cat: string;
  read: string;
  date: string;
  author: string;
  excerpt: string | null;
}

const categories = ["All", "Nutrition", "Health", "Behavior", "Grooming", "Care Tips"];

const catIconMap: Record<string, React.ElementType> = {
  Nutrition: Salad,
  Health: Hospital,
  Behavior: Dog,
  Grooming: Scissors,
  "Care Tips": Home,
  default: PawPrint,
};

const featured = {
  title: "The Complete Guide to First-Year Puppy Care",
  excerpt: "Everything you need to know about feeding, vaccinations, socialisation, training, and building a lifetime bond with your new puppy.",
  cat: "Care Tips",
  read: "12 min",
  date: "Apr 22, 2025",
  Icon: PawPrint,
  author: "Dr. Malika Yusupova",
};

export default function LearnPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activecat, setActivecat] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<Article[]>("/api/articles")
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a =>
    (activecat === "All" || a.cat === activecat) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-gradient-to-r from-[#DDEDFF] to-white dark:from-[#1a2744] dark:to-[#0f1825] py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#192A51] dark:text-white mb-2">Pet Care Learning Hub</h1>
          <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8]">Expert guides, tips, and advice from our veterinary team</p>
          <div className="mt-6 flex items-center bg-white dark:bg-[#1a2744] border border-border rounded-2xl shadow-sm overflow-hidden px-4 gap-3 max-w-xl">
            <Search size={18} className="text-[#6b7a99] shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 py-3.5 text-sm bg-transparent outline-none text-[#192A51] dark:text-white placeholder:text-[#6b7a99]"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="bg-gradient-to-r from-[#4399E1] to-[#192A51] rounded-3xl p-8 flex flex-col sm:flex-row gap-6 items-center mb-12 text-white shadow-lg shadow-[#4399E1]/20">
          <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <featured.Icon size={56} className="text-[#FFA9AC]" />
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <span className="text-xs font-semibold bg-[#FFA9AC]/30 text-[#FFA9AC] px-3 py-1 rounded-full w-fit">{featured.cat} · Featured</span>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">{featured.title}</h2>
            <p className="text-sm text-white/80 leading-relaxed">{featured.excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1"><BookOpen size={11} /> {featured.read} read</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {featured.date}</span>
              <span>By {featured.author}</span>
            </div>
            <button className="mt-1 flex items-center gap-2 bg-[#FFA9AC] hover:bg-[#f08d90] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition w-fit">
              Read Article <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActivecat(c)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition ${activecat === c ? "bg-[#4399E1] text-white shadow-sm" : "bg-white dark:bg-[#1a2744] border border-border text-[#6b7a99] dark:text-[#8fa4c8] hover:border-[#4399E1] hover:text-[#4399E1]"}`}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto text-sm text-[#6b7a99] self-center">{loading ? "..." : filtered.length} articles</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 bg-white dark:bg-[#1a2744] rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(a => {
              const Icon = catIconMap[a.cat] || catIconMap.default;
              return (
                <div key={a.id} className="bg-white dark:bg-[#1a2744] rounded-2xl overflow-hidden border border-border hover:shadow-md transition group cursor-pointer">
                  <div className="bg-[#DDEDFF] dark:bg-[#1e3060] h-36 flex items-center justify-center">
                    <Icon size={52} className="text-[#4399E1]/60 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold bg-[#DDEDFF] dark:bg-[#1e3060] text-[#4399E1] px-2 py-0.5 rounded-full">{a.cat}</span>
                      <span className="text-[10px] text-[#6b7a99]">{a.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#192A51] dark:text-white leading-snug group-hover:text-[#4399E1] transition line-clamp-2">{a.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-[#6b7a99] flex items-center gap-1"><BookOpen size={10} /> {a.read}</span>
                      <span className="text-[10px] text-[#6b7a99] truncate max-w-[100px]">{a.author}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
