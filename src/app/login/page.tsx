"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <form onSubmit={handleLogin} className="card" style={{ width: "100%", maxWidth: "360px", textAlign: "center", padding: "40px 24px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "4px", background: "linear-gradient(135deg, var(--accent-light), #60a5fa)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>⚡ Muscle War</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>Enter Owner Password</p>
        
        {error && <div style={{ color: "var(--red)", fontSize: "13px", marginBottom: "16px", background: "var(--red-bg)", padding: "10px", borderRadius: "var(--radius-sm)", fontWeight: 600 }}>{error}</div>}
        
        <input 
          type="password" 
          className="form-input" 
          style={{ marginBottom: "16px", textAlign: "center", fontSize: "16px" }}
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          autoFocus 
        />
        <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Login</button>
      </form>
    </div>
  );
}
