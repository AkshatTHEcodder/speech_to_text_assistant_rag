import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import Button from "../components/Button.jsx";
import { api } from "../lib/api.js";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ loading: true, ok: false, error: "" });

  const email = params.get("email") || "";
  const token = params.get("token") || "";

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        await api("/api/auth/verify-email", { method: "POST", body: { email, token } });
        if (mounted) setState({ loading: false, ok: true, error: "" });
      } catch (e) {
        if (mounted) setState({ loading: false, ok: false, error: e.message || "Verification failed" });
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [email, token]);

  return (
    <AuthCard title="Verify email" subtitle="Finishing up your signup…">
      {state.loading ? (
        <div className="text-sm text-slate-300">Verifying…</div>
      ) : state.ok ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            Email verified. You can log in now.
          </div>
          <Link to="/login">
            <Button>Go to login</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </div>
          <Link to="/login">
            <Button variant="ghost">Back to login</Button>
          </Link>
        </div>
      )}
    </AuthCard>
  );
}

