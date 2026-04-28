"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Calendar, Heart, Star, PawPrint, ShoppingBag, ChevronRight, UserRound, Dog, Cat, Bone } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const tabs = ["Overview", "Orders", "Appointments", "My Pets"];

interface Order {
  id: string;
  item: string;
  date: string;
  status: string;
  price: string;
  img: string;
}

interface Appointment {
  id: string;
  date: string;
  status: string;
  vet: { name: string; spec: string; clinic: string };
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
}

interface DashboardData {
  user: { id: string; name: string; email: string; role: string };
  stats: { ordersCount: number; appointmentsCount: number; petsCount: number; wishlistCount: number };
  recentOrders: Order[];
  upcomingAppointments: Appointment[];
  pets: Pet[];
}

function PetIcon({ species }: { species: string }) {
  if (species === "Dog") return <Dog size={32} className="text-[#4399E1]" />;
  if (species === "Cat") return <Cat size={32} className="text-[#4399E1]" />;
  return <Bone size={32} className="text-[#4399E1]" />;
}

export default function DashboardPage() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState({ name: "", species: "Dog", breed: "", age: "", weight: "" });
  const [addingPet, setAddingPet] = useState(false);

  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push("/auth");
    else if (user.role === "admin") router.push("/admin");
    else if (user.role === "vet") router.push("/vet-dashboard");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get<DashboardData>("/api/dashboard/summary")
      .then(d => {
        setData(d);
        setOrders(d.recentOrders);
        setAppointments(d.upcomingAppointments);
        setPets(d.pets);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (tab === "Orders") {
      api.get<Order[]>("/api/dashboard/orders").then(setOrders).catch(console.error);
    } else if (tab === "Appointments") {
      api.get<Appointment[]>("/api/dashboard/appointments").then(setAppointments).catch(console.error);
    } else if (tab === "My Pets") {
      api.get<Pet[]>("/api/dashboard/pets").then(setPets).catch(console.error);
    }
  }, [tab, user]);

  async function cancelAppointment(id: string) {
    setCancellingId(id);
    try {
      await api.patch(`/api/appointments/${id}/cancel`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Cancelled" } : a));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  async function addPet() {
    setAddingPet(true);
    try {
      const pet = await api.post<Pet>("/api/pets", newPet);
      setPets(prev => [...prev, pet]);
      setShowAddPet(false);
      setNewPet({ name: "", species: "Dog", breed: "", age: "", weight: "" });
      if (data) setData({ ...data, stats: { ...data.stats, petsCount: data.stats.petsCount + 1 } });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingPet(false);
    }
  }

  async function deletePet(id: string) {
    if (!confirm("Remove this pet?")) return;
    try {
      await api.delete(`/api/pets/${id}`);
      setPets(prev => prev.filter(p => p.id !== id));
      if (data) setData({ ...data, stats: { ...data.stats, petsCount: data.stats.petsCount - 1 } });
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-[#4399E1] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-gradient-to-br from-[#4399E1] to-[#192A51] rounded-2xl p-5 text-white mb-5 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserRound size={32} className="text-white" />
            </div>
            <p className="font-bold text-base">{user?.name}</p>
            <p className="text-xs text-white/70 mt-0.5">{user?.email}</p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs bg-[#FFA9AC]/30 text-white rounded-full px-3 py-1 w-fit mx-auto">
              <Star size={11} className="fill-[#FFA9AC] text-[#FFA9AC]" /> {user?.role === "admin" ? "Admin" : "Premium Member"}
            </div>
          </div>

          <nav className="flex flex-col gap-1 bg-white dark:bg-[#1a2744] rounded-2xl p-3 border border-border">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-xl transition text-left ${tab === t ? "bg-[#DDEDFF] dark:bg-[#1e3060] text-[#4399E1]" : "text-[#6b7a99] dark:text-[#8fa4c8] hover:bg-[#f8faff] dark:hover:bg-[#162035]"}`}
              >
                {t === "Overview" && <UserRound size={15} />}
                {t === "Orders" && <Package size={15} />}
                {t === "Appointments" && <Calendar size={15} />}
                {t === "My Pets" && <PawPrint size={15} />}
                {t}
              </button>
            ))}
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-xl transition text-left text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1"
            >
              Sign Out
            </button>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-white dark:bg-[#1a2744] rounded-2xl border border-border animate-pulse" />)}
            </div>
          ) : (
            <>
              {tab === "Overview" && data && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: <ShoppingBag size={20} className="text-[#4399E1]" />, label: "Orders", value: data.stats.ordersCount, bg: "bg-[#DDEDFF] dark:bg-[#1e3060]" },
                      { icon: <Calendar size={20} className="text-[#FFA9AC]" />, label: "Appointments", value: data.stats.appointmentsCount, bg: "bg-[#ffeef0] dark:bg-[#FFA9AC]/10" },
                      { icon: <Heart size={20} className="text-[#FFA9AC]" />, label: "Wishlist", value: data.stats.wishlistCount, bg: "bg-[#ffeef0] dark:bg-[#FFA9AC]/10" },
                      { icon: <PawPrint size={20} className="text-[#4399E1]" />, label: "My Pets", value: data.stats.petsCount, bg: "bg-[#DDEDFF] dark:bg-[#1e3060]" },
                    ].map(s => (
                      <div key={s.label} className="bg-white dark:bg-[#1a2744] rounded-2xl p-4 border border-border flex items-center gap-3">
                        <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
                        <div>
                          <p className="text-xl font-bold text-[#192A51] dark:text-white">{s.value}</p>
                          <p className="text-xs text-[#6b7a99]">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="bg-white dark:bg-[#1a2744] rounded-2xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-[#192A51] dark:text-white text-sm">Recent Order</p>
                        <button onClick={() => setTab("Orders")} className="text-xs text-[#4399E1] font-medium hover:underline">View all</button>
                      </div>
                      {data.recentOrders[0] ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                            <img src={data.recentOrders[0].img} alt={data.recentOrders[0].item} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#192A51] dark:text-white truncate">{data.recentOrders[0].item}</p>
                            <p className="text-xs text-[#6b7a99]">{data.recentOrders[0].date}</p>
                          </div>
                          <span className="text-xs font-semibold bg-[#DDEDFF] dark:bg-[#1e3060] text-[#4399E1] px-2 py-0.5 rounded-full">{data.recentOrders[0].status}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-[#6b7a99]">No orders yet</p>
                      )}
                    </div>
                    <div className="bg-white dark:bg-[#1a2744] rounded-2xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-[#192A51] dark:text-white text-sm">Upcoming Appointment</p>
                        <button onClick={() => setTab("Appointments")} className="text-xs text-[#4399E1] font-medium hover:underline">View all</button>
                      </div>
                      {data.upcomingAppointments[0] ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#ffeef0] dark:bg-[#FFA9AC]/10 rounded-xl flex items-center justify-center">
                            <UserRound size={24} className="text-[#FFA9AC]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#192A51] dark:text-white">{data.upcomingAppointments[0].vet.name}</p>
                            <p className="text-xs text-[#FFA9AC] font-medium">{data.upcomingAppointments[0].date}</p>
                            <p className="text-xs text-[#6b7a99] truncate">{data.upcomingAppointments[0].vet.clinic}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-[#6b7a99]">No upcoming appointments</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === "Orders" && (
                <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border overflow-hidden">
                  <div className="p-5 border-b border-border">
                    <h2 className="font-bold text-[#192A51] dark:text-white">Order History</h2>
                  </div>
                  {orders.length === 0 ? (
                    <p className="p-8 text-center text-sm text-[#6b7a99]">No orders yet</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {orders.map(o => (
                        <div key={o.id} className="p-5 flex items-center gap-4 hover:bg-[#f8faff] dark:hover:bg-[#162035] transition">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                            <img src={o.img} alt={o.item} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#192A51] dark:text-white">{o.item}</p>
                            <p className="text-xs text-[#6b7a99]">{o.date}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-[#192A51] dark:text-white">{o.price} sum</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.status === "Delivered" ? "bg-[#DDEDFF] dark:bg-[#1e3060] text-[#4399E1]" : "bg-[#ffeef0] dark:bg-[#FFA9AC]/10 text-[#FFA9AC]"}`}>{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "Appointments" && (
                <div className="flex flex-col gap-4">
                  {appointments.length === 0 ? (
                    <p className="text-sm text-[#6b7a99] p-4">No appointments yet</p>
                  ) : (
                    appointments.map(a => (
                      <div key={a.id} className="bg-white dark:bg-[#1a2744] rounded-2xl p-5 border border-border flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#ffeef0] dark:bg-[#FFA9AC]/10 rounded-2xl flex items-center justify-center shrink-0">
                          <UserRound size={28} className="text-[#FFA9AC]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#192A51] dark:text-white">{a.vet.name}</p>
                          <p className="text-xs text-[#4399E1] font-medium">{a.vet.spec}</p>
                          <p className="text-xs text-[#6b7a99] mt-0.5">{a.vet.clinic} · {a.date}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${a.status === "Upcoming" ? "bg-[#ffeef0] dark:bg-[#FFA9AC]/10 text-[#FFA9AC]" : a.status === "Cancelled" ? "bg-red-50 text-red-400" : "bg-[#DDEDFF] dark:bg-[#1e3060] text-[#4399E1]"}`}>{a.status}</span>
                          {a.status === "Upcoming" && (
                            <button
                              onClick={() => cancelAppointment(a.id)}
                              disabled={cancellingId === a.id}
                              className="text-xs text-red-400 hover:underline disabled:opacity-50"
                            >
                              {cancellingId === a.id ? "Cancelling..." : "Cancel"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <Link href="/vets" className="flex items-center justify-center gap-2 border-2 border-dashed border-border text-[#4399E1] font-medium text-sm py-4 rounded-2xl hover:border-[#4399E1] transition">
                    + Book a New Appointment
                  </Link>
                </div>
              )}

              {tab === "My Pets" && (
                <div className="flex flex-col gap-5">
                  {pets.map(p => (
                    <div key={p.id} className="bg-white dark:bg-[#1a2744] rounded-2xl p-5 border border-border flex items-center gap-5">
                      <div className="w-16 h-16 bg-[#DDEDFF] dark:bg-[#1e3060] rounded-2xl flex items-center justify-center shrink-0">
                        <PetIcon species={p.species} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#192A51] dark:text-white text-base">{p.name}</p>
                        <p className="text-xs text-[#4399E1] font-medium">{p.species} · {p.breed}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-[#6b7a99]">Age: <b className="text-[#192A51] dark:text-white">{p.age}</b></span>
                          <span className="text-xs text-[#6b7a99]">Weight: <b className="text-[#192A51] dark:text-white">{p.weight}</b></span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Link href="/vets" className="flex items-center gap-1.5 text-xs font-semibold text-[#FFA9AC] hover:underline">
                          Book Vet <ChevronRight size={13} />
                        </Link>
                        <button onClick={() => deletePet(p.id)} className="text-xs text-red-400 hover:underline">Remove</button>
                      </div>
                    </div>
                  ))}

                  {showAddPet ? (
                    <div className="bg-white dark:bg-[#1a2744] rounded-2xl p-5 border border-[#4399E1] flex flex-col gap-3">
                      <h3 className="font-semibold text-[#192A51] dark:text-white text-sm">Add a Pet</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(["name", "breed", "age", "weight"] as const).map(field => (
                          <div key={field}>
                            <label className="text-xs font-semibold text-[#192A51] dark:text-white capitalize block mb-1">{field}</label>
                            <input
                              value={newPet[field]}
                              onChange={e => setNewPet(p => ({ ...p, [field]: e.target.value }))}
                              className="w-full text-sm bg-[#f8faff] dark:bg-[#162035] border border-border rounded-xl px-3 py-2 outline-none focus:border-[#4399E1] text-[#192A51] dark:text-white"
                              placeholder={field === "age" ? "e.g. 2 yrs" : field === "weight" ? "e.g. 8 kg" : ""}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="text-xs font-semibold text-[#192A51] dark:text-white block mb-1">Species</label>
                          <select value={newPet.species} onChange={e => setNewPet(p => ({ ...p, species: e.target.value }))} className="w-full text-sm bg-[#f8faff] dark:bg-[#162035] border border-border rounded-xl px-3 py-2 outline-none text-[#192A51] dark:text-white">
                            <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={addPet} disabled={addingPet || !newPet.name || !newPet.breed} className="bg-[#4399E1] text-white text-sm font-semibold px-5 py-2 rounded-xl disabled:opacity-50 hover:bg-[#2d84d0] transition">
                          {addingPet ? "Saving..." : "Save Pet"}
                        </button>
                        <button onClick={() => setShowAddPet(false)} className="text-sm text-[#6b7a99] hover:text-[#192A51] dark:hover:text-white transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddPet(true)} className="flex items-center justify-center gap-2 border-2 border-dashed border-border text-[#4399E1] font-medium text-sm py-4 rounded-2xl hover:border-[#4399E1] transition">
                      + Add a Pet
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
