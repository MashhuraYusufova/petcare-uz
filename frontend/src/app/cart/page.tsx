"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";

interface Product {
  id: string;
  name: string;
  price: number;
  img: string;
  brand: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!api.getToken()) {
      setItems([]);
      setLoading(false);
      return;
    }

    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await api.get<CartItem[]>("/api/cart");
      setItems(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await api.patch(`/api/cart/${productId}`, { quantity: newQty });
      setItems(prev => prev.map(item =>
        item.productId === productId ? { ...item, quantity: newQty } : item
      ));
    } catch (err: any) {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.delete(`/api/cart/${productId}`);
      setItems(prev => prev.filter(item => item.productId !== productId));
      toast.success("Removed from cart");
    } catch (err: any) {
      toast.error("Failed to remove item");
    }
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      await api.post("/api/orders/checkout", {});
      toast.success("Order placed successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = items.length > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      <Navbar />

      <main className="flex-grow-1 py-5">
        <Container>
          <h1 className="fw-bold mb-5 d-flex align-items-center gap-3" style={{ color: "#192A51", fontSize: '2rem' }}>
            <ShoppingBag style={{ color: "#4399E1" }} /> Shopping Cart
          </h1>

          {loading ? (
            <div className="d-flex flex-column gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-light rounded-4 border animate-pulse" style={{ height: 120 }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="rounded-4 p-5 text-center border-0 bg-light shadow-none">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: 80, height: 80, backgroundColor: "#DDEDFF" }}>
                <ShoppingBag size={32} style={{ color: "#4399E1" }} />
              </div>
              <h2 className="fw-bold mb-2" style={{ color: "#192A51" }}>Your cart is empty</h2>
              <p className="text-muted mb-5">Looks like you haven't added any premium products yet.</p>
              <Link href="/shop" className="btn btn-lg fw-bold rounded-4 px-5 py-3 shadow-none transition" style={{ backgroundColor: "#4399E1", color: "#ffffff" }}>
                Start Shopping <ArrowRight size={18} className="ms-2" />
              </Link>
            </Card>
          ) : (
            <Row className="g-5">
              <Col lg={8}>
                <div className="d-flex flex-column gap-4">
                  {items.map(item => (
                    <Card key={item.id} className="rounded-4 p-4 border shadow-none bg-white">
                      <Row className="align-items-center g-4">
                        <Col xs="auto">
                          <div className="rounded-3 overflow-hidden border" style={{ width: 96, height: 96 }}>
                            <img src={item.product.img} alt={item.product.name} className="w-100 h-100 object-fit-cover" />
                          </div>
                        </Col>
                        <Col className="min-w-0">
                          <p className="extra-small fw-bold text-uppercase mb-1" style={{ color: "#4399E1", fontSize: 10, letterSpacing: '0.05em' }}>{item.product.brand}</p>
                          <h3 className="h6 fw-bold mb-1 text-dark truncate">{item.product.name}</h3>
                          <p className="fw-bold mb-0" style={{ color: "#4399E1" }}>{item.product.price.toLocaleString()} sum</p>
                        </Col>
                        <Col xs="auto">
                          <div className="d-flex align-items-center gap-2 p-1 bg-light rounded-3 border">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-0 w-8 h-8 rounded-2 text-decoration-none d-flex align-items-center justify-content-center hover-bg-white text-dark"
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="small fw-bold text-center" style={{ width: 24 }}>{item.quantity}</span>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-0 w-8 h-8 rounded-2 text-decoration-none d-flex align-items-center justify-content-center hover-bg-white text-dark"
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="link"
                            onClick={() => removeItem(item.productId)}
                            className="p-3 rounded-3 text-decoration-none transition"
                            style={{ color: "#FFA9AC" }}
                          >
                            <Trash2 size={20} />
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              </Col>

              <Col lg={4}>
                <Card className="rounded-4 p-4 border shadow-sm bg-white sticky-top" style={{ top: '6rem' }}>
                  <h3 className="h5 fw-bold mb-4 text-dark">Order Summary</h3>
                  <div className="d-flex flex-column gap-3 small">
                    <div className="d-flex justify-content-between text-muted">
                      <span>Subtotal</span>
                      <span className="fw-bold text-dark">{subtotal.toLocaleString()} sum</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>Shipping</span>
                      <span className="fw-bold text-dark">{shipping.toLocaleString()} sum</span>
                    </div>
                    <hr className="my-2 border-light" />
                    <div className="d-flex justify-content-between h5 fw-bold mb-0 pt-1">
                      <span className="text-dark">Total</span>
                      <span style={{ color: "#4399E1" }}>{total.toLocaleString()} sum</span>
                    </div>
                  </div>
                  <Button
                    onClick={checkout}
                    disabled={checkingOut}
                    className="w-100 rounded-4 py-3 fw-bold border-0 mt-5 transition shadow-sm"
                    style={{ backgroundColor: "#192A51", color: "#ffffff" }}
                  >
                    {checkingOut ? "Processing..." : "Checkout Now"}
                  </Button>
                  <Link href="/shop" className="d-block text-center small fw-bold mt-3 text-decoration-none" style={{ color: "#4399E1" }}>
                    Continue Shopping
                  </Link>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
