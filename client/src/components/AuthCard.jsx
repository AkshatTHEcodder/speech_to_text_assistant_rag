import { Link } from "react-router-dom";

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute top-24 left-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-6 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-indigo-300/80">StreamTalk</div>
            <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
          </div>
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-200">
            Home
          </Link>
        </div>

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6 text-sm text-slate-300">{footer}</div> : null}
      </div>
    </div>
  );
}

