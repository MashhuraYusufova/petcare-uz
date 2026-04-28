"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, BookOpen, Clock, ArrowRight, Salad, Hospital, Dog, Scissors, Pill, Home, GraduationCap, PawPrint } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Container, Row, Col, Card, Badge, Button, InputGroup, Form, Nav } from "react-bootstrap";

interface Article {
  id: string;
  title: string;
  cat: string;
  read: string;
  date: string;
  author: string;
  excerpt: string | null;
}

const categories = ["All", "Nutrition", "Health", "Behavior", "Grooming", "Care Tips"];

const catIconMap: Record<string, React.ElementType> = {
  Nutrition: Salad,
  Health: Hospital,
  Behavior: Dog,
  Grooming: Scissors,
  "Care Tips": Home,
  default: PawPrint,
};

const featured = {
  title: "The Complete Guide to First-Year Puppy Care",
  excerpt: "Everything you need to know about feeding, vaccinations, socialisation, training, and building a lifetime bond with your new puppy.",
  cat: "Care Tips",
  read: "12 min",
  date: "Apr 22, 2025",
  Icon: PawPrint,
  author: "Dr. Malika Yusupova",
};

export default function LearnPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activecat, setActivecat] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<Article[]>("/api/articles")
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a =>
    (activecat === "All" || a.cat === activecat) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      <Navbar />

      <section style={{ background: "linear-gradient(90deg, #DDEDFF 0%, #ffffff 100%)", padding: "3rem 1.5rem" }}>
        <Container>
          <h1 className="fw-bold mb-1" style={{ color: "#192A51", fontSize: '2rem' }}>Pet Care Learning Hub</h1>
          <p className="small mb-4" style={{ color: "#6b7a99" }}>Expert guides, tips, and advice from our veterinary team</p>
          <div className="position-relative" style={{ maxWidth: 576 }}>
            <InputGroup className="bg-white border rounded-4 shadow-sm overflow-hidden">
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <Search size={18} style={{ color: "#6b7a99" }} />
              </InputGroup.Text>
              <Form.Control
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="border-0 py-3 shadow-none text-sm"
              />
            </InputGroup>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <Card className="rounded-4 overflow-hidden border-0 mb-5 shadow-lg position-relative" style={{ background: "linear-gradient(90deg, #4399E1 0%, #192A51 100%)" }}>
          <Card.Body className="p-5 d-flex flex-column flex-sm-row gap-4 align-items-center text-white position-relative z-1">
            <div className="rounded-4 d-flex align-items-center justify-content-center shrink-0" style={{ width: 96, height: 96, backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <featured.Icon size={56} style={{ color: "#FFA9AC" }} />
            </div>
            <div className="flex-grow-1">
              <Badge pill className="fw-bold px-3 py-1 mb-3" style={{ backgroundColor: "rgba(255, 169, 172, 0.3)", color: "#FFA9AC", fontSize: 10 }}>{featured.cat} · Featured</Badge>
              <h2 className="h3 fw-bold mb-2 lh-sm">{featured.title}</h2>
              <p className="small opacity-75 mb-4" style={{ maxWidth: 600 }}>{featured.excerpt}</p>
              <div className="d-flex flex-wrap align-items-center gap-4 extra-small opacity-50 mb-4">
                <span className="d-flex align-items-center gap-1"><BookOpen size={11} /> {featured.read} read</span>
                <span className="d-flex align-items-center gap-1"><Clock size={11} /> {featured.date}</span>
                <span>By {featured.author}</span>
              </div>
              <Button className="rounded-pill px-4 py-2 border-0 fw-bold small d-flex align-items-center gap-2 shadow-sm transition" style={{ backgroundColor: "#FFA9AC", color: "#ffffff" }}>
                Read Article <ArrowRight size={14} />
              </Button>
            </div>
          </Card.Body>
        </Card>

        <div className="d-flex flex-wrap align-items-center gap-2 mb-5">
          {categories.map(c => (
            <Button
              key={c}
              size="sm"
              onClick={() => setActivecat(c)}
              className={`rounded-pill px-4 py-2 border fw-bold small transition ${activecat === c ? "shadow-sm border-0" : "bg-white border-light text-muted"}`}
              style={{
                backgroundColor: activecat === c ? "#4399E1" : "#ffffff",
                color: activecat === c ? "#ffffff" : "#6b7a99",
                fontSize: 13
              }}
            >
              {c}
            </Button>
          ))}
          <span className="ms-md-auto extra-small text-muted align-self-center">{loading ? "..." : filtered.length} articles</span>
        </div>

        {loading ? (
          <Row className="g-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Col xs={6} sm={4} lg={3} key={i}>
                <div className="bg-light rounded-4 border animate-pulse" style={{ height: 240 }} />
              </Col>
            ))}
          </Row>
        ) : (
          <Row className="g-4">
            {filtered.map(a => {
              const Icon = catIconMap[a.cat] || catIconMap.default;
              return (
                <Col xs={12} sm={6} lg={3} key={a.id}>
                  <Card className="rounded-4 border-light overflow-hidden shadow-none h-100 transition hover-shadow-sm group cursor-pointer">
                    <div className="d-flex align-items-center justify-content-center" style={{ height: 144, backgroundColor: "#DDEDFF" }}>
                      <Icon size={52} className="transition duration-300 group-hover-scale-110" style={{ color: "rgba(67, 153, 225, 0.6)" }} />
                    </div>
                    <Card.Body className="p-4 d-flex flex-column gap-2">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <Badge pill className="fw-bold px-2 py-0.5" style={{ backgroundColor: "#DDEDFF", color: "#4399E1", fontSize: 9 }}>{a.cat}</Badge>
                        <span className="extra-small text-muted" style={{ fontSize: 9 }}>{a.date}</span>
                      </div>
                      <Card.Title className="small fw-bold mb-2 text-dark lh-sm h-100" style={{ height: '2.8em', overflow: 'hidden' }}>{a.title}</Card.Title>
                      <div className="mt-auto d-flex align-items-center justify-content-between extra-small text-muted" style={{ fontSize: 10 }}>
                        <span className="d-flex align-items-center gap-1"><BookOpen size={10} /> {a.read}</span>
                        <span className="truncate" style={{ maxWidth: 80 }}>{a.author}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      <Footer />
    </div>
  );
}
