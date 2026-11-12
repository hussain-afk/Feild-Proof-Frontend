import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  X,
  ArrowDownUp,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Receipt,
  Clock,
  CalendarDays,
  UserRound,
  FileText,
  Wallet,
  Download,
  Loader2,
} from "lucide-react";

import { context } from "../context/context.jsx";
import LoadingState from "./LoadingState.jsx";

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

const KINDS = {
  approved: {
    person: "approvedBy",
    badge: "Approved",
    badgeStyle: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    messageLabel: "Approval message",
    noMessage: "No approval message.",
  },
  rejected: {
    person: "rejectedBy",
    badge: "Rejected",
    badgeStyle: "border-rose-500/20 bg-rose-500/10 text-rose-400",
    messageLabel: "Reason",
    noMessage: "No reason was given.",
  },
};

const TILES = [
  { id: "all", label: "All reviewed", icon: ClipboardList },
  { id: "approved", label: "Approved", icon: CheckCircle2 },
  { id: "rejected", label: "Rejected", icon: XCircle },
];

const PAGE_SIZE = 10;
const LONG_MESSAGE = 90;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-800 bg-[#0a0f1a] pl-10 pr-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition hover:border-slate-700 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const isValidDate = (date) => date && !Number.isNaN(new Date(date).getTime());

const formatDate = (date) =>
  isValidDate(date)
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

const formatTime = (date) =>
  isValidDate(date)
    ? new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const formatStamp = (date) =>
  isValidDate(date) ? `${formatDate(date)}, ${formatTime(date)}` : "N/A";

const timeOf = (item) =>
  item.createdAt ? new Date(item.createdAt).getTime() : 0;

const rowId = (item) => `${item.kind}-${item._id}`;

// PDF ki standard font nbsp ko theek dikhati hai, phir bhi normal space rakhte hain
const formatMoney = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  })
    .format(Number(amount || 0))
    .replace(/\u00a0/g, " ");

/* ------------------------------------------------------------------ */
/* Payslip data (modal aur PDF dono isi se banate hain)                 */
/* ------------------------------------------------------------------ */

const buildPayslip = (item) => {
  const p = item.payslip;
  const paid = p.status === "paid";
  const rate = Number(p.hourlyRate || 0);
  const hours = Number(p.workingHours || 0);
  const total = Number(p.totalAmount || 0);

  return {
    paid,
    total,
    id: p._id,
    title: item.task?.title || "Untitled task",
    calculation: `${rate} × ${hours}`,
    sections: [
      {
        title: "Task information",
        icon: FileText,
        rows: [
          { label: "Task name", value: item.task?.title || "Untitled task" },
          { label: "Task ID", value: item.task?._id || p.task },
          { label: "Task status", value: item.task?.status || "approved" },
        ],
      },
      {
        title: "Payment breakdown",
        icon: Wallet,
        rows: [
          { label: "Hourly rate", value: `${formatMoney(rate)} / hour` },
          { label: "Working hours", value: `${hours.toFixed(2)} hours` },
          { label: "Calculation", value: `${rate} × ${hours}` },
          { label: "Total amount", value: formatMoney(total), strong: true },
        ],
      },
      {
        title: "Approved by",
        icon: UserRound,
        rows: [
          { label: "Manager", value: item.approvedBy?.name },
          { label: "Email", value: item.approvedBy?.email },
        ],
      },
      {
        title: "Record details",
        icon: CalendarDays,
        rows: [
          { label: "Approved on", value: formatStamp(item.createdAt) },
          { label: "Payslip generated", value: formatStamp(p.createdAt) },
          { label: "Payslip ID", value: p._id },
          ...(paid && p.paidAt
            ? [{ label: "Paid on", value: formatStamp(p.paidAt) }]
            : []),
        ],
      },
    ],
  };
};

/* ------------------------------------------------------------------ */
/* PDF (landscape A4, jsPDF)                                            */
/* ------------------------------------------------------------------ */

const downloadPayslipPdf = async (item) => {
  const { jsPDF } = await import("jspdf"); // zaroorat par hi load hoga
  const slip = buildPayslip(item);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth(); // 297
  const H = doc.internal.pageSize.getHeight(); // 210
  const M = 14;

  const ink = [15, 23, 42];
  const muted = [100, 116, 139];
  const line = [203, 213, 225];

  const text = (value, x, y, opts, size, style = "normal", color = ink) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(value, x, y, opts);
  };

  /* Header band */
  doc.setFillColor(...ink);
  doc.rect(0, 0, W, 28, "F");
  text("FieldProof", M, 14, undefined, 18, "bold", [255, 255, 255]);
  text("Payment record", M, 21, undefined, 9, "normal", [148, 163, 184]);
  text("PAYSLIP", W - M, 14, { align: "right" }, 16, "bold", [255, 255, 255]);
  text(
    `Generated ${formatDate(new Date())}`,
    W - M,
    21,
    { align: "right" },
    9,
    "normal",
    [148, 163, 184]
  );

  /* Left summary card */
  const cardX = M;
  const cardY = 38;
  const cardW = 84;
  const cardH = 118;
  const pad = 7;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...line);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, "FD");

  text("TOTAL PAYMENT", cardX + pad, cardY + 12, undefined, 8, "bold", muted);
  text(formatMoney(slip.total), cardX + pad, cardY + 23, undefined, 20, "bold");

  // Status pill
  const statusLabel = slip.paid ? "PAID" : "UNPAID";
  const pillColor = slip.paid ? [220, 252, 231] : [254, 243, 199];
  const pillText = slip.paid ? [22, 101, 52] : [146, 64, 14];
  doc.setFillColor(...pillColor);
  doc.roundedRect(cardX + pad, cardY + 29, 24, 7, 2, 2, "F");
  text(statusLabel, cardX + pad + 12, cardY + 33.8, { align: "center" }, 8, "bold", pillText);

  doc.setDrawColor(...line);
  doc.line(cardX + pad, cardY + 44, cardX + cardW - pad, cardY + 44);

  text("TASK", cardX + pad, cardY + 53, undefined, 8, "bold", muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const titleLines = doc.splitTextToSize(slip.title, cardW - pad * 2).slice(0, 3);
  text(titleLines, cardX + pad, cardY + 60, undefined, 11, "bold");

  text("CALCULATION", cardX + pad, cardY + 90, undefined, 8, "bold", muted);
  text(slip.calculation, cardX + pad, cardY + 97, undefined, 11, "normal");
  text("hourly rate × working hours", cardX + pad, cardY + 103, undefined, 8, "normal", muted);

  /* Right: detail sections in two columns */
  const gap = 10;
  const left = cardX + cardW + gap;
  const colW = (W - M - left - gap) / 2;

  const drawSection = (section, x, y) => {
    text(section.title, x, y, undefined, 10.5, "bold");
    doc.setDrawColor(...line);
    doc.line(x, y + 2.2, x + colW, y + 2.2);

    let cy = y + 10;
    section.rows.forEach((row) => {
      doc.setFont("helvetica", row.strong ? "bold" : "normal");
      doc.setFontSize(row.strong ? 10 : 9);
      const lines = doc.splitTextToSize(String(row.value || "N/A"), colW * 0.6);
      text(row.label, x, cy, undefined, 9, "normal", muted);
      text(
        lines,
        x + colW,
        cy,
        { align: "right" },
        row.strong ? 10 : 9,
        row.strong ? "bold" : "normal"
      );
      cy += Math.max(1, lines.length) * 4.3 + 4.2;
    });

    return cy + 4;
  };

  const [taskInfo, breakdown, approver, record] = slip.sections;
  const col1 = left;
  const col2 = left + colW + gap;

  const afterTask = drawSection(taskInfo, col1, cardY + 4);
  drawSection(approver, col1, afterTask + 2);

  const afterBreakdown = drawSection(breakdown, col2, cardY + 4);
  drawSection(record, col2, afterBreakdown + 2);

  /* Footer */
  doc.setDrawColor(...line);
  doc.line(M, H - 18, W - M, H - 18);
  text(
    "This payslip is generated by FieldProof.",
    W / 2,
    H - 11,
    { align: "center" },
    8,
    "normal",
    muted
  );

  const slug = slip.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  doc.save(`payslip-${slug || "task"}-${String(slip.id || "").slice(-6)}.pdf`);
};

const runDownload = async (item) => {
  try {
    await downloadPayslipPdf(item);
  } catch (error) {
    console.error("Payslip PDF error:", error);
    toast.error("Could not create the PDF. Please try again.");
  }
};

/* ------------------------------------------------------------------ */
/* Small Components                                                    */
/* ------------------------------------------------------------------ */

function MessageText({ text, open, onToggle }) {
  const isLong = text.length > LONG_MESSAGE;

  return (
    <div className="min-w-0">
      <p
        className={`break-words text-sm leading-relaxed text-slate-300 ${
          open || !isLong ? "" : "line-clamp-2"
        }`}
      >
        {text}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={`mt-1.5 rounded text-xs font-medium text-sky-400 hover:text-sky-300 ${focusRing}`}
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function StatusBadge({ kind }) {
  const config = KINDS[kind];
  const Icon = kind === "approved" ? CheckCircle2 : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.badgeStyle}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.badge}
    </span>
  );
}

function DetailRow({ label, value, strong }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-sm text-slate-500">{label}</span>
      <span
        className={`min-w-0 break-words text-right text-sm ${
          strong ? "font-bold text-sky-400" : "font-medium text-slate-200"
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

function DownloadIconButton({ item }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    await runDownload(item);
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label="Download payslip as PDF"
      title="Download PDF"
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50 ${focusRing}`}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Payslip modal (landscape)                                           */
/* ------------------------------------------------------------------ */

function PayslipModal({ item, onClose }) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item?.payslip) return null;

  const slip = buildPayslip(item);

  const handleDownload = async () => {
    setDownloading(true);
    await runDownload(item);
    setDownloading(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payslip-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-slate-800 bg-[#0c1220] shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 id="payslip-title" className="font-semibold text-white">
                Payslip
              </h2>
              <p className="text-xs text-slate-500">FieldProof payment record</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close payslip"
            className={`rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white ${focusRing}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Landscape body: summary on the left, details on the right */}
        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-slate-800 bg-[#0a0f1a] p-6 md:border-b-0 md:border-r">
            <p className="text-xs font-medium text-slate-500">Total payment</p>
            <p className="mt-2 break-words text-3xl font-bold tracking-tight text-white">
              {formatMoney(slip.total)}
            </p>

            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                slip.paid
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }`}
            >
              {slip.paid ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
              {slip.paid ? "Paid" : "Unpaid"}
            </span>

            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="text-xs font-medium text-slate-500">Task</p>
              <p className="mt-1.5 break-words text-sm font-semibold text-white">
                {slip.title}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium text-slate-500">Calculation</p>
              <p className="mt-1.5 text-sm font-medium text-slate-200">
                {slip.calculation}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                hourly rate × working hours
              </p>
            </div>
          </aside>

          <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2">
            {slip.sections.map(({ title, icon: Icon, rows }) => (
              <section key={title} className="min-w-0">
                <div className="mb-1 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Icon className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                </div>
                <div className="divide-y divide-slate-800/70">
                  {rows.map((row) => (
                    <DetailRow key={row.label} {...row} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-center text-[11px] text-slate-600 sm:text-left">
            This payslip is generated by FieldProof.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`h-10 flex-1 rounded-xl border border-slate-700 bg-slate-800/60 px-5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 sm:flex-none ${focusRing}`}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-60 sm:flex-none ${focusRing}`}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile Card                                                         */
/* ------------------------------------------------------------------ */

function ReviewCard({ item, openId, toggleMessage, onViewPayslip }) {
  const kind = KINDS[item.kind];
  const person = item[kind.person];
  const id = rowId(item);
  const open = openId === id;
  const hasPayslip = item.kind === "approved" && item.payslip;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1220]">
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-sm font-semibold text-white">
              {item.task?.title || "Untitled task"}
            </h3>
            <p className="mt-1 font-mono text-[10px] text-slate-600">
              #{item.task?._id?.slice(-8) || "N/A"}
            </p>
          </div>
          <StatusBadge kind={item.kind} />
        </div>

        <div className="flex items-start gap-3">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200">
              {person?.name || "Unknown"}
            </p>
            <p className="break-all text-xs text-slate-500">
              {person?.email || "No email"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-4 w-4" />
          {formatStamp(item.createdAt)}
        </div>

        <div className="border-t border-slate-800 pt-3">
          <p className="mb-2 text-xs font-medium text-slate-500">
            {kind.messageLabel}
          </p>
          <MessageText
            text={item.message || kind.noMessage}
            open={open}
            onToggle={() => toggleMessage(id)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-800 bg-[#0a0f1a] p-3">
        {hasPayslip ? (
          <>
            <button
              type="button"
              onClick={() => onViewPayslip(item)}
              className={`flex h-9 flex-1 items-center justify-between gap-2 rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 text-xs font-semibold text-sky-400 transition hover:bg-sky-500/15 ${focusRing}`}
            >
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                View payslip
              </span>
              <span className="text-slate-300">
                {formatMoney(item.payslip.totalAmount)}
              </span>
            </button>
            <DownloadIconButton item={item} />
          </>
        ) : (
          <p className="w-full text-center text-xs text-slate-600">
            No payslip available
          </p>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */

function ReviewedTasks() {
  const { myApprovedTasks, myRejectedTasks, isLoading } = useContext(context);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const approved = Array.isArray(myApprovedTasks) ? myApprovedTasks : [];
  const rejected = Array.isArray(myRejectedTasks) ? myRejectedTasks : [];

  const all = [
    ...approved.map((item) => ({ ...item, kind: "approved" })),
    ...rejected.map((item) => ({ ...item, kind: "rejected" })),
  ];

  const counts = {
    all: all.length,
    approved: approved.length,
    rejected: rejected.length,
  };

  const text = search.trim().toLowerCase();

  const matching = all
    .filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;

      const person = item[KINDS[item.kind].person];
      const searchable = `${item.task?.title || ""} ${person?.name || ""} ${
        person?.email || ""
      } ${item.message || ""}`;

      return searchable.toLowerCase().includes(text);
    })
    .sort((a, b) => (newestFirst ? timeOf(b) - timeOf(a) : timeOf(a) - timeOf(b)));

  const rows = matching.slice(0, limit);

  const changeFilter = (id) => {
    setFilter(id);
    setLimit(PAGE_SIZE);
  };

  const toggleMessage = (id) => setOpenId((current) => (current === id ? null : id));

  if (isLoading) {
    return (
      <LoadingState
        message="Loading reviewed tasks"
        subtext="Syncing your review history"
      />
    );
  }

  return (
    <div className="min-h-screen min-w-0 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Reviewed tasks
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your approved and rejected task history, with payslips.
          </p>
        </header>

        {/* Filter tiles */}
        <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-4">
          {TILES.map(({ id, label, icon: Icon }) => {
            const active = filter === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => changeFilter(id)}
                aria-pressed={active}
                className={`min-w-0 rounded-2xl border p-3 text-left transition sm:p-4 ${focusRing} ${
                  active
                    ? "border-sky-500/40 bg-sky-500/[0.07]"
                    : "border-slate-800 bg-[#0c1220] hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active ? "text-sky-400" : "text-slate-500"
                    }`}
                  />
                  <span className="truncate text-[11px] font-medium text-slate-500 sm:text-xs">
                    {label}
                  </span>
                </div>
                <p className="mt-2 text-xl font-semibold tabular-nums text-white sm:text-2xl">
                  {counts[id]}
                </p>
              </button>
            );
          })}
        </div>

        {/* Search and sort */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="Search task, person or message"
              aria-label="Search tasks"
              className={inputClass}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-xs text-slate-500">
              {matching.length} {matching.length === 1 ? "result" : "results"}
            </p>
            <button
              type="button"
              onClick={() => setNewestFirst((current) => !current)}
              className={`flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-[#0c1220] px-4 text-xs font-medium text-slate-300 transition hover:border-slate-700 ${focusRing}`}
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {newestFirst ? "Newest first" : "Oldest first"}
            </button>
          </div>
        </div>

        {/* Results */}
        {matching.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] px-5 py-16 text-center">
            <ClipboardList className="mx-auto mb-3 h-7 w-7 text-slate-600" />
            <p className="text-sm font-semibold text-slate-200">
              {all.length === 0 ? "No reviewed tasks yet" : "No tasks found"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {all.length === 0
                ? "Approved and rejected tasks will appear here."
                : "Try a different search or filter."}
            </p>
            {all.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  changeFilter("all");
                }}
                className="mt-4 text-xs font-medium text-sky-400 hover:text-sky-300"
              >
                Clear search and filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-3 lg:hidden">
              {rows.map((item) => (
                <ReviewCard
                  key={rowId(item)}
                  item={item}
                  openId={openId}
                  toggleMessage={toggleMessage}
                  onViewPayslip={setSelectedPayslip}
                />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1220] lg:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-800 bg-[#0a0f1a] text-xs font-medium text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Task</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Reviewed by</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Message / reason</th>
                      <th className="px-5 py-3.5">Payslip</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/70">
                    {rows.map((item) => {
                      const kind = KINDS[item.kind];
                      const person = item[kind.person];
                      const id = rowId(item);
                      const hasPayslip = item.kind === "approved" && item.payslip;

                      return (
                        <tr
                          key={id}
                          className="align-top transition hover:bg-white/[0.02]"
                        >
                          <td className="max-w-[190px] px-5 py-4">
                            <p className="break-words font-medium text-white">
                              {item.task?.title || "Untitled task"}
                            </p>
                            <p className="mt-1 font-mono text-[10px] text-slate-600">
                              #{item.task?._id?.slice(-8) || "N/A"}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge kind={item.kind} />
                          </td>

                          <td className="max-w-[180px] px-4 py-4">
                            <p className="break-words font-medium text-slate-200">
                              {person?.name || "Unknown"}
                            </p>
                            <p className="mt-1 break-all text-xs text-slate-500">
                              {person?.email || "No email"}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            <p className="text-slate-300">{formatDate(item.createdAt)}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatTime(item.createdAt)}
                            </p>
                          </td>

                          <td className="max-w-sm px-4 py-4">
                            <MessageText
                              text={item.message || kind.noMessage}
                              open={openId === id}
                              onToggle={() => toggleMessage(id)}
                            />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            {hasPayslip ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPayslip(item)}
                                  className={`inline-flex h-9 items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 text-xs font-medium text-sky-400 transition hover:bg-sky-500/15 ${focusRing}`}
                                >
                                  <Receipt className="h-3.5 w-3.5" />
                                  View
                                </button>
                                <DownloadIconButton item={item} />
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Pagination */}
        {matching.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0c1220] px-4 py-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-300">{rows.length}</span> of{" "}
              {matching.length} tasks
            </p>

            {rows.length < matching.length && (
              <button
                type="button"
                onClick={() => setLimit((current) => current + PAGE_SIZE)}
                className={`rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 ${focusRing}`}
              >
                Show more
              </button>
            )}
          </div>
        )}
      </div>

      {selectedPayslip && (
        <PayslipModal
          item={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
}

export default ReviewedTasks;