import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Mail, KeyRound } from "lucide-react";
import Modal from "./Modal.jsx";
import useAuth from "../hooks/useAuth.jsx";

/**
 * Email verification in 2 steps:
 *   Step 1: "Send code" dabao  -> email par 6 digit code jata hai
 *   Step 2: code likho + "Verify" dabao
 * Code wali field aur Verify button tab tak disabled rehte hain jab tak code bhej na diya jaye.
 *
 * Use:
 *   <VerifyEmailModal
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     email={user.email}
 *     onVerified={() => setUser((u) => ({ ...u, isVerified: true }))}
 *   />
 */

const RESEND_SECONDS = 60; // naya code mangne se pehle intezar
const CODE_LENGTH = 6;

const inputClass =
  "w-full h-10 rounded-lg bg-[#0b1220] border border-slate-800 px-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------------------------------------------ */
/* "Code bhej diya gaya" ko yaad rakhna                                  */
/* ------------------------------------------------------------------ */
// Worker code dekhne email app ya doosre tab par jata hai. Wapas aane par page reload ho sakta hai
// (khaas kar phone par), aur React ka state gayab ho jata hai. Isliye code bhejne ka waqt
// browser me save karte hain, taake wapas aane par modal wahin se shuru ho (code wale step se).

const STORAGE_KEY = "fp-email-verification";
const CODE_VALID_MS = 10 * 60 * 1000; // code 10 minute chalta hai

const savePending = (email) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, sentAt: Date.now(), dismissed: false }));

const clearPending = () => localStorage.removeItem(STORAGE_KEY);

/** Is email ke liye bheja hua (aur abhi tak chalne wala) code ka record, warna null */
export const getPendingVerification = (email) => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.email === email && Date.now() - saved.sentAt < CODE_VALID_MS) return saved;
  } catch {
    // kharab data ho to ignore
  }
  return null;
};

/** User ne modal band kar diya: ab khud se na kholo, lekin code yaad rakho */
export const dismissPendingVerification = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, dismissed: true }));
  } catch {
    // ignore
  }
};

// Server ka message ho to wo dikhao, warna apna
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

function VerifyEmailModal({ isOpen, onClose, email, onVerified }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify your email"
      subtitle="We will send a 6 digit code to confirm this email is yours."
    >
      {/* Band hone par form hat jata hai, is liye har baar fresh shuru hota hai */}
      {isOpen && <VerifyForm email={email} onClose={onClose} onVerified={onVerified} />}
    </Modal>
  );
}

function VerifyForm({ email, onClose, onVerified }) {
  const { sendEmailVerificationCode, verifyEmail } = useAuth();

  // Pehle se code bheja hua hai? (jaise page reload ke baad) To seedha step 2 se shuru karo
  const [pending] = useState(() => getPendingVerification(email));

  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(Boolean(pending)); // step 2 tab khulta hai jab code chala jaye
  const [secondsLeft, setSecondsLeft] = useState(() =>
    pending ? Math.max(0, RESEND_SECONDS - Math.floor((Date.now() - pending.sentAt) / 1000)) : 0
  ); // resend ka countdown
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    pending ? `A code was already sent to ${email}. Enter it below, or resend it.` : ""
  );

  // Countdown: har second ek kam
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleSendCode = async () => {
    setError("");
    setInfo("");
    setIsSending(true);

    try {
      await sendEmailVerificationCode(email);
      savePending(email); // wapas aane par yahin se shuru hoga
      setCodeSent(true);
      setSecondsLeft(RESEND_SECONDS);
      setInfo(`We sent a ${CODE_LENGTH} digit code to ${email}. It may take a minute to arrive.`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send the code. Please try again."));
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault(); // page reload na ho
    setError("");
    setIsVerifying(true);

    try {
      await verifyEmail(email, code);
      clearPending();
      onVerified?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Wrong or expired code. Please try again."));
    } finally {
      setIsVerifying(false);
    }
  };

  // Cancel dabane ka matlab: ab verify nahi karna, to yaad rakha hua code bhi hata do
  const handleCancel = () => {
    clearPending();
    onClose();
  };

  const canSend = !isSending && secondsLeft === 0;
  const canVerify = codeSent && code.length === CODE_LENGTH && !isVerifying;

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      {/* ===== Step 1: email aur "Send code" ===== */}
      <div>
        <label htmlFor="verify-email" className="mb-1.5 block text-sm font-medium text-slate-200">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          {/* Sirf aapki apni account wali email verify hoti hai, is liye ye badli nahi ja sakti */}
          <input id="verify-email" type="email" value={email} disabled className={`${inputClass} pl-10`} />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          To verify a different email, change it in your profile and save first.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSendCode}
        disabled={!canSend}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : codeSent ? (
          secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"
        ) : (
          "Send verification code"
        )}
      </button>

      {/* ===== Step 2: code aur "Verify" (code bhejne ke baad khulte hain) ===== */}
      <div className="border-t border-slate-800 pt-4">
        <label htmlFor="verify-code" className="mb-1.5 block text-sm font-medium text-slate-200">
          Verification code
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="verify-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            value={code}
            // Sirf digits chalte hain
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
            placeholder={codeSent ? "Enter the 6 digit code" : "Send the code first"}
            disabled={!codeSent}
            className={`${inputClass} pl-10 font-mono tracking-widest`}
          />
        </div>
      </div>

      {info && !error && (
        <p className="flex items-start gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2.5 text-xs text-sky-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{info}</span>
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!canVerify}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify code"
          )}
        </button>
      </div>
    </form>
  );
}

export default VerifyEmailModal;