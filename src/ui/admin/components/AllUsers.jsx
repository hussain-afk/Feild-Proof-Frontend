import { useContext, useState } from "react";
import {
  Search,
  Pencil,
  Ban,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
  BadgeCheck,
  Phone,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { context } from "../../../context/context.jsx";
import Modal from "../../Modal.jsx";
import LoadingState from "../../LoadingState.jsx";
import useAdmin from "../../../hooks/useAdmin.jsx";
import useAuth from "../../../hooks/useAuth.jsx";

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

const ROLES = ["admin", "manager", "worker"];

const ROLE_STYLE = {
  admin: "border-purple-500/25 bg-purple-500/10 text-purple-300",
  manager: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  worker: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
};

const TILES = [
  { id: "all", label: "All users", icon: Users },
  { id: "verified", label: "Verified", icon: BadgeCheck },
  { id: "unverified", label: "Not verified", icon: AlertCircle },
];

const FORM_FIELDS = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "text", placeholder: "03001234567" },
  {
    name: "hourlyRate",
    label: "Hourly rate (USD)",
    type: "number",
    placeholder: "e.g. 30",
  },
];

const inputClass =
  "h-11 w-full rounded-xl border border-slate-800/80 bg-[#0a0f1a] px-3.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/15";

const badgeClass =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

const getInitials = (name) =>
  (name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

const matchesFilter = (user, filter) => {
  if (filter === "all") return true;
  if (filter === "verified") return Boolean(user.isVerified);
  if (filter === "unverified") return !user.isVerified;
  return user.role === filter;
};

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

function Avatar({ user, size = "h-10 w-10" }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${size} shrink-0 rounded-full border border-slate-700/80 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300`}
    >
      {getInitials(user.name)}
    </div>
  );
}

function UserBadges({ user }) {
  return (
    <>
      <span
        className={`${badgeClass} ${
          ROLE_STYLE[user.role] ||
          "border-slate-700 bg-slate-800 text-slate-400"
        }`}
      >
        {user.role || "user"}
      </span>

      {user.isVerified ? (
        <span
          className={`${badgeClass} border-emerald-500/25 bg-emerald-500/10 text-emerald-300`}
        >
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified
        </span>
      ) : (
        <span
          className={`${badgeClass} border-amber-500/25 bg-amber-500/10 text-amber-300`}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Not verified
        </span>
      )}

      {user.isBanned && (
        <span
          className={`${badgeClass} border-rose-500/30 bg-rose-500/10 text-rose-300`}
        >
          <Ban className="h-3.5 w-3.5" />
          Banned
        </span>
      )}
    </>
  );
}

function IconButton({ icon: Icon, label, onClick, disabled, hover }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 ${hover}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function UserRow({ user, isSelf, onEdit, onBan, onDelete }) {
  const details = [
    [Phone, user.phone || "No phone"],
    [DollarSign, `${user.hourlyRate ?? 0} per hour`],
    [CalendarDays, `Joined ${formatDate(user.createdAt)}`],
  ];

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-white/[0.02] sm:px-6">
      <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
        <Avatar user={user} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {user.name || "Unknown user"}
            {isSelf && (
              <span className="ml-2 text-xs font-normal text-slate-500">
                (you)
              </span>
            )}
          </p>
          <p className="truncate text-xs text-slate-500">
            {user.email || "No email"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <UserBadges user={user} />
      </div>

      <div className="flex gap-1">
        <IconButton
          icon={Pencil}
          label="Edit user"
          onClick={() => onEdit(user)}
          hover="hover:bg-sky-500/10 hover:text-sky-300"
        />
        <IconButton
          icon={Ban}
          label={isSelf ? "You cannot ban your own account" : "Ban user"}
          onClick={() => onBan(user)}
          disabled={isSelf}
          hover="hover:bg-amber-500/10 hover:text-amber-300"
        />
        <IconButton
          icon={Trash2}
          label={isSelf ? "You cannot delete your own account" : "Delete user"}
          onClick={() => onDelete(user)}
          disabled={isSelf}
          hover="hover:bg-rose-500/10 hover:text-rose-300"
        />
      </div>

      <div className="flex w-full flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 sm:pl-[52px]">
        {details.map(([Icon, text]) => (
          <span key={text} className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-slate-600" />
            {text}
          </span>
        ))}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const AllUsers = () => {
  const {
    allUsers = [],
    setAllUsers,
    isLoading,
    user: currentUser,
  } = useContext(context);
  const { updateUserProfileByAdmin, handleBanUser } = useAdmin();
  const { deleteUser } = useAuth();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [action, setAction] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isEdit = action?.type === "edit";

  const text = search.trim().toLowerCase();

  const visibleUsers = allUsers.filter(
    (user) =>
      matchesFilter(user, filter) &&
      `${user.name} ${user.email}`.toLowerCase().includes(text)
  );

  const countFor = (key) =>
    allUsers.filter((user) => matchesFilter(user, key)).length;

  const openEdit = (user) => {
    setError("");
    setAction({ type: "edit", user });
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      hourlyRate: user.hourlyRate ?? "",
      role: user.role || "worker",
    });
  };

  const openDelete = (user) => {
    setError("");
    setAction({ type: "delete", user });
  };

  const closeAction = () => setAction(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const run = async (task, fallbackMessage) => {
    setBusy(true);
    setError("");

    try {
      await task();
      closeAction();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || fallbackMessage
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    run(async () => {
      const updated = await updateUserProfileByAdmin(
        action.user._id,
        form.name,
        form.email,
        form.phone,
        form.hourlyRate,
        form.role
      );

      setAllUsers((users) =>
        users.map((user) =>
          user._id === action.user._id ? { ...user, ...updated } : user
        )
      );
    }, "Could not update this user.");
  };

  const handleDelete = (e) => {
    e.preventDefault();

    run(async () => {
      await deleteUser(action.user._id);
      setAllUsers((users) =>
        users.filter((user) => user._id !== action.user._id)
      );
    }, "Could not delete this user.");
  };

  const handleBan = async (user) => {
    run(async () => {
      await handleBanUser(user._id);
      setAllUsers((users) =>
        users.map((u) =>
          u._id === user._id ? { ...u, isBanned: !u.isBanned } : u
        )
      );
    }, "Could not ban this user.");
  };

  if (isLoading) {
    return (
      <LoadingState message="Loading users" subtext="Syncing your workspace" />
    );
  }

  return (
    <div className="min-h-screen  text-slate-100">
      {/* Soft top glow */}
      {/* <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-sky-500/[0.04] to-transparent" /> */}

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-8 space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Users
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-slate-500">
            See who is registered, who has verified their email, and manage
            their accounts.
          </p>
        </header>

        {/* ===== Stat tiles ===== */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TILES.map(({ id, label, icon: Icon }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={active}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                  active
                    ? "border-sky-500/40 bg-sky-500/10 shadow-lg shadow-sky-500/5"
                    : "border-slate-800/80 bg-[#0c1220] hover:border-slate-700"
                }`}
              >
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1.5 text-2xl font-semibold tabular-nums text-white">
                    {countFor(id)}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active
                      ? "bg-sky-500/15 text-sky-300"
                      : "bg-slate-800/60 text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* ===== Search + role tabs ===== */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search users"
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="flex overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0c1220] p-1">
            {["all", ...ROLES].map((role) => {
              const active = filter === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFilter(role)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium capitalize transition ${
                    active
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {role}
                  <span
                    className={`tabular-nums ${
                      active ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {countFor(role)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== List ===== */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220]">
          {visibleUsers.length > 0 ? (
            <ul className="divide-y divide-slate-800/60">
              {visibleUsers.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  isSelf={user._id === currentUser?._id}
                  onEdit={openEdit}
                  onBan={handleBan}
                  onDelete={openDelete}
                />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/60">
                <Users className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                No users found
              </p>
              <p className="mt-1.5 text-xs text-slate-500">
                Try a different search or filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= Edit / Delete modal ================= */}
      <Modal
        isOpen={Boolean(action)}
        onClose={busy ? () => {} : closeAction}
        title={isEdit ? "Update user" : "Delete user"}
        subtitle={
          isEdit
            ? "Change details and role for this account."
            : "This action cannot be undone."
        }
      >
        {action && (
          <form
            onSubmit={isEdit ? handleSave : handleDelete}
            className="space-y-5"
          >
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#0a0f1a] p-3.5">
              <Avatar user={action.user} size="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {action.user.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {action.user.email}
                </p>
              </div>
            </div>

            {isEdit ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <UserBadges user={action.user} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {FORM_FIELDS.map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
                        {field.label}
                      </span>
                      <input
                        name={field.name}
                        type={field.type}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        min={field.type === "number" ? 0 : undefined}
                        className={inputClass}
                      />
                    </label>
                  ))}

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      Role
                    </span>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer capitalize`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-slate-400">
                Are you sure you want to delete this user? This cannot be
                undone.
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-3 text-xs text-rose-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2.5 border-t border-slate-800/80 pt-5">
              <button
                type="button"
                onClick={closeAction}
                disabled={busy}
                className="h-11 flex-1 rounded-xl border border-slate-700/80 bg-slate-800/60 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy}
                className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isEdit
                    ? "bg-sky-600 shadow-lg shadow-sky-600/20 hover:bg-sky-500"
                    : "bg-rose-600 shadow-lg shadow-rose-600/20 hover:bg-rose-500"
                }`}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? "Saving..." : "Deleting..."}
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Yes, delete"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AllUsers;