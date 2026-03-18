"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Dumbbell, Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/plans", label: "Plans", icon: Dumbbell },
  { href: "/payments", label: "Payments", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>

      {isOpen && <div className="mobile-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>⚡ Muscle War</h1>
            <button className="mobile-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <p>Fitness Management</p>
        </div>
        <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname === href ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <button 
          onClick={() => {
            document.cookie = "mwf_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/login";
          }}
          className="nav-link" style={{ color: "var(--red)", marginTop: "auto" }}
        >
          Logout
        </button>
      </nav>
      <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          © 2025 Muscle War Fitness
        </div>
      </div>
    </aside>
    </>
  );
}
