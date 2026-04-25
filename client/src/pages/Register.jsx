import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import TextField from "../components/TextField.jsx";
import Button from "../components/Button.jsx";
import { api } from "../lib/api.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/register", { method: "POST", body: { name, email, password } });
      setDone(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="We’ll email you a verification link (once SMTP keys are added)."
      footer={
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Already have an account?</span>
          <Link className="text-indigo-300 hover:text-indigo-200" to="/login">
            Sign in
          </Link>
        </div>
      }
    >
      {done ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          Account created. Check your inbox for a verification email (after SMTP is configured).
          <div className="mt-3">
            <Link className="text-indigo-300 hover:text-indigo-200" to="/login">
              Go to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField label="Name" value={name} onChange={setName} placeholder="Your name" autoComplete="name" />
          <TextField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Min 8 characters"
            autoComplete="new-password"
          />

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={loading || !name || !email || password.length < 8}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

