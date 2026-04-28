"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Container, Row, Col } from "react-bootstrap";
import { useTheme } from "./ThemeProvider";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="mt-auto py-5" style={{ backgroundColor: "var(--footer-bg)" }}>
      <Container>
        <Row className="gy-4">
          {/* Brand */}
          <Col lg={3} sm={6}>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-2">
                {theme === "dark" ? (
                  <Image src="/logo-dark.png" alt="PetCare" width={130} height={36} className="h-9 w-auto" />
                ) : (
                  <Image src="/logo-light.png" alt="PetCare" width={130} height={36} className="h-9 w-auto" />
                )}
              </div>
              <p className="small mb-0" style={{ color: "#4399E1", lineHeight: 1.6 }}>
                Your all-in-one platform for pet products, vet appointments, and expert pet care advice.
              </p>
              <p className="mb-0" style={{ fontSize: '0.75rem', color: "var(--muted-text)" }}>
                contact@petcare.uz · +998 71 123 45 67
              </p>
            </div>
          </Col>

          {/* Platform */}
          <Col lg={3} sm={6}>
            <div className="d-flex flex-column gap-2">
              <h4 className="fw-bold text-uppercase tracking-wider mb-2" style={{ fontSize: '0.85rem', color: "#FFA9AC" }}>Platform</h4>
              {["Shop", "Vet Booking", "Learn", "Community"].map(l => (
                <Link key={l} href="#" className="text-decoration-none small transition" style={{ color: "var(--foreground)" }} onMouseEnter={(e) => e.currentTarget.style.color = '#4399E1'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}>{l}</Link>
              ))}
            </div>
          </Col>

          {/* Account */}
          <Col lg={3} sm={6}>
            <div className="d-flex flex-column gap-2">
              <h4 className="fw-bold text-uppercase tracking-wider mb-2" style={{ fontSize: '0.85rem', color: "#FFA9AC" }}>Account</h4>
              {["Sign In", "Sign Up", "Dashboard", "Orders", "Wishlist"].map(l => (
                <Link key={l} href="#" className="text-decoration-none small transition" style={{ color: "var(--foreground)" }} onMouseEnter={(e) => e.currentTarget.style.color = '#4399E1'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}>{l}</Link>
              ))}
            </div>
          </Col>

          {/* Support */}
          <Col lg={3} sm={6}>
            <div className="d-flex flex-column gap-2">
              <h4 className="fw-bold text-uppercase tracking-wider mb-2" style={{ fontSize: '0.85rem', color: "#FFA9AC" }}>Support</h4>
              {["Help Center", "Privacy Policy", "Terms of Service", "About Us"].map(l => (
                <Link key={l} href="#" className="text-decoration-none small transition" style={{ color: "var(--foreground)" }} onMouseEnter={(e) => e.currentTarget.style.color = '#4399E1'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}>{l}</Link>
              ))}
            </div>
          </Col>
        </Row>

        <div className="mt-5 pt-4 border-top" style={{ borderColor: "rgba(67, 153, 225, 0.2)" }}>
          <p className="text-center mb-0 d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.75rem', color: "var(--muted-text)" }}>
            © 2025 PetCare.uz · Made with <Heart size={12} style={{ color: "#FFA9AC", fill: "#FFA9AC" }} /> for pets everywhere
          </p>
        </div>
      </Container>
    </footer>
  );
}
