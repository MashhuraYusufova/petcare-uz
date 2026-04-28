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
    <div className="min-vh-100 d-flex flex-column bg-white">
      <Navbar />

      <section style={{ background: "linear-gradient(90deg, #DDEDFF 0%, #ffffff 100%)", padding: "3rem 1.5rem" }}>
        <Container>
          <h1 className="fw-bold mb-1" style={{ color: "#192A51", fontSize: '2rem' }}>Find a Veterinarian</h1>
          <p className="small mb-4" style={{ color: "#6b7a99" }}>Book trusted vets near you, online or in-person</p>
          <div className="position-relative" style={{ maxWidth: 576 }}>
            <InputGroup className="bg-white border rounded-4 shadow-sm overflow-hidden">
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <Search size={18} style={{ color: "#6b7a99" }} />
              </InputGroup.Text>
              <Form.Control
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by vet name or clinic..."
                className="border-0 py-3 shadow-none text-sm"
              />
            </InputGroup>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2 small text-muted"><Filter size={14} /> Filter:</div>
          <Form.Select
            size="sm"
            value={spec}
            onChange={e => setSpec(e.target.value)}
            className="rounded-3 border shadow-none w-auto"
            style={{ fontSize: '0.875rem' }}
          >
            {specs.map(s => <option key={s} value={s}>{s}</option>)}
          </Form.Select>
          <Form.Select
            size="sm"
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="rounded-3 border shadow-none w-auto"
            style={{ fontSize: '0.875rem' }}
          >
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </Form.Select>
          <p className="ms-md-auto mb-0 small text-muted">
            <span className="fw-bold text-dark">{loading ? "..." : filtered.length}</span> vets found
          </p>
        </div>

        {loading ? (
          <Row className="g-4">
            <Col lg={8}>
              <div className="d-flex flex-column gap-3">
                {[1, 2, 3].map(i => <div key={i} className="bg-light rounded-4 border animate-pulse" style={{ height: 160 }} />)}
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
                    className={`rounded-4 p-4 border transition cursor-pointer shadow-none ${selected === v.id ? "border-primary shadow-sm" : "border-light"}`}
                    style={{ borderColor: selected === v.id ? "#4399E1" : "#e8eef7" }}
                  >
                    <div className="d-flex align-items-start gap-4 flex-wrap flex-sm-nowrap">
                      <div className="rounded-4 bg-light d-flex align-items-center justify-content-center shrink-0" style={{ width: 64, height: 64, backgroundColor: "#DDEDFF" }}>
                        <UserRound size={32} style={{ color: "#4399E1" }} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                          <div>
                            <p className="fw-bold mb-0 text-dark">{v.name}</p>
                            <p className="small fw-medium mb-0" style={{ color: "#4399E1" }}>{v.spec}</p>
                          </div>
                          <Badge pill className="fw-semibold px-2.5 py-1" style={{ backgroundColor: v.avail ? "#ffeef0" : "#f8faff", color: v.avail ? "#FFA9AC" : "#6b7a99", fontSize: 10 }}>
                            ● {v.avail ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                          <span className="d-flex align-items-center gap-1 extra-small text-muted"><MapPin size={11} /> {v.clinic}, {v.district}</span>
                          <span className="d-flex align-items-center gap-1 extra-small text-muted"><Clock size={11} /> {v.exp} experience</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center">
                              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} style={{ fill: i < Math.floor(v.rating) ? "#fbbf24" : "transparent", color: i < Math.floor(v.rating) ? "#fbbf24" : "#e5e7eb" }} />)}
                            </div>
                            <span className="extra-small text-muted">{v.rating} · {v.reviews} reviews</span>
                          </div>
                          <span className="small fw-bold text-dark">{v.price} sum / visit</span>
                        </div>
                      </div>
                    </div>

                    {v.avail && v.slots.length > 0 && (
                      <div className="mt-4 pt-4 border-top">
                        <p className="extra-small fw-bold text-muted mb-2 text-uppercase tracking-wider">Today&apos;s available slots:</p>
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
                                color: selected === v.id && selectedSlot === slot ? "#ffffff" : "#192A51",
                                borderColor: selected === v.id && selectedSlot === slot ? "#4399E1" : "#e8eef7",
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
                <Card className="rounded-4 border-light p-4 shadow-sm">
                  {!selectedVet ? (
                    <div className="text-center py-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, backgroundColor: "#DDEDFF" }}>
                        <Stethoscope size={32} style={{ color: "#4399E1" }} />
                      </div>
                      <p className="fw-bold mb-1 small text-dark">Select a Vet</p>
                      <p className="extra-small text-muted mb-0">Click on a vet card to see booking details</p>
                    </div>
                  ) : booked ? (
                    <div className="text-center py-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, backgroundColor: "#ffeef0" }}>
                        <CheckCircle size={36} style={{ color: "#FFA9AC" }} />
                      </div>
                      <p className="fw-bold mb-1 text-dark">Appointment Booked!</p>
                      <p className="small text-muted mb-1">{selectedVet.name}</p>
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
                      <h3 className="fw-bold mb-4 small text-dark">Book Appointment</h3>
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: "#DDEDFF" }}>
                          <UserRound size={24} style={{ color: "#4399E1" }} />
                        </div>
                        <div>
                          <p className="small fw-bold mb-0 text-dark">{selectedVet.name}</p>
                          <p className="extra-small mb-0" style={{ color: "#4399E1" }}>{selectedVet.spec}</p>
                        </div>
                      </div>
                      <div className="bg-light rounded-3 p-3 mb-4 d-flex flex-column gap-2" style={{ backgroundColor: "#f8faff" }}>
                        <div className="d-flex justify-content-between extra-small"><span className="text-muted">Clinic</span><span className="fw-medium text-dark">{selectedVet.clinic}</span></div>
                        <div className="d-flex justify-content-between extra-small"><span className="text-muted">Location</span><span className="fw-medium text-dark">{selectedVet.district}</span></div>
                        <div className="d-flex justify-content-between small pt-1 border-top"><span className="text-muted">Consultation</span><span className="fw-bold text-dark">{selectedVet.price} sum</span></div>
                      </div>
                      <p className="extra-small fw-bold text-dark mb-2 text-uppercase tracking-wider">Select Time Slot</p>
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
                                color: selectedSlot === slot ? "#ffffff" : "#192A51",
                                borderColor: selectedSlot === slot ? "#4399E1" : "#e8eef7",
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
