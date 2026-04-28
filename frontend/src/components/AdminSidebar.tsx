"use client";
import { LayoutDashboard, ShoppingBag, Stethoscope, BookOpen, Calendar, BarChart3, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Nav } from "react-bootstrap";
import Image from "next/image";

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: ShoppingBag, label: "Products" },
  { icon: Stethoscope, label: "Veterinarians" },
  { icon: BookOpen, label: "Blog Posts" },
  { icon: Calendar, label: "Appointments" },
  { icon: Users, label: "Users" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

export default function AdminSidebar({ tab, setTab, setSidebarOpen }: any) {
  return (
    <div className="d-flex flex-column h-100" style={{ backgroundColor: "#192A51" }}>
      <div className="p-4 border-bottom border-white border-opacity-10">
        <div className="d-flex align-items-center gap-3">
          <Image src="/logo-dark.png" alt="PetCare" width={120} height={34} className="h-8 w-auto brightness-0 invert" priority />
          <span className="badge rounded-pill fw-bold small py-1 px-2" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#4399E1", fontSize: 10 }}>ADMIN</span>
        </div>
      </div>

      <Nav className="flex-column p-3 flex-grow-1">
        {navItems.map(n => (
          <Nav.Link
            key={n.label}
            onClick={() => { setTab(n.label); setSidebarOpen(false); }}
            className={`d-flex align-items-center gap-3 small fw-medium py-2.5 px-3 rounded-3 mb-1 text-white border-0 transition ${tab === n.label ? "bg-primary shadow-sm" : "opacity-75 hover-opacity-100 hover-bg-white-10"}`}
            style={{ backgroundColor: tab === n.label ? "#4399E1" : "transparent" }}
          >
            <n.icon size={16} />
            {n.label}
          </Nav.Link>
        ))}
      </Nav>
      <div className="p-4 border-top border-white border-opacity-10">
        <Link href="/" className="small text-white opacity-50 text-decoration-none hover-opacity-100 transition">← Back to Site</Link>
      </div>
    </div>
  );
}
