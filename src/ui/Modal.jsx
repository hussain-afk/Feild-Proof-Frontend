
import { useEffect } from "react";
import { X, Command } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "w-full",
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="modal-backdrop absolute inset-0 bg-[#030712]/95"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* MODAL CONTAINER */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`modal-panel relative flex h-[100dvh] w-full ${maxWidth} flex-col overflow-hidden border border-white/[0.06] bg-[#080e19] shadow-2xl shadow-black/50`}
      >

        {/* TOP ACCENT */}
        <div className="absolute left-0 right-0 top-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

        {/* HEADER */}
        <header className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0b1220]/95 px-5 py-4 sm:px-8 sm:py-5">

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">

            {/* ICON */}
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-300 sm:flex">
              <Command size={19} />
            </div>

            {/* TITLE */}
            <div className="min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="truncate text-base font-semibold tracking-tight text-white sm:text-lg"
                >
                  {title}
                </h2>
              )}

              {subtitle && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-400 transition-all duration-200 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 active:scale-95"
          >
            <X
              size={19}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </header>

        {/* MODAL BODY */}
        <main className="custom-scrollbar relative min-h-0 flex-1 overflow-y-auto bg-[#080e19]">

          {/* SUBTLE BACKGROUND GLOW */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[70%] -translate-x-1/2 rounded-full bg-cyan-500/[0.025] blur-3xl" />

          {/* CONTENT */}
          <div className="relative min-h-full px-4 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-8">
            {children}
          </div>
        </main>

        {/* BOTTOM ACCENT */}
        <div className="h-px shrink-0 bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
      </div>

      <style>{`
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalPanelIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-backdrop {
          animation: modalBackdropIn 0.2s ease-out both;
        }

        .modal-panel {
          animation: modalPanelIn 0.24s cubic-bezier(0.2, 0.7, 0.3, 1) both;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #263449 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #263449;
          border-radius: 20px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b506b;
        }

        @media (prefers-reduced-motion: reduce) {
          .modal-backdrop,
          .modal-panel {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;