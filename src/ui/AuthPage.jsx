
import { useState, useContext } from "react";
import useAuth from "../hooks/useAuth";
import { context } from "../context/context.jsx";
import feildproofLogo from "../assets/fieldproof-logo.png";

import {
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
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import LoadingState from "../ui/LoadingState.jsx";

/* -------------------------------------------------- */
/* Settings                                           */
/* -------------------------------------------------- */

const MANAGER_REQUEST_ROLE = "pending_manager";

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
};

const MODES = {
  login: {
    tab: "Sign in",
    icon: LogIn,
    title: "Welcome back",
    text: "Sign in to continue to your workspace.",
    button: "Sign in to account",
    fields: ["email", "password"],
    successText: "",
  },

  signup: {
    tab: "Register",
    icon: UserPlus,
    title: "Create your account",
    text: "Register as a worker. A manager can invite you to their team later.",
    button: "Create account",
    fields: ["name", "email", "password"],
    successText: "Registration successful. You can sign in now.",
  },

  managerRequest: {
    tab: "Manager request",
    icon: UserCog,
    title: "Request manager access",
    text: "Create your account and request manager access.",
    button: "Create account and request access",
    fields: ["name", "email", "password"],
    successText:
      "Your account was created and your manager request was sent. An admin will review it.",
    info: "An admin reviews every manager request before access is given.",
  },
};

const FEATURES = [
  {
    icon: MapPin,
    title: "GPS geo-fencing",
    text: "Check-ins count only inside the site radius.",
  },
  {
    icon: Camera,
    title: "Live verification",
    text: "Photo and attendance proof on every visit.",
  },
  {
    icon: Receipt,
    title: "Automated invoicing",
    text: "Tracked hours turn into clear billing.",
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
};

const inputClass =
  "h-12 w-full rounded-xl border border-slate-800 bg-[#090f1b] pl-11 pr-11 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-all duration-200 hover:border-slate-700 focus:border-sky-500/70 focus:ring-4 focus:ring-sky-500/10";

/* -------------------------------------------------- */
/* Logo                                               */
/* -------------------------------------------------- */

function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={feildproofLogo}
        alt="FieldProof Logo"
        className={compact ? "h-14 w-auto object-contain" : "h-16 w-auto object-contain"}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/* Input Field                                        */
/* -------------------------------------------------- */

function Field({
  id,
  label,
  icon: Icon,
  type = "text",
  hint,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-semibold tracking-wide text-slate-400"
      >
        {label}
        <span className="ml-1 text-rose-400">*</span>
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-500 transition-colors" />

        <input
          id={id}
          required
          type={isPassword && visible ? "text" : type}
          className={inputClass}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
          >
            {visible ? (
              <EyeOff size={17} />
            ) : (
              <Eye size={17} />
            )}
          </button>
        )}
      </div>

      {hint && (
        <p className="text-xs leading-relaxed text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* Notice                                             */
/* -------------------------------------------------- */

function Notice({ notice }) {
  if (!notice) return null;

  const success = notice.type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
          : "border-rose-500/20 bg-rose-500/10 text-rose-200"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />

      <p className="leading-relaxed">
        {notice.text}
      </p>
    </div>
  );
}

/* -------------------------------------------------- */
/* Feature Panel                                       */
/* -------------------------------------------------- */

function FeaturePanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-sky-950/40 via-[#0c1220] to-[#080d17] p-9 lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          maskImage:
            "radial-gradient(ellipse at top left, black 10%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at top left, black 10%, transparent 75%)",
        }}
      />

      <div className="relative">
        <Logo />

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-[11px] font-semibold text-sky-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          WORKFORCE MANAGEMENT PLATFORM
        </div>

        <h1 className="mt-6 text-3xl font-bold leading-[1.25] tracking-tight text-white xl:text-4xl">
          Work smarter.
          <span className="block text-sky-400">
            Verify everything.
          </span>
        </h1>

        <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
          Manage field teams, track attendance and keep every
          work operation transparent with FieldProof.
        </p>

        <div className="mt-9 space-y-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-[#0a101c]/70 p-4 transition duration-300 hover:border-sky-500/30 hover:bg-sky-500/[0.04]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400 transition group-hover:scale-105">
                <Icon size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {title}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-8 flex items-center justify-between border-t border-slate-800/80 pt-5">
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} FieldProof
        </p>

        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck size={13} className="text-emerald-400" />
          Secure workspace
        </span>
      </div>
    </aside>
  );
}

/* -------------------------------------------------- */
/* Auth Page                                          */
/* -------------------------------------------------- */

function AuthPage() {
  const { isLoading } = useContext(context);
  const { register, login } = useAuth();

  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const mode = MODES[authMode];

  const isLogin = authMode === "login";

  const handleChange = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const switchMode = (key) => {
    setAuthMode(key);
    setNotice(null);
    setForm((prev) => ({
      ...prev,
      password: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    const values = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    const hasEmptyField = mode.fields.some(
      (key) => !values[key]
    );

    if (hasEmptyField) {
      setNotice({
        type: "error",
        text: "Please fill in all the fields.",
      });
      return;
    }

    setLoading(true);

    try {
      if (authMode === "login") {
        await login(values.email, values.password);
      }

      if (authMode === "signup") {
        await register(
          values.name,
          values.email,
          values.password
        );
      }

      if (authMode === "managerRequest") {
        await register(
          values.name,
          values.email,
          values.password,
          MANAGER_REQUEST_ROLE
        );
      }

      if (mode.successText) {
        setNotice({
          type: "success",
          text: mode.successText,
        });

        setForm(EMPTY_FORM);
      }
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#070a12] px-4 py-6 text-slate-100 sm:px-6">

      {/* Background effects */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-600/[0.08] blur-[110px]" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/[0.08] blur-[110px]" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-900/[0.04] blur-[120px]" />
      </div>

      {/* Main card */}

      <div
        className={`relative grid w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0c1220] shadow-2xl shadow-black/50 ${
          isLogin
            ? "max-w-md"
            : "max-w-5xl lg:grid-cols-[0.95fr_1.05fr]"
        }`}
      >

        {/* Login gets compact layout.
            Signup and manager request retain feature panel. */}

        {!isLogin && <FeaturePanel />}

        {/* Form section */}

        <main
          className={`flex min-w-0 flex-col justify-center ${
            isLogin
              ? "p-5 sm:p-8"
              : "p-5 sm:p-9 lg:p-10"
          }`}
        >
          <div className="mx-auto w-full max-w-md">

            {/* Compact login logo */}

            {isLogin && (
              <div className="mb-5 flex flex-col items-center text-center">
                <Logo compact />

                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">
                  <Sparkles size={12} />
                  Workforce platform
                </div>
              </div>
            )}

            {/* Mobile logo for signup / manager request */}

            {!isLogin && (
              <div className="mb-6 lg:hidden">
                <Logo />
              </div>
            )}

            {/* Tabs */}

            <div
              role="tablist"
              aria-label="Account options"
              className="mb-6 grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-[#080e19] p-1"
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
                    className={`flex min-h-10 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-center text-[10px] font-semibold leading-tight transition sm:flex-row sm:gap-2 sm:px-2 sm:text-xs ${
                      active
                        ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                        : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <TabIcon size={15} className="shrink-0" />
                    {item.tab}
                  </button>
                );
              })}
            </div>

            {/* Heading */}

            <div className="mb-5 space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {mode.title}
              </h2>

              <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
                {mode.text}
              </p>
            </div>

            {/* Form */}

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

              {/* Manager info */}

              {mode.info && (
                <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] px-4 py-3 text-xs leading-relaxed text-sky-200">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p>{mode.info}</p>
                </div>
              )}

              {/* Notice */}

              <div aria-live="polite">
                <Notice notice={notice} />
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition duration-300 hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-500 hover:shadow-sky-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1220] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode.button}
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Switch account */}

            <div className="mt-5 border-t border-slate-800/70 pt-5">
              <p className="text-center text-xs text-slate-500 sm:text-sm">
                {authMode === "login" ? (
                  <>
                    New to FieldProof?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-semibold text-sky-400 transition hover:text-sky-300"
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
                      className="font-semibold text-sky-400 transition hover:text-sky-300"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Security footer */}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-600">
              <Lock size={11} />
              Secure access to your FieldProof workspace
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthPage;
