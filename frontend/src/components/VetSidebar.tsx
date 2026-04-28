"use client";
import { LayoutDashboard, Calendar, Clock, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Nav, Badge } from "react-bootstrap";
import Image from "next/image";

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: Calendar, label: "Appointments" },
  { icon: Clock, label: "Availability" },
  { icon: Users, label: "Patient Requests" },
  { icon: Settings, label: "Profile Settings" },
];

export default function VetSidebar({ vet, user, tab, setTab, setSidebarOpen, pendingCount }: any) {
  return (
    <div className="d-flex flex-column h-100" style={{ backgroundColor: "#192A51" }}>
      <div className="p-4 border-bottom border-white border-opacity-10">
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-3">
            <Image src="/logo-dark.png" alt="PetCare" width={110} height={32} className="h-7 w-auto brightness-0 invert" priority />
            <span className="badge rounded-pill fw-bold small py-1 px-2" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#4399E1", fontSize: 9 }}>VETS</span>
          </div>
          <div className="d-flex align-items-center gap-2.5 bg-white bg-opacity-10 p-2 rounded-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center h4 mb-0" style={{ width: 40, height: 40, backgroundColor: "rgba(255, 255, 255, 0.1)" }}>👩‍⚕️</div>
            <div className="min-w-0">
              <p className="small fw-bold text-white mb-0 truncate">{vet?.name ?? user?.name}</p>
              <p className="extra-small text-white opacity-50 mb-0 truncate" style={{ fontSize: 10 }}>{vet?.spec ?? "Veterinarian"}</p>
            </div>
          </div>
        </div>
      </div>
      <Nav className="flex-column p-3 flex-grow-1">
        {navItems.map(n => (
          <Nav.Link
            key={n.label}
            onClick={() => { setTab(n.label); setSidebarOpen(false); }}
            className={`d-flex align-items-center gap-3 small fw-medium py-2.5 px-3 rounded-3 mb-1 text-white border-0 transition ${tab === n.label ? "bg-primary shadow-sm" : "opacity-75 hover-opacity-100"}`}
            style={{ backgroundColor: tab === n.label ? "#4399E1" : "transparent" }}
          >
            <n.icon size={16} />
            {n.label}
            {n.label === "Patient Requests" && pendingCount > 0 && (
              <Badge pill bg="danger" className="ms-auto extra-small" style={{ fontSize: 9 }}>{pendingCount}</Badge>
            )}
          </Nav.Link>
        ))}
      </Nav>
      <div className="p-4 border-top border-white border-opacity-10">
        <Link href="/" className="extra-small text-white opacity-50 text-decoration-none hover-opacity-100 transition">← Back to Site</Link>
      </div>
    </div>
  );
}
