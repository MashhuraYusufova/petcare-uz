"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, PawPrint, Globe, Send, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Nav } from "react-bootstrap";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, loading: authLoading, login, register } = useAuth();
  const router = useRouter();

  function redirectByRole(role: string) {
    if (role === "admin") router.push("/admin");
    else if (role === "vet") router.push("/vet-dashboard");
    else router.push("/dashboard");
  }

  useEffect(() => {
    if (!authLoading && user) redirectByRole(user.role);
  }, [user, authLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") return;
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { user } = await login(email, password);
        redirectByRole(user.role);
      } else {
        const { user } = await register(name, email, password);
        redirectByRole(user.role);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left visual panel */}
      <div className="d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden" style={{ width: '50%', background: "linear-gradient(135deg, #4399E1 0%, #192A51 100%)" }}>
        <div className="position-absolute inset-0 opacity-10 pointer-events-none">
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "radial-gradient(circle at 20% 20%, #ffffff 0%, transparent 40%), radial-gradient(circle at 80% 80%, #FFA9AC 0%, transparent 30%)", filter: "blur(60px)" }} />
        </div>
        <div className="position-relative z-1">
          <Link href="/" className="d-block w-fit">
            <Image src="/logo-dark.png" alt="PetCare" width={140} height={40} className="h-10 w-auto brightness-0 invert" />
          </Link>
        </div>
        <div className="position-relative z-1 d-flex flex-column gap-4">
          <div className="d-flex align-items-center justify-content-center rounded-4 mb-2" style={{ width: 80, height: 80, backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
            <PawPrint size={48} style={{ color: "#FFA9AC" }} />
          </div>
          <h2 className="fw-bold fs-1 lh-sm mb-0">
            {mode === "login" ? "Welcome Back!" : mode === "signup" ? "Join PetCare Today" : "Reset Your Password"}
          </h2>
          <p className="opacity-75 lead fs-6 mb-2" style={{ maxWidth: 400 }}>
            {mode === "login"
              ? "Access your orders, vet appointments, and personalized pet care recommendations."
              : mode === "signup"
              ? "Create your account and get access to premium pet products, trusted vets, and care guides."
              : "No worries! Enter your email and we'll send you a reset link."}
          </p>
          <div className="d-flex flex-column gap-2">
            {["10,000+ Happy Pet Owners", "50+ Trusted Veterinarians", "200+ Premium Products"].map(f => (
              <div key={f} className="d-flex align-items-center gap-2 small opacity-75">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 18, height: 18, backgroundColor: "rgba(255, 169, 172, 0.4)" }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="position-relative z-1 small opacity-50 mb-0">© 2025 PetCare.uz · Uzbekistan&apos;s #1 Pet Platform</p>
      </div>

      {/* Right form panel */}
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 position-relative" style={{ backgroundColor: 'var(--background)' }}>
        <div className="position-absolute top-0 start-0 end-0 p-4 d-flex align-items-center justify-content-between">
          <Link href="/" className="d-lg-none d-flex align-items-center gap-2 text-decoration-none small" style={{ color: "#6b7a99" }}>
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="d-none d-lg-block" />
          <Button variant="link" onClick={toggle} className="p-0 w-9 h-9 rounded-circle d-flex align-items-center justify-content-center text-decoration-none" style={{ color: '#6b7a99', backgroundColor: theme === 'dark' ? '#1e3060' : '#DDEDFF' }}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
        </div>

        <div className="w-100" style={{ maxWidth: 400 }}>
          <div className="d-lg-none d-flex justify-content-center mb-5">
            <Image src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"} alt="PetCare" width={130} height={36} className="h-9 w-auto" />
          </div>

          {mode !== "forgot" && (
            <Nav className="rounded-4 p-1 mb-5 nav-pills nav-fill" style={{ backgroundColor: 'var(--section-bg)' }}>
              {(["login", "signup"] as Mode[]).map(m => (
                <Nav.Item key={m}>
                  <Nav.Link
                    active={mode === m}
                    onClick={() => { setMode(m); setError(""); }}
                    className={`rounded-3 small fw-bold py-2 border-0 ${mode === m ? "shadow-sm" : ""}`}
                    style={{ backgroundColor: mode === m ? 'var(--card-bg)' : 'transparent', color: mode === m ? '#4399E1' : 'var(--muted-text)' }}
                  >
                    {m === "login" ? "Sign In" : "Sign Up"}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          )}

          <h2 className="fw-bold mb-1" style={{ color: 'var(--foreground)', fontSize: '1.5rem' }}>
            {mode === "login" ? "Sign in to your account" : mode === "signup" ? "Create your account" : "Forgot password?"}
          </h2>
          <p className="small mb-5" style={{ color: 'var(--muted-text)' }}>
            {mode === "login" ? "Enter your credentials to continue" : mode === "signup" ? "It only takes a minute — join free!" : "We'll send a reset link to your email"}
          </p>

          {error && (
            <Alert variant="danger" className="rounded-4 py-3 small border-0 mb-4" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
            {mode === "signup" && (
              <Form.Group>
                <Form.Label className="extra-small fw-bold text-uppercase mb-2" style={{ fontSize: 10, letterSpacing: '0.05em' }}>Full Name</Form.Label>
                <InputGroup className="border rounded-3 overflow-hidden" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                  <InputGroup.Text className="bg-transparent border-0 pe-0">
                    <User size={16} style={{ color: 'var(--muted-text)' }} />
                  </InputGroup.Text>
                  <Form.Control
                    value={name}
                    onChange={e => setName(e.target.value)}
                    type="text"
                    placeholder="Your full name"
                    className="border-0 py-2.5 small shadow-none"
                    style={{ backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    required
                  />
                </InputGroup>
              </Form.Group>
            )}

            <Form.Group>
              <Form.Label className="extra-small fw-bold text-uppercase mb-2" style={{ fontSize: 10, letterSpacing: '0.05em' }}>Email Address</Form.Label>
              <InputGroup className="border rounded-3 overflow-hidden" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <InputGroup.Text className="bg-transparent border-0 pe-0">
                  <Mail size={16} style={{ color: 'var(--muted-text)' }} />
                </InputGroup.Text>
                <Form.Control
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@email.com"
                  className="border-0 py-2.5 small shadow-none"
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  required
                />
              </InputGroup>
            </Form.Group>

            {mode !== "forgot" && (
              <Form.Group>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="extra-small fw-bold text-uppercase mb-0" style={{ fontSize: 10, letterSpacing: '0.05em' }}>Password</Form.Label>
                  {mode === "login" && (
                    <Button variant="link" onClick={() => setMode("forgot")} className="p-0 extra-small fw-bold text-decoration-none" style={{ fontSize: 10, color: "#FFA9AC" }}>
                      Forgot password?
                    </Button>
                  )}
                </div>
                <InputGroup className="border rounded-3 overflow-hidden" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                  <InputGroup.Text className="bg-transparent border-0 pe-0">
                    <Lock size={16} style={{ color: 'var(--muted-text)' }} />
                  </InputGroup.Text>
                  <Form.Control
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    className="border-0 py-2.5 small shadow-none"
                    style={{ backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    required
                  />
                  <Button variant="link" onClick={() => setShow(s => !s)} className="bg-transparent border-0 text-decoration-none" style={{ color: "#6b7a99" }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </InputGroup>
              </Form.Group>
            )}

            {mode === "login" && (
              <Form.Check
                type="checkbox"
                label={<span className="small text-muted ms-1">Remember me for 30 days</span>}
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="cursor-pointer"
              />
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-100 rounded-3 py-3 fw-bold border-0 shadow-sm mt-2 transition"
              style={{ backgroundColor: "#4399E1", color: "#ffffff" }}
            >
              {submitting ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </Button>

            {mode === "forgot" && (
              <Button variant="link" onClick={() => setMode("login")} className="d-flex align-items-center justify-content-center gap-2 text-decoration-none small text-muted">
                <ArrowLeft size={14} /> Back to Sign In
              </Button>
            )}
          </Form>

          {mode !== "forgot" && (
            <>
              <div className="d-flex align-items-center gap-3 my-5">
                <div className="flex-grow-1 border-top" />
                <span className="extra-small text-muted fw-medium text-uppercase" style={{ fontSize: 10 }}>or continue with</span>
                <div className="flex-grow-1 border-top" />
              </div>
              <Row className="g-3">
                <Col xs={6}>
                  <Button className="w-100 rounded-3 py-2.5 small fw-semibold border d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}>
                    <Globe size={16} style={{ color: "#4399E1" }} /> Google
                  </Button>
                </Col>
                <Col xs={6}>
                  <Button className="w-100 rounded-3 py-2.5 small fw-semibold border d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}>
                    <Send size={16} style={{ color: "#4399E1" }} /> Telegram
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
