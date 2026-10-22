import { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 bg-[#070a12]/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`modal-panel relative z-10 flex w-full ${maxWidth} max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220] shadow-2xl shadow-black/40`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-800/80 bg-[#0a0f1a]/60 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h3
                id="modal-title"
                className="text-base font-semibold tracking-tight text-white sm:text-lg"
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/60 text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5 text-sm text-slate-200 sm:px-6">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-backdrop {
          animation: modalFadeIn 0.2s ease-out forwards;
        }
        .modal-panel {
          animation: modalScaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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