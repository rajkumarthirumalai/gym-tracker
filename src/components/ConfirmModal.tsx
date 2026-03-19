"use client";
import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  confirmColor?: "red" | "primary" | "yellow";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen, title, message, confirmText = "Confirm", confirmColor = "primary", onConfirm, onCancel, isLoading
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 9999 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: confirmColor === "red" ? "var(--red)" : "inherit" }}>
            {confirmColor === "red" && <AlertTriangle size={18} />}
            {title}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={isLoading}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
            {message}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>Cancel</button>
          <button 
            className={`btn btn-${confirmColor === "red" ? "danger" : confirmColor === "yellow" ? "warning" : "primary"}`} 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
