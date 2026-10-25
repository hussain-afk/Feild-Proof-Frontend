import { Search, X } from "lucide-react";

// The colour of each status label
const STATUS_STYLE = {
  pending: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  accepted: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/25 bg-red-500/10 text-red-300",
  cancelled: "border-slate-600/40 bg-slate-700/30 text-slate-400",
  expired: "border-slate-600/40 bg-slate-700/30 text-slate-400",
};

const DOT_STYLE = {
  pending: "bg-amber-400 motion-safe:animate-pulse",
  accepted: "bg-emerald-400",
  rejected: "bg-red-400",
  cancelled: "bg-slate-500",
  expired: "bg-slate-500",
};

// A round picture with the first letter of the name
export function Avatar({ name, tone = "sky" }) {
  const colors = tone === "amber" ? "bg-amber-500/15 text-amber-300 ring-amber-500/20" : "bg-sky-500/15 text-sky-300 ring-sky-500/20";

  return (
    <div
      aria-hidden="true"
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold ring-1 ${colors}`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

export function StatusBadge({ status = "pending" }) {
  const key = STATUS_STYLE[status] ? status : "pending";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[key]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLE[key]}`} />
      {status}
    </span>
  );
}

// The title of the page with a number on the right
export function PageHeader({ icon: Icon, title, subtitle, count, countLabel }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/15 bg-sky-500/5 text-sky-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-1.5 max-w-xl text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>

      <span className="rounded-full border border-slate-800 bg-[#111827] px-3.5 py-1.5 text-sm text-slate-300">
        <span className="font-semibold text-white">{count}</span> {countLabel}
      </span>
    </header>
  );
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-700 bg-[#111827]/60 px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-200">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{text}</p>
    </div>
  );
}

// A search box (the pages show it only when there are many invites)
export function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-4 sm:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] pl-9 pr-9 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-500 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}