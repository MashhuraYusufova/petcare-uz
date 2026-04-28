"use client";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, ShoppingCart, User, Menu, X, Globe, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Container, Navbar as BSNavbar, Nav, Button, Badge, Offcanvas } from "react-bootstrap";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Vet Booking", href: "/vets" },
  { label: "Learn", href: "/learn" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [showMobile, setShowMobile] = useState(false);
  const [lang, setLang] = useState<"EN" | "UZ">("EN");
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get<any[]>("/api/cart")
        .then(items => setCartCount(items.length))
        .catch(console.error);
    } else {
      setCartCount(0);
    }
  }, [user]);

  return (
    <BSNavbar sticky="top" expand="md" className="border-bottom shadow-sm" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--card-border)' }}>
      <Container fluid="xl" className="h-100">
        <Link href="/" className="navbar-brand d-flex align-items-center me-4">
          {theme === "dark" ? (
            <Image src="/logo-dark.png" alt="PetCare" width={140} height={40} className="h-10 w-auto" priority />
          ) : (
            <Image src="/logo-light.png" alt="PetCare" width={140} height={40} className="h-10 w-auto" priority />
          )}
        </Link>

        <BSNavbar.Toggle aria-controls="mobile-nav" onClick={() => setShowMobile(true)} className="border-0 shadow-none">
          <Menu size={24} style={{ color: 'var(--foreground)' }} />
        </BSNavbar.Toggle>

        <BSNavbar.Collapse className="d-none d-md-flex">
          <Nav className="me-auto gap-3">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link text-sm fw-medium transition-colors"
                style={{ color: 'var(--foreground)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4399E1'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}
              >
                {l.label}
              </Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="link"
              onClick={() => setLang(l => l === "EN" ? "UZ" : "EN")}
              className="text-decoration-none d-flex align-items-center gap-1 text-xs fw-semibold px-2 py-1 rounded-3 transition"
              style={{ color: 'var(--muted-text)' }}
            >
              <Globe size={14} />
              {lang}
            </Button>

            <Button
              variant="link"
              onClick={toggle}
              className="p-0 w-9 h-9 d-flex align-items-center justify-content-center rounded-circle transition text-decoration-none"
              style={{ color: 'var(--muted-text)', backgroundColor: 'transparent' }}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>

            <Link
              href="/dashboard"
              className="w-9 h-9 d-flex align-items-center justify-content-center rounded-circle transition text-decoration-none"
              style={{ color: 'var(--muted-text)' }}
            >
              <Heart size={18} />
            </Link>

            <Link
              href="/cart"
              className="position-relative w-9 h-9 d-flex align-items-center justify-content-center rounded-circle transition text-decoration-none"
              style={{ color: 'var(--muted-text)' }}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <Badge pill className="position-absolute top-0 end-0 p-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#4399E1', width: 16, height: 16, fontSize: 9 }}>
                  {cartCount}
                </Badge>
              )}
            </Link>

            {user ? (
              <div className="d-flex align-items-center gap-3 ms-2">
                <Link
                  href={user.role === "admin" ? "/admin" : user.role === "vet" ? "/vet-dashboard" : "/dashboard"}
                  className="btn btn-sm fw-semibold rounded-pill px-3 d-flex align-items-center gap-2"
                  style={{ backgroundColor: '#DDEDFF', color: '#4399E1', border: 'none' }}
                >
                  <User size={14} />
                  {user.name.split(" ")[0]}
                </Link>
                <Button
                  variant="link"
                  onClick={logout}
                  className="text-decoration-none p-0 small fw-medium text-muted hover-danger transition"
                  style={{ fontSize: '0.75rem' }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="btn btn-sm fw-semibold rounded-pill px-4 ms-2"
                style={{ backgroundColor: '#4399E1', color: '#ffffff', border: 'none' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </BSNavbar.Collapse>

        <Offcanvas show={showMobile} onHide={() => setShowMobile(false)} placement="end" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
          <Offcanvas.Header closeButton className={theme === 'dark' ? 'btn-close-white' : ''}>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column gap-3">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setShowMobile(false)}
                className="text-decoration-none fw-medium py-2 border-bottom"
                style={{ color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <div className="d-flex flex-column gap-2 mt-2">
                <Link
                  href={user.role === "admin" ? "/admin" : user.role === "vet" ? "/vet-dashboard" : "/dashboard"}
                  onClick={() => setShowMobile(false)}
                  className="btn fw-semibold rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: '#4399E1', color: '#ffffff', border: 'none' }}
                >
                  <User size={14} /> {user.role === "admin" ? "Admin Panel" : user.role === "vet" ? "Vet Dashboard" : "Dashboard"}
                </Link>
                <Button variant="link" onClick={() => { logout(); setShowMobile(false); }} className="text-decoration-none text-danger fw-medium py-1">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setShowMobile(false)}
                className="btn fw-semibold rounded-pill py-2 mt-2"
                style={{ backgroundColor: '#4399E1', color: '#ffffff', border: 'none' }}
              >
                Sign In
              </Link>
            )}
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </BSNavbar>
  );
}
