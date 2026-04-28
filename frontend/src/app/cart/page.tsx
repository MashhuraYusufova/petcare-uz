"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  img: string;
  brand: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.getToken()) {
      setItems([]);
      setLoading(false);
      return;
    }

    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await api.get<CartItem[]>("/api/cart");
      setItems(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await api.patch(`/api/cart/${productId}`, { quantity: newQty });
      setItems(prev => prev.map(item =>
        item.productId === productId ? { ...item, quantity: newQty } : item
      ));
    } catch (err: any) {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.delete(`/api/cart/${productId}`);
      setItems(prev => prev.filter(item => item.productId !== productId));
      toast.success("Removed from cart");
    } catch (err: any) {
      toast.error("Failed to remove item");
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = items.length > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl font-bold text-[#192A51] dark:text-white mb-8 flex items-center gap-3">
          <ShoppingBag className="text-[#4399E1]" /> Shopping Cart
        </h1>

        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-white dark:bg-[#1a2744] rounded-2xl animate-pulse border border-border" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-[#1a2744] rounded-3xl p-12 text-center border border-border shadow-sm">
            <div className="w-20 h-20 bg-[#DDEDFF] dark:bg-[#1e3060] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-[#4399E1]" />
            </div>
            <h2 className="text-xl font-bold text-[#192A51] dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-[#6b7a99] dark:text-[#8fa4c8] mb-8">Looks like you haven't added any premium products yet.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[#4399E1] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#2d84d0] transition shadow-lg shadow-blue-200 dark:shadow-none">
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-white dark:bg-[#1a2744] rounded-2xl p-4 border border-border shadow-sm flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-border">
                    <img src={item.product.img} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#4399E1] font-bold uppercase tracking-wider">{item.product.brand}</p>
                    <h3 className="text-lg font-bold text-[#192A51] dark:text-white truncate">{item.product.name}</h3>
                    <p className="text-[#4399E1] font-bold mt-1">{item.product.price.toLocaleString()} sum</p>
                  </div>
                  <div className="flex items-center gap-3 bg-[#f8fafc] dark:bg-[#0f172a] p-1.5 rounded-xl border border-border">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-[#1a2744] transition text-[#192A51] dark:text-white"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-[#192A51] dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-[#1a2744] transition text-[#192A51] dark:text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-3 text-[#FFA9AC] hover:bg-[#FFF5F5] dark:hover:bg-[#2d1a1a] rounded-xl transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-white dark:bg-[#1a2744] rounded-3xl p-6 border border-border shadow-sm sticky top-8">
                <h3 className="text-xl font-bold text-[#192A51] dark:text-white mb-6">Order Summary</h3>
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex justify-between text-[#6b7a99] dark:text-[#8fa4c8]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#192A51] dark:text-white">{subtotal.toLocaleString()} sum</span>
                  </div>
                  <div className="flex justify-between text-[#6b7a99] dark:text-[#8fa4c8]">
                    <span>Shipping</span>
                    <span className="font-bold text-[#192A51] dark:text-white">{shipping.toLocaleString()} sum</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-[#192A51] dark:text-white">Total</span>
                    <span className="text-[#4399E1]">{total.toLocaleString()} sum</span>
                  </div>
                </div>
                <button className="w-full bg-[#192A51] text-white py-4 rounded-2xl font-bold mt-8 hover:bg-[#253d75] transition shadow-lg">
                  Checkout Now
                </button>
                <Link href="/shop" className="block text-center text-sm font-bold text-[#4399E1] mt-4 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
