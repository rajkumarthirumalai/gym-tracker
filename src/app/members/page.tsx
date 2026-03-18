"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Search, Plus, Phone, X, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { safeFetch, safePost } from "@/lib/fetch";

interface Plan { id: number; name: string; duration: number; price: number }
interface Payment { amount: number }
interface Membership { id: number; plan: Plan; payments: Payment[]; startDate: string; expiryDate: string; status: string }
interface Customer {
  id: number; name: string; phone: string; email?: string; status: string;
  memberships: Membership[];
}

function getPaymentStatus(membership: Membership) {
  const paid = membership.payments.reduce((s, p) => s + p.amount, 0);
  const total = membership.plan.price;
  if (paid >= total) return { label: "Paid", color: "green", pct: 100 };
  if (paid > 0) return { label: "Partial", color: "yellow", pct: Math.round((paid / total) * 100) };
  return { label: "Unpaid", color: "red", pct: 0 };
}

function getMembershipStatus(membership: Membership) {
  if (membership.status === "stopped") return { label: "Stopped", color: "gray" };
  const expired = new Date(membership.expiryDate) < new Date();
  if (expired) return { label: "Expired", color: "red" };
  return { label: "Active", color: "green" };
}

function MembersPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(searchParams.get("filter") ?? "all");
  const [showAddModal, setShowAddModal] = useState(searchParams.get("action") === "add");
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [phoneSearched, setPhoneSearched] = useState(false);
  const [toast, setToast] = useState("");
  const [dbError, setDbError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New member form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // New membership form
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [initialPayment, setInitialPayment] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const data = await safeFetch<Customer[]>(`/api/customers?${params}`);
    if (data === null) {
      setDbError(true);
      setLoading(false);
      return;
    }
    setDbError(false);
    setCustomers(data);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { safeFetch<Plan[]>("/api/plans").then(d => d && setPlans(d)); }, []);

  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) return;
    setPhoneSearched(true);
    const data = await safeFetch<Customer>(`/api/customers?phone=${phoneSearch.trim()}`);
    setFoundCustomer(data);
  };

  const handleCreateCustomer = async () => {
    const phoneToUse = newPhone || phoneSearch;
    if (!newName || !phoneToUse || isSubmitting) return;
    setIsSubmitting(true);
    const { data, status } = await safePost<Customer>("/api/customers", { name: newName, phone: phoneToUse, email: newEmail });
    setIsSubmitting(false);
    if (status === 409) {
      showToast("Phone already registered!");
      return;
    }
    if (!data) {
      showToast("Error creating customer");
      return;
    }
    showToast("Member added!");
    setShowAddModal(false);
    setNewName(""); setNewPhone(""); setNewEmail("");
    fetchCustomers();
    // Open membership modal immediately
    setSelectedCustomerId(data.id);
    setShowMembershipModal(true);
  };

  const handleCreateMembership = async () => {
    if (!selectedCustomerId || !selectedPlanId || isSubmitting) return;
    setIsSubmitting(true);
    await safePost("/api/memberships", {
      customerId: selectedCustomerId,
      planId: Number(selectedPlanId),
      startDate,
      initialPayment: Number(initialPayment) || 0,
    });
    setIsSubmitting(false);
    showToast("Membership created!");
    setShowMembershipModal(false);
    setSelectedCustomerId(null); setSelectedPlanId(""); setInitialPayment("");
    fetchCustomers();
    if (selectedCustomerId) router.push(`/members/${selectedCustomerId}`);
  };

  const displayed = customers.filter((c) => {
    const m = c.memberships[0];
    if (filter === "active") return m && getMembershipStatus(m).label === "Active";
    if (filter === "expired") return !m || getMembershipStatus(m).label === "Expired";
    if (filter === "inactive") return c.status === "inactive";
    return true;
  });

  const selectedPlan = plans.find(p => p.id === Number(selectedPlanId));

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>Members</h2>
              <p>Search, manage, and track all gym members</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Add Member
            </button>
          </div>
        </div>

        <div className="page-body">
          {/* Search */}
          {dbError && (
            <div style={{ marginBottom: "16px", padding: "12px 16px", background: "var(--yellow-bg)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--yellow)" }}>
              ⚠️ <strong>Database not connected.</strong> Update <code>.env</code> and run <code>npx prisma migrate dev</code> to get started.
            </div>
          )}
          <div className="search-bar">
            <div className="search-input-wrap">
              <Search size={15} />
              <input
                className="form-input"
                placeholder="Search by name or phone…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {["all", "active", "expired", "inactive"].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Member list */}
          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : displayed.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No members found</h3>
              <p>Try a different filter or add a new member.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {displayed.map(c => {
                const m = c.memberships[0];
                const mStatus = m ? getMembershipStatus(m) : null;
                const pStatus = m ? getPaymentStatus(m) : null;
                const dLeft = m ? Math.ceil((new Date(m.expiryDate).getTime() - Date.now()) / 86400000) : null;
                return (
                  <Link key={c.id} href={`/members/${c.id}`} className="member-card">
                    <div className="member-info">
                      <div className="member-avatar">{c.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="member-name">{c.name}</div>
                        <div className="member-phone">📞 {c.phone}</div>
                      </div>
                    </div>
                    <div className="member-meta">
                      {m && (
                        <>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                              {m.plan.name}
                            </div>
                            <div
                              className="progress-bar"
                              title={`Paid ₹${m.payments.reduce((s,p)=>s+p.amount,0)} / ₹${m.plan.price}`}
                            >
                              <div
                                className={`progress-fill ${pStatus?.color === "yellow" ? "partial" : pStatus?.color === "red" ? "none" : ""}`}
                                style={{ width: `${pStatus?.pct}%` }}
                              />
                            </div>
                          </div>
                          <span className={`badge badge-${mStatus?.color}`}>{mStatus?.label}</span>
                          {dLeft !== null && dLeft > 0 && (
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{dLeft}d</span>
                          )}
                        </>
                      )}
                      {!m && <span className="badge badge-gray">No Plan</span>}
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Find or Add Member</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              {/* Phone search first */}
              <div className="form-group">
                <label className="form-label">Search by Phone Number</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    className="form-input"
                    placeholder="Enter phone number"
                    value={phoneSearch}
                    onChange={e => setPhoneSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handlePhoneSearch()}
                  />
                  <button className="btn btn-secondary" onClick={handlePhoneSearch}>
                    <Phone size={14} />
                  </button>
                </div>
              </div>

              {phoneSearched && foundCustomer && (
                <div className="card" style={{ marginBottom: "16px", background: "var(--green-bg)", borderColor: "var(--green)" }}>
                  <div style={{ fontWeight: 700, marginBottom: "4px", color: "var(--green)" }}>✅ Member Found!</div>
                  <div style={{ fontSize: "14px" }}>{foundCustomer.name} — {foundCustomer.phone}</div>
                  <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                    <button className="btn btn-success btn-sm" onClick={() => {
                      setSelectedCustomerId(foundCustomer.id);
                      setShowAddModal(false);
                      setShowMembershipModal(true);
                    }}>
                      + New Membership
                    </button>
                    <Link href={`/members/${foundCustomer.id}`} className="btn btn-secondary btn-sm">
                      View Profile
                    </Link>
                  </div>
                </div>
              )}

              {phoneSearched && !foundCustomer && (
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    No member found. Create a new one:
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Member name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input className="form-input" value={newPhone || phoneSearch} onChange={e => setNewPhone(e.target.value)} placeholder="Phone number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (optional)</label>
                    <input className="form-input" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              {phoneSearched && !foundCustomer && (
                <button className="btn btn-primary" onClick={handleCreateCustomer} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create & Add Membership"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Membership Modal */}
      {showMembershipModal && (
        <div className="modal-overlay" onClick={() => setShowMembershipModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Membership</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMembershipModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Plan *</label>
                <select className="form-select" value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}>
                  <option value="">Choose a plan</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.duration} days — ₹{p.price}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              {selectedPlan && (
                <div className="card" style={{ marginBottom: "16px", background: "var(--bg-secondary)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Plan Summary</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>Duration</span><strong>{selectedPlan.duration} days</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "6px" }}>
                    <span>Total Amount</span><strong>₹{selectedPlan.price}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "6px" }}>
                    <span>Expiry</span>
                    <strong>
                      {startDate ? new Date(new Date(startDate).getTime() + selectedPlan.duration * 86400000).toLocaleDateString("en-IN") : "-"}
                    </strong>
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Initial Payment (₹) — leave 0 for now</label>
                <input
                  type="number"
                  className="form-input"
                  value={initialPayment}
                  onChange={e => setInitialPayment(e.target.value)}
                  placeholder="0"
                  min="0"
                />
                {selectedPlan && initialPayment && Number(initialPayment) < selectedPlan.price && (
                  <div style={{ fontSize: "12px", color: "var(--yellow)", marginTop: "4px" }}>
                    ⚠️ Partial payment — ₹{selectedPlan.price - Number(initialPayment)} pending
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

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast toast-success">{toast}</div>
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense>
      <MembersPageInner />
    </Suspense>
  );
}
