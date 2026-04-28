"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Star, Heart, SlidersHorizontal, ChevronDown, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Nav } from "react-bootstrap";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviews: number;
  tag: string | null;
  img: string;
  brand: string;
  cat: string;
}

// const categories = ["All", "Food & Treats", "Toys", "Grooming", "Health", "Beds", "Training"];
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Best Rating", "Newest"];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [activecat, setActivecat] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    api.get<Product[]>("/api/products")
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));

    api.get<{ name: string }[]>("/api/products/categories")
      .then(cats => setCategories(["All", ...cats.map(c => c.name)]))
      .catch(console.error);

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

  let filtered = products.filter(p =>
    (activecat === "All" || p.cat === activecat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (sort === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === "Best Rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar />

      <section style={{ background: "var(--hero-gradient, linear-gradient(90deg, #DDEDFF 0%, #ffffff 100%))", padding: "3rem 1.5rem" }}>
        <Container>
          <h1 className="fw-bold mb-1" style={{ color: "var(--foreground)", fontSize: '2rem' }}>Pet Shop</h1>
          <p className="small mb-4" style={{ color: "var(--muted-text)" }}>Premium products for your beloved pets</p>
          <div className="position-relative" style={{ maxWidth: 576 }}>
            <InputGroup className="border rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <Search size={18} style={{ color: "var(--muted-text)" }} />
              </InputGroup.Text>
              <Form.Control
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="border-0 py-3 shadow-none text-sm"
                style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: 'transparent', color: 'var(--foreground)' }}
              />
            </InputGroup>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="g-4">
          <Col lg={3} className="d-none d-lg-block">
            <aside className="d-flex flex-column gap-4 sticky-top" style={{ top: '6rem' }}>
              <div>
                <h3 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.875rem', color: "var(--foreground)" }}>
                  <SlidersHorizontal size={14} /> Filters
                </h3>
                <Nav className="flex-column gap-1">
                  {categories.map(c => (
                    <Button
                      key={c}
                      variant="link"
                      onClick={() => setActivecat(c)}
                      className={`text-start text-decoration-none px-3 py-2 rounded-3 small fw-medium transition ${activecat === c ? "text-white" : ""}`}
                      style={{ backgroundColor: activecat === c ? "#4399E1" : "transparent", color: activecat === c ? "#ffffff" : "var(--muted-text)" }}
                    >
                      {c}
                    </Button>
                  ))}
                </Nav>
              </div>

              <div>
                <h3 className="fw-bold mb-3" style={{ fontSize: '0.875rem', color: "var(--foreground)" }}>Price Range</h3>
                <div className="d-flex flex-column gap-2">
                  {["Under 50,000", "50,000 – 150,000", "150,000 – 300,000", "Over 300,000"].map(r => (
                    <Form.Check key={r} type="checkbox" label={<span className="small" style={{ color: 'var(--muted-text)' }}>{r} sum</span>} className="cursor-pointer" />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="fw-bold mb-3" style={{ fontSize: '0.875rem', color: "var(--foreground)" }}>Rating</h3>
                {[5, 4, 3].map(r => (
                  <Form.Check key={r} type="checkbox" className="mb-2 cursor-pointer" label={
                    <div className="d-flex align-items-center gap-1 ms-1">
                      <div className="d-flex align-items-center">
                        {Array.from({ length: r }).map((_, i) => <Star key={i} size={12} style={{ fill: "#fbbf24", color: "#fbbf24" }} />)}
                        {Array.from({ length: 5 - r }).map((_, i) => <Star key={i} size={12} style={{ color: "#e5e7eb" }} />)}
                      </div>
                      <span className="extra-small ms-1" style={{ color: 'var(--muted-text)' }}>& up</span>
                    </div>
                  } />
                ))}
              </div>
            </aside>
          </Col>

          <Col lg={9}>
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
              <p className="small mb-0" style={{ color: 'var(--muted-text)' }}>
                <span className="fw-bold" style={{ color: 'var(--foreground)' }}>{loading ? "..." : filtered.length}</span> products found
              </p>
              <div className="d-flex align-items-center gap-3">
                <div className="d-lg-none d-flex gap-2 overflow-auto pb-1" style={{ maxWidth: '60vw' }}>
                  {categories.slice(0, 4).map(c => (
                    <Button
                      key={c}
                      size="sm"
                      onClick={() => setActivecat(c)}
                      variant={activecat === c ? "primary" : "outline-secondary"}
                      className="rounded-pill text-nowrap px-3"
                      style={{ backgroundColor: activecat === c ? "#4399E1" : "transparent", borderColor: activecat === c ? "#4399E1" : "var(--card-border)", fontSize: '0.75rem', color: activecat === c ? '#ffffff' : 'var(--muted-text)' }}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
                <Form.Select
                  size="sm"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="rounded-3 border shadow-none"
                  style={{ width: 'auto', fontSize: '0.875rem', paddingRight: '2rem', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
                >
                  {sortOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </Form.Select>
              </div>
            </div>

            {loading ? (
              <Row className="g-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Col xs={6} sm={4} xl={3} key={i}>
                    <div className="rounded-4 border animate-pulse" style={{ height: 260, backgroundColor: 'var(--section-bg)', borderColor: 'var(--card-border)' }} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Row className="g-4">
                {filtered.map(p => (
                  <Col xs={6} sm={4} xl={3} key={p.id}>
                    <Card className="h-100 border shadow-none rounded-4 overflow-hidden position-relative group" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                      <div className="position-relative" style={{ height: 160, overflow: "hidden" }}>
                        <img src={p.img} alt={p.name} className="w-100 h-100 object-fit-cover transition duration-300" style={{ transform: 'scale(1)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                        {p.tag && (
                          <Badge pill className="position-absolute" style={{ top: 8, left: 8, backgroundColor: p.tag === "Sale" || p.tag === "Bestseller" || p.tag === "Popular" ? "#FFA9AC" : "#4399E1", fontSize: 10 }}>
                            {p.tag}
                          </Badge>
                        )}
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => toggleWishlist(p.id)}
                          className="position-absolute rounded-circle p-1 d-flex align-items-center justify-content-center border-0 shadow-sm"
                          style={{ top: 8, right: 8, width: 28, height: 28, zIndex: 2, backgroundColor: "var(--card-bg)" }}
                        >
                          <Heart size={13} style={{ fill: wishlist.includes(p.id) ? "#FFA9AC" : "transparent", color: wishlist.includes(p.id) ? "#FFA9AC" : "#6b7a99" }} />
                        </Button>
                      </div>
                      <Card.Body className="p-3 d-flex flex-column gap-1">
                        <p className="extra-small fw-medium mb-0" style={{ color: "#4399E1", fontSize: 10 }}>{p.brand}</p>
                        <Card.Title className="small fw-bold mb-1" style={{ color: "var(--foreground)", lineHeight: 1.3, height: '2.6em', overflow: 'hidden' }}>{p.name}</Card.Title>
                        <div className="d-flex align-items-center gap-1 mb-2">
                          <Star size={10} style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                          <span className="small" style={{ fontSize: 11, color: 'var(--muted-text)' }}>{p.rating} ({p.reviews})</span>
                        </div>
                        <div className="mt-auto d-flex align-items-center justify-content-between">
                          <div className="d-flex flex-column">
                            <span className="small fw-bold" style={{ color: "var(--foreground)" }}>{p.price.toLocaleString()}</span>
                            {p.oldPrice && <span className="extra-small text-decoration-line-through" style={{ fontSize: 9, color: 'var(--muted-text)' }}>{p.oldPrice.toLocaleString()}</span>}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(p.id)}
                            disabled={addingToCart === p.id}
                            style={{ backgroundColor: "#4399E1", border: "none", fontSize: 11, padding: '4px 8px', borderRadius: 8 }}
                            className="d-flex align-items-center gap-1 fw-semibold"
                          >
                            <Plus size={12} className={addingToCart === p.id ? "animate-pulse" : ""} />
                            Add
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}
