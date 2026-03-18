"use client";
import { useEffect, useState, use } from "react";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Plus, CreditCard, X, StopCircle, RefreshCw, Calendar } from "lucide-react";
import Link from "next/link";
import { safeFetch, safePost, safePatch } from "@/lib/fetch";

interface Plan { id: number; name: string; duration: number; price: number }
interface Payment { id: number; amount: number; date: string; note: string }
interface Membership {
  id: number; plan: Plan; payments: Payment[];
  startDate: string; expiryDate: string; status: string;
}
interface Customer {
  id: number; name: string; phone: string; email?: string; status: string;
  notes: string; lastVisitDate?: string; memberships: Membership[];
}

function getStatus(m: Membership) {
  if (m.status === "stopped") return { label: "Stopped", color: "gray" };
  return new Date(m.expiryDate) < new Date()
    ? { label: "Expired", color: "red" }
    : { label: "Active", color: "green" };
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [initialPayment, setInitialPayment] = useState("");
  const [toast, setToast] = useState("");
  const [dbError, setDbError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchCustomer = async () => {
    const data = await safeFetch<Customer>(`/api/customers/${id}`);
    if (!data) {
      setDbError(true);
      setLoading(false);
      return;
    }
    setDbError(false);
    setCustomer(data);
    setLoading(false);
  };

  useEffect(() => { fetchCustomer(); }, [id]);
  useEffect(() => { safeFetch<Plan[]>("/api/plans").then(d => d && setPlans(d)); }, []);

  const handleAddPayment = async () => {
    if (!selectedMembershipId || !payAmount || isSubmitting) return;
    setIsSubmitting(true);
    await safePost("/api/payments", { membershipId: selectedMembershipId, amount: Number(payAmount), note: payNote });
    setIsSubmitting(false);
    showToast("Payment recorded!");
    setShowPaymentModal(false); setPayAmount(""); setPayNote("");
    fetchCustomer();
  };

  const handleCreateMembership = async () => {
    if (!selectedPlanId || isSubmitting) return;
    setIsSubmitting(true);
    await safePost("/api/memberships", {
      customerId: customer!.id, planId: Number(selectedPlanId),
      startDate, initialPayment: Number(initialPayment) || 0,
    });
    setIsSubmitting(false);
    showToast("New membership created!");
    setShowMembershipModal(false); setSelectedPlanId(""); setInitialPayment("");
    fetchCustomer();
  };

  const handleStopMembership = async (mId: number) => {
    if (!confirm("Mark this membership as stopped?")) return;
    await safePatch(`/api/memberships/${mId}`, { status: "stopped" });
    showToast("Membership stopped");
    fetchCustomer();
  };

  const handleMarkInactive = async () => {
    if (!confirm("Mark this member as inactive?")) return;
    await safePatch(`/api/customers/${id}`, { status: "inactive" });
    showToast("Member marked inactive");
    fetchCustomer();
  };

  const handleUpdateLastVisit = async () => {
    await safePatch(`/api/customers/${id}`, { lastVisitDate: new Date().toISOString() });
    showToast("Last visit updated!");
    fetchCustomer();
  };

  if (loading) return (
    <div className="app-layout"><Sidebar />
      <main className="main-content">
        <div style={{ padding: "60px 32px", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
      </main>
    </div>
  );

  if (!customer) return (
    <div className="app-layout"><Sidebar />
      <main className="main-content">
        {dbError ? (
          <div style={{ padding: "60px 32px", textAlign: "center" }}>
            <div style={{ color: "var(--yellow)", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>⚠️ Database not connected</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Update your <code>.env</code> with real DB credentials and run <code>npx prisma migrate dev</code>.</div>
          </div>
        ) : (
          <div style={{ padding: "60px 32px", textAlign: "center", color: "var(--red)" }}>Member not found.</div>
        )}
      </main>
    </div>
  );

  const activeMembership = customer.memberships.find(m => m.status === "active" && new Date(m.expiryDate) > new Date());
  const selectedPlan = plans.find(p => p.id === Number(selectedPlanId));

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <Link href="/members" className="btn btn-secondary btn-sm" style={{ marginBottom: "12px", display: "inline-flex" }}>
            <ArrowLeft size={13} /> Back
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div className="member-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2>{customer.name}</h2>
                <p>📞 {customer.phone} {customer.email && `· ✉️ ${customer.email}`}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button className="btn btn-secondary btn-sm" onClick={handleUpdateLastVisit}>
                <Calendar size={13} /> Check-in Today
              </button>
              {customer.status === "active" && (
                <button className="btn btn-danger btn-sm" onClick={handleMarkInactive}>
                  <StopCircle size={13} /> Mark Inactive
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => setShowMembershipModal(true)}>
                <Plus size={13} /> New Membership
              </button>
            </div>
          </div>
        </div>

        <div className="page-body">
          {/* Info strip */}
          <div className="card" style={{ marginBottom: "24px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div className="section-title" style={{ marginBottom: "4px" }}>Member Status</div>
              <span className={`badge badge-${customer.status === "active" ? "green" : "red"}`}>
                {customer.status}
              </span>
            </div>
            <div>
              <div className="section-title" style={{ marginBottom: "4px" }}>Last Visit</div>
              <div style={{ fontSize: "13px" }}>
                {customer.lastVisitDate
                  ? new Date(customer.lastVisitDate).toLocaleDateString("en-IN")
                  : "Not recorded"}
              </div>
            </div>
            <div>
              <div className="section-title" style={{ marginBottom: "4px" }}>Total Memberships</div>
              <div style={{ fontSize: "13px" }}>{customer.memberships.length}</div>
            </div>
            {activeMembership && (
              <div>
                <div className="section-title" style={{ marginBottom: "4px" }}>Active Plan</div>
                <div style={{ fontSize: "13px" }}>
                  {activeMembership.plan.name} — expires {new Date(activeMembership.expiryDate).toLocaleDateString("en-IN")}
                </div>
              </div>
            )}
          </div>

          {/* Memberships */}
          <div className="section-title">Membership History</div>
          {customer.memberships.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>No memberships yet</p>
              <button className="btn btn-primary" onClick={() => setShowMembershipModal(true)}>
                <Plus size={14} /> Add Membership
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {customer.memberships.map(m => {
                const mStatus = getStatus(m);
                const paid = m.payments.reduce((s, p) => s + p.amount, 0);
                const pending = m.plan.price - paid;
                const pct = Math.min(100, Math.round((paid / m.plan.price) * 100));

                return (
                  <div key={m.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px" }}>{m.plan.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                          {new Date(m.startDate).toLocaleDateString("en-IN")} → {new Date(m.expiryDate).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span className={`badge badge-${mStatus.color}`}>{mStatus.label}</span>
                        {m.status === "active" && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleStopMembership(m.id)}>
                            Stop
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Payment summary */}
                    <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "13px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Total: </span>
                        <strong>₹{m.plan.price}</strong>
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Paid: </span>
                        <strong style={{ color: "var(--green)" }}>₹{paid}</strong>
                      </div>
                      {pending > 0 && (
                        <div style={{ fontSize: "13px" }}>
                          <span style={{ color: "var(--text-muted)" }}>Pending: </span>
                          <strong style={{ color: "var(--red)" }}>₹{pending}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                        <span>Payment Progress</span><span>{pct}%</span>
                      </div>
                      <div className="progress-bar" style={{ width: "100%", height: "6px" }}>
                        <div className={`progress-fill ${pct < 100 && pct > 0 ? "partial" : pct === 0 ? "none" : ""}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Payment history */}
                    {m.payments.length > 0 && (
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Payments</div>
                        {m.payments.map(p => (
                          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "5px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                            <span style={{ color: "var(--text-secondary)" }}>{new Date(p.date).toLocaleDateString("en-IN")}</span>
                            <span style={{ color: "var(--green)", fontWeight: 600 }}>+ ₹{p.amount}</span>
                            {p.note && <span style={{ color: "var(--text-muted)" }}>{p.note}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {pending > 0 && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => { setSelectedMembershipId(m.id); setPayAmount(String(pending)); setShowPaymentModal(true); }}
                      >
                        <CreditCard size={13} /> Record Payment
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPaymentModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" className="form-input" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Amount" />
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="e.g. Cash, UPI, etc." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddPayment} disabled={!payAmount || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Membership Modal */}
      {showMembershipModal && (
        <div className="modal-overlay" onClick={() => setShowMembershipModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <RefreshCw size={14} style={{ marginRight: "6px" }} />
                New Membership for {customer.name}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMembershipModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Plan *</label>
                <select className="form-select" value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}>
                  <option value="">Choose a plan</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} — {p.duration} days — ₹{p.price}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              {selectedPlan && (
                <div className="card" style={{ marginBottom: "16px", background: "var(--bg-secondary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>Expiry</span>
                    <strong>{new Date(new Date(startDate).getTime() + selectedPlan.duration * 86400000).toLocaleDateString("en-IN")}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "6px" }}>
                    <span>Total</span><strong>₹{selectedPlan.price}</strong>
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Initial Payment (₹)</label>
                <input type="number" className="form-input" value={initialPayment} onChange={e => setInitialPayment(e.target.value)} placeholder="0" min="0" />
                {selectedPlan && initialPayment && Number(initialPayment) < selectedPlan.price && (
                  <div style={{ fontSize: "12px", color: "var(--yellow)", marginTop: "4px" }}>
                    ⚠️ Partial — ₹{selectedPlan.price - Number(initialPayment)} pending
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowMembershipModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateMembership} disabled={!selectedPlanId || isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Membership"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast toast-success">{toast}</div>
        </div>
      )}
    </div>
  );
}
