"use client";
import { useState, useEffect, type FormEvent } from "react";
import { LayoutDashboard, ShoppingBag, Stethoscope, BookOpen, Calendar, BarChart3, Users, Settings, Menu, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: ShoppingBag, label: "Products" },
  { icon: Stethoscope, label: "Veterinarians" },
  { icon: BookOpen, label: "Blog Posts" },
  { icon: Calendar, label: "Appointments" },
  { icon: Users, label: "Users" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

interface OverviewStats {
  usersCount: number; ordersCount: number; appointmentsCount: number;
  productsCount: number; vetsCount: number; totalRevenue: number;
}

interface Product {
  id: string; name: string; price: number; oldPrice: number | null;
  rating: number; reviews: number; tag: string | null; img: string;
  brand: string; cat: string; stock: number;
}

interface Vet {
  id: string; name: string; spec: string; clinic: string; district: string;
  rating: number; reviews: number; exp: string; price: string; avail: boolean;
  email?: string | null; slots?: string[];
}

interface Appointment {
  id: string; date: string; status: string; reason: string | null;
  vet: { id: string; name: string; spec: string; clinic: string };
  user: { id: string; name: string; email: string };
}

interface User {
  id: string; name: string; email: string; role: string; createdAt: string;
}

const productInputClass = "w-full rounded-xl border border-border bg-[#f8faff] dark:bg-[#162035] px-3 py-2.5 text-sm text-[#192A51] dark:text-white outline-none transition focus:border-[#4399E1]";
const productLabelClass = "text-xs font-semibold text-[#192A51] dark:text-white";

const initialProductForm = {
  name: "",
  price: "",
  oldPrice: "",
  rating: "4.8",
  reviews: "0",
  tag: "",
  img: "",
  brand: "",
  cat: "",
  stock: "0",
};

const initialVetForm = {
  name: "",
  spec: "",
  clinic: "",
  district: "",
  rating: "5",
  reviews: "0",
  exp: "",
  price: "",
  avail: true,
  slots: "",
  email: "",
};

function productToForm(product: Product) {
  return {
    name: product.name,
    price: String(product.price),
    oldPrice: product.oldPrice == null ? "" : String(product.oldPrice),
    rating: String(product.rating),
    reviews: String(product.reviews),
    tag: product.tag ?? "",
    img: product.img,
    brand: product.brand,
    cat: product.cat,
    stock: String(product.stock),
  };
}

function vetToForm(vet: Vet) {
  return {
    name: vet.name,
    spec: vet.spec,
    clinic: vet.clinic,
    district: vet.district,
    rating: String(vet.rating),
    reviews: String(vet.reviews),
    exp: vet.exp,
    price: vet.price,
    avail: vet.avail,
    slots: (vet.slots ?? []).join(", "),
    email: vet.email ?? "",
  };
}

export default function AdminPage() {
  const [tab, setTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showVetForm, setShowVetForm] = useState(false);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [vetForm, setVetForm] = useState(initialVetForm);
  const [productError, setProductError] = useState("");
  const [vetError, setVetError] = useState("");
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [submittingVet, setSubmittingVet] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingVetId, setEditingVetId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
    if (!authLoading && user && user.role !== "admin") router.push("/dashboard");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    Promise.all([
      api.get<OverviewStats>("/api/admin/overview"),
      api.get<Product[]>("/api/products"),
      api.get<Vet[]>("/api/vets"),
      api.get<Appointment[]>("/api/admin/appointments"),
    ]).then(([s, p, v, a]) => {
      setStats(s); setProducts(p); setVets(v); setAppointments(a);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "admin" || tab !== "Users") return;
    api.get<User[]>("/api/admin/users").then(setUsers).catch(console.error);
  }, [tab, user]);

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/api/admin/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function deleteVet(id: string) {
    if (!confirm("Remove this vet?")) return;
    await api.delete(`/api/admin/vets/${id}`);
    setVets(prev => prev.filter(v => v.id !== id));
  }

  async function changeRole(id: string, role: string) {
    await api.patch(`/api/admin/users/${id}/role`, { role });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  }

  function resetProductForm() {
    setProductForm(initialProductForm);
    setProductError("");
    setEditingProductId(null);
    setShowProductForm(false);
  }

  function resetVetForm() {
    setVetForm(initialVetForm);
    setVetError("");
    setEditingVetId(null);
    setShowVetForm(false);
  }

  function startCreateProduct() {
    setEditingProductId(null);
    setProductForm(initialProductForm);
    setProductError("");
    setShowProductForm(prev => !prev || editingProductId !== null);
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setProductForm(productToForm(product));
    setProductError("");
    setShowProductForm(true);
  }

  function startCreateVet() {
    setEditingVetId(null);
    setVetForm(initialVetForm);
    setVetError("");
    setShowVetForm(prev => !prev || editingVetId !== null);
  }

  function startEditVet(vet: Vet) {
    setEditingVetId(vet.id);
    setVetForm(vetToForm(vet));
    setVetError("");
    setShowVetForm(true);
  }

  async function submitProduct(e: FormEvent) {
    e.preventDefault();
    setProductError("");
    setSubmittingProduct(true);
    const payload = {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
      rating: Number(productForm.rating),
      reviews: Number(productForm.reviews),
      tag: productForm.tag.trim() || null,
      img: productForm.img.trim(),
      brand: productForm.brand.trim(),
      cat: productForm.cat.trim(),
      stock: Number(productForm.stock),
    };
    try {
      if (editingProductId) {
        const updated = await api.put<Product>(`/api/admin/products/${editingProductId}`, payload);
        setProducts(prev => prev.map(product => product.id === editingProductId ? updated : product));
      } else {
        const created = await api.post<Product>("/api/admin/products", payload);
        setProducts(prev => [created, ...prev]);
        setStats(prev => prev ? { ...prev, productsCount: prev.productsCount + 1 } : prev);
      }
      resetProductForm();
    } catch (err: any) {
      setProductError(err.message);
    } finally {
      setSubmittingProduct(false);
    }
  }

  async function submitVet(e: FormEvent) {
    e.preventDefault();
    setVetError("");
    setSubmittingVet(true);
    const payload = {
      name: vetForm.name.trim(),
      spec: vetForm.spec.trim(),
      clinic: vetForm.clinic.trim(),
      district: vetForm.district.trim(),
      rating: Number(vetForm.rating),
      reviews: Number(vetForm.reviews),
      exp: vetForm.exp.trim(),
      price: vetForm.price.trim(),
      avail: vetForm.avail,
      slots: vetForm.slots
        .split(",")
        .map(slot => slot.trim())
        .filter(Boolean),
      email: vetForm.email.trim() || null,
    };
    try {
      if (editingVetId) {
        const updated = await api.put<Vet>(`/api/admin/vets/${editingVetId}`, payload);
        setVets(prev => prev.map(vet => vet.id === editingVetId ? updated : vet));
      } else {
        const created = await api.post<Vet>("/api/admin/vets", payload);
        setVets(prev => [created, ...prev]);
        setStats(prev => prev ? { ...prev, vetsCount: prev.vetsCount + 1 } : prev);
      }
      resetVetForm();
    } catch (err: any) {
      setVetError(err.message);
    } finally {
      setSubmittingVet(false);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex bg-[#f8faff] dark:bg-[#0a1220]">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-60 bg-[#192A51] dark:bg-[#0f1825] text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4399E1] rounded-full flex items-center justify-center text-sm">🐾</div>
            <span className="font-bold">Pet<span className="text-[#4399E1]">Care</span> Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {navItems.map(n => (
            <button
              key={n.label}
              onClick={() => { setTab(n.label); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-xl mb-1 transition text-left ${tab === n.label ? "bg-[#4399E1] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              <n.icon size={16} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition flex items-center gap-1">← Back to Site</Link>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-[#1a2744] border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={20} className="text-[#192A51] dark:text-white" /></button>
            <div>
              <h1 className="font-bold text-[#192A51] dark:text-white">{tab}</h1>
              <p className="text-xs text-[#6b7a99]">Admin Dashboard · PetCare.uz</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f8faff] dark:hover:bg-[#1e3060] text-[#6b7a99]">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="w-8 h-8 bg-[#4399E1] rounded-full flex items-center justify-center text-sm text-white font-bold">
              {user.name[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-6 overflow-auto">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white dark:bg-[#1a2744] rounded-2xl border border-border animate-pulse" />)}
            </div>
          ) : (
            <>
              {tab === "Overview" && stats && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Revenue", value: `${stats.totalRevenue.toLocaleString()} sum`, change: "+18%", up: true, icon: "💰" },
                      { label: "Total Orders", value: stats.ordersCount.toString(), change: "+12%", up: true, icon: "📦" },
                      { label: "Active Users", value: stats.usersCount.toString(), change: "+8%", up: true, icon: "👤" },
                      { label: "Vet Appointments", value: stats.appointmentsCount.toString(), change: "", up: true, icon: "🩺" },
                    ].map(s => (
                      <div key={s.label} className="bg-white dark:bg-[#1a2744] rounded-2xl p-5 border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{s.icon}</span>
                          {s.change && (
                            <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? "text-green-600" : "text-red-500"}`}>
                              {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change}
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-[#192A51] dark:text-white">{s.value}</p>
                        <p className="text-xs text-[#6b7a99] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <p className="font-semibold text-[#192A51] dark:text-white text-sm">Recent Appointments</p>
                      <button onClick={() => setTab("Appointments")} className="text-xs text-[#4399E1] hover:underline">View all</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#f8faff] dark:bg-[#162035]">
                          <tr>{["User", "Vet", "Date", "Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6b7a99]">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {appointments.slice(0, 5).map(a => (
                            <tr key={a.id} className="border-t border-border hover:bg-[#f8faff] dark:hover:bg-[#162035] transition">
                              <td className="px-4 py-3 font-medium text-[#192A51] dark:text-white">{a.user.name}</td>
                              <td className="px-4 py-3 text-[#6b7a99]">{a.vet.name}</td>
                              <td className="px-4 py-3 text-[#6b7a99]">{a.date}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  a.status === "Confirmed" ? "bg-[#dcfce7] text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                  a.status === "Completed" ? "bg-[#DDEDFF] text-[#4399E1]" :
                                  a.status === "Cancelled" || a.status === "Declined" ? "bg-[#fee2e2] text-red-600" :
                                  "bg-[#fff7ed] text-amber-700"
                                }`}>{a.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab === "Products" && (
                <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <p className="font-semibold text-[#192A51] dark:text-white text-sm">Manage Products ({products.length})</p>
                    <button
                      onClick={startCreateProduct}
                      className="bg-[#4399E1] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2d84d0] transition"
                    >
                      {showProductForm && !editingProductId ? "Close Form" : "+ Add Product"}
                    </button>
                  </div>
                  {showProductForm && (
                    <form onSubmit={submitProduct} className="border-b border-border p-4 sm:p-5 bg-[#f8faff] dark:bg-[#162035]">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#192A51] dark:text-white">
                            {editingProductId ? "Edit Product" : "New Product"}
                          </p>
                          <p className="text-xs text-[#6b7a99]">
                            {editingProductId ? "Update the selected product and save changes." : "Create a new catalog item for the store."}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <label className="flex flex-col gap-1.5 xl:col-span-2">
                          <span className={productLabelClass}>Product Name</span>
                          <input value={productForm.name} onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))} className={productInputClass} required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Brand</span>
                          <input value={productForm.brand} onChange={e => setProductForm(prev => ({ ...prev, brand: e.target.value }))} className={productInputClass} required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Category</span>
                          <input value={productForm.cat} onChange={e => setProductForm(prev => ({ ...prev, cat: e.target.value }))} className={productInputClass} required />
                        </label>
                        <label className="flex flex-col gap-1.5 xl:col-span-2">
                          <span className={productLabelClass}>Image URL or Path</span>
                          <input value={productForm.img} onChange={e => setProductForm(prev => ({ ...prev, img: e.target.value }))} className={productInputClass} placeholder="/prod-4.jpg" required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Price</span>
                          <input value={productForm.price} onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))} className={productInputClass} type="number" min="0" required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Old Price</span>
                          <input value={productForm.oldPrice} onChange={e => setProductForm(prev => ({ ...prev, oldPrice: e.target.value }))} className={productInputClass} type="number" min="0" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Rating</span>
                          <input value={productForm.rating} onChange={e => setProductForm(prev => ({ ...prev, rating: e.target.value }))} className={productInputClass} type="number" min="0" max="5" step="0.1" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Reviews</span>
                          <input value={productForm.reviews} onChange={e => setProductForm(prev => ({ ...prev, reviews: e.target.value }))} className={productInputClass} type="number" min="0" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Stock</span>
                          <input value={productForm.stock} onChange={e => setProductForm(prev => ({ ...prev, stock: e.target.value }))} className={productInputClass} type="number" min="0" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Tag</span>
                          <input value={productForm.tag} onChange={e => setProductForm(prev => ({ ...prev, tag: e.target.value }))} className={productInputClass} placeholder="New, Sale, Bestseller" />
                        </label>
                      </div>
                      {productError && <p className="mt-4 text-sm text-red-500">{productError}</p>}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="submit" disabled={submittingProduct} className="bg-[#4399E1] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#2d84d0] disabled:opacity-60 transition">
                          {submittingProduct ? "Saving..." : editingProductId ? "Save Product" : "Create Product"}
                        </button>
                        <button
                          type="button"
                          onClick={resetProductForm}
                          className="text-sm font-semibold px-4 py-2.5 rounded-xl border border-border text-[#6b7a99] hover:bg-white dark:hover:bg-[#1a2744] transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f8faff] dark:bg-[#162035]">
                        <tr>{["Product", "Category", "Stock", "Price", "Rating", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6b7a99]">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id} className="border-t border-border hover:bg-[#f8faff] dark:hover:bg-[#162035] transition">
                            <td className="px-4 py-3 font-medium text-[#192A51] dark:text-white max-w-[200px] truncate">{p.name}</td>
                            <td className="px-4 py-3 text-[#6b7a99]">{p.cat}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                (p.stock ?? 0) === 0 ? "bg-[#fee2e2] text-red-600" :
                                (p.stock ?? 0) < 10 ? "bg-[#fff7ed] text-amber-700" :
                                "bg-[#dcfce7] text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              }`}>{(p.stock ?? 0) === 0 ? "Out of Stock" : (p.stock ?? 0) < 10 ? `Low (${p.stock})` : p.stock}</span>
                            </td>
                            <td className="px-4 py-3 text-[#6b7a99]">{p.price.toLocaleString()} sum</td>
                            <td className="px-4 py-3 text-amber-500 font-semibold">⭐ {p.rating}</td>
                            <td className="px-4 py-3 flex gap-2">
                              <button onClick={() => startEditProduct(p)} className="text-xs text-[#4399E1] hover:underline">Edit</button>
                              <button onClick={() => deleteProduct(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === "Veterinarians" && (
                <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <p className="font-semibold text-[#192A51] dark:text-white text-sm">Manage Veterinarians ({vets.length})</p>
                    <button
                      onClick={startCreateVet}
                      className="bg-[#4399E1] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2d84d0] transition"
                    >
                      {showVetForm && !editingVetId ? "Close Form" : "+ Add Vet"}
                    </button>
                  </div>
                  {showVetForm && (
                    <form onSubmit={submitVet} className="border-b border-border p-4 sm:p-5 bg-[#f8faff] dark:bg-[#162035]">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#192A51] dark:text-white">
                            {editingVetId ? "Edit Veterinarian" : "New Veterinarian"}
                          </p>
                          <p className="text-xs text-[#6b7a99]">
                            {editingVetId ? "Update profile details, availability, and vet email link." : "Create a new vet profile available in booking and discovery."}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Full Name</span>
                          <input value={vetForm.name} onChange={e => setVetForm(prev => ({ ...prev, name: e.target.value }))} className={productInputClass} required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Specialization</span>
                          <input value={vetForm.spec} onChange={e => setVetForm(prev => ({ ...prev, spec: e.target.value }))} className={productInputClass} required />
                        </label>
                        <label className="flex flex-col gap-1.5 xl:col-span-2">
                          <span className={productLabelClass}>Clinic</span>
                          <input value={vetForm.clinic} onChange={e => setVetForm(prev => ({ ...prev, clinic: e.target.value }))} className={productInputClass} required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>District</span>
                          <input value={vetForm.district} onChange={e => setVetForm(prev => ({ ...prev, district: e.target.value }))} className={productInputClass} required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Experience</span>
                          <input value={vetForm.exp} onChange={e => setVetForm(prev => ({ ...prev, exp: e.target.value }))} className={productInputClass} placeholder="5 years" required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Price</span>
                          <input value={vetForm.price} onChange={e => setVetForm(prev => ({ ...prev, price: e.target.value }))} className={productInputClass} placeholder="50,000 UZS" required />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Email</span>
                          <input value={vetForm.email} onChange={e => setVetForm(prev => ({ ...prev, email: e.target.value }))} className={productInputClass} type="email" placeholder="vet@email.com" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Rating</span>
                          <input value={vetForm.rating} onChange={e => setVetForm(prev => ({ ...prev, rating: e.target.value }))} className={productInputClass} type="number" min="0" max="5" step="0.1" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={productLabelClass}>Reviews</span>
                          <input value={vetForm.reviews} onChange={e => setVetForm(prev => ({ ...prev, reviews: e.target.value }))} className={productInputClass} type="number" min="0" />
                        </label>
                        <label className="flex flex-col gap-1.5 xl:col-span-2">
                          <span className={productLabelClass}>Available Slots</span>
                          <input value={vetForm.slots} onChange={e => setVetForm(prev => ({ ...prev, slots: e.target.value }))} className={productInputClass} placeholder="09:00, 10:00, 14:30" />
                        </label>
                        <label className="flex items-center gap-2 self-end rounded-xl border border-border bg-white dark:bg-[#1a2744] px-3 py-2.5">
                          <input checked={vetForm.avail} onChange={e => setVetForm(prev => ({ ...prev, avail: e.target.checked }))} type="checkbox" className="accent-[#4399E1]" />
                          <span className="text-sm text-[#192A51] dark:text-white">Available for booking</span>
                        </label>
                      </div>
                      {vetError && <p className="mt-4 text-sm text-red-500">{vetError}</p>}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="submit" disabled={submittingVet} className="bg-[#4399E1] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#2d84d0] disabled:opacity-60 transition">
                          {submittingVet ? "Saving..." : editingVetId ? "Save Vet" : "Create Vet"}
                        </button>
                        <button
                          type="button"
                          onClick={resetVetForm}
                          className="text-sm font-semibold px-4 py-2.5 rounded-xl border border-border text-[#6b7a99] hover:bg-white dark:hover:bg-[#1a2744] transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f8faff] dark:bg-[#162035]">
                        <tr>{["Vet", "Specialization", "Clinic", "Rating", "Status", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6b7a99]">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {vets.map(v => (
                          <tr key={v.id} className="border-t border-border hover:bg-[#f8faff] dark:hover:bg-[#162035] transition">
                            <td className="px-4 py-3 font-medium text-[#192A51] dark:text-white">{v.name}</td>
                            <td className="px-4 py-3 text-[#6b7a99]">{v.spec}</td>
                            <td className="px-4 py-3 text-[#6b7a99] max-w-[140px] truncate">{v.clinic}</td>
                            <td className="px-4 py-3 text-amber-500 font-semibold">⭐ {v.rating}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.avail ? "bg-[#dcfce7] text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-[#fff7ed] text-amber-700"}`}>
                                {v.avail ? "Available" : "Unavailable"}
                              </span>
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                              <button onClick={() => startEditVet(v)} className="text-xs text-[#4399E1] hover:underline">Edit</button>
                              <button onClick={() => deleteVet(v.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === "Appointments" && (
                <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-[#192A51] dark:text-white text-sm">All Appointments ({appointments.length})</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f8faff] dark:bg-[#162035]">
                        <tr>{["User", "Vet", "Date", "Reason", "Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6b7a99]">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {appointments.map(a => (
                          <tr key={a.id} className="border-t border-border hover:bg-[#f8faff] dark:hover:bg-[#162035] transition">
                            <td className="px-4 py-3 font-medium text-[#192A51] dark:text-white">{a.user.name}</td>
                            <td className="px-4 py-3 text-[#6b7a99]">{a.vet.name}</td>
                            <td className="px-4 py-3 text-[#6b7a99] whitespace-nowrap">{a.date}</td>
                            <td className="px-4 py-3 text-[#6b7a99] max-w-[160px] truncate">{a.reason || "—"}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                a.status === "Confirmed" ? "bg-[#dcfce7] text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                a.status === "Completed" ? "bg-[#DDEDFF] text-[#4399E1]" :
                                a.status === "Cancelled" || a.status === "Declined" ? "bg-[#fee2e2] text-red-600" :
                                "bg-[#fff7ed] text-amber-700"
                              }`}>{a.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === "Users" && (
                <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-[#192A51] dark:text-white text-sm">All Users ({users.length})</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f8faff] dark:bg-[#162035]">
                        <tr>{["Name", "Email", "Role", "Joined", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6b7a99]">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="border-t border-border hover:bg-[#f8faff] dark:hover:bg-[#162035] transition">
                            <td className="px-4 py-3 font-medium text-[#192A51] dark:text-white">{u.name}</td>
                            <td className="px-4 py-3 text-[#6b7a99]">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                u.role === "admin" ? "bg-[#DDEDFF] text-[#4399E1]" :
                                u.role === "vet" ? "bg-[#faf5ff] text-purple-600" :
                                "bg-[#f0f0f0] dark:bg-[#1e3060] text-[#6b7a99]"
                              }`}>{u.role}</span>
                            </td>
                            <td className="px-4 py-3 text-[#6b7a99] text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 flex gap-2">
                              {u.id !== user.id && (
                                <>
                                  <button onClick={() => changeRole(u.id, u.role === "admin" ? "user" : "admin")} className="text-xs text-[#4399E1] hover:underline">
                                    {u.role === "admin" ? "Demote" : "Make Admin"}
                                  </button>
                                  <button onClick={() => changeRole(u.id, u.role === "vet" ? "user" : "vet")} className="text-xs text-purple-500 hover:underline">
                                    {u.role === "vet" ? "Unvet" : "Make Vet"}
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(tab === "Blog Posts" || tab === "Analytics" || tab === "Settings") && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-6xl mb-4">🚧</div>
                  <p className="text-lg font-bold text-[#192A51] dark:text-white">{tab} Module</p>
                  <p className="text-sm text-[#6b7a99] mt-2">This section is under construction.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
