import React, { useContext, useState, useEffect, useRef } from "react";
import { context } from "../context/context.jsx";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth.jsx";
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Lock,
  Building2,
  CreditCard,
  Smartphone,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
} from "lucide-react";

const MAX_AVATAR_MB = 5;

const inputClass =
  "w-full h-10 rounded-lg bg-[#0b1220] border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const ProfilePage = () => {
  const { updatePayment, updateProfile } = useAuth();
  const { user } = useContext(context);
  const { id } = useParams();

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Payment form
  const [accountHolderName, setAccountHolderName] = useState(
    user?.paymentMethod?.accountHolderName || ""
  );
  const [bankName, setBankName] = useState(user?.paymentMethod?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(
    user?.paymentMethod?.accountNumber || ""
  );
  const [jazzcashOrEasypaisaNumber, setJazzcashOrEasypaisaNumber] = useState(
    user?.paymentMethod?.jazzcashOrEasypaisa || ""
  );
  const [activePaymentTab, setActivePaymentTab] = useState("bank");
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);

  const blobUrlRef = useRef(null);

  // Sync state when the user in context updates
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setHourlyRate(user.hourlyRate || "");
      setAvatarPreview(user.avatar || null);

      if (user.paymentMethod) {
        setAccountHolderName(user.paymentMethod.accountHolderName || "");
        setBankName(user.paymentMethod.bankName || "");
        setAccountNumber(user.paymentMethod.accountNumber || "");
        setJazzcashOrEasypaisaNumber(user.paymentMethod.jazzcashOrEasypaisa || "");
      }
    }
  }, [user]);

  // Free the temporary preview URL when it is replaced or the page closes
  useEffect(
    () => () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    },
    []
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setProfileMessage({
        type: "error",
        text: `Photo is too large. Choose an image under ${MAX_AVATAR_MB} MB.`,
      });
      e.target.value = "";
      return;
    }

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = URL.createObjectURL(file);

    setProfileMessage(null);
    setAvatar(file);
    setAvatarPreview(blobUrlRef.current);
  };

  // Enable "Save changes" only when something actually changed
  const isProfileDirty =
    name !== (user?.name || "") ||
    email !== (user?.email || "") ||
    phone !== (user?.phone || "") ||
    String(hourlyRate) !== String(user?.hourlyRate || "") ||
    password !== "" ||
    avatar !== null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileSubmitting(true);
    setProfileMessage(null);
    const userId = id || user?._id;

    try {
      await updateProfile(userId, name, email, phone, hourlyRate, password, avatar);
      setProfileMessage({ type: "success", text: "Profile updated successfully." });
      setPassword("");
      setAvatar(null);
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error.message || "Could not update your profile. Try again.",
      });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsPaymentSubmitting(true);
    setPaymentMessage(null);
    const userId = id || user?._id;

    try {
      await updatePayment(
        userId,
        bankName,
        accountNumber,
        accountHolderName,
        jazzcashOrEasypaisaNumber
      );
      setPaymentMessage({ type: "success", text: "Payment method saved." });
      setTimeout(() => setPaymentMessage(null), 3000);
    } catch (error) {
      setPaymentMessage({
        type: "error",
        text: error.message || "Could not save your payment method. Try again.",
      });
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Worker";

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {/* ================= PAGE HEADER ================= */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Account settings
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Manage your profile and how you get paid.
          </p>
        </header>

        {/* ================= PROFILE SUMMARY ================= */}
        <section className="mb-6 rounded-xl border border-slate-800 bg-[#111827] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="relative shrink-0 self-start sm:self-auto">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-slate-600" />
                )}
              </div>

              <label
                htmlFor="avatar-input"
                title="Change photo"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#111827] bg-sky-600 text-white shadow transition hover:bg-sky-500 focus-within:ring-2 focus-within:ring-sky-400"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change profile photo</span>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold text-white">
                  {name || "Your profile"}
                </h2>
                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-400">
                  {roleLabel}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:gap-x-6">
                <p className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{email || "No email added"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                  {phone || "No phone added"}
                </p>
              </div>

              {avatar && (
                <p className="mt-3 text-xs text-sky-400">
                  New photo selected. Save your changes to apply it.
                </p>
              )}
            </div>

            {/* User ID */}
            <div className="sm:text-right">
              <p className="text-xs text-slate-500">User ID</p>
              <p className="mt-1 font-mono text-sm text-slate-200">
                {id || user?._id?.slice(-12) || "N/A"}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ================= PERSONAL INFORMATION ================= */}
          <form
            onSubmit={handleProfileSubmit}
            className="flex flex-col rounded-xl border border-slate-800 bg-[#111827] p-5 sm:p-6"
          >
            <CardHeader
              title="Personal information"
              subtitle="Update your profile details."
            />

            <div className="flex-1 space-y-4">
              <Field
                id="full-name"
                label="Full name"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />

              <Field
                id="email"
                label="Email address"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <Field
                id="phone"
                label="Phone number"
                icon={Phone}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03001234567"
                autoComplete="tel"
              />

              <Field
                id="hourly-rate"
                label="Hourly rate (USD per hour)"
                icon={DollarSign}
                inputMode="decimal"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="25"
              />

              <Field
                id="password"
                label="New password"
                hint="Leave blank to keep your current password."
                icon={Lock}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
                autoComplete="new-password"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>

            <FormMessage message={profileMessage} />

            <SubmitButton
              loading={isProfileSubmitting}
              disabled={!isProfileDirty}
              label="Save changes"
              loadingLabel="Saving..."
            />
          </form>

          {/* ================= PAYMENT METHOD ================= */}
          <form
            onSubmit={handlePaymentSubmit}
            className="flex flex-col rounded-xl border border-slate-800 bg-[#111827] p-5 sm:p-6"
          >
            <CardHeader
              title="Payment method"
              subtitle="Choose where your payments are sent."
            />

            <div className="flex-1 space-y-4">
              <Field
                id="holder-name"
                label="Account holder name"
                required
                icon={User}
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Name as shown on your account"
                autoComplete="name"
              />

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-200">
                  Payout method
                </span>
                <div
                  role="tablist"
                  aria-label="Payout method"
                  className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-[#0b1220] p-1"
                >
                  {[
                    { key: "bank", label: "Bank transfer", icon: Building2 },
                    { key: "wallet", label: "Mobile wallet", icon: Smartphone },
                  ].map(({ key, label, icon: Icon }) => {
                    const active = activePaymentTab === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActivePaymentTab(key)}
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                          active
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activePaymentTab === "bank" && (
                <div className="space-y-4">
                  <Field
                    id="bank-name"
                    label="Bank name"
                    required
                    icon={Building2}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Meezan Bank, HBL"
                  />

                  <Field
                    id="account-number"
                    label="Account number or IBAN"
                    required
                    icon={CreditCard}
                    mono
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="PK36MEZN0001020304050607"
                  />
                </div>
              )}

              {activePaymentTab === "wallet" && (
                <Field
                  id="wallet-number"
                  label="Mobile number"
                  hint="Linked to your JazzCash or Easypaisa account."
                  required
                  icon={Smartphone}
                  mono
                  type="tel"
                  value={jazzcashOrEasypaisaNumber}
                  onChange={(e) => setJazzcashOrEasypaisaNumber(e.target.value)}
                  placeholder="03001234567"
                />
              )}
            </div>

            <FormMessage message={paymentMessage} />

            <SubmitButton
              loading={isPaymentSubmitting}
              label="Save payment method"
              loadingLabel="Saving..."
            />
          </form>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

function CardHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  icon: Icon,
  mono,
  trailing,
  ...inputProps
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          required={required}
          className={`${inputClass} pl-10 ${trailing ? "pr-10" : "pr-3"} ${
            mono ? "font-mono" : ""
          }`}
          {...inputProps}
        />
        {trailing}
      </div>
    </div>
  );
}

function FormMessage({ message }) {
  if (!message) return null;
  const success = message.type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`mt-5 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
        success
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          : "border-red-500/30 bg-red-500/10 text-red-200"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message.text}</p>
    </div>
  );
}

function SubmitButton({ loading, disabled, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}

export default ProfilePage;