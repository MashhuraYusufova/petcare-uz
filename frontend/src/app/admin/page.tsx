"use client";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Menu, TrendingUp, TrendingDown, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Container, Row, Col, Card, Button, Table, Badge, Form, Offcanvas, Modal } from "react-bootstrap";
import AdminSidebar from "@/components/AdminSidebar";

interface OverviewStats {
  usersCount: number; ordersCount: number; appointmentsCount: number;
  productsCount: number; vetsCount: number; totalRevenue: number;
}

interface AdvancedAnalytics {
  topProducts: { name: string, count: number }[];
  revenueTimeline: { date: string, revenue: number }[];
  mostBoughtProduct: string;
  highestRevenueDay: { date: string, revenue: number };
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

const initialProductForm = {
  name: "", price: "", oldPrice: "", rating: "4.8", reviews: "0",
  tag: "", img: "", brand: "", cat: "", stock: "0",
};

const initialVetForm = {
  name: "", spec: "", clinic: "", district: "", rating: "5", reviews: "0",
  exp: "", price: "", avail: true, slots: "", email: "",
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
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
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

  const appointmentsByStatus = useMemo(() => {
    const counts = appointments.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  const productsByCategory = useMemo(() => {
    const counts = products.reduce((acc, curr) => {
      acc[curr.cat] = (acc[curr.cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const COLORS = ['#4399E1', '#48BB78', '#ECC94B', '#F56565', '#9F7AEA'];

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
      api.get<{ id: string, name: string }[]>("/api/products/categories"),
      api.get<AdvancedAnalytics>("/api/admin/analytics"),
    ]).then(([s, p, v, a, c, an]) => {
      setStats(s); setProducts(p); setVets(v); setAppointments(a); setCategories(c); setAnalytics(an);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "admin" || tab !== "Users") return;
    api.get<User[]>("/api/admin/users").then(setUsers).catch(console.error);
  }, [tab, user]);

  async function deleteProduct(id: string) {
    if (!confirm("Delete product?")) return;
    await api.delete(`/api/admin/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function deleteVet(id: string) {
    if (!confirm("Remove vet?")) return;
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
    setShowProductForm(true);
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
    setShowVetForm(true);
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
        setProducts(prev => prev.map(p => p.id === editingProductId ? updated : p));
      } else {
        const created = await api.post<Product>("/api/admin/products", payload);
        setProducts(prev => [created, ...prev]);
        if (stats) setStats({ ...stats, productsCount: stats.productsCount + 1 });
      }
      resetProductForm();
    } catch (err: any) { setProductError(err.message); }
    finally { setSubmittingProduct(false); }
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
      slots: vetForm.slots.split(",").map(s => s.trim()).filter(Boolean),
      email: vetForm.email.trim() || null,
    };
    try {
      if (editingVetId) {
        const updated = await api.put<Vet>(`/api/admin/vets/${editingVetId}`, payload);
        setVets(prev => prev.map(v => v.id === editingVetId ? updated : v));
      } else {
        const created = await api.post<Vet>("/api/admin/vets", payload);
        setVets(prev => [created, ...prev]);
        if (stats) setStats({ ...stats, vetsCount: stats.vetsCount + 1 });
      }
      resetVetForm();
    } catch (err: any) { setVetError(err.message); }
    finally { setSubmittingVet(false); }
  }

  if (authLoading || !user) return null;

  return (
    <div className="min-vh-100 d-flex" style={{ backgroundColor: 'var(--background)' }}>
      <aside className="d-none d-lg-block shrink-0" style={{ width: 240 }}>
        <AdminSidebar tab={tab} setTab={setTab} setSidebarOpen={setSidebarOpen} />
      </aside>

      <Offcanvas show={sidebarOpen} onHide={() => setSidebarOpen(false)} style={{ width: 240, backgroundColor: "#192A51" }}>
        <AdminSidebar tab={tab} setTab={setTab} setSidebarOpen={setSidebarOpen} />
      </Offcanvas>

      <div className="flex-grow-1 d-flex flex-column min-w-0">
        <header className="border-bottom px-4 py-3 d-flex align-items-center justify-content-between sticky-top z-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="d-flex align-items-center gap-3">
            <Button variant="link" className="d-lg-none p-0" onClick={() => setSidebarOpen(true)} style={{ color: 'var(--foreground)' }}>
              <Menu size={20} />
            </Button>
            <div>
              <h1 className="h6 fw-bold mb-0" style={{ color: 'var(--foreground)' }}>{tab}</h1>
              <p className="extra-small text-muted mb-0" style={{ fontSize: 10 }}>Admin Dashboard · PetCare.uz</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Button variant="link" onClick={toggle} className="p-0 rounded-circle text-muted transition hover-bg-light" style={{ width: 32, height: 32 }}>
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white small shadow-sm" style={{ width: 32, height: 32, backgroundColor: "#4399E1" }}>
              {user.name[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4">
          {loading ? (
            <Row className="g-4">
              {[1, 2, 3, 4].map(i => (
                <Col xs={6} lg={3} key={i}>
                  <Card className="rounded-4 border-0 shadow-sm animate-pulse" style={{ height: 100 }} />
                </Col>
              ))}
            </Row>
          ) : (
            <Container fluid className="px-0">
              {tab === "Overview" && stats && (
                <div className="d-flex flex-column gap-4">
                  <Row className="g-4">
                    {[
                      { label: "Total Revenue", value: `${stats.totalRevenue.toLocaleString()} sum`, change: "+18%", up: true, icon: "💰" },
                      { label: "Total Orders", value: stats.ordersCount.toString(), change: "+12%", up: true, icon: "📦" },
                      { label: "Active Users", value: stats.usersCount.toString(), change: "+8%", up: true, icon: "👤" },
                      { label: "Vet Appointments", value: stats.appointmentsCount.toString(), change: "", up: true, icon: "🩺" },
                    ].map(s => (
                      <Col xs={6} lg={3} key={s.label}>
                        <Card className="rounded-4 border-0 shadow-sm p-4 h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="fs-3">{s.icon}</span>
                            {s.change && (
                              <Badge pill className={`d-flex align-items-center gap-1 extra-small fw-bold ${s.up ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change}
                              </Badge>
                            )}
                          </div>
                          <p className="h5 fw-bold mb-1" style={{ color: 'var(--foreground)' }}>{s.value}</p>
                          <p className="extra-small text-muted mb-0" style={{ fontSize: 11 }}>{s.label}</p>
                        </Card>
                      </Col>
                    ))}
                  </Row>



                  <Card className="rounded-4 border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <Card.Header className="p-4 border-0 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--card-bg)' }}>
                      <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Recent Appointments</p>
                      <Button variant="link" onClick={() => setTab("Appointments")} className="extra-small p-0 text-decoration-none fw-bold" style={{ fontSize: 11, color: "#4399E1" }}>View all</Button>
                    </Card.Header>
                    <div className="table-responsive">
                      <Table hover className="mb-0 small align-middle">
                        <thead className="bg-light">
                          <tr className="border-top">
                            {["User", "Vet", "Date", "Status"].map(h => <th key={h} className="px-4 py-3 extra-small fw-bold text-muted text-uppercase">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.slice(0, 5).map(a => (
                            <tr key={a.id}>
                              <td className="px-4 py-3 fw-bold text-dark">{a.user.name}</td>
                              <td className="px-4 py-3 text-muted">{a.vet.name}</td>
                              <td className="px-4 py-3 text-muted">{a.date}</td>
                              <td className="px-4 py-3">
                                <Badge pill className={`extra-small fw-bold ${
                                  a.status === "Confirmed" ? "bg-success-subtle text-success" :
                                  a.status === "Completed" ? "bg-primary-subtle text-primary" :
                                  a.status === "Cancelled" || a.status === "Declined" ? "bg-danger-subtle text-danger" :
                                  "bg-warning-subtle text-warning"
                                }`}>{a.status}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card>
                </div>
              )}

              {tab === "Products" && (
                <Card className="rounded-4 border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <Card.Header className="p-4 border-0 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Manage Products ({products.length})</p>
                    <Button onClick={startCreateProduct} size="sm" className="rounded-3 px-3 fw-bold border-0 shadow-sm" style={{ backgroundColor: "#4399E1", fontSize: 11 }}>+ Add Product</Button>
                  </Card.Header>

                  <Modal show={showProductForm} onHide={resetProductForm} centered size="lg" className="rounded-4">
                    <Modal.Header closeButton className="border-0 pb-0">
                      <Modal.Title className="small fw-bold">{editingProductId ? "Edit Product" : "New Product"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                      <Form onSubmit={submitProduct} className="d-flex flex-column gap-3">
                        <Row className="g-3">
                          <Col lg={8}><Form.Group><Form.Label className="extra-small fw-bold text-dark mb-1">Name</Form.Label><Form.Control value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" required /></Form.Group></Col>
                          <Col lg={4}><Form.Group><Form.Label className="extra-small fw-bold text-dark mb-1">Brand</Form.Label><Form.Control value={productForm.brand} onChange={e => setProductForm(p => ({ ...p, brand: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" required /></Form.Group></Col>
                          <Col lg={6}>
                            <Form.Group>
                              <Form.Label className="extra-small fw-bold text-dark mb-1">Category</Form.Label>
                              <Form.Select
                                value={productForm.cat}
                                onChange={e => setProductForm(p => ({ ...p, cat: e.target.value }))}
                                className="bg-light border-0 shadow-none small p-2.5 rounded-3"
                                required
                              >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                  <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col lg={6}><Form.Group><Form.Label className="extra-small fw-bold text-dark mb-1">Image URL</Form.Label><Form.Control value={productForm.img} onChange={e => setProductForm(p => ({ ...p, img: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" required /></Form.Group></Col>
                          <Col xs={6} lg={3}><Form.Group><Form.Label className="extra-small fw-bold text-dark mb-1">Price</Form.Label><Form.Control value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" type="number" required /></Form.Group></Col>
                          <Col xs={6} lg={3}><Form.Group><Form.Label className="extra-small fw-bold text-dark mb-1">Stock</Form.Label><Form.Control value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" type="number" required /></Form.Group></Col>
                        </Row>
                        {productError && <p className="small text-danger mt-1">{productError}</p>}
                        <div className="d-flex gap-2 mt-2">
                          <Button type="submit" disabled={submittingProduct} className="rounded-3 px-4 py-2 border-0 small fw-bold" style={{ backgroundColor: "#4399E1" }}>{submittingProduct ? "Saving..." : editingProductId ? "Save" : "Create"}</Button>
                          <Button variant="link" onClick={resetProductForm} className="text-decoration-none small text-muted fw-bold">Cancel</Button>
                        </div>
                      </Form>
                    </Modal.Body>
                  </Modal>

                  <div className="table-responsive">
                    <Table hover className="mb-0 small align-middle">
                      <thead className="bg-light"><tr className="border-top">{["Product", "Category", "Stock", "Price", "Rating", "Actions"].map(h => <th key={h} className="px-4 py-3 extra-small fw-bold text-muted text-uppercase">{h}</th>)}</tr></thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td className="px-4 py-3 fw-bold text-dark truncate" style={{ maxWidth: 200 }}>{p.name}</td>
                            <td className="px-4 py-3 text-muted">{p.cat}</td>
                            <td className="px-4 py-3"><Badge pill className={`extra-small fw-bold ${p.stock < 10 ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success"}`}>{p.stock}</Badge></td>
                            <td className="px-4 py-3 text-muted">{p.price.toLocaleString()} sum</td>
                            <td className="px-4 py-3 text-warning">⭐ {p.rating}</td>
                            <td className="px-4 py-3"><div className="d-flex gap-2"><Button variant="link" size="sm" onClick={() => startEditProduct(p)} className="p-0 extra-small fw-bold text-decoration-none" style={{ color: "#4399E1" }}>Edit</Button><Button variant="link" size="sm" onClick={() => deleteProduct(p.id)} className="p-0 extra-small fw-bold text-decoration-none text-danger">Delete</Button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              )}

              {tab === "Veterinarians" && (
                <Card className="rounded-4 border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <Card.Header className="p-4 border-0 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Manage Veterinarians ({vets.length})</p>
                    <Button onClick={startCreateVet} size="sm" className="rounded-3 px-3 fw-bold border-0 shadow-sm" style={{ backgroundColor: "#4399E1", fontSize: 11 }}>+ Add Vet</Button>
                  </Card.Header>

                  <Modal show={showVetForm} onHide={resetVetForm} centered size="lg" className="rounded-4">
                    <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="small fw-bold">{editingVetId ? "Edit" : "New"} Veterinarian</Modal.Title></Modal.Header>
                    <Modal.Body className="p-4">
                      <Form onSubmit={submitVet} className="d-flex flex-column gap-3">
                        <Row className="g-3">
                          <Col lg={6}><Form.Group><Form.Label className="extra-small fw-bold text-dark mb-1">Full Name</Form.Label><Form.Control value={vetForm.name} onChange={e => setVetForm(v => ({ ...v, name: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" required /></Form.Group></Col>
                          <Col lg={6}><Form.Group><Form.Label className="extra-small fw-bold text-dark mb-1">Specialization</Form.Label><Form.Control value={vetForm.spec} onChange={e => setVetForm(v => ({ ...v, spec: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" required /></Form.Group></Col>
                          <Col lg={12}><Form.Group><Form.Label className="extra-small fw-bold text-dark mb-1">Clinic</Form.Label><Form.Control value={vetForm.clinic} onChange={e => setVetForm(v => ({ ...v, clinic: e.target.value }))} className="bg-light border-0 shadow-none small p-2.5 rounded-3" required /></Form.Group></Col>
                        </Row>
                        {vetError && <p className="small text-danger mt-1">{vetError}</p>}
                        <div className="d-flex gap-2 mt-2">
                          <Button type="submit" disabled={submittingVet} className="rounded-3 px-4 py-2 border-0 small fw-bold shadow-sm" style={{ backgroundColor: "#4399E1" }}>{submittingVet ? "Saving..." : "Save"}</Button>
                          <Button variant="link" onClick={resetVetForm} className="text-decoration-none small text-muted fw-bold">Cancel</Button>
                        </div>
                      </Form>
                    </Modal.Body>
                  </Modal>

                  <div className="table-responsive">
                    <Table hover className="mb-0 small align-middle">
                      <thead className="bg-light"><tr className="border-top">{["Vet", "Specialization", "Clinic", "Rating", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 extra-small fw-bold text-muted text-uppercase">{h}</th>)}</tr></thead>
                      <tbody>
                        {vets.map(v => (
                          <tr key={v.id}>
                            <td className="px-4 py-3 fw-bold text-dark">{v.name}</td>
                            <td className="px-4 py-3 text-muted">{v.spec}</td>
                            <td className="px-4 py-3 text-muted">{v.clinic}</td>
                            <td className="px-4 py-3 text-warning">⭐ {v.rating}</td>
                            <td className="px-4 py-3"><Badge pill className={`extra-small fw-bold ${v.avail ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>{v.avail ? "Active" : "Away"}</Badge></td>
                            <td className="px-4 py-3"><div className="d-flex gap-2"><Button variant="link" size="sm" onClick={() => startEditVet(v)} className="p-0 extra-small fw-bold text-decoration-none" style={{ color: "#4399E1" }}>Edit</Button><Button variant="link" size="sm" onClick={() => deleteVet(v.id)} className="p-0 extra-small fw-bold text-decoration-none text-danger">Remove</Button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              )}

              {tab === "Appointments" && (
                <Card className="rounded-4 border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <Card.Header className="p-4 border-0" style={{ backgroundColor: 'var(--card-bg)' }}><p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>All Appointments ({appointments.length})</p></Card.Header>
                  <div className="table-responsive">
                    <Table hover className="mb-0 small align-middle">
                      <thead className="bg-light"><tr className="border-top">{["User", "Vet", "Date", "Status"].map(h => <th key={h} className="px-4 py-3 extra-small fw-bold text-muted text-uppercase">{h}</th>)}</tr></thead>
                      <tbody>
                        {appointments.map(a => (
                          <tr key={a.id}>
                            <td className="px-4 py-3 fw-bold text-dark">{a.user.name}</td>
                            <td className="px-4 py-3 text-muted">{a.vet.name}</td>
                            <td className="px-4 py-3 text-muted">{a.date}</td>
                            <td className="px-4 py-3"><Badge pill className="extra-small fw-bold bg-primary-subtle text-primary">{a.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              )}

              {tab === "Users" && (
                <Card className="rounded-4 border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <Card.Header className="p-4 border-0" style={{ backgroundColor: 'var(--card-bg)' }}><p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>All Users ({users.length})</p></Card.Header>
                  <div className="table-responsive">
                    <Table hover className="mb-0 small align-middle">
                      <thead className="bg-light"><tr className="border-top">{["Name", "Email", "Role", "Joined", "Actions"].map(h => <th key={h} className="px-4 py-3 extra-small fw-bold text-muted text-uppercase">{h}</th>)}</tr></thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td className="px-4 py-3 fw-bold text-dark">{u.name}</td>
                            <td className="px-4 py-3 text-muted">{u.email}</td>
                            <td className="px-4 py-3"><Badge pill className="extra-small fw-bold bg-secondary-subtle text-secondary">{u.role}</Badge></td>
                            <td className="px-4 py-3 text-muted extra-small">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3"><Button variant="link" size="sm" onClick={() => changeRole(u.id, u.role === "admin" ? "user" : "admin")} className="p-0 extra-small fw-bold text-decoration-none" style={{ color: "#4399E1" }}>{u.role === "admin" ? "Demote" : "Make Admin"}</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              )}

              {tab === "Analytics" && analytics && (
                <div className="d-flex flex-column gap-4">
                  <Row className="g-4 mb-4">
                    <Col lg={4}>
                      <Card className="rounded-4 border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <p className="extra-small text-muted mb-1" style={{ fontSize: 11 }}>Most Bought Product</p>
                        <p className="h5 fw-bold mb-0 text-primary text-truncate">{analytics.mostBoughtProduct}</p>
                      </Card>
                    </Col>
                    <Col lg={4}>
                      <Card className="rounded-4 border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <p className="extra-small text-muted mb-1" style={{ fontSize: 11 }}>Highest Revenue Day</p>
                        <p className="h5 fw-bold mb-0 text-success">{analytics.highestRevenueDay.date === 'N/A' ? 'N/A' : new Date(analytics.highestRevenueDay.date).toLocaleDateString()}</p>
                        {analytics.highestRevenueDay.revenue > 0 && <p className="extra-small text-muted mt-1 mb-0">{analytics.highestRevenueDay.revenue.toLocaleString()} sum</p>}
                      </Card>
                    </Col>
                    <Col lg={4}>
                       <Card className="rounded-4 border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <p className="extra-small text-muted mb-1" style={{ fontSize: 11 }}>Total Products Tracked</p>
                        <p className="h5 fw-bold mb-0 text-warning">{analytics.topProducts.length}</p>
                      </Card>
                    </Col>
                  </Row>

                  {analytics.revenueTimeline.length > 0 && (
                    <Row className="g-4 mb-4">
                      <Col lg={12}>
                        <Card className="rounded-4 border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                          <Card.Header className="p-4 border-0 bg-transparent">
                            <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Revenue Over Time</p>
                          </Card.Header>
                          <Card.Body className="p-4 pt-0">
                            <div style={{ height: 300 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.revenueTimeline}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                                  <XAxis dataKey="date" stroke="var(--muted-text)" fontSize={12} tickFormatter={(val) => isNaN(new Date(val).getTime()) ? val : new Date(val).toLocaleDateString()} />
                                  <YAxis stroke="var(--muted-text)" fontSize={12} width={80} tickFormatter={(val) => `${(val / 1000)}k`} />
                                  <RechartsTooltip 
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} sum`, 'Revenue']}
                                    labelFormatter={(label) => isNaN(new Date(label).getTime()) ? label : new Date(label).toLocaleDateString()}
                                  />
                                  <Line type="monotone" dataKey="revenue" stroke="#48BB78" strokeWidth={3} dot={{ r: 4, fill: '#48BB78' }} activeDot={{ r: 6 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )}

                  <Row className="g-4 mb-4">
                    <Col lg={8}>
                      <Card className="rounded-4 border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <Card.Header className="p-4 border-0 bg-transparent">
                          <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Products by Category</p>
                        </Card.Header>
                        <Card.Body className="p-4 pt-0">
                          <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={productsByCategory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                                <XAxis dataKey="name" stroke="var(--muted-text)" fontSize={12} />
                                <YAxis stroke="var(--muted-text)" fontSize={12} allowDecimals={false} />
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="value" fill="#4399E1" radius={[4, 4, 0, 0]} name="Products" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={4}>
                      <Card className="rounded-4 border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <Card.Header className="p-4 border-0 bg-transparent">
                          <p className="small fw-bold mb-0" style={{ color: 'var(--foreground)' }}>Appointments by Status</p>
                        </Card.Header>
                        <Card.Body className="p-4 pt-0">
                          <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={appointmentsByStatus}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {appointmentsByStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {(tab === "Blog Posts" || tab === "Settings") && (
                <div className="text-center py-5 mt-5"><div className="display-1 opacity-10 mb-4">🚧</div><h2 className="h4 fw-bold" style={{ color: 'var(--foreground)' }}>{tab} Module</h2><p style={{ color: 'var(--muted-text)' }}>Under construction.</p></div>
              )}
            </Container>
          )}
        </main>
      </div>
    </div>
  );
}
