import React, { useState, useContext } from "react";
import useAuth from "../hooks/useAuth";
import { context } from "../context/context.jsx";

import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Building2,
} from "lucide-react";

import LoadingState from "../ui/LoadingState.jsx";

function AuthPage() {
  const { isLoading } = useContext(context);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (authMode === "signup") {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex items-center justify-center px-3 py-5 sm:px-5 lg:px-8">

      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      {/* Main Card */}
      <div
        className="
          relative
          w-full
          max-w-5xl
          overflow-hidden
          rounded-2xl
          border border-white/[0.07]
          bg-[#0d1422]/95
          shadow-[0_25px_80px_rgba(0,0,0,0.45)]
          backdrop-blur-xl
        "
      >

        <div className="grid grid-cols-1 lg:grid-cols-12">

          {/* =================================================
              LEFT BRANDING SECTION
          ================================================= */}
          <div
            className="
              relative
              overflow-hidden
              border-b border-white/[0.06]
              bg-gradient-to-br
              from-blue-950/50
              via-[#0d1422]
              to-[#080c15]
              p-5
              sm:p-7
              lg:col-span-5
              lg:border-b-0
              lg:border-r
              lg:p-8
            "
          >

            {/* Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">

              {/* Logo */}
              <div className="mb-5 flex items-center gap-3 sm:mb-7">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-blue-400/20
                    bg-blue-500/10
                    text-blue-400
                    shadow-lg
                    shadow-blue-500/10
                  "
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-lg font-extrabold tracking-tight text-white">
                    Field<span className="text-blue-500">Proof</span>
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Workforce Platform
                  </p>
                </div>

              </div>

              {/* Heading */}
              <div className="max-w-md">

                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Secure Field Operations
                </p>

                <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-[27px]">
                  Work Verification &
                  <span className="block text-slate-300">
                    Automated Invoicing
                  </span>
                </h1>

                <p className="mt-3 max-w-md text-xs leading-6 text-slate-400 sm:text-sm">
                  Ensure real-time attendance, GPS geo-fenced logs,
                  and automated invoicing for your field teams.
                </p>

              </div>

              {/* Features */}
              <div className="mt-6 grid gap-2 sm:mt-7 sm:grid-cols-3 lg:grid-cols-1">

                {/* Feature 1 */}
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.025]
                    px-3
                    py-2.5
                    transition
                    hover:border-blue-500/20
                    hover:bg-blue-500/[0.04]
                  "
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-200">
                      GPS Geo-Fencing
                    </p>

                    <p className="text-[9px] text-slate-500">
                      Verify field locations
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.025]
                    px-3
                    py-2.5
                    transition
                    hover:border-blue-500/20
                    hover:bg-blue-500/[0.04]
                  "
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-200">
                      Live Verification
                    </p>

                    <p className="text-[9px] text-slate-500">
                      Photo & attendance proof
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.025]
                    px-3
                    py-2.5
                    transition
                    hover:border-blue-500/20
                    hover:bg-blue-500/[0.04]
                  "
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Building2 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-200">
                      Automated Billing
                    </p>

                    <p className="text-[9px] text-slate-500">
                      Simplified work tracking
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="relative mt-7 hidden border-t border-white/[0.06] pt-4 lg:block">
              <p className="text-[10px] text-slate-600">
                FieldProof Platform Engine ©{" "}
                {new Date().getFullYear()}
              </p>
            </div>

          </div>


          {/* =================================================
              RIGHT FORM SECTION
          ================================================= */}
          <div
            className="
              flex
              items-center
              bg-[#0c1320]
              p-5
              sm:p-7
              md:p-9
              lg:col-span-7
              lg:p-10
            "
          >

            <div className="mx-auto w-full max-w-md">

              {/* Auth Switch */}
              <div
                className="
                  mb-7
                  flex
                  w-full
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-[#080e19]
                  p-1
                "
              >

                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`
                    flex-1
                    rounded-lg
                    py-2.5
                    text-xs
                    font-semibold
                    transition-all
                    duration-200
                    ${
                      authMode === "login"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-500 hover:text-slate-300"
                    }
                  `}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`
                    flex-1
                    rounded-lg
                    py-2.5
                    text-xs
                    font-semibold
                    transition-all
                    duration-200
                    ${
                      authMode === "signup"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-500 hover:text-slate-300"
                    }
                  `}
                >
                  Register
                </button>

              </div>


              {/* Form Heading */}
              <div className="mb-6">

                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  {authMode === "login"
                    ? "Account Access"
                    : "New Account"}
                </p>

                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {authMode === "login"
                    ? "Welcome Back"
                    : "Create Your Account"}
                </h2>

                <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
                  {authMode === "login"
                    ? "Enter your credentials to access your dashboard."
                    : "Create an account to manage and track field tasks."}
                </p>

              </div>


              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* Name */}
                {authMode === "signup" && (
                  <div>

                    <label className="mb-1.5 block text-[11px] font-medium text-slate-300">
                      Full Name
                    </label>

                    <div className="relative">

                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="
                          w-full
                          rounded-xl
                          border
                          border-white/[0.07]
                          bg-[#080e19]
                          py-3
                          pl-10
                          pr-4
                          text-xs
                          text-slate-100
                          outline-none
                          placeholder:text-slate-600
                          transition-all
                          focus:border-blue-500/60
                          focus:bg-[#0a111e]
                          focus:ring-2
                          focus:ring-blue-500/10
                        "
                      />

                    </div>

                  </div>
                )}


                {/* Email */}
                <div>

                  <label className="mb-1.5 block text-[11px] font-medium text-slate-300">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/[0.07]
                        bg-[#080e19]
                        py-3
                        pl-10
                        pr-4
                        text-xs
                        text-slate-100
                        outline-none
                        placeholder:text-slate-600
                        transition-all
                        focus:border-blue-500/60
                        focus:bg-[#0a111e]
                        focus:ring-2
                        focus:ring-blue-500/10
                      "
                    />

                  </div>

                </div>


                {/* Password */}
                <div>

                  <label className="mb-1.5 block text-[11px] font-medium text-slate-300">
                    Password
                  </label>

                  <div className="relative">

                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/[0.07]
                        bg-[#080e19]
                        py-3
                        pl-10
                        pr-4
                        text-xs
                        text-slate-100
                        outline-none
                        placeholder:text-slate-600
                        transition-all
                        focus:border-blue-500/60
                        focus:bg-[#0a111e]
                        focus:ring-2
                        focus:ring-blue-500/10
                      "
                    />

                  </div>

                </div>


                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    mt-2
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    py-3
                    text-xs
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                    transition-all
                    duration-200
                    hover:bg-blue-500
                    hover:shadow-blue-500/25
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  <span>
                    {loading
                      ? "Processing..."
                      : authMode === "login"
                      ? "Sign In"
                      : "Create Account"}
                  </span>

                  <ArrowRight
                    className="
                      h-3.5
                      w-3.5
                      transition-transform
                      duration-200
                      group-hover:translate-x-0.5
                    "
                  />

                </button>

              </form>


              {/* Small Bottom Text */}
              <p className="mt-5 text-center text-[9px] leading-4 text-slate-600">
                Secure access to your FieldProof workspace
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthPage;