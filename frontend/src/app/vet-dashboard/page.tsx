"use client";
import { useState, useEffect } from "react";
import { Menu, CheckCircle, XCircle, Bell, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Container, Row, Col, Card, Button, Badge, Form, Offcanvas } from "react-bootstrap";
import VetSidebar from "@/components/VetSidebar";
import { Vet, Appointment, Stats, SlotState } from "@/types/vet";

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
    async function fetchData() {
      try {
        const [v, a, s] = await Promise.all([
          api.get<Vet>("/api/vet/me"),
          api.get<Appointment[]>("/api/vet/appointments"),
          api.get<Stats>("/api/vet/stats"),
        ]);
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
          status: bookedTimes.has(time) ? "booked" : (v.slots ?? []).includes(time) ? "available" : "blocked",
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
    } catch (err: any) { alert(err.message); }
    finally { setSavingSlots(false); }
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await api.put<Vet>("/api/vet/profile", profileForm);
      setVet(updated);
    } catch (err: any) { alert(err.message); }
    finally { setSavingProfile(false); }
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
    <div className="min-vh-100 d-flex" style={{ backgroundColor: 'var(--background)' }}>
      <aside className="d-none d-lg-block shrink-0" style={{ width: 240 }}>
        <VetSidebar vet={vet} user={user} tab={tab} setTab={setTab} setSidebarOpen={setSidebarOpen} pendingCount={pending.length} />
      </aside>

      <Offcanvas show={sidebarOpen} onHide={() => setSidebarOpen(false)} style={{ width: 240, backgroundColor: "#192A51" }}>
        <VetSidebar vet={vet} user={user} tab={tab} setTab={setTab} setSidebarOpen={setSidebarOpen} pendingCount={pending.length} />
      </Offcanvas>

      <div className="flex-grow-1 d-flex flex-column min-w-0">
        <header className="border-bottom px-4 py-3 d-flex align-items-center justify-content-between sticky-top z-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="d-flex align-items-center gap-3">
            <Button variant="link" className="d-lg-none p-0" onClick={() => setSidebarOpen(true)} style={{ color: 'var(--foreground)' }}><Menu size={20} /></Button>
            <div>
              <h1 className="h6 fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{tab}</h1>
              <p className="extra-small text-muted mb-0" style={{ fontSize: 10 }}>Veterinarian Dashboard</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button variant="link" className="p-0 rounded-circle text-muted position-relative" style={{ width: 32, height: 32 }}><Bell size={16} />{pending.length > 0 && <span className="position-absolute top-0 end-0 translate-middle-y translate-middle-x p-1 bg-danger rounded-circle border border-white" />}</Button>
            <Button variant="link" onClick={toggle} className="p-0 rounded-circle text-muted transition hover-bg-light" style={{ width: 32, height: 32 }}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</Button>
          </div>
        </header>

        <main className="p-4">
          {loading ? (
            <Row className="g-4">{[1, 2, 3, 4].map(i => <Col xs={6} lg={3} key={i}><Card className="rounded-4 border-0 shadow-sm animate-pulse" style={{ height: 100 }} /></Col>)}</Row>
          ) : !vet ? (
            <div className="text-center py-5 mt-5"><div className="display-1 opacity-10 mb-4">🔗</div><h2 className="h4 fw-bold" style={{ color: 'var(--foreground)' }}>Vet profile not linked</h2><p style={{ color: 'var(--muted-text)', maxWidth: 400, margin: '0 auto' }}>Your account has the vet role but isn&apos;t linked to a profile. Ask an admin to set <code style={{ backgroundColor: 'var(--section-bg)', padding: '0 4px', borderRadius: 4 }}>{user.email}</code> on your record.</p></div>
          ) : (
            <Container fluid className="px-0">
              {tab === "Overview" && stats && (
                <div className="d-flex flex-column gap-4">
                  <Row className="g-4">
                    {[
                      { label: "Upcoming", value: stats.upcomingCount.toString(), icon: "📅", color: "var(--section-bg)" },
                      { label: "Pending", value: stats.pendingCount.toString(), icon: "⏳", color: "var(--section-bg)" },
                      { label: "Completed", value: stats.completedCount.toString(), icon: "✅", color: "var(--section-bg)" },
                      { label: "Rating", value: `${stats.rating} ⭐`, icon: "🏆", color: "var(--section-bg)" },
                    ].map(s => (
                      <Col xs={6} lg={3} key={s.label}>
                        <Card className="rounded-4 border-0 shadow-sm p-4 h-100" style={{ backgroundColor: 'var(--card-bg)' }}><div className="rounded-3 d-flex align-items-center justify-content-center fs-4 mb-3" style={{ width: 44, height: 44, backgroundColor: s.color }}>{s.icon}</div><p className="h4 fw-bold mb-1" style={{ color: 'var(--foreground)' }}>{s.value}</p><p className="extra-small text-muted mb-0" style={{ fontSize: 11 }}>{s.label}</p></Card>
                      </Col>
                    ))}
                  </Row>

                  <Card className="rounded-4 border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <Card.Header className="p-4 border-0 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--card-bg)' }}><p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Upcoming Schedule</p><Button variant="link" onClick={() => setTab("Appointments")} className="extra-small p-0 text-decoration-none fw-bold" style={{ fontSize: 11, color: "#4399E1" }}>View all</Button></Card.Header>
                    {upcoming.length === 0 ? <Card.Body className="text-center py-4"><p className="small text-muted mb-0">No upcoming appointments</p></Card.Body> : (
                      <div className="list-group list-group-flush border-top">
                        {upcoming.slice(0, 5).map(a => (
                          <div key={a.id} className="list-group-item p-4 border-0 d-flex align-items-center gap-4 transition" style={{ backgroundColor: 'var(--card-bg)' }}>
                            <div className="extra-small fw-bold text-primary text-nowrap" style={{ width: 64 }}>{a.date.split("·")[1]?.trim() ?? "—"}</div>
                            <div className="flex-grow-1 min-w-0"><p className="small fw-bold mb-0 text-dark truncate">{a.user.name}</p><p className="extra-small text-muted mb-0 truncate" style={{ fontSize: 10 }}>{a.reason || "No reason specified"}</p></div>
                            <Badge pill className={`extra-small fw-bold ${a.status === "Confirmed" ? "bg-success-subtle text-success" : "bg-primary-subtle text-primary"}`}>{a.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {tab === "Appointments" && (
                <Card className="rounded-4 border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <Card.Header className="p-4 border-0" style={{ backgroundColor: 'var(--card-bg)' }}><p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>All Appointments ({appointments.length})</p></Card.Header>
                  <div className="list-group list-group-flush border-top">
                    {appointments.length === 0 ? <div className="p-5 text-center text-muted small">No appointments yet</div> : appointments.map(a => (
                      <div key={a.id} className="list-group-item p-4 d-flex align-items-start gap-4 transition" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        <div className="text-center shrink-0" style={{ width: 80 }}><p className="small fw-bold mb-0" style={{ color: '#4399E1' }}>{a.date.split("·")[1]?.trim() ?? "—"}</p><p className="extra-small mb-0" style={{ fontSize: 10, color: 'var(--muted-text)' }}>{a.date.split("·")[0]?.trim()}</p></div>
                        <div className="flex-grow-1 min-w-0"><p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{a.user.name}</p><p className="extra-small mb-1" style={{ fontSize: 11, color: 'var(--muted-text)' }}>{a.user.email}</p>{a.reason && <p className="extra-small mb-0" style={{ fontSize: 10, color: 'var(--muted-text)' }}>Reason: {a.reason}</p>}</div>
                        <Badge pill className={`extra-small fw-bold shrink-0 ${a.status === "Confirmed" ? "bg-success-subtle text-success" : a.status === "Completed" ? "bg-primary-subtle text-primary" : a.status === "Cancelled" || a.status === "Declined" ? "bg-danger-subtle text-danger" : "bg-warning-subtle text-warning"}`}>{a.status}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "Availability" && (
                <Card className="rounded-4 border-0 shadow-sm p-4" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <h3 className="h6 fw-bold mb-1" style={{ color: 'var(--foreground)' }}>Manage Availability</h3>
                  <p className="extra-small text-muted mb-4">Click available slots to block them. Booked slots cannot be changed.</p>
                  <Row className="g-2 mb-4">
                    {availability.map(s => (
                      <Col xs={4} sm={3} md={2} key={s.time}>
                        <Button variant={s.status === "booked" ? "primary" : s.status === "available" ? "outline-success" : "light"} disabled={s.status === "booked"} onClick={() => toggleSlot(s.time)} className={`w-100 py-2.5 rounded-3 d-flex flex-column align-items-center gap-1 border-0 shadow-none ${s.status === "blocked" ? "text-decoration-line-through opacity-50" : ""}`} style={{ backgroundColor: s.status === "booked" ? "#4399E1" : s.status === "available" ? "#dcfce7" : "var(--section-bg)", color: s.status === "booked" ? "#ffffff" : s.status === "available" ? "#15803d" : "var(--muted-text)" }}><span className="small fw-bold">{s.time}</span><span className="extra-small opacity-75" style={{ fontSize: 9 }}>{s.status === "booked" ? "Booked" : s.status === "available" ? "Free" : "Blocked"}</span></Button>
                      </Col>
                    ))}
                  </Row>
                  <div className="d-flex flex-wrap gap-4 mb-5 extra-small text-muted fw-medium"><span className="d-flex align-items-center gap-2"><div className="rounded-1" style={{ width: 12, height: 12, backgroundColor: "#4399E1" }} /> Booked</span><span className="d-flex align-items-center gap-2"><div className="rounded-1 border" style={{ width: 12, height: 12, backgroundColor: "#dcfce7" }} /> Available</span><span className="d-flex align-items-center gap-2"><div className="rounded-1" style={{ width: 12, height: 12, backgroundColor: "#f8faff" }} /> Blocked</span></div>
                  <Button onClick={saveAvailability} disabled={savingSlots} className="rounded-3 px-4 py-2.5 fw-bold border-0 shadow-sm" style={{ backgroundColor: "#4399E1" }}>{savingSlots ? "Saving..." : "Save Availability"}</Button>
                </Card>
              )}

              {tab === "Patient Requests" && (
                <div className="d-flex flex-column gap-3">
                  {pending.length === 0 ? <Card className="rounded-4 border-0 shadow-sm p-5 text-center" style={{ backgroundColor: 'var(--card-bg)' }}><div className="fs-1 mb-3">✅</div><p className="small fw-bold mb-1" style={{ color: 'var(--foreground)' }}>No pending requests</p><p className="extra-small mb-0" style={{ color: 'var(--muted-text)' }}>All patient requests have been handled.</p></Card> : pending.map(r => (
                    <Card key={r.id} className="rounded-4 border-0 shadow-sm p-4" style={{ backgroundColor: 'var(--card-bg)' }}><div className="d-flex align-items-start gap-3"><div className="rounded-3 d-flex align-items-center justify-content-center fs-4 shrink-0" style={{ width: 48, height: 48, backgroundColor: "var(--section-bg)" }}>🐾</div><div className="flex-grow-1 min-w-0"><div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3"><div><p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{r.user.name}</p><p className="extra-small mb-1" style={{ fontSize: 10, color: 'var(--muted-text)' }}>{r.date}</p>{r.reason && <p className="extra-small mb-0 lh-sm" style={{ fontSize: 11, color: 'var(--muted-text)' }}>Reason: {r.reason}</p>}</div><div className="d-flex gap-2 shrink-0"><Button size="sm" onClick={() => confirmAppointment(r.id)} disabled={actingId === r.id} className="rounded-3 px-3 py-2 fw-bold border-0 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: "#4399E1", fontSize: 11 }}><CheckCircle size={14} /> Accept</Button><Button size="sm" onClick={() => declineAppointment(r.id)} disabled={actingId === r.id} className="rounded-3 px-3 py-2 fw-bold border extra-small d-flex align-items-center gap-2" style={{ fontSize: 11, backgroundColor: 'var(--section-bg)', borderColor: 'var(--card-border)', color: 'var(--muted-text)' }}><XCircle size={14} /> Decline</Button></div></div></div></div></Card>
                  ))}
                </div>
              )}

              {tab === "Profile Settings" && vet && (
                <Card className="rounded-4 border-0 shadow-sm p-4" style={{ maxWidth: 600, backgroundColor: 'var(--card-bg)' }}>
                  <h3 className="h6 fw-bold mb-5" style={{ color: 'var(--foreground)' }}>Profile Settings</h3>
                  <Form className="d-flex flex-column gap-4">
                    {(["name", "spec", "clinic", "exp", "price"] as const).map(field => (
                      <Form.Group key={field}><Form.Label className="extra-small fw-bold text-dark mb-1 text-uppercase" style={{ fontSize: 10 }}>{field === "spec" ? "Specialization" : field === "exp" ? "Experience" : field === "price" ? "Price (sum/visit)" : field}</Form.Label><Form.Control value={(profileForm as any)[field]} onChange={e => setProfileForm((f: any) => ({ ...f, [field]: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" /></Form.Group>
                    ))}
                    <Form.Group><Form.Label className="extra-small fw-bold text-muted mb-1 text-uppercase" style={{ fontSize: 10 }}>Email (Read-only)</Form.Label><Form.Control value={vet.email ?? ""} disabled className="bg-light-subtle border-0 shadow-none small p-2.5 rounded-3 text-muted opacity-50" /></Form.Group>
                    <Button onClick={saveProfile} disabled={savingProfile} className="rounded-3 py-3 fw-bold border-0 shadow-sm mt-3" style={{ backgroundColor: "#4399E1" }}>{savingProfile ? "Saving..." : "Save Profile Changes"}</Button>
                  </Form>
                </Card>
              )}
            </Container>
          )}
        </main>
      </div>
    </div>
  );
}
