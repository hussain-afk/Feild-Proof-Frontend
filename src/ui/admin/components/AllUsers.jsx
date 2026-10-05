import React, { useContext, useState } from "react";
import {
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { context } from "../../../context/context.jsx";
import Modal from "../../Modal.jsx";
import useAdmin from "../../../hooks/useAdmin.jsx";

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

const FILTERS = ["all", "admin", "manager", "worker"];

const ROLE_STYLE = {
  admin: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  manager: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  worker: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

// Same grid for the header and every row, so columns line up (desktop only)
const GRID = "md:grid-cols-[2fr_2fr_1fr_1fr_1fr_40px]";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] px-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("")
    : "U";

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

function Avatar({ user, size = "h-10 w-10" }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${size} shrink-0 rounded-full border border-slate-700 object-cover`}
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

function RoleBadge({ role }) {
  const style = ROLE_STYLE[role?.toLowerCase()] || "border-slate-700 bg-slate-800 text-slate-400";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {role || "user"}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

// The "..." button and its dropdown
function ActionMenu({ isOpen, onToggle, onClose, onEdit }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="User actions"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* invisible layer: clicking anywhere outside closes the menu */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-slate-700 bg-[#111827] p-1.5 shadow-2xl shadow-black/40">
            <button
              type="button"
              onClick={onEdit}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-sky-500/10 hover:text-sky-400"
            >
              <Pencil className="h-3.5 w-3.5" />
              Update
            </button>

            {/* Delete button is UI only for now */}
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// One user. On mobile it is a card, on desktop it is a table row.
function UserRow({ user, menuOpen, onToggleMenu, onCloseMenu, onEdit }) {
  return (
    <div
      className={`relative grid gap-3 px-4 py-4 transition-colors hover:bg-white/[0.02] md:items-center md:px-6 ${GRID}`}
    >
      {/* User */}
      <div className="flex min-w-0 items-center gap-3 pr-10 md:pr-0">
        <Avatar user={user} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {user.name || "Unknown user"}
          </p>
          <p className="truncate text-xs text-slate-500 md:hidden">{user.email}</p>
        </div>
      </div>

      {/* Contact (desktop) */}
      <div className="hidden min-w-0 md:block">
        <p className="truncate text-sm text-slate-300">{user.email || "No email"}</p>
        <p className="mt-0.5 text-xs text-slate-500">{user.phone || "No phone"}</p>
      </div>

      {/* Role, rate, joined: one line on mobile, three columns on desktop */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:contents">
        <div>
          <RoleBadge role={user.role} />
        </div>
        <p className="text-slate-300">
          ${user.hourlyRate ?? 0}
          <span className="text-xs text-slate-500">/hr</span>
        </p>
        <p className="text-xs text-slate-400 md:text-sm">{formatDate(user.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="absolute right-3 top-4 md:static md:flex md:justify-end">
        <ActionMenu
          isOpen={menuOpen}
          onToggle={onToggleMenu}
          onClose={onCloseMenu}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const AllUsers = () => {
  const { allUsers = [], setAllUsers } = useContext(context);
  const { updateUserProfileByAdmin } = useAdmin();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [menuId, setMenuId] = useState(null); // user whose menu is open

  const [selected, setSelected] = useState(null); // user being edited
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---------- Filtering ----------
  const text = search.trim().toLowerCase();
  const visibleUsers = allUsers.filter((user) => {
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    const matchText = `${user.name} ${user.email}`.toLowerCase().includes(text);
    return matchRole && matchText;
  });

  const countFor = (role) =>
    role === "all" ? allUsers.length : allUsers.filter((u) => u.role === role).length;

  // ---------- Edit modal ----------
  const openEdit = (user) => {
    setMenuId(null);
    setError("");
    setSelected(user);
    // Start the form with the current values, so nothing gets blanked by mistake
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      hourlyRate: user.hourlyRate ?? "",
      role: user.role || "worker",
    });
  };

  const closeEdit = () => setSelected(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updated = await updateUserProfileByAdmin(
        selected._id,
        form.name,
        form.email,
        form.phone,
        form.hourlyRate,
        form.role
      );

      // Update the list on screen right away
      setAllUsers((users) =>
        users.map((u) => (u._id === selected._id ? { ...u, ...updated } : u))
      );
      closeEdit();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not update this user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* ================= Header ================= */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            View and manage everyone registered in the system.
          </p>
        </header>

        {/* ================= Search + filter ================= */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search users"
              className={`${inputClass} pl-9`}
            />
          </div>

          <div className="flex overflow-x-auto rounded-lg border border-slate-800 bg-[#0f1624] p-1">
            {FILTERS.map((role) => {
              const active = roleFilter === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                    active ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {role}
                  <span className={active ? "text-slate-300" : "text-slate-500"}>
                    {countFor(role)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= List ================= */}
        <div className="rounded-xl border border-slate-800 bg-[#111827]">
          {/* Column titles (desktop only) */}
          <div
            className={`hidden gap-3 rounded-t-xl border-b border-slate-800 bg-[#0e1522] px-6 py-3 text-xs font-medium text-slate-500 md:grid ${GRID}`}
          >
            <span>User</span>
            <span>Contact</span>
            <span>Role</span>
            <span>Hourly rate</span>
            <span>Joined</span>
            <span />
          </div>

          {visibleUsers.length > 0 ? (
            <div className="divide-y divide-slate-800/70">
              {visibleUsers.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  menuOpen={menuId === user._id}
                  onToggleMenu={() => setMenuId(menuId === user._id ? null : user._id)}
                  onCloseMenu={() => setMenuId(null)}
                  onEdit={() => openEdit(user)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-200">No users found</p>
              <p className="mt-1 text-xs text-slate-500">
                Try a different search or role filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= Edit modal ================= */}
      <Modal isOpen={Boolean(selected)} onClose={closeEdit} title="Update user">
        {selected && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Who we are editing */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0b1220] p-3">
              <Avatar user={selected} size="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{selected.name}</p>
                <p className="truncate text-xs text-slate-500">
                  Joined {formatDate(selected.createdAt)}
                </p>
              </div>
              <RoleBadge role={selected.role} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Phone">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                  className={inputClass}
                />
              </Field>

              <Field label="Hourly rate (USD)">
                <input
                  name="hourlyRate"
                  type="number"
                  min="0"
                  value={form.hourlyRate}
                  onChange={handleChange}
                  placeholder="e.g. 30"
                  className={inputClass}
                />
              </Field>

              <Field label="Role">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="worker">Worker</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
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