export default function TextField({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-300">{label}</div>
      <input
        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/15"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}

