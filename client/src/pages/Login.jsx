import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import TextField from "../components/TextField.jsx";
import Button from "../components/Button.jsx";
import { api } from "../lib/api.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: { email, password } });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue. Your account is stored securely in MongoDB."
      footer={
        <div className="flex items-center justify-between">
          <span className="text-slate-400">New here?</span>
          <Link className="text-indigo-300 hover:text-indigo-200" to="/register">
            Create account
          </Link>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between text-sm">
          <Link className="text-slate-300 hover:text-slate-100" to="/forgot-password">
            Forgot password?
          </Link>
          <span className="text-slate-500">JWT session</span>
        </div>

        <Button type="submit" disabled={loading || !email || !password}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <div className="text-xs text-slate-500">
          Tip: set <code className="text-slate-300">VITE_API_BASE</code> if your API runs on a different host.
        </div>
      </form>
    </AuthCard>
  );
}

