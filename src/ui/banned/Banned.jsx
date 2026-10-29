import { Ban, LogOut, ShieldAlert, Mail } from "lucide-react";

const Banned = ({
  onLogout,
  supportEmail = "https://muhammadhussainmemon.vercel.app/#contact",
}) => {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-[2000] flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-[#0b0f17] px-4 py-10 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/[0.06] blur-[100px]"
      />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10">
          <Ban className="h-8 w-8 text-red-400" strokeWidth={1.8} />
        </div>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          ACCOUNT SUSPENDED
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Access restricted
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
          Your account has been banned by an administrator. You cannot use the
          dashboard while this restriction is active.
        </p>

        {/* Notice */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-4 text-left">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Need help?</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                If you believe this was a mistake, contact support to request a
                review of your account.
              </p>
            </div>
          </div>
        </div>

        {/* Contact support */}
        <a
          href={supportEmail}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 text-sm font-medium text-slate-200 transition hover:border-sky-500/40 hover:bg-slate-700"
        >
          <Mail className="h-4 w-4" />
          Contact support
        </a>

        {/* Logout */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        )}

        <p className="mt-6 text-xs text-slate-600">
          Account security · Access control
        </p>
      </div>
    </div>
  );
};

export default Banned;