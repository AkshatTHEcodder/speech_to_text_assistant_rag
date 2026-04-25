export default function Button({ children, disabled, onClick, type = "button", variant = "primary" }) {
  const base =
    "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "ghost"
      ? "border border-white/10 bg-white/5 hover:bg-white/10"
      : "bg-indigo-500 hover:bg-indigo-400 text-slate-950";

  return (
    <button type={type} className={`${base} ${styles}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

