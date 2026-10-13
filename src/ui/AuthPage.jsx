import { useState, useContext } from "react";
import useAuth from "../hooks/useAuth";
import { context } from "../context/context.jsx";

import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Camera,
  Receipt,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import LoadingState from "../ui/LoadingState.jsx";

/* ------------------------------------------------------------------ */
/* Tabs. Har tab ke texts yahan hain, kuch badalna ho to sirf yahan     */
/* ------------------------------------------------------------------ */

const MODES = {
  login: {
    tab: "Sign in",
    title: "Welcome back",
    text: "Sign in to open your dashboard.",
    button: "Sign in",
    showName: false,
  },
  signup: {
    tab: "Register",
    title: "Create your account",
    text: "Register to manage and track field tasks.",
    button: "Create account",
    showName: true,
  },
  managerRequest: {
    tab: "Manager request",
    title: "Create your account and request manager access",
    text: "Register as usual. An admin reviews every request before manager access is given.",
    button: "Create account and request access",
    showName: true,
  },
};

const FEATURES = [
  { icon: MapPin, title: "GPS geo-fencing", text: "Check-ins count only inside the site radius." },
  { icon: Camera, title: "Live verification", text: "Photo and attendance proof on every visit." },
  { icon: Receipt, title: "Automated invoicing", text: "Tracked hours turn into clear billing." },
];

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080e19] pl-11 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20";

/* ------------------------------------------------------------------ */
/* Chhote components                                                    */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <p className="text-lg font-bold tracking-tight text-white">
          Field<span className="text-blue-500">Proof</span>
        </p>
        <p className="text-xs text-slate-500">Workforce platform</p>
      </div>
    </div>
  );
}

// Label + icon + input. type="password" ho to show/hide ki eye bhi aati hai
function Field({ id, label, icon: Icon, type = "text", ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          required
          type={isPassword && visible ? "text" : type}
          className={`${inputClass} ${isPassword ? "pr-12" : ""}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:text-slate-200"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// Error ya kamyabi ka message
function Notice({ notice }) {
  if (!notice) return null;

  const success = notice.type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${
        success
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          : "border-red-500/30 bg-red-500/10 text-red-200"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{notice.text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function AuthPage() {
  const { isLoading } = useContext(context);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("pending_manager"); // Default role for new users

  const [authMode, setAuthMode] = useState("login"); // "login" | "signup" | "managerRequest"
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  // requestManager: manager request bhejne ka function. useAuth me hona chahiye
  const { register, login } = useAuth();

  const mode = MODES[authMode];

  const switchMode = (key) => {
    setAuthMode(key);
    setNotice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      if (authMode === "login") {
        await login(email, password);
      } else if (authMode === "signup") {
        await register(name, email, password);
      } else {
        await register(name, email, password, role); // Pass the role for manager request
        setNotice({
          type: "success",
          text: "Your account was created and your manager request was sent. An admin will review it.",
        });
      }
    } catch (error) {
      setNotice({
        type: "error",
        text: error?.response?.data?.message || error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#070b14] px-4 py-8 text-slate-100">
      {/* Peeche halki roshni */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d1422] shadow-[0_30px_90px_rgba(0,0,0,0.5)] lg:grid-cols-[1fr_1.1fr]">
        {/* =============== Left: brand (sirf bari screen par) =============== */}
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-gradient-to-br from-blue-950/60 via-[#0d1422] to-[#080c15] p-10 lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              maskImage: "radial-gradient(ellipse at top left, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at top left, black 20%, transparent 70%)",
            }}
          />

          <div className="relative">
            <Logo />

            <h1 className="mt-12 text-3xl font-bold leading-tight tracking-tight text-white">
              Work verification and
              <span className="block text-slate-300">automated invoicing</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
              Real-time attendance, GPS geo-fenced logs and automated invoicing for your field teams.
            </p>

            <ul className="mt-9 space-y-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-10 text-xs text-slate-600">
            &copy; {new Date().getFullYear()} FieldProof. All rights reserved.
          </p>
        </aside>

        {/* =============== Right: form =============== */}
        <main className="p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            {/* Chhoti screen par logo yahan aata hai */}
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Account options"
              className="mb-8 grid grid-cols-3 gap-1 rounded-xl border border-white/[0.07] bg-[#080e19] p-1"
            >
              {Object.entries(MODES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={authMode === key}
                  onClick={() => switchMode(key)}
                  className={`rounded-lg px-2 py-2.5 text-sm font-medium transition ${
                    authMode === key
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {item.tab}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold leading-snug tracking-tight text-white">{mode.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{mode.text}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode.showName && (
                <Field
                  id="auth-name"
                  label="Full name"
                  icon={User}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              )}

              <Field
                id="auth-email"
                label="Email address"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
              />

              <Field
                id="auth-password"
                label="Password"
                icon={Lock}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
              />

              <div aria-live="polite">
                <Notice notice={notice} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1422] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  mode.button
                )}
              </button>
            </form>

            {/* Doosre tab par jane ka link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              {authMode === "login" ? (
                <>
                  New to FieldProof?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-blue-400 transition hover:text-blue-300"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-medium text-blue-400 transition hover:text-blue-300"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-600">
              <Lock className="h-3 w-3" />
              Secure access to your FieldProof workspace
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthPage;