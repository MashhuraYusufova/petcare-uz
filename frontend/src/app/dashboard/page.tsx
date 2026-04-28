"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Calendar, Heart, Star, PawPrint, ShoppingBag, ChevronRight, UserRound, Dog, Cat, Bone, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Container, Row, Col, Card, Nav, Button, Badge, Modal, Form } from "react-bootstrap";

const tabs = ["Overview", "Orders", "Favorites", "Appointments", "My Pets"];

interface Order {
  id: string;
  item: string;
  date: string;
  status: string;
  price: string;
  img: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  img: string;
  brand: string;
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
  if (species === "Dog") return <Dog size={32} style={{ color: "#4399E1" }} />;
  if (species === "Cat") return <Cat size={32} style={{ color: "#4399E1" }} />;
  return <Bone size={32} style={{ color: "#4399E1" }} />;
}

export default function DashboardPage() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
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
    } else if (tab === "Favorites") {
      api.get<Product[]>("/api/dashboard/wishlist").then(setWishlist).catch(console.error);
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

  async function removeFromWishlist(productId: string) {
    try {
      await api.delete(`/api/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => p.id !== productId));
      toast.success("Removed from favorites");
      if (data) setData({ ...data, stats: { ...data.stats, wishlistCount: data.stats.wishlistCount - 1 } });
    } catch (err: any) {
      toast.error("Failed to remove from favorites");
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--background)' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar />

      <Container className="py-5">
        <Row className="g-5">
          <Col lg={3}>
            <aside className="d-flex flex-column gap-4 sticky-top" style={{ top: '6rem' }}>
              <Card className="rounded-4 p-4 text-white border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #4399E1 0%, #192A51 100%)" }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                  <UserRound size={32} style={{ color: "#ffffff" }} />
                </div>
                <div className="text-center">
                  <p className="fw-bold mb-0 text-white">{user?.name}</p>
                  <p className="extra-small opacity-75 mb-3" style={{ fontSize: 11 }}>{user?.email}</p>
                  <Badge pill className="fw-semibold px-3 py-1 mx-auto d-flex align-items-center gap-2 justify-content-center w-fit" style={{ backgroundColor: "rgba(255, 169, 172, 0.3)", fontSize: 10 }}>
                    <Star size={11} style={{ fill: "#FFA9AC", color: "#FFA9AC" }} /> {user?.role === "admin" ? "Admin" : "Premium Member"}
                  </Badge>
                </div>
              </Card>

              <Nav className="flex-column gap-1 rounded-4 p-2 border" style={{ backgroundColor: 'var(--section-bg)', borderColor: 'var(--card-border)' }}>
                {tabs.map(t => (
                  <Nav.Link
                    key={t}
                    onClick={() => setTab(t)}
                    active={tab === t}
                    className={`d-flex align-items-center gap-2.5 small fw-bold py-2.5 px-3 rounded-3 transition ${tab === t ? "shadow-sm" : ""}`}
                    style={{ backgroundColor: tab === t ? 'var(--card-bg)' : 'transparent', color: tab === t ? '#4399E1' : 'var(--muted-text)' }}
                  >
                    {t === "Overview" && <UserRound size={15} />}
                    {t === "Orders" && <Package size={15} />}
                    {t === "Favorites" && <Heart size={15} />}
                    {t === "Appointments" && <Calendar size={15} />}
                    {t === "My Pets" && <PawPrint size={15} />}
                    {t}
                  </Nav.Link>
                ))}
                <Button
                  variant="link"
                  onClick={() => { logout(); router.push("/"); }}
                  className="d-flex align-items-center gap-2.5 small fw-bold py-2.5 px-3 rounded-3 text-decoration-none text-danger mt-1 text-start"
                >
                  Sign Out
                </Button>
              </Nav>
            </aside>
          </Col>

          <Col lg={9}>
            {loading ? (
              <div className="d-flex flex-column gap-3">
                {[1, 2, 3].map(i => <div key={i} className="bg-light rounded-4 border animate-pulse" style={{ height: 100 }} />)}
              </div>
            ) : (
              <main style={{ color: 'var(--foreground)' }}>
                {tab === "Overview" && data && (
                  <div className="d-flex flex-column gap-5">
                    <Row className="g-4">
                      {[
                        { icon: <ShoppingBag size={20} style={{ color: "#4399E1" }} />, label: "Orders", value: data.stats.ordersCount, bg: "rgba(67, 153, 225, 0.15)", tab: "Orders" },
                        { icon: <Calendar size={20} style={{ color: "#FFA9AC" }} />, label: "Appointments", value: data.stats.appointmentsCount, bg: "rgba(255, 169, 172, 0.15)", tab: "Appointments" },
                        { icon: <Heart size={20} style={{ color: "#FFA9AC" }} />, label: "Wishlist", value: data.stats.wishlistCount, bg: "rgba(255, 169, 172, 0.15)", tab: "Favorites" },
                        { icon: <PawPrint size={20} style={{ color: "#4399E1" }} />, label: "My Pets", value: data.stats.petsCount, bg: "rgba(67, 153, 225, 0.15)", tab: "My Pets" },
                      ].map(s => (
                        <Col xs={6} md={3} key={s.label}>
                          <Card className="rounded-4 p-3 h-100 shadow-none cursor-pointer transition" onClick={() => setTab(s.tab)} style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-3 d-flex align-items-center justify-content-center shrink-0" style={{ width: 44, height: 44, backgroundColor: s.bg }}>{s.icon}</div>
                              <div>
                                <p className="h5 fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{s.value}</p>
                                <p className="extra-small mb-0" style={{ fontSize: 11, color: 'var(--muted-text)' }}>{s.label}</p>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>

                    <Row className="g-4">
                      <Col md={6}>
                        <Card className="rounded-4 p-4 h-100 shadow-none" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                          <div className="d-flex align-items-center justify-content-between mb-4">
                            <h3 className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Recent Order</h3>
                            <Button variant="link" size="sm" onClick={() => setTab("Orders")} className="extra-small p-0 text-decoration-none fw-bold" style={{ color: "#4399E1", fontSize: 11 }}>View all</Button>
                          </div>
                          {data.recentOrders[0] ? (
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-3 overflow-hidden border shrink-0" style={{ width: 48, height: 48 }}>
                                <img src={data.recentOrders[0].img} alt={data.recentOrders[0].item} className="w-100 h-100 object-fit-cover" />
                              </div>
                              <div className="min-w-0 flex-grow-1">
                                <p className="small fw-bold mb-0 truncate" style={{ color: 'var(--foreground)' }}>{data.recentOrders[0].item}</p>
                                <p className="extra-small text-muted mb-0" style={{ fontSize: 11 }}>{data.recentOrders[0].date}</p>
                              </div>
                              <Badge pill style={{ backgroundColor: "rgba(67, 153, 225, 0.15)", color: "#4399E1", fontSize: 10 }}>{data.recentOrders[0].status}</Badge>
                            </div>
                          ) : (
                            <p className="small text-muted mb-0">No orders yet</p>
                          )}
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="rounded-4 p-4 h-100 shadow-none" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                          <div className="d-flex align-items-center justify-content-between mb-4">
                            <h3 className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Upcoming Appointment</h3>
                            <Button variant="link" size="sm" onClick={() => setTab("Appointments")} className="extra-small p-0 text-decoration-none fw-bold" style={{ color: "#4399E1", fontSize: 11 }}>View all</Button>
                          </div>
                          {data.upcomingAppointments[0] ? (
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-3 d-flex align-items-center justify-content-center shrink-0" style={{ width: 48, height: 48, backgroundColor: "rgba(255, 169, 172, 0.15)" }}>
                                <UserRound size={24} style={{ color: "#FFA9AC" }} />
                              </div>
                              <div className="min-w-0 flex-grow-1">
                                <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{data.upcomingAppointments[0].vet.name}</p>
                                <p className="extra-small fw-bold mb-0" style={{ color: "#FFA9AC", fontSize: 11 }}>{data.upcomingAppointments[0].date}</p>
                                <p className="extra-small text-muted mb-0 truncate" style={{ fontSize: 10 }}>{data.upcomingAppointments[0].vet.clinic}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="small text-muted mb-0">No upcoming appointments</p>
                          )}
                        </Card>
                      </Col>
                    </Row>
                  </div>
                )}

                {tab === "Orders" && (
                  <Card className="rounded-4 overflow-hidden shadow-none" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <Card.Header className="p-4 border-bottom-0" style={{ backgroundColor: 'var(--card-bg)' }}>
                      <h2 className="h6 fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Order History</h2>
                    </Card.Header>
                    {orders.length === 0 ? (
                      <Card.Body className="text-center py-5">
                        <p className="small text-muted mb-0">No orders yet</p>
                      </Card.Body>
                    ) : (
                      <div className="list-group list-group-flush">
                        {orders.map(o => (
                          <div key={o.id} className="list-group-item p-4 d-flex align-items-center gap-4 transition" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                            <div className="rounded-3 overflow-hidden border shrink-0" style={{ width: 56, height: 56 }}>
                              <img src={o.img} alt={o.item} className="w-100 h-100 object-fit-cover" />
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{o.item}</p>
                              <p className="extra-small text-muted mb-0" style={{ fontSize: 11 }}>{o.date}</p>
                            </div>
                            <div className="text-end">
                              <p className="small fw-bold mb-1" style={{ color: 'var(--foreground)' }}>{o.price} sum</p>
                              <Badge pill style={{ backgroundColor: o.status === "Delivered" ? "rgba(67, 153, 225, 0.15)" : "rgba(255, 169, 172, 0.15)", color: o.status === "Delivered" ? "#4399E1" : "#FFA9AC", fontSize: 10 }}>{o.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}

                {tab === "Favorites" && (
                  <Card className="rounded-4 overflow-hidden shadow-none" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <Card.Header className="p-4 border-bottom-0 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--card-bg)' }}>
                      <h2 className="h6 fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Favorite Products</h2>
                      <Link href="/shop" className="extra-small fw-bold text-decoration-none" style={{ color: "#4399E1", fontSize: 11 }}>Go to Shop</Link>
                    </Card.Header>
                    {wishlist.length === 0 ? (
                      <Card.Body className="text-center py-5">
                        <Heart size={40} className="opacity-10 mb-3" />
                        <p className="small text-muted mb-0">You haven't saved any products yet.</p>
                      </Card.Body>
                    ) : (
                      <Row className="g-0 border-top">
                        {wishlist.map(p => (
                          <Col sm={6} key={p.id} className="border-end border-bottom border-light">
                            <div className="p-4 d-flex align-items-center gap-3 group transition h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                              <div className="rounded-3 overflow-hidden border shrink-0" style={{ width: 64, height: 64 }}>
                                <img src={p.img} alt={p.name} className="w-100 h-100 object-fit-cover transition duration-300 group-hover-scale-110" />
                              </div>
                              <div className="flex-grow-1 min-w-0">
                                <p className="extra-small fw-bold text-uppercase mb-0" style={{ color: "#4399E1", fontSize: 9 }}>{p.brand}</p>
                                <h3 className="small fw-bold mb-1 truncate" style={{ color: 'var(--foreground)' }}>{p.name}</h3>
                                <p className="small fw-bold mb-0" style={{ color: "#4399E1" }}>{p.price.toLocaleString()} sum</p>
                              </div>
                              <Button
                                variant="link"
                                onClick={() => removeFromWishlist(p.id)}
                                className="p-2 text-decoration-none rounded-3 transition"
                                style={{ color: "#FFA9AC" }}
                              >
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Card>
                )}

                {tab === "Appointments" && (
                  <div className="d-flex flex-column gap-3">
                    {appointments.length === 0 ? (
                      <p className="small text-muted p-4 bg-light rounded-4">No appointments yet</p>
                    ) : (
                      appointments.map(a => (
                        <Card key={a.id} className="rounded-4 p-4 shadow-none" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                          <div className="d-flex align-items-center gap-4 flex-wrap flex-sm-nowrap">
                            <div className="rounded-4 d-flex align-items-center justify-content-center shrink-0" style={{ width: 56, height: 56, backgroundColor: "rgba(255, 169, 172, 0.15)" }}>
                              <UserRound size={28} style={{ color: "#FFA9AC" }} />
                            </div>
                            <div className="flex-grow-1">
                              <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{a.vet.name}</p>
                              <p className="extra-small fw-medium mb-1" style={{ color: "#4399E1" }}>{a.vet.spec}</p>
                              <p className="extra-small text-muted mb-0" style={{ fontSize: 11 }}>{a.vet.clinic} · {a.date}</p>
                            </div>
                            <div className="d-flex flex-column align-items-end gap-2 ms-sm-auto">
                              <Badge pill style={{ backgroundColor: a.status === "Upcoming" ? "rgba(255, 169, 172, 0.15)" : a.status === "Cancelled" ? "rgba(220, 38, 38, 0.15)" : "rgba(67, 153, 225, 0.15)", color: a.status === "Upcoming" ? "#FFA9AC" : a.status === "Cancelled" ? "#dc2626" : "#4399E1", fontSize: 10 }}>{a.status}</Badge>
                              {a.status === "Upcoming" && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => cancelAppointment(a.id)}
                                  disabled={cancellingId === a.id}
                                  className="p-0 extra-small fw-bold text-decoration-none text-danger"
                                  style={{ fontSize: 11 }}
                                >
                                  {cancellingId === a.id ? "Cancelling..." : "Cancel"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                    <Link href="/vets" className="btn d-flex align-items-center justify-content-center gap-2 border-2 border-dashed rounded-4 py-4 text-primary fw-bold transition hover-border-primary" style={{ borderStyle: 'dashed', borderColor: '#e8eef7' }}>
                      + Book a New Appointment
                    </Link>
                  </div>
                )}

                {tab === "My Pets" && (
                  <div className="d-flex flex-column gap-4">
                    {pets.map(p => (
                      <Card key={p.id} className="rounded-4 p-4 shadow-none" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        <div className="d-flex align-items-center gap-4 flex-wrap flex-sm-nowrap">
                          <div className="rounded-4 d-flex align-items-center justify-content-center shrink-0" style={{ width: 64, height: 64, backgroundColor: "rgba(67, 153, 225, 0.15)" }}>
                            <PetIcon species={p.species} />
                          </div>
                          <div className="flex-grow-1">
                            <p className="h6 fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                            <p className="extra-small fw-medium mb-2" style={{ color: "#4399E1" }}>{p.species} · {p.breed}</p>
                            <div className="d-flex gap-4">
                              <span className="extra-small" style={{ color: 'var(--muted-text)' }}>Age: <b style={{ color: 'var(--foreground)' }}>{p.age}</b></span>
                              <span className="extra-small" style={{ color: 'var(--muted-text)' }}>Weight: <b style={{ color: 'var(--foreground)' }}>{p.weight}</b></span>
                            </div>
                          </div>
                          <div className="d-flex flex-column align-items-end gap-2 ms-sm-auto">
                            <Link href="/vets" className="d-flex align-items-center gap-1 extra-small fw-bold text-decoration-none" style={{ color: "#FFA9AC" }}>
                              Book Vet <ChevronRight size={14} />
                            </Link>
                            <Button variant="link" size="sm" onClick={() => deletePet(p.id)} className="p-0 extra-small text-decoration-none text-danger">Remove</Button>
                          </div>
                        </div>
                      </Card>
                    ))}

                    <Modal show={showAddPet} onHide={() => setShowAddPet(false)} centered rounded-4>
                      <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="h5 fw-bold">Add a Pet</Modal.Title>
                      </Modal.Header>
                      <Modal.Body className="p-4">
                        <Form className="d-flex flex-column gap-3">
                          <Row className="g-3">
                            <Col xs={6}>
                              <Form.Group>
                                <Form.Label className="extra-small fw-bold text-dark mb-1">Name</Form.Label>
                                <Form.Control value={newPet.name} onChange={e => setNewPet(p => ({ ...p, name: e.target.value }))} className="rounded-3 shadow-none small border-0" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }} placeholder="Pet's name" />
                              </Form.Group>
                            </Col>
                            <Col xs={6}>
                              <Form.Group>
                                <Form.Label className="extra-small fw-bold text-dark mb-1">Breed</Form.Label>
                                <Form.Control value={newPet.breed} onChange={e => setNewPet(p => ({ ...p, breed: e.target.value }))} className="rounded-3 shadow-none small border-0" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }} placeholder="e.g. Golden Retriever" />
                              </Form.Group>
                            </Col>
                            <Col xs={6}>
                              <Form.Group>
                                <Form.Label className="extra-small fw-bold text-dark mb-1">Age</Form.Label>
                                <Form.Control value={newPet.age} onChange={e => setNewPet(p => ({ ...p, age: e.target.value }))} className="rounded-3 shadow-none small border-0" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }} placeholder="e.g. 2 yrs" />
                              </Form.Group>
                            </Col>
                            <Col xs={6}>
                              <Form.Group>
                                <Form.Label className="extra-small fw-bold text-dark mb-1">Weight</Form.Label>
                                <Form.Control value={newPet.weight} onChange={e => setNewPet(p => ({ ...p, weight: e.target.value }))} className="rounded-3 shadow-none small border-0" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }} placeholder="e.g. 10 kg" />
                              </Form.Group>
                            </Col>
                            <Col xs={12}>
                              <Form.Group>
                                <Form.Label className="extra-small fw-bold text-dark mb-1">Species</Form.Label>
                                <Form.Select value={newPet.species} onChange={e => setNewPet(p => ({ ...p, species: e.target.value }))} className="rounded-3 shadow-none small border-0" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}>
                                  <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>
                        </Form>
                      </Modal.Body>
                      <Modal.Footer className="border-0 pt-0 p-4">
                        <Button variant="link" onClick={() => setShowAddPet(false)} className="text-decoration-none text-muted small me-auto p-0">Cancel</Button>
                        <Button onClick={addPet} disabled={addingPet || !newPet.name || !newPet.breed} className="rounded-3 px-4 py-2 border-0 small fw-bold" style={{ backgroundColor: "#4399E1" }}>
                          {addingPet ? "Saving..." : "Save Pet"}
                        </Button>
                      </Modal.Footer>
                    </Modal>

                    {!showAddPet && (
                      <Button onClick={() => setShowAddPet(true)} variant="link" className="d-flex align-items-center justify-content-center gap-2 border-2 border-dashed rounded-4 py-4 text-primary fw-bold transition text-decoration-none hover-border-primary" style={{ borderStyle: 'dashed', borderColor: '#e8eef7' }}>
                        + Add a Pet
                      </Button>
                    )}
                  </div>
                )}
              </main>
            )}
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}
