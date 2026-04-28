"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Star, MapPin, Clock, ChevronDown, Filter, UserRound, Stethoscope, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Vet {
  id: string;
  name: string;
  spec: string;
  clinic: string;
  district: string;
  rating: number;
  reviews: number;
  exp: string;
  price: string;
  avail: boolean;
  slots: string[];
}

const specs = ["All Specializations", "Small Animal Surgery", "Dermatology & Nutrition", "Exotic Animals", "General Practice", "Cardiology", "Orthopedics"];
const districts = ["All Districts", "Yunusabad", "Mirzo-Ulugbek", "Chilonzor", "Shayxontohur", "Uchtepa", "Bektemir"];

export default function VetsPage() {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("All Specializations");
  const [district, setDistrict] = useState("All Districts");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    api.get<Vet[]>("/api/vets")
      .then(setVets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = vets.filter(v =>
    (!search || v.name.toLowerCase().includes(search.toLowerCase()) || v.clinic.toLowerCase().includes(search.toLowerCase())) &&
    (spec === "All Specializations" || v.spec === spec) &&
    (district === "All Districts" || v.district === district)
  );

  const selectedVet = vets.find(v => v.id === selected);

  async function confirmBooking() {
    if (!selectedVet || !selectedSlot) return;
    if (!user) {
      setBookError("Please sign in to book an appointment");
      return;
    }
    setBooking(true);
    setBookError("");
    try {
      await api.post("/api/appointments", { vetId: selectedVet.id, date: `Today · ${selectedSlot}` });
      setBooked(true);
    } catch (err: any) {
      setBookError(err.message);
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-gradient-to-r from-[#DDEDFF] to-white dark:from-[#1a2744] dark:to-[#0f1825] py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#192A51] dark:text-white mb-2">Find a Veterinarian</h1>
          <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8]">Book trusted vets near you, online or in-person</p>
          <div className="mt-6 flex items-center bg-white dark:bg-[#1a2744] border border-border rounded-2xl shadow-sm overflow-hidden px-4 gap-3 max-w-xl">
            <Search size={18} className="text-[#6b7a99] shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by vet name or clinic..."
              className="flex-1 py-3.5 text-sm bg-transparent outline-none text-[#192A51] dark:text-white placeholder:text-[#6b7a99]"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-1.5 text-sm text-[#6b7a99] dark:text-[#8fa4c8]"><Filter size={14} /> Filter:</div>
          <div className="relative">
            <select value={spec} onChange={e => setSpec(e.target.value)} className="text-sm bg-white dark:bg-[#1a2744] border border-border text-[#192A51] dark:text-white rounded-xl px-3 py-2 pr-8 outline-none appearance-none cursor-pointer">
              {specs.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7a99] pointer-events-none" />
          </div>
          <div className="relative">
            <select value={district} onChange={e => setDistrict(e.target.value)} className="text-sm bg-white dark:bg-[#1a2744] border border-border text-[#192A51] dark:text-white rounded-xl px-3 py-2 pr-8 outline-none appearance-none cursor-pointer">
              {districts.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7a99] pointer-events-none" />
          </div>
          <p className="ml-auto text-sm text-[#6b7a99] dark:text-[#8fa4c8] self-center">
            <span className="font-semibold text-[#192A51] dark:text-white">{loading ? "..." : filtered.length}</span> vets found
          </p>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-5">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-white dark:bg-[#1a2744] rounded-2xl border border-border animate-pulse" />)}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-5">
              {filtered.map(v => (
                <div
                  key={v.id}
                  onClick={() => { setSelected(v.id); setSelectedSlot(null); setBooked(false); setBookError(""); }}
                  className={`bg-white dark:bg-[#1a2744] rounded-2xl p-5 border transition cursor-pointer ${selected === v.id ? "border-[#4399E1] shadow-md shadow-[#4399E1]/10" : "border-border hover:shadow-md"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#DDEDFF] dark:bg-[#1e3060] flex items-center justify-center shrink-0">
                      <UserRound size={32} className="text-[#4399E1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-[#192A51] dark:text-white">{v.name}</p>
                          <p className="text-xs text-[#4399E1] font-medium">{v.spec}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${v.avail ? "bg-[#ffeef0] text-[#FFA9AC] dark:bg-[#FFA9AC]/20 dark:text-[#FFA9AC]" : "bg-[#f8faff] dark:bg-[#1e2a40] text-[#6b7a99]"}`}>
                          ● {v.avail ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-[#6b7a99] dark:text-[#8fa4c8]"><MapPin size={11} /> {v.clinic}, {v.district}</span>
                        <span className="flex items-center gap-1 text-xs text-[#6b7a99] dark:text-[#8fa4c8]"><Clock size={11} /> {v.exp} experience</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} className={i < Math.floor(v.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />)}
                          </div>
                          <span className="text-xs text-[#6b7a99]">{v.rating} · {v.reviews} reviews</span>
                        </div>
                        <span className="text-sm font-bold text-[#192A51] dark:text-white">{v.price} sum / visit</span>
                      </div>
                    </div>
                  </div>

                  {v.avail && v.slots.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold text-[#6b7a99] dark:text-[#8fa4c8] mb-2">Today&apos;s available slots:</p>
                      <div className="flex flex-wrap gap-2">
                        {v.slots.map(slot => (
                          <button
                            key={slot}
                            onClick={e => { e.stopPropagation(); setSelected(v.id); setSelectedSlot(slot); setBooked(false); setBookError(""); }}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${selected === v.id && selectedSlot === slot ? "bg-[#4399E1] text-white border-[#4399E1]" : "border-border text-[#192A51] dark:text-white hover:border-[#4399E1] hover:text-[#4399E1]"}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-white dark:bg-[#1a2744] rounded-2xl border border-border p-6 shadow-sm">
                {!selectedVet ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#DDEDFF] dark:bg-[#1e3060] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Stethoscope size={32} className="text-[#4399E1]" />
                    </div>
                    <p className="text-sm font-semibold text-[#192A51] dark:text-white">Select a Vet</p>
                    <p className="text-xs text-[#6b7a99] dark:text-[#8fa4c8] mt-1">Click on a vet card to see booking details</p>
                  </div>
                ) : booked ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#ffeef0] dark:bg-[#FFA9AC]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={36} className="text-[#FFA9AC]" />
                    </div>
                    <p className="text-base font-bold text-[#192A51] dark:text-white">Appointment Booked!</p>
                    <p className="text-sm text-[#6b7a99] dark:text-[#8fa4c8] mt-2">{selectedVet.name}</p>
                    <p className="text-xs text-[#4399E1] font-semibold mt-1">Today at {selectedSlot}</p>
                    <button
                      onClick={() => { setSelected(null); setBooked(false); setSelectedSlot(null); }}
                      className="mt-6 w-full bg-[#4399E1] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#2d84d0] transition"
                    >
                      Book Another
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-[#192A51] dark:text-white mb-4">Book Appointment</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#DDEDFF] dark:bg-[#1e3060] rounded-xl flex items-center justify-center">
                        <UserRound size={24} className="text-[#4399E1]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#192A51] dark:text-white">{selectedVet.name}</p>
                        <p className="text-xs text-[#4399E1]">{selectedVet.spec}</p>
                      </div>
                    </div>
                    <div className="bg-[#f8faff] dark:bg-[#162035] rounded-xl p-3 mb-4 flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs"><span className="text-[#6b7a99]">Clinic</span><span className="font-medium text-[#192A51] dark:text-white">{selectedVet.clinic}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[#6b7a99]">Location</span><span className="font-medium text-[#192A51] dark:text-white">{selectedVet.district}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[#6b7a99]">Consultation</span><span className="font-bold text-[#192A51] dark:text-white">{selectedVet.price} sum</span></div>
                    </div>
                    <p className="text-xs font-semibold text-[#192A51] dark:text-white mb-2">Select Time Slot</p>
                    {selectedVet.avail && selectedVet.slots.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {selectedVet.slots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${selectedSlot === slot ? "bg-[#4399E1] text-white border-[#4399E1]" : "border-border text-[#192A51] dark:text-white hover:border-[#4399E1]"}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#FFA9AC] mb-5">No slots available today</p>
                    )}
                    {bookError && <p className="text-xs text-red-500 mb-3">{bookError}</p>}
                    <button
                      disabled={!selectedSlot || booking}
                      onClick={confirmBooking}
                      className="w-full bg-[#FFA9AC] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f08d90] text-white text-sm font-semibold py-3 rounded-xl transition"
                    >
                      {booking ? "Booking..." : user ? "Confirm Booking" : "Sign In to Book"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
