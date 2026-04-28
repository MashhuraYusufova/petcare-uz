"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Star, Heart, SlidersHorizontal, ChevronDown, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviews: number;
  tag: string | null;
  img: string;
  brand: string;
  cat: string;
}

const categories = ["All", "Food & Treats", "Toys", "Grooming", "Health", "Beds", "Training"];
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Best Rating", "Newest"];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activecat, setActivecat] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    api.get<Product[]>("/api/products")
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (productId: string) => {
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

  let filtered = products.filter(p =>
    (activecat === "All" || p.cat === activecat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (sort === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === "Best Rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-gradient-to-r from-[#DDEDFF] to-white dark:from-[#1a2744] dark:to-[#0f1825] py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#192A51] dark:text-white mb-2">Pet Shop</h1>
          <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8]">Premium products for your beloved pets</p>
          <div className="mt-6 flex items-center bg-white dark:bg-[#1a2744] border border-border rounded-2xl shadow-sm overflow-hidden px-4 gap-3 max-w-xl">
            <Search size={18} className="text-[#6b7a99] shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 py-3.5 text-sm bg-transparent outline-none text-[#192A51] dark:text-white placeholder:text-[#6b7a99]"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex gap-8">
        <aside className="hidden lg:flex flex-col gap-6 w-56 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#192A51] dark:text-white mb-3 flex items-center gap-2"><SlidersHorizontal size={14} /> Filters</h3>
            <div className="flex flex-col gap-1">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setActivecat(c)}
                  className={`text-left text-sm px-3 py-2 rounded-xl transition font-medium ${activecat === c ? "bg-[#4399E1] text-white" : "text-[#6b7a99] dark:text-[#8fa4c8] hover:bg-[#DDEDFF] dark:hover:bg-[#1e3060]"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#192A51] dark:text-white mb-3">Price Range</h3>
            <div className="flex flex-col gap-2">
              {["Under 50,000", "50,000 – 150,000", "150,000 – 300,000", "Over 300,000"].map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-[#4399E1] w-4 h-4 rounded" />
                  <span className="text-sm text-[#6b7a99] dark:text-[#8fa4c8]">{r} sum</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#192A51] dark:text-white mb-3">Rating</h3>
            {[5, 4, 3].map(r => (
              <label key={r} className="flex items-center gap-2 cursor-pointer mb-1.5">
                <input type="checkbox" className="accent-[#4399E1] w-4 h-4 rounded" />
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: r }).map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                  {Array.from({ length: 5 - r }).map((_, i) => <Star key={i} size={12} className="text-gray-200 dark:text-gray-600" />)}
                </div>
                <span className="text-xs text-[#6b7a99]">& up</span>
              </label>
            ))}
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8]">
              <span className="font-semibold text-[#192A51] dark:text-white">{loading ? "..." : filtered.length}</span> products found
            </p>
            <div className="flex items-center gap-2">
              <div className="lg:hidden flex gap-2 overflow-x-auto">
                {categories.slice(0, 4).map(c => (
                  <button
                    key={c}
                    onClick={() => setActivecat(c)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition ${activecat === c ? "bg-[#4399E1] text-white" : "bg-white dark:bg-[#1a2744] border border-border text-[#6b7a99]"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="text-sm bg-white dark:bg-[#1a2744] border border-border text-[#192A51] dark:text-white rounded-xl px-3 py-2 pr-8 outline-none appearance-none cursor-pointer"
                >
                  {sortOptions.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7a99] pointer-events-none" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-white dark:bg-[#1a2744] rounded-2xl border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => (
                <div key={p.id} className="bg-white dark:bg-[#1a2744] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition border border-border group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {p.tag && (
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tag === "Sale" || p.tag === "Bestseller" || p.tag === "Popular" ? "bg-[#FFA9AC] text-white" : "bg-[#4399E1] text-white"}`}>
                        {p.tag}
                      </span>
                    )}
                    <button
                      onClick={() => setWishlist(w => w.includes(p.id) ? w.filter(i => i !== p.id) : [...w, p.id])}
                      className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-[#1a2744] rounded-full flex items-center justify-center shadow transition opacity-0 group-hover:opacity-100"
                    >
                      <Heart size={13} className={wishlist.includes(p.id) ? "fill-[#FFA9AC] text-[#FFA9AC]" : "text-[#6b7a99]"} />
                    </button>
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    <p className="text-[10px] text-[#4399E1] font-medium">{p.brand}</p>
                    <p className="text-sm font-semibold text-[#192A51] dark:text-white leading-tight">{p.name}</p>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[11px] text-[#6b7a99]">{p.rating} ({p.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <span className="text-sm font-bold text-[#192A51] dark:text-white">{p.price.toLocaleString()}</span>
                        {p.oldPrice && <span className="ml-1 text-[10px] line-through text-[#6b7a99]">{p.oldPrice.toLocaleString()}</span>}
                      </div>
                      <button
                        onClick={() => addToCart(p.id)}
                        disabled={addingToCart === p.id}
                        className="bg-[#4399E1] hover:bg-[#2d84d0] text-white p-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        <ShoppingCart size={13} className={addingToCart === p.id ? "animate-pulse" : ""} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
