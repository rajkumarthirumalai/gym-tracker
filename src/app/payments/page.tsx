"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { CreditCard, Search } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import Shimmer from "@/components/Shimmer";

interface Payment { id: number; amount: number; date: string; note: string; membership: { id: number; plan: { name: string }; customer: { id: number; name: string; phone: string } } }

export default function PaymentsPage() {
  const { data: payments = [], isLoading, error } = useSWR<Payment[]>("/api/payments/list");
  const [search, setSearch] = useState("");

  const dbError = !!error;

  const filtered = payments.filter(p =>
    p.membership?.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
    p.membership?.customer?.phone.includes(search)
  );

  const total = filtered.reduce((s, p) => s + p.amount, 0);

  const PaymentsLoading = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Shimmer variant="stat" height="100px" />
      <Shimmer variant="card" height="300px" />
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Payments</h2>
          <p>All payment transactions</p>
        </div>

        <div className="page-body">
          {dbError && (
            <div style={{ marginBottom: "16px", padding: "12px 16px", background: "var(--yellow-bg)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--yellow)" }}>
              ⚠️ <strong>Database not connected.</strong> Update <code>.env</code> and run <code>npx prisma migrate dev</code> to get started.
            </div>
          )}

          {isLoading && payments.length === 0 ? (
            <PaymentsLoading />
          ) : (
            <>
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div className="stat-card purple" style={{ flex: 1, minWidth: "160px" }}>
                  <span className="stat-label">Total Revenue</span>
                  <span className="stat-value" style={{ fontSize: "24px" }}>₹{total.toLocaleString("en-IN")}</span>
                  <span className="stat-sub">{filtered.length} transactions</span>
                </div>
              </div>

              <div className="search-bar">
                <div className="search-input-wrap" style={{ flex: 1 }}>
                  <Search size={15} />
                  <input className="form-input" placeholder="Search by member name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>

              <div className="card">
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <CreditCard size={40} />
                    <h3>No payments found</h3>
                    <p>Add payments from member profiles.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Plan</th>
                          <th>Date</th>
                          <th>Note</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(p => (
                          <tr key={p.id}>
                            <td>
                              <Link href={`/members/${p.membership?.customer?.id}`} style={{ color: "var(--accent-light)", textDecoration: "none", fontWeight: 600 }}>
                                {p.membership?.customer?.name}
                              </Link>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.membership?.customer?.phone}</div>
                            </td>
                            <td><span className="badge badge-purple">{p.membership?.plan?.name}</span></td>
                            <td style={{ color: "var(--text-secondary)" }}>{new Date(p.date).toLocaleDateString("en-IN")}</td>
                            <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{p.note || "—"}</td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "var(--green)" }}>₹{p.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
