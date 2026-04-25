import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import TextField from "../components/TextField.jsx";
import Button from "../components/Button.jsx";
import { api } from "../lib/api.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/reset-password", { method: "POST", body: { email, token, newPassword } });
      setDone(true);
    } catch (e) {
      setError(e.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Set a strong password you don’t reuse elsewhere.">
      {done ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            Password updated. You can log in now.
          </div>
          <Link to="/login">
            <Button>Go to login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            Using email <span className="text-slate-100">{email || "(missing)"}</span>
          </div>
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Min 8 characters"
            autoComplete="new-password"
          />
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          <Button type="submit" disabled={loading || newPassword.length < 8 || !email || !token}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

