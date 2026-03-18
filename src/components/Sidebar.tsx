"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings, Dumbbell } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/plans", label: "Plans", icon: Dumbbell },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⚡ GymTrack</h1>
        <p>Member Management</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname === href ? "active" : ""}`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          © 2025 GymTrack
        </div>
      </div>
    </aside>
  );
}
