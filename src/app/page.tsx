"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Users, UserCheck, UserX, CreditCard, AlertTriangle, Calendar
} from "lucide-react";
import Link from "next/link";
import { safeFetch } from "@/lib/fetch";

interface DashboardData {
  totalCustomers: number;
  activeMembers: number;
  expiredMembers: number;
  pendingPaymentCount: number;
  expiringToday: ExpiringMember[];
  expiringThisWeek: ExpiringMember[];
}
interface ExpiringMember {
  id: number;
  customer: { name: string; phone: string };
  plan: { name: string };
  expiryDate: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetch<DashboardData>("/api/dashboard").then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const daysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading)
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ padding: "60px 32px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading dashboard…
          </div>
        </main>
      </div>
    );

  if (!data)
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ padding: "60px 32px", textAlign: "center" }}>
            <div style={{ color: "var(--yellow)", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>⚠️ Database not connected</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Update your <code>.env</code> with real DB credentials and run <code>npx prisma migrate dev</code>.</div>
          </div>
        </main>
      </div>
    );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Dashboard</h2>
          <p>Overview of your gym members and memberships</p>
        </div>

        <div className="page-body">
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card purple">
              <span className="stat-label">Total Members</span>
              <span className="stat-value">{data?.totalCustomers ?? 0}</span>
              <span className="stat-sub">Registered customers</span>
            </div>
            <div className="stat-card green">
              <span className="stat-label">Active</span>
              <span className="stat-value">{data?.activeMembers ?? 0}</span>
              <span className="stat-sub">Current memberships</span>
            </div>
            <div className="stat-card red">
              <span className="stat-label">Expired</span>
              <span className="stat-value">{data?.expiredMembers ?? 0}</span>
              <span className="stat-sub">Need renewal</span>
            </div>
            <div className="stat-card yellow">
              <span className="stat-label">Pending Pay</span>
              <span className="stat-value">{data?.pendingPaymentCount ?? 0}</span>
              <span className="stat-sub">Partial payments</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Expiring Today */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <AlertTriangle size={16} color="var(--red)" />
                <span style={{ fontWeight: 700, fontSize: "14px" }}>Expiring Today</span>
                <span className="badge badge-red" style={{ marginLeft: "auto" }}>
                  {data?.expiringToday.length ?? 0}
                </span>
              </div>
              {data?.expiringToday.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>✅ No expirations today</p>
              ) : (
                data?.expiringToday.map((m) => (
                  <div key={m.id} className="expiry-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13px" }}>{m.customer.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.customer.phone}</div>
                    </div>
                    <span className="badge badge-red">{m.plan.name}</span>
                  </div>
                ))
              )}
            </div>

            {/* Expiring This Week */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Calendar size={16} color="var(--yellow)" />
                <span style={{ fontWeight: 700, fontSize: "14px" }}>Expiring This Week</span>
                <span className="badge badge-yellow" style={{ marginLeft: "auto" }}>
                  {data?.expiringThisWeek.length ?? 0}
                </span>
              </div>
              {data?.expiringThisWeek.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>✅ None this week</p>
              ) : (
                data?.expiringThisWeek.map((m) => (
                  <div key={m.id} className="expiry-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13px" }}>{m.customer.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.customer.phone}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="badge badge-yellow">{m.plan.name}</span>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                        {daysLeft(m.expiryDate)}d left
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: "24px" }}>
            <div className="section-title">Quick Actions</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/members?action=add" className="btn btn-primary">
                <Users size={14} /> Add Member
              </Link>
              <Link href="/members" className="btn btn-secondary">
                <UserCheck size={14} /> View All Members
              </Link>
              <Link href="/payments" className="btn btn-secondary">
                <CreditCard size={14} /> Record Payment
              </Link>
              <Link href="/members?filter=expired" className="btn btn-secondary">
                <UserX size={14} /> Expired Members
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
