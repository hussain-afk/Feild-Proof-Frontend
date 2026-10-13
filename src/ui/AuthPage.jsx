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
  LogIn,
  UserPlus,
  UserCog,
  ArrowRight,
  Info,
} from "lucide-react";

import LoadingState from "../ui/LoadingState.jsx";

/* ------------------------------------------------------------------ */
/* Settings (edit the texts here)                                       */
/* ------------------------------------------------------------------ */

// The role sent to the backend when someone asks for manager access
const MANAGER_REQUEST_ROLE = "pending_manager";

// Every field of the form. A field shown on the page is ALWAYS required.
const FIELDS = {
  name: {
    label: "Full name",
    icon: User,
    type: "text",
    placeholder: "Your full name",
    autoComplete: "name",
  },
  email: {
    label: "Email address",
    icon: Mail,
    type: "email",
    placeholder: "name@company.com",
    autoComplete: "email",
  },
  password: {
    label: "Password",
    icon: Lock,
    type: "password",
    placeholder: "Enter your password",
  },
  managerId: {
    label: "Manager ID",
    icon: ShieldCheck,
    type: "text",
    placeholder: "Enter your manager's ID",
    autoComplete: "off",
    hint: "Ask your manager for this ID.",
  },
};

// The three tabs. `fields` = which inputs the tab shows (all of them are required).
const MODES = {
  login: {
    tab: "Sign in",
    icon: LogIn,
    title: "Welcome back",
    text: "Sign in to open your dashboard.",
    button: "Sign in",
    fields: ["email", "password"],
    successText: "", // nothing to show: after login the app opens the dashboard
  },
  signup: {
    tab: "Register",
    icon: UserPlus,
    title: "Create your account",
    text: "Register to join an existing manager's team.",
    button: "Create account",
    fields: ["name", "email", "password", "managerId"],
    successText: "Registration submitted successfully.",
  },
  managerRequest: {
    tab: "Manager request",
    icon: UserCog,
    title: "Request manager access",
    text: "Create your account and request manager access.",
    button: "Create account and request access",
    fields: ["name", "email", "password"],
    successText: "Your account was created and your manager request was sent. An admin will review it.",
    info: "An admin reviews every manager request before access is given.",
  },
};

const FEATURES = [
  { icon: MapPin, title: "GPS geo-fencing", text: "Check-ins count only inside the site radius." },
  { icon: Camera, title: "Live verification", text: "Photo and attendance proof on every visit." },
  { icon: Receipt, title: "Automated invoicing", text: "Tracked hours turn into clear billing." },
];

const EMPTY_FORM = { name: "", email: "", password: "", managerId: "" };

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080e19] pl-11 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition hover:border-white/20 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20";

/* ------------------------------------------------------------------ */
/* Small components                                                     */
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

// One input with its label. It is always required.
function Field({ id, label, icon: Icon, type = "text", hint, ...inputProps }) {
  const [visible, setVisible] = useState(false); // only used by password fields
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
        <span aria-hidden="true" className="ml-0.5 text-red-400">
          *
        </span>
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
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:text-slate-200"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// Green (success) or red (error) message
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
  const { register, login } = useAuth();

  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  const mode = MODES[authMode];

  // Typing in a field: update only that field
  const handleChange = (key) => (event) => {
    setForm((previous) => ({ ...previous, [key]: event.target.value }));
  };

  // Changing the tab: clear the message and the password, keep name and email
  const switchMode = (key) => {
    setAuthMode(key);
    setNotice(null);
    setForm((previous) => ({ ...previous, password: "", managerId: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    // Clean values (extra spaces removed)
    const values = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      managerId: form.managerId.trim(),
    };

    // Every field of this tab must have a value (this also catches "   " spaces only)
    const hasEmptyField = mode.fields.some((key) => !values[key]);
    if (hasEmptyField) {
      setNotice({ type: "error", text: "Please fill in all the fields." });
      return;
    }

    setLoading(true);

    try {
      if (authMode === "login") {
        await login(values.email, values.password);
      }

      if (authMode === "signup") {
        // Your useAuth register function must accept managerId as its 5th argument
        await register(values.name, values.email, values.password, undefined, values.managerId);
      }

      if (authMode === "managerRequest") {
        await register(values.name, values.email, values.password, MANAGER_REQUEST_ROLE);
      }

      if (mode.successText) {
        setNotice({ type: "success", text: mode.successText });
        setForm(EMPTY_FORM);
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
      {/* Background glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d1422] shadow-[0_30px_90px_rgba(0,0,0,0.5)] lg:grid-cols-[1fr_1.1fr]">
        {/* ================= Left: branding (big screens only) ================= */}
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

            <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              Live attendance verification
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white">
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
                  className="flex items-start gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-blue-500/30 hover:bg-white/[0.05]"
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

        {/* ================= Right: form ================= */}
        <main className="p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            {/* Logo (small screens only) */}
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Account options"
              className="mb-8 grid grid-cols-3 gap-1 rounded-xl border border-white/[0.07] bg-[#080e19] p-1"
            >
              {Object.entries(MODES).map(([key, item]) => {
                const TabIcon = item.icon;
                const active = authMode === key;

                return (
                  <button
                    key={key}
                    id={`tab-${key}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="auth-form"
                    onClick={() => switchMode(key)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-center text-xs font-medium leading-tight transition sm:flex-row sm:gap-2 sm:px-2 sm:py-2.5 sm:text-sm ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <TabIcon className="h-4 w-4 shrink-0" />
                    {item.tab}
                  </button>
                );
              })}
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold leading-snug tracking-tight text-white">{mode.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{mode.text}</p>
            </div>

            {/* Form: it shows the fields of the active tab, and all of them are required */}
            <form
              id="auth-form"
              role="tabpanel"
              aria-labelledby={`tab-${authMode}`}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode.fields.map((key) => (
                <Field
                  key={key}
                  id={`auth-${key}`}
                  {...FIELDS[key]}
                  autoComplete={
                    key === "password"
                      ? authMode === "login"
                        ? "current-password"
                        : "new-password"
                      : FIELDS[key].autoComplete
                  }
                  value={form[key]}
                  onChange={handleChange(key)}
                />
              ))}

              {/* Extra information for this tab (if any) */}
              {mode.info && (
                <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3.5 py-3 text-sm text-blue-200">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{mode.info}</p>
                </div>
              )}

              <div aria-live="polite">
                <Notice notice={notice} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1422] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode.button}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Switch between sign in and register */}
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