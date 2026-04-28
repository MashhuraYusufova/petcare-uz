"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Search, Star, ArrowRight, ShoppingBag, Stethoscope, BookOpen, Heart, Award,
  ChevronRight, Bone, Gamepad2, Scissors, Pill, Home, GraduationCap,
  Fish, Cat, Bath, PawPrint, UserRound, Truck, RefreshCw, ShieldCheck,
  MessageCircle, Salad, Hospital, Dog, Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Container, Row, Col, Card, Badge, Button, InputGroup, FormControl } from "react-bootstrap";

const categories = [
  { icon: Bone, label: "Food & Treats", color: "var(--section-bg)", count: "240+ items" },
  { icon: Gamepad2, label: "Toys & Play", color: "var(--section-bg)", count: "120+ items" },
  { icon: Scissors, label: "Grooming", color: "var(--section-bg)", count: "80+ items" },
  { icon: Pill, label: "Health & Meds", color: "var(--section-bg)", count: "60+ items" },
  { icon: Home, label: "Beds & Homes", color: "var(--section-bg)", count: "95+ items" },
  { icon: GraduationCap, label: "Training", color: "var(--section-bg)", count: "45+ items" },
];

const productsData = [
  { id: "69f09bb2f72189a2330da568", name: "Royal Canin Adult — Salmon Recipe", price: 89000, oldPrice: 120000, rating: 4.8, reviews: 234, tag: "Bestseller", img: "/prod-1.jpg", brand: "Royal Canin" },
  { id: "69f09bb2f72189a2330da569", name: "Cat Interactive Feather Toy Set", price: 45000, oldPrice: null, rating: 4.6, reviews: 89, tag: "New", img: "/prod-2.jpg", brand: "Zooplus" },
  { id: "69f09bb2f72189a2330da56a", name: "Beaphar Dog Shampoo Sensitive", price: 32000, oldPrice: 40000, rating: 4.7, reviews: 156, tag: "Sale", img: "/prod-3.jpg", brand: "Beaphar" },
  { id: "69f0bc1fa7e3bf3929a7f317", name: "Royal Canin Puppy Starter Kit", price: 120000, oldPrice: null, rating: 4.9, reviews: 78, tag: "Popular", img: "/prod-4.jpg", brand: "Royal Canin" },
];

const vets = [
  { name: "Dr. Malika Yusupova", spec: "Small Animal Surgery", rating: 4.9, exp: "8 yrs", clinic: "Tashkent Animal Clinic", avail: true },
  { name: "Dr. Bobur Rahimov", spec: "Dermatology & Nutrition", rating: 4.8, exp: "5 yrs", clinic: "Happy Paws Vet Center", avail: true },
  { name: "Dr. Nilufar Karimova", spec: "Exotic Animals", rating: 4.7, exp: "10 yrs", clinic: "Pet Health Hub", avail: false },
];

const blogs = [
  { title: "10 Foods Your Dog Should Never Eat", cat: "Nutrition", read: "5 min", Icon: Salad, date: "Apr 20" },
  { title: "How to Prepare Your Cat for a Vet Visit", cat: "Health", read: "4 min", Icon: Hospital, date: "Apr 18" },
  { title: "Understanding Dog Body Language", cat: "Behavior", read: "7 min", Icon: Dog, date: "Apr 15" },
];

const features = [
  { Icon: Truck, title: "Free Delivery", desc: "Orders over 100,000 sum" },
  { Icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
  { Icon: ShieldCheck, title: "Secure Payment", desc: "100% safe checkout" },
  { Icon: MessageCircle, title: "24/7 Support", desc: "Always here to help" },
];

export default function HomePage() {
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (api.getToken()) {
      api.get<any[]>("/api/wishlist")
        .then(items => setWishlist(items.map(i => i.id)))
        .catch(console.error);
    }
  }, []);

  const toggleWishlist = async (productId: string) => {
    if (!api.getToken()) {
      toast.error("Please sign in to add items to favorites");
      return;
    }
    const isWished = wishlist.includes(productId);
    try {
      if (isWished) {
        await api.delete(`/api/wishlist/${productId}`);
        setWishlist(w => w.filter(id => id !== productId));
        toast.success("Removed from favorites");
      } else {
        await api.post("/api/wishlist", { productId });
        setWishlist(w => [...w, productId]);
        toast.success("Added to favorites");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update favorites");
    }
  };

  const addToCart = async (productId: string) => {
    if (!api.getToken()) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    setAddingToCart(productId);
    try {
      await api.post("/api/cart", { productId, quantity: 1 });
      toast.success("Added to cart");
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "var(--background)" }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-section" style={{ background: "var(--hero-gradient, linear-gradient(135deg, #DDEDFF 0%, #ffffff 50%, #ffeef0 100%))", padding: "5rem 1.5rem" }}>
        <Container>
          <Row className="align-items-center g-5">
            <Col md={6} className="d-flex flex-column gap-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <div style={{ backgroundColor: "rgba(67,153,225,0.1)", color: "#4399E1", borderRadius: "999px", width: 'fit-content' }} className="d-inline-flex align-items-center gap-2 px-3 py-2">
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4399E1", display: "inline-block" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>Uzbekistan&apos;s #1 Pet Platform</span>
              </div>
              <h1 style={{ fontWeight: 800, color: "var(--foreground)", lineHeight: 1.15, fontSize: "3rem" }}>
                Everything Your <span style={{ color: "#4399E1" }}>Pet Needs</span>, <br />In One Place
              </h1>
              <p style={{ color: "var(--muted-text)", maxWidth: 420, fontSize: "1rem" }}>
                Shop premium pet products, book trusted vets, and access expert care guides — all on PetCare.uz.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/shop" style={{ textDecoration: 'none' }}>
                  <Button style={{ backgroundColor: "#4399E1", borderColor: "#4399E1", borderRadius: "999px", fontWeight: 600, padding: "0.75rem 1.5rem" }} className="d-flex align-items-center gap-2">
                    <ShoppingBag size={18} /> Shop Now
                  </Button>
                </Link>
                <Link href="/vets" style={{ textDecoration: 'none' }}>
                  <Button variant="outline-danger" style={{ color: "#FFA9AC", borderColor: "#FFA9AC", borderRadius: "999px", fontWeight: 600, backgroundColor: "transparent", padding: "0.75rem 1.5rem" }} className="d-flex align-items-center gap-2">
                    <Stethoscope size={18} /> Book a Vet
                  </Button>
                </Link>
              </div>
              <div className="d-flex align-items-center gap-4 pt-2">
                {[["10K+", "Happy Pets"], ["200+", "Products"], ["50+", "Vets"]].map(([num, lbl]) => (
                  <div key={lbl}>
                    <p style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "1.25rem", margin: 0 }}>{num}</p>
                    <p style={{ color: "var(--muted-text)", fontSize: 12, margin: 0 }}>{lbl}</p>
                  </div>
                ))}
              </div>
            </Col>
            <Col md={6} className="d-flex align-items-center justify-content-center">
              <img src="/hero-pets.png" alt="A dog and cat together" style={{ width: "100%", maxWidth: 480, height: "auto", borderRadius: 24, display: "block" }} />
            </Col>
          </Row>

          <Row className="mt-5 justify-content-center">
            <Col md={8}>
              <div style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", borderRadius: 16, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <Search size={20} style={{ color: "var(--muted-text)", flexShrink: 0 }} />
                <input type="text" placeholder="Search products, vets, or care tips..." style={{ flex: 1, padding: "16px 0", fontSize: 14, background: "transparent", border: "none", outline: "none", color: "var(--foreground)", fontFamily: "'Montserrat', sans-serif" }} />
                <Button style={{ backgroundColor: "#4399E1", border: "none", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>Search</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories */}
      <section className="py-5" style={{ backgroundColor: 'var(--background)' }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fs-4 fw-bold mb-1" style={{ color: "var(--foreground)" }}>Shop by Category</h2>
              <p className="small mb-0" style={{ color: "var(--muted-text)" }}>Find everything your pet needs</p>
            </div>
            <Link href="/shop" className="d-flex align-items-center gap-1 small fw-semibold text-decoration-none" style={{ color: "#4399E1" }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <Row className="g-3">
            {categories.map(cat => (
              <Col xs={6} sm={4} lg={2} key={cat.label}>
                <Link href="/shop" className="text-decoration-none">
                  <div className="d-flex flex-column align-items-center gap-3 p-3 rounded-4 h-100" style={{ backgroundColor: "var(--section-bg)", border: "1px solid transparent", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(67,153,225,0.2)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: cat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <cat.icon size={26} style={{ color: "#4399E1" }} />
                    </div>
                    <div className="text-center">
                      <p className="mb-1 small fw-semibold" style={{ color: "var(--foreground)" }}>{cat.label}</p>
                      <p className="mb-0" style={{ fontSize: 11, color: "var(--muted-text)" }}>{cat.count}</p>
                    </div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Popular Products */}
      <section className="py-5" style={{ backgroundColor: "var(--section-bg)" }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fs-4 fw-bold mb-1" style={{ color: "var(--foreground)" }}>Popular Products</h2>
              <p className="small mb-0" style={{ color: "var(--muted-text)" }}>Top picks loved by pet owners</p>
            </div>
            <Link href="/shop" className="d-flex align-items-center gap-1 small fw-semibold text-decoration-none" style={{ color: "#4399E1" }}>
              See All <ChevronRight size={16} />
            </Link>
          </div>
          <Row className="g-4">
            {productsData.map(p => (
              <Col xs={12} sm={6} lg={3} key={p.id}>
                <Card className="h-100 border-0 shadow-sm position-relative" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: 'var(--card-bg)' }}>
                  <div style={{ position: "relative", height: 176, overflow: "hidden" }}>
                    <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Badge pill style={{ position: "absolute", top: 12, left: 12, backgroundColor: p.tag === "Sale" || p.tag === "Popular" || p.tag === "Bestseller" ? "#FFA9AC" : "#4399E1", fontSize: "0.75rem" }}>
                      {p.tag}
                    </Badge>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => toggleWishlist(p.id)}
                      className="position-absolute rounded-circle p-1 d-flex align-items-center justify-content-center border-0 shadow-sm"
                      style={{ top: 12, right: 12, width: 32, height: 32, zIndex: 2, backgroundColor: "rgba(255,255,255,0.9)" }}
                    >
                      <Heart size={15} style={{ fill: wishlist.includes(p.id) ? "#FFA9AC" : "transparent", color: wishlist.includes(p.id) ? "#FFA9AC" : "#6b7a99" }} />
                    </Button>
                  </div>
                  <Card.Body className="d-flex flex-column gap-2 p-3">
                    <p className="mb-0 fw-medium" style={{ fontSize: 11, color: "var(--muted-text)" }}>{p.brand}</p>
                    <Card.Title className="fs-6 fw-semibold mb-0" style={{ color: "var(--foreground)", lineHeight: 1.4 }}>{p.name}</Card.Title>
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex align-items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} style={{ fill: i < Math.floor(p.rating) ? "#fbbf24" : "transparent", color: i < Math.floor(p.rating) ? "#fbbf24" : "#e5e7eb" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--muted-text)" }}>({p.reviews})</span>
                    </div>
                    <div className="mt-auto pt-2 d-flex align-items-center justify-content-between">
                      <div>
                        <span className="fw-bold" style={{ color: "var(--foreground)", fontSize: "1rem" }}>{p.price.toLocaleString()} sum</span>
                        {p.oldPrice && <span className="ms-2 text-decoration-line-through" style={{ fontSize: "0.75rem", color: "var(--muted-text)" }}>{p.oldPrice.toLocaleString()}</span>}
                      </div>
                      <Button size="sm" style={{ backgroundColor: "#4399E1", border: "none", borderRadius: 12, fontWeight: 600 }} onClick={() => addToCart(p.id)} disabled={addingToCart === p.id} className="d-flex align-items-center gap-2">
                        <Plus size={14} /> Add
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Vets */}
      <section className="py-5" style={{ backgroundColor: 'var(--background)' }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fs-4 fw-bold mb-1" style={{ color: "var(--foreground)" }}>Top Veterinarians</h2>
              <p className="small mb-0" style={{ color: "var(--muted-text)" }}>Trusted professionals near you</p>
            </div>
            <Link href="/vets" className="d-flex align-items-center gap-1 small fw-semibold text-decoration-none" style={{ color: "#4399E1" }}>
              All Vets <ChevronRight size={16} />
            </Link>
          </div>
          <Row className="g-4">
            {vets.map(v => (
              <Col xs={12} sm={6} lg={4} key={v.name}>
                <Card className="h-100 border-0 p-3" style={{ backgroundColor: "var(--section-bg)", borderRadius: 16, border: "1px solid var(--card-border)" }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "#DDEDFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <UserRound size={32} style={{ color: "#4399E1" }} />
                    </div>
                    <div>
                      <p className="mb-0 fw-semibold" style={{ color: "var(--foreground)" }}>{v.name}</p>
                      <p className="mb-0 small fw-medium" style={{ color: "#4399E1" }}>{v.spec}</p>
                      <p className="mb-0" style={{ fontSize: 12, color: "var(--muted-text)" }}>{v.clinic}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: 12, color: "var(--muted-text)" }}>
                      <span className="d-flex align-items-center gap-1"><Star size={12} style={{ fill: "#fbbf24", color: "#fbbf24" }} /> {v.rating}</span>
                      <span>· {v.exp} exp</span>
                    </div>
                    <Badge pill style={{ backgroundColor: v.avail ? "#ffeef0" : "#fee2e2", color: v.avail ? "#FFA9AC" : "#dc2626" }}>
                      ● {v.avail ? "Available" : "Busy"}
                    </Badge>
                  </div>
                  <Link href="/vets" style={{ textDecoration: 'none' }}>
                    <Button variant="danger" className="w-100" style={{ backgroundColor: "#FFA9AC", border: "none", borderRadius: 12, fontWeight: 600 }}>
                      Book Appointment
                    </Button>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Blog */}
      <section className="py-5" style={{ backgroundColor: "var(--section-bg)" }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fs-4 fw-bold mb-1" style={{ color: "var(--foreground)" }}>Pet Care Tips</h2>
              <p className="small mb-0" style={{ color: "var(--muted-text)" }}>Expert advice for happy, healthy pets</p>
            </div>
            <Link href="/learn" className="d-flex align-items-center gap-1 small fw-semibold text-decoration-none" style={{ color: "#4399E1" }}>
              All Articles <ChevronRight size={16} />
            </Link>
          </div>
          <Row className="g-4">
            {blogs.map(b => (
              <Col xs={12} sm={4} key={b.title}>
                <Link href="/learn" className="text-decoration-none">
                  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: 'var(--card-bg)' }}>
                    <div style={{ backgroundColor: "var(--section-bg)", height: 144, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <b.Icon size={56} style={{ color: "rgba(67,153,225,0.6)" }} />
                    </div>
                    <Card.Body className="p-3 d-flex flex-column gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <Badge pill style={{ backgroundColor: "var(--section-bg)", color: "#4399E1", fontSize: 11 }}>{b.cat}</Badge>
                        <span style={{ fontSize: 11, color: "var(--muted-text)" }}>{b.date}</span>
                      </div>
                      <Card.Title className="fs-6 fw-semibold mb-0" style={{ color: "var(--foreground)" }}>{b.title}</Card.Title>
                      <p className="mb-0 d-flex align-items-center gap-1" style={{ fontSize: 11, color: "var(--muted-text)" }}>
                        <BookOpen size={11} /> {b.read} read
                      </p>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Strip */}
      <section className="py-4 border-top" style={{ backgroundColor: 'var(--background)' }}>
        <Container>
          <Row className="g-4 text-center justify-content-center">
            {features.map(f => (
              <Col xs={6} sm={3} key={f.title} className="d-flex flex-column align-items-center gap-2">
                <f.Icon size={28} style={{ color: "#4399E1" }} />
                <p className="mb-0 small fw-semibold" style={{ color: "var(--foreground)" }}>{f.title}</p>
                <p className="mb-0" style={{ fontSize: 12, color: "var(--muted-text)" }}>{f.desc}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
