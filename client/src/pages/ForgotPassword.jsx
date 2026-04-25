import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import TextField from "../components/TextField.jsx";
import Button from "../components/Button.jsx";
import { api } from "../lib/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/forgot-password", { method: "POST", body: { email } });
      setDone(true);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="We’ll email you a reset link.">
      {done ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          If an account exists for that email, you’ll receive a reset link shortly.
          <div className="mt-3">
            <Link className="text-indigo-300 hover:text-indigo-200" to="/login">
              Back to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          <Button type="submit" disabled={loading || !email}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

