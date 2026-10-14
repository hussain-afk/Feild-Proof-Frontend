
import { Ban, LogOut, ShieldAlert, Mail } from "lucide-react";

const Banned = ({ onLogout, supportEmail = "https://muhammadhussainmemon.vercel.app/#contact" }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f17] px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 text-center shadow-2xl shadow-black/20 sm:p-8">
          {/* Ban icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <Ban className="h-10 w-10 text-red-400" />
          </div>

          {/* Status */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            ACCOUNT SUSPENDED
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Access Restricted
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
            Your account has been banned by an administrator.
            You cannot access the dashboard while this restriction
            is active.
          </p>

          {/* Notice */}
          <div className="mt-6 flex gap-3 rounded-xl border border-slate-800 bg-[#0b1220] p-4 text-left">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

            <div>
              <p className="text-sm font-medium text-slate-200">
                Need help?
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                If you believe this action was a mistake, contact
                support to request a review of your account.
              </p>
            </div>
          </div>

          {/* Contact support */}
          <a
            href={supportEmail}
            target="_blank"
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-200 transition hover:border-sky-500/40 hover:bg-slate-700"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>

          {/* Logout */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          )}

          <p className="mt-6 text-xs text-slate-600">
            Account Security · Access Control
          </p>
        </div>
      </div>
    </div>
  );
};

export default Banned;
