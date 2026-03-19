"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Plus, X, Dumbbell, Pencil, Trash2 } from "lucide-react";
import { safePatch, safePost } from "@/lib/fetch";
import useSWR from "swr";
import Shimmer from "@/components/Shimmer";
import ConfirmModal from "@/components/ConfirmModal";

interface Plan { id: number; name: string; duration: number; price: number; active: boolean }

export default function PlansPage() {
  const { data: plans = [], isLoading, mutate: mutatePlans, error } = useSWR<Plan[]>("/api/plans");
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [toast, setToast] = useState("");
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const dbError = !!error;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => { setEditPlan(null); setName(""); setDuration(""); setPrice(""); setShowModal(true); };
  const openEdit = (p: Plan) => { setEditPlan(p); setName(p.name); setDuration(String(p.duration)); setPrice(String(p.price)); setShowModal(true); };

  const handleSave = async () => {
    if (!name || !duration || !price) return;
    const payload = { name, duration: Number(duration), price: Number(price) };
    if (editPlan) {
      await safePatch(`/api/plans/${editPlan.id}`, payload);
      showToast("Plan updated!");
    } else {
      await safePost("/api/plans", payload);
      showToast("Plan created!");
    }
    setShowModal(false);
    mutatePlans();
  };

  const confirmDelete = async () => {
    if (!deletePlan) return;
    setIsDeleting(true);
    const res = await fetch(`/api/plans/${deletePlan.id}`, { method: "DELETE" });
    setIsDeleting(false);
    
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to delete plan.");
      setDeletePlan(null);
      return;
    }
    showToast("Plan completely deleted!");
    setDeletePlan(null);
    mutatePlans();
  };

  const handleDelete = (p: Plan) => {
    setDeletePlan(p);
  };

  const PlansLoading = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
      {[1, 2, 3].map(i => <Shimmer key={i} variant="card" height="120px" />)}
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>Plans</h2>
              <p>Manage your gym membership plans</p>
            </div>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={14} /> Add Plan
            </button>
          </div>
        </div>

        <div className="page-body">
          {dbError && (
            <div style={{ marginBottom: "16px", padding: "12px 16px", background: "var(--yellow-bg)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--yellow)" }}>
              ⚠️ <strong>Database not connected.</strong> Update <code>.env</code> and run <code>npx prisma migrate dev</code> to get started.
            </div>
          )}

          {isLoading && plans.length === 0 ? (
            <PlansLoading />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
              {plans.map(p => (
                <div key={p.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Dumbbell size={18} color="var(--accent-light)" />
                      <span style={{ fontWeight: 700, fontSize: "15px" }}>{p.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                        <Pencil size={12} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-light)", marginBottom: "4px" }}>
                    ₹{p.price}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {p.duration} days · {(p.price / p.duration).toFixed(1)}/day
                  </div>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                  <Dumbbell size={40} />
                  <h3>No plans yet</h3>
                  <p>Add your first membership plan.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editPlan ? "Edit Plan" : "Add Plan"}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Plan Name *</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Monthly" />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (days) *</label>
                <input type="number" className="form-input" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input type="number" className="form-input" value={price} onChange={e => setPrice(e.target.value)} placeholder="800" />
              </div>
              {duration && price && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Daily rate: ₹{(Number(price) / Number(duration)).toFixed(2)}/day
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editPlan ? "Update Plan" : "Create Plan"}
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

      <ConfirmModal
        isOpen={!!deletePlan}
        title="Delete Plan"
        message={`Are you sure you want to completely delete the plan "${deletePlan?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        onConfirm={confirmDelete}
        onCancel={() => setDeletePlan(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
