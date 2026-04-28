"use client";
import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, Users, Clock, Settings, Menu, CheckCircle, XCircle, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: Calendar, label: "Appointments" },
  { icon: Clock, label: "Availability" },
  { icon: Users, label: "Patient Requests" },
  { icon: Settings, label: "Profile Settings" },
];

interface Vet {
  id: string; name: string; spec: string; clinic: string; district: string;
  rating: number; reviews: number; exp: string; price: string; avail: boolean;
  slots: string[]; email: string | null;
}

interface Appointment {
  id: string; date: string; status: string; reason: string | null;
  user: { id: string; name: string; email: string };
}

interface Stats {
  upcomingCount: number; pendingCount: number; completedCount: number;
  rating: number; reviews: number;
}

interface SlotState { time: string; status: "available" | "blocked" | "booked" }

const ALL_TIMES = ["08:00","09:00","09:30","10:00","10:30","11:00","12:00","13:00","14:00","14:30","15:00","16:00","17:00"];

export default function VetDashboardPage() {
  const [tab, setTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [vet, setVet] = useState<Vet | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<SlotState[]>([]);
  const [savingSlots, setSavingSlots] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", spec: "", clinic: "", exp: "", price: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/auth"); return; }
    if (user.role !== "vet") { router.replace("/dashboard"); return; }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "vet") return;
    Promise.all([
      api.get<Vet>("/api/vet/me"),
      api.get<Appointment[]>("/api/vet/appointments"),
      api.get<Stats>("/api/vet/stats"),
    ]).then(([v, a, s]) => {
      setVet(v);
      setAppointments(a);
      setStats(s);
      setProfileForm({ name: v.name, spec: v.spec, clinic: v.clinic, exp: v.exp, price: v.price });

      const bookedTimes = new Set(
        a.filter(ap => ap.status === "Upcoming" || ap.status === "Confirmed")
          .map(ap => ap.date.split("·")[1]?.trim() ?? "")
      );
      setAvailability(ALL_TIMES.map(time => ({
        time,
        status: bookedTimes.has(time) ? "booked" : v.slots.includes(time) ? "available" : "blocked",
      })));
    }).catch(() => { /* vet profile not linked yet */ }).finally(() => setLoading(false));
  }, [user]);

  function toggleSlot(time: string) {
    setAvailability(prev => prev.map(s =>
      s.time === time && s.status !== "booked"
        ? { ...s, status: s.status === "available" ? "blocked" : "available" }
        : s
    ));
  }

  async function saveAvailability() {
    setSavingSlots(true);
    const slots = availability.filter(s => s.status === "available").map(s => s.time);
    try {
      const updated = await api.put<Vet>("/api/vet/availability", { slots });
      setVet(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingSlots(false);
    }
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await api.put<Vet>("/api/vet/profile", profileForm);
      setVet(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function confirmAppointment(id: string) {
    setActingId(id);
    try {
      const updated = await api.patch<Appointment>(`/api/vet/appointments/${id}/confirm`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: updated.status } : a));
    } catch (err: any) { alert(err.message); }
    finally { setActingId(null); }
  }

  async function declineAppointment(id: string) {
    setActingId(id);
    try {
      const updated = await api.patch<Appointment>(`/api/vet/appointments/${id}/decline`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: updated.status } : a));
    } catch (err: any) { alert(err.message); }
    finally { setActingId(null); }
  }

  const pending = appointments.filter(a => a.status === "Pending");
  const upcoming = appointments.filter(a => a.status === "Upcoming" || a.status === "Confirmed");

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex bg-[#f8faff] dark:bg-[#0a1220]">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-60 bg-[#192A51] dark:bg-[#0f1825] text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-white/10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4399E1] rounded-full flex items-center justify-center text-sm">🐾</div>
              <span className="font-bold text-sm">Pet<span className="text-[#4399E1]">Care</span> Vets</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">👩‍⚕️</div>
              <div>
                <p className="text-sm font-semibold">{vet?.name ?? user.name}</p>
                <p className="text-xs text-white/60">{vet?.spec ?? "Veterinarian"}</p>
              </div>
            </div>
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
              {n.label === "Patient Requests" && pending.length > 0 && (
                <span className="ml-auto w-4 h-4 bg-[#FFA9AC] rounded-full text-[10px] font-bold flex items-center justify-center">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition">← Back to Site</Link>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-[#1a2744] border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={20} className="text-[#192A51] dark:text-white" /></button>
            <div>
              <h1 className="font-bold text-[#192A51] dark:text-white">{tab}</h1>
              <p className="text-xs text-[#6b7a99]">Veterinarian Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f8faff] dark:hover:bg-[#1e3060] text-[#6b7a99]">
              <Bell size={16} />
              {pending.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFA9AC] rounded-full" />}
            </button>
            <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f8faff] dark:hover:bg-[#1e3060] text-[#6b7a99]">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </header>

        <main className="p-6 overflow-auto">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white dark:bg-[#1a2744] rounded-2xl border border-border animate-pulse" />)}
            </div>
          ) : !vet ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🔗</div>
              <p className="text-lg font-bold text-[#192A51] dark:text-white">Vet profile not linked</p>
              <p className="text-sm text-[#6b7a99] mt-2 max-w-sm">
                Your account has the vet role but isn&apos;t linked to a vet profile yet.<br />
                Ask an admin to set <span className="font-mono bg-[#f0f0f0] dark:bg-[#1e3060] px-1 rounded">email: &quot;{user.email}&quot;</span> on your Vet record.
              </p>
            </div>
          ) : (
            <>
              {tab === "Overview" && stats && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Upcoming", value: stats.upcomingCount.toString(), icon: "📅", color: "bg-[#DDEDFF] dark:bg-[#1e3060]" },
                      { label: "Pending Requests", value: stats.pendingCount.toString(), icon: "⏳", color: "bg-[#fff7ed] dark:bg-[#3a2a10]" },
                      { label: "Completed Total", value: stats.completedCount.toString(), icon: "✅", color: "bg-[#dcfce7] dark:bg-[#1a3a25]" },
                      { label: "Avg Rating", value: `${stats.rating} ⭐`, icon: "🏆", color: "bg-[#faf5ff] dark:bg-[#2a1a3a]" },
                    ].map(s => (
                      <div key={s.label} className="bg-white dark:bg-[#1a2744] rounded-2xl p-4 border border-border">
                        <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                        <p className="text-xl font-bold text-[#192A51] dark:text-white">{s.value}</p>
                        <p className="text-xs text-[#6b7a99] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <p className="font-semibold text-[#192A51] dark:text-white text-sm">Upcoming Schedule</p>
                      <button onClick={() => setTab("Appointments")} className="text-xs text-[#4399E1] hover:underline">View all</button>
                    </div>
                    {upcoming.length === 0 ? (
                      <p className="p-6 text-sm text-[#6b7a99] text-center">No upcoming appointments</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {upcoming.slice(0, 5).map(a => (
                          <div key={a.id} className="p-4 flex items-center gap-4 hover:bg-[#f8faff] dark:hover:bg-[#162035] transition">
                            <div className="text-sm font-bold text-[#4399E1] w-20 shrink-0">{a.date.split("·")[1]?.trim() ?? a.date}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#192A51] dark:text-white">{a.user.name}</p>
                              <p className="text-xs text-[#6b7a99] truncate">{a.reason || "No reason specified"}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${a.status === "Confirmed" ? "bg-[#dcfce7] text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-[#DDEDFF] text-[#4399E1]"}`}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === "Appointments" && (
                <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-[#192A51] dark:text-white text-sm">All Appointments ({appointments.length})</p>
                  </div>
                  {appointments.length === 0 ? (
                    <p className="p-8 text-sm text-[#6b7a99] text-center">No appointments yet</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {appointments.map(a => (
                        <div key={a.id} className="p-4 flex items-start gap-4 hover:bg-[#f8faff] dark:hover:bg-[#162035] transition">
                          <div className="shrink-0 text-center w-20">
                            <p className="text-sm font-bold text-[#4399E1]">{a.date.split("·")[1]?.trim() ?? "—"}</p>
                            <p className="text-xs text-[#6b7a99]">{a.date.split("·")[0]?.trim()}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#192A51] dark:text-white">{a.user.name}</p>
                            <p className="text-xs text-[#6b7a99]">{a.user.email}</p>
                            {a.reason && <p className="text-xs text-[#6b7a99] mt-0.5">Reason: {a.reason}</p>}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            a.status === "Confirmed" ? "bg-[#dcfce7] text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            a.status === "Completed" ? "bg-[#DDEDFF] text-[#4399E1]" :
                            a.status === "Cancelled" || a.status === "Declined" ? "bg-[#fee2e2] text-red-600" :
                            "bg-[#fff7ed] text-amber-700"
                          }`}>{a.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "Availability" && (
                <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-[#192A51] dark:text-white mb-1">Manage Availability</h3>
                  <p className="text-xs text-[#6b7a99] mb-6">Click available slots to block them. Booked slots cannot be changed.</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                    {availability.map(s => (
                      <button
                        key={s.time}
                        onClick={() => toggleSlot(s.time)}
                        disabled={s.status === "booked"}
                        className={`py-3 px-2 rounded-xl text-sm font-semibold transition text-center ${
                          s.status === "booked" ? "bg-[#4399E1] text-white cursor-default" :
                          s.status === "available" ? "bg-[#dcfce7] dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 border border-green-200" :
                          "bg-[#f0f0f0] dark:bg-[#1e3060] text-[#6b7a99] line-through"
                        }`}
                      >
                        {s.time}
                        <span className="block text-[9px] font-normal mt-0.5">
                          {s.status === "booked" ? "Booked" : s.status === "available" ? "Free" : "Blocked"}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mb-6 text-xs text-[#6b7a99]">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#4399E1] rounded-sm inline-block" /> Booked</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#dcfce7] border border-green-200 rounded-sm inline-block" /> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#f0f0f0] dark:bg-[#1e3060] rounded-sm inline-block" /> Blocked</span>
                  </div>
                  <button
                    onClick={saveAvailability}
                    disabled={savingSlots}
                    className="bg-[#4399E1] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2d84d0] transition disabled:opacity-50"
                  >
                    {savingSlots ? "Saving..." : "Save Availability"}
                  </button>
                </div>
              )}

              {tab === "Patient Requests" && (
                <div className="flex flex-col gap-4">
                  {pending.length === 0 ? (
                    <div className="bg-white dark:bg-[#1a2744] rounded-2xl p-8 border border-border text-center">
                      <p className="text-2xl mb-2">✅</p>
                      <p className="text-sm font-semibold text-[#192A51] dark:text-white">No pending requests</p>
                      <p className="text-xs text-[#6b7a99] mt-1">All requests have been handled</p>
                    </div>
                  ) : pending.map(r => (
                    <div key={r.id} className="bg-white dark:bg-[#1a2744] rounded-2xl p-5 border border-border flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#DDEDFF] dark:bg-[#1e3060] rounded-2xl flex items-center justify-center text-2xl shrink-0">🐾</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-semibold text-[#192A51] dark:text-white">{r.user.name}</p>
                            <p className="text-xs text-[#6b7a99] mt-0.5">{r.date}</p>
                            {r.reason && <p className="text-xs text-[#6b7a99] mt-1">{r.reason}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => confirmAppointment(r.id)}
                            disabled={actingId === r.id}
                            className="flex items-center gap-1.5 bg-[#4399E1] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2d84d0] transition disabled:opacity-50"
                          >
                            <CheckCircle size={13} /> Accept
                          </button>
                          <button
                            onClick={() => declineAppointment(r.id)}
                            disabled={actingId === r.id}
                            className="flex items-center gap-1.5 border border-border text-[#6b7a99] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#f8faff] dark:hover:bg-[#162035] transition disabled:opacity-50"
                          >
                            <XCircle size={13} /> Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "Profile Settings" && vet && (
                <div className="bg-white dark:bg-[#1a2744] rounded-2xl border border-border p-6 max-w-xl">
                  <h3 className="font-semibold text-[#192A51] dark:text-white mb-6">Profile Settings</h3>
                  <div className="flex flex-col gap-5">
                    {(["name", "spec", "clinic", "exp", "price"] as const).map(field => (
                      <div key={field}>
                        <label className="text-xs font-semibold text-[#192A51] dark:text-white block mb-1.5 capitalize">
                          {field === "spec" ? "Specialization" : field === "exp" ? "Experience" : field === "price" ? "Price (sum/visit)" : field}
                        </label>
                        <input
                          value={profileForm[field]}
                          onChange={e => setProfileForm(f => ({ ...f, [field]: e.target.value }))}
                          className="w-full bg-[#f8faff] dark:bg-[#162035] border border-border rounded-xl px-4 py-2.5 text-sm text-[#192A51] dark:text-white outline-none focus:border-[#4399E1] transition"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold text-[#192A51] dark:text-white block mb-1.5">Email (for login)</label>
                      <input
                        value={vet.email ?? ""}
                        disabled
                        className="w-full bg-[#f0f0f0] dark:bg-[#1e2a40] border border-border rounded-xl px-4 py-2.5 text-sm text-[#6b7a99] outline-none cursor-not-allowed"
                      />
                    </div>
                    <button
                      onClick={saveProfile}
                      disabled={savingProfile}
                      className="bg-[#4399E1] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#2d84d0] transition mt-2 disabled:opacity-50"
                    >
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
