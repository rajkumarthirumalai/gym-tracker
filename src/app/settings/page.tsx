"use client";
import Sidebar from "@/components/Sidebar";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Settings</h2>
          <p>Configure your gym tracker</p>
        </div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: "500px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
              <Settings size={18} color="var(--accent-light)" />
              <span style={{ fontWeight: 700 }}>Application Settings</span>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.7 }}>
              <p>🏋️ <strong>Gym Name:</strong> Configure in your <code>.env</code> file</p>
              <p style={{ marginTop: "8px" }}>🗄️ <strong>Database:</strong> Connected via Prisma + PostgreSQL (Neon/Supabase)</p>
              <p style={{ marginTop: "8px" }}>🚀 <strong>Deployment:</strong> Vercel (free tier)</p>
              <p style={{ marginTop: "8px" }}>📧 <strong>Reminders:</strong> Coming soon — WhatsApp / Email</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: "500px", marginTop: "16px", background: "var(--yellow-bg)", borderColor: "rgba(245,158,11,0.2)" }}>
            <div style={{ fontWeight: 700, marginBottom: "8px", color: "var(--yellow)" }}>⚠️ Database Setup Required</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <p>1. Create a free database at <strong>neon.tech</strong> or <strong>supabase.com</strong></p>
              <p>2. Copy the connection strings into your <code>.env</code> file:</p>
              <pre style={{ background: "var(--bg-primary)", padding: "10px", borderRadius: "6px", marginTop: "8px", fontSize: "11px", overflow: "auto" }}>
{`DATABASE_URL="postgresql://...?pgbouncer=true"
DIRECT_URL="postgresql://..."`}
              </pre>
              <p style={{ marginTop: "8px" }}>3. Run: <code>npx prisma migrate dev</code></p>
              <p>4. Seed plans: <code>npm run db:seed</code></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
