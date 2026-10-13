import {useContext} from "react";
import {context} from "../../context/context.jsx";

function Pending() {
  const {user} = useContext(context);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07111F] px-4 py-10 text-white">

      <div className="w-full max-w-md rounded-2xl border border-[#233753] bg-[#0D1B2E] p-6 shadow-2xl shadow-black/20 sm:p-8">

        {/* Status Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-400"
          >
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Request Pending
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Your request has been successfully submitted
            and is awaiting admin approval.
          </p>
        </div>

        {/* Status Badge */}
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1.5 text-sm font-medium text-amber-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            {
              user?.role === "pending_manager" ? "Pending" : "Approved"
            }
          </span>
        </div>

        {/* Divider */}
        <div className="my-7 border-t border-[#233753]" />

        {/* Information */}
        <div className="rounded-xl border border-[#233753] bg-[#091525] p-4">
          <div className="flex items-start gap-3">

            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>

            <div>
              <h2 className="text-sm font-medium text-slate-200">
                What happens next?
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-slate-400">
                Our administrator will review your request.
                You will be notified once it has been approved.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Thank you for your patience.
        </p>

      </div>
    </div>
  );
}

export default Pending;
