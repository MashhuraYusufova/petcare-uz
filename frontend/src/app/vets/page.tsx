"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Star, MapPin, Clock, ChevronDown, Filter, UserRound, Stethoscope, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup } from "react-bootstrap";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [spec, setSpec] = useState("All Specializations");
  const [district, setDistrict] = useState("All Districts");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (spec !== "All Specializations") params.append("spec", spec);
    if (district !== "All Districts") params.append("district", district);

    api.get<Vet[]>(`/api/vets?${params.toString()}`)
      .then(setVets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch, spec, district]);

  const filtered = vets;

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
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar />

      <section style={{ background: "var(--hero-gradient, linear-gradient(90deg, #DDEDFF 0%, #ffffff 100%))", padding: "3rem 1.5rem" }}>
        <Container>
          <h1 className="fw-bold mb-1" style={{ color: "var(--foreground)", fontSize: '2rem' }}>Find a Veterinarian</h1>
          <p className="small mb-4" style={{ color: "var(--muted-text)" }}>Book trusted vets near you, online or in-person</p>
          <div className="position-relative" style={{ maxWidth: 576 }}>
            <InputGroup className="border rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <Search size={18} style={{ color: "var(--muted-text)" }} />
              </InputGroup.Text>
              <Form.Control
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by vet name or clinic..."
                className="border-0 py-3 shadow-none text-sm"
                style={{ backgroundColor: 'transparent', color: 'var(--foreground)' }}
              />
            </InputGroup>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2 small" style={{ color: 'var(--muted-text)' }}><Filter size={14} /> Filter:</div>
          <Form.Select
            size="sm"
            value={spec}
            onChange={e => setSpec(e.target.value)}
            className="rounded-3 border shadow-none w-auto"
            style={{ fontSize: '0.875rem', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
          >
            {specs.map(s => <option key={s} value={s}>{s}</option>)}
          </Form.Select>
          <Form.Select
            size="sm"
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="rounded-3 border shadow-none w-auto"
            style={{ fontSize: '0.875rem', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
          >
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </Form.Select>
          <p className="ms-md-auto mb-0 small" style={{ color: 'var(--muted-text)' }}>
            <span className="fw-bold" style={{ color: 'var(--foreground)' }}>{loading ? "..." : filtered.length}</span> vets found
          </p>
        </div>

        {loading ? (
          <Row className="g-4">
            <Col lg={8}>
              <div className="d-flex flex-column gap-3">
                {[1, 2, 3].map(i => <div key={i} className="rounded-4 border animate-pulse" style={{ height: 160, backgroundColor: 'var(--section-bg)', borderColor: 'var(--card-border)' }} />)}
              </div>
            </Col>
          </Row>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              <div className="d-flex flex-column gap-4">
                {filtered.map(v => (
                  <Card
                    key={v.id}
                    onClick={() => { setSelected(v.id); setSelectedSlot(null); setBooked(false); setBookError(""); }}
                    className={`rounded-4 p-4 border transition cursor-pointer shadow-none`}
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: selected === v.id ? "#4399E1" : "var(--card-border)", color: 'var(--foreground)' }}
                  >
                    <div className="d-flex align-items-start gap-4 flex-wrap flex-sm-nowrap">
                      <div className="rounded-4 d-flex align-items-center justify-content-center shrink-0" style={{ width: 64, height: 64, backgroundColor: "rgba(67, 153, 225, 0.15)" }}>
                        <UserRound size={32} style={{ color: "#4399E1" }} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                          <div>
                            <p className="fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{v.name}</p>
                            <p className="small fw-medium mb-0" style={{ color: "#4399E1" }}>{v.spec}</p>
                          </div>
                          <Badge pill className="fw-semibold px-2.5 py-1" style={{ backgroundColor: v.avail ? "rgba(255, 169, 172, 0.15)" : "rgba(107, 122, 153, 0.15)", color: v.avail ? "#FFA9AC" : "var(--muted-text)", fontSize: 10 }}>
                            ● {v.avail ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                          <span className="d-flex align-items-center gap-1 extra-small" style={{ color: 'var(--muted-text)' }}><MapPin size={11} /> {v.clinic}, {v.district}</span>
                          <span className="d-flex align-items-center gap-1 extra-small" style={{ color: 'var(--muted-text)' }}><Clock size={11} /> {v.exp} experience</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center">
                              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} style={{ fill: i < Math.floor(v.rating) ? "#fbbf24" : "transparent", color: i < Math.floor(v.rating) ? "#fbbf24" : "#e5e7eb" }} />)}
                            </div>
                            <span className="extra-small" style={{ color: 'var(--muted-text)' }}>{v.rating} · {v.reviews} reviews</span>
                          </div>
                          <span className="small fw-bold" style={{ color: 'var(--foreground)' }}>{v.price} sum / visit</span>
                        </div>
                      </div>
                    </div>

                    {v.avail && v.slots.length > 0 && (
                      <div className="mt-4 pt-4 border-top" style={{ borderColor: 'var(--card-border)' }}>
                        <p className="extra-small fw-bold mb-2 text-uppercase tracking-wider" style={{ color: 'var(--muted-text)' }}>Today&apos;s available slots:</p>
                        <div className="d-flex flex-wrap gap-2">
                          {v.slots.map(slot => (
                            <Button
                              key={slot}
                              size="sm"
                              onClick={e => { e.stopPropagation(); setSelected(v.id); setSelectedSlot(slot); setBooked(false); setBookError(""); }}
                              variant={selected === v.id && selectedSlot === slot ? "primary" : "outline-light"}
                              className="rounded-3 extra-small px-3 border shadow-none"
                              style={{
                                backgroundColor: selected === v.id && selectedSlot === slot ? "#4399E1" : "transparent",
                                color: selected === v.id && selectedSlot === slot ? "#ffffff" : "var(--foreground)",
                                borderColor: selected === v.id && selectedSlot === slot ? "#4399E1" : "var(--card-border)",
                                fontSize: 11
                              }}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Col>

            <Col lg={4}>
              <aside className="sticky-top" style={{ top: '6rem' }}>
                <Card className="rounded-4 p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}>
                  {!selectedVet ? (
                    <div className="text-center py-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, backgroundColor: "rgba(67, 153, 225, 0.15)" }}>
                        <Stethoscope size={32} style={{ color: "#4399E1" }} />
                      </div>
                      <p className="fw-bold mb-1 small" style={{ color: 'var(--foreground)' }}>Select a Vet</p>
                      <p className="extra-small mb-0" style={{ color: 'var(--muted-text)' }}>Click on a vet card to see booking details</p>
                    </div>
                  ) : booked ? (
                    <div className="text-center py-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, backgroundColor: "rgba(255, 169, 172, 0.15)" }}>
                        <CheckCircle size={36} style={{ color: "#FFA9AC" }} />
                      </div>
                      <p className="fw-bold mb-1" style={{ color: 'var(--foreground)' }}>Appointment Booked!</p>
                      <p className="small mb-1" style={{ color: 'var(--muted-text)' }}>{selectedVet.name}</p>
                      <p className="small fw-bold mb-4" style={{ color: "#4399E1" }}>Today at {selectedSlot}</p>
                      <Button
                        onClick={() => { setSelected(null); setBooked(false); setSelectedSlot(null); }}
                        className="w-100 rounded-3 border-0 py-2.5 small fw-bold shadow-none"
                        style={{ backgroundColor: "#4399E1", color: "#ffffff" }}
                      >
                        Book Another
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="fw-bold mb-4 small" style={{ color: 'var(--foreground)' }}>Book Appointment</h3>
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: "rgba(67, 153, 225, 0.15)" }}>
                          <UserRound size={24} style={{ color: "#4399E1" }} />
                        </div>
                        <div>
                          <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{selectedVet.name}</p>
                          <p className="extra-small mb-0" style={{ color: "#4399E1" }}>{selectedVet.spec}</p>
                        </div>
                      </div>
                      <div className="rounded-3 p-3 mb-4 d-flex flex-column gap-2" style={{ backgroundColor: "var(--section-bg)" }}>
                        <div className="d-flex justify-content-between extra-small"><span style={{ color: 'var(--muted-text)' }}>Clinic</span><span className="fw-medium" style={{ color: 'var(--foreground)' }}>{selectedVet.clinic}</span></div>
                        <div className="d-flex justify-content-between extra-small"><span style={{ color: 'var(--muted-text)' }}>Location</span><span className="fw-medium" style={{ color: 'var(--foreground)' }}>{selectedVet.district}</span></div>
                        <div className="d-flex justify-content-between small pt-1 border-top" style={{ borderColor: 'var(--card-border)' }}><span style={{ color: 'var(--muted-text)' }}>Consultation</span><span className="fw-bold" style={{ color: 'var(--foreground)' }}>{selectedVet.price} sum</span></div>
                      </div>
                      <p className="extra-small fw-bold mb-2 text-uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Select Time Slot</p>
                      {selectedVet.avail && selectedVet.slots.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2 mb-4">
                          {selectedVet.slots.map(slot => (
                            <Button
                              key={slot}
                              size="sm"
                              onClick={() => setSelectedSlot(slot)}
                              variant={selectedSlot === slot ? "primary" : "outline-light"}
                              className="rounded-3 extra-small px-3 border shadow-none"
                              style={{
                                backgroundColor: selectedSlot === slot ? "#4399E1" : "transparent",
                                color: selectedSlot === slot ? "#ffffff" : "var(--foreground)",
                                borderColor: selectedSlot === slot ? "#4399E1" : "var(--card-border)",
                                fontSize: 11
                              }}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="extra-small text-danger mb-4">No slots available today</p>
                      )}
                      {bookError && <p className="extra-small text-danger mb-3">{bookError}</p>}
                      <Button
                        disabled={!selectedSlot || booking}
                        onClick={confirmBooking}
                        className="w-100 rounded-3 border-0 py-3 small fw-bold shadow-none"
                        style={{ backgroundColor: "#FFA9AC", color: "#ffffff" }}
                      >
                        {booking ? "Booking..." : user ? "Confirm Booking" : "Sign In to Book"}
                      </Button>
                    </>
                  )}
                </Card>
              </aside>
            </Col>
          </Row>
        )}
      </Container>

      <Footer />
    </div>
  );
}
