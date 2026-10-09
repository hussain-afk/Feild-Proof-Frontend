import {
  useContext,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  memo,
} from "react";
import Modal from "../../Modal";
import { context } from "../../../context/context.jsx";
import useTasks from "../../../hooks/useTasks.jsx";
import ManagerTaskCard from "./TaskCard.jsx";
import LocationPicker from "./LocationPicker.jsx";
import {
  FileText,
  UserCheck,
  MapPin,
  Plus,
  X,
  CheckCircle2,
  Clock3,
  ListTodo,
  Loader2,
  Search,
  AlertCircle,
  ExternalLink,
  CalendarClock,
  PlayCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants and helpers                                                */
/* ------------------------------------------------------------------ */

const emptyForm = {
  title: "",
  description: "",
  assignedWorker: [], // array of user IDs
  dueDate: "",
  siteLocation: {
    name: "",
    latitude: "",
    longitude: "",
    radiusInMeters: 100,
  },
};

const STATUS = {
  pending: {
    label: "Pending",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  "in-progress": {
    label: "In progress",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in-progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-[#0b1220] border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const labelClass = "block text-xs font-medium text-slate-300 mb-1.5";

const getId = (user) => user._id || user.id;

// Latitude aur longitude dono sach me chune gaye hain ya nahi ("" ko 0 na samjho)
const hasCoordinates = (loc) =>
  [loc?.latitude, loc?.longitude].every(
    (v) => v !== "" && v != null && Number.isFinite(Number(v))
  );
const isManager = (user) => user.role?.toLowerCase() === "manager";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not specified";

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function Home() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [workerSearch, setWorkerSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [addLocation, setAddLocation] = useState(true); // site location on/off
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [taskSearch, setTaskSearch] = useState("");

  const {
    allUsers = [],
    allTasks = [],
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
  } = useContext(context);

  const { handleCreateTask } = useTasks();

  /* ---------- Statistics ---------- */
  const counts = useMemo(() => {
    const c = { all: allTasks.length, pending: 0, "in-progress": 0, completed: 0 };
    allTasks.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status] += 1;
    });
    return c;
  }, [allTasks]);

  const percentOfTotal = (n) =>
    counts.all ? `${Math.round((n / counts.all) * 100)}% of all tasks` : "No tasks yet";

  /* ---------- Task list filtering ---------- */
  const visibleTasks = useMemo(() => {
    const text = taskSearch.trim().toLowerCase();
    return allTasks.filter((t) => {
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchText =
        !text ||
        `${t.title || ""} ${t.siteLocation?.name || ""}`.toLowerCase().includes(text);
      return matchStatus && matchText;
    });
  }, [allTasks, statusFilter, taskSearch]);

  /* ---------- Form helpers ---------- */
  const resetForm = () => {
    setFormData(emptyForm);
    setWorkerSearch("");
    setFormError("");
    setAddLocation(true);
  };

  const closeCreateModal = () => {
    resetForm();
    setIsCreateTaskModalOpen(false);
  };

  const updateLocation = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      siteLocation: { ...prev.siteLocation, [field]: value },
    }));
  };

  /* ---------- Worker selection ---------- */
  const deferredSearch = useDeferredValue(workerSearch);

  const filteredUsers = useMemo(() => {
    const text = deferredSearch.toLowerCase();
    return allUsers.filter((u) =>
      `${u.name} ${u.role || ""}`.toLowerCase().includes(text)
    );
  }, [allUsers, deferredSearch]);

  const selectedSet = useMemo(
    () => new Set(formData.assignedWorker),
    [formData.assignedWorker]
  );

  const toggleWorker = useCallback((id) => {
    setFormError("");
    setFormData((prev) => {
      const set = new Set(prev.assignedWorker);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...prev, assignedWorker: [...set] };
    });
  }, []);

  const selectableUsers = filteredUsers.filter((u) => !isManager(u));

  const allSelected =
    selectableUsers.length > 0 &&
    selectableUsers.every((u) => selectedSet.has(getId(u)));

  const toggleSelectAll = () => {
    const ids = selectableUsers.map(getId);
    setFormData((prev) => ({
      ...prev,
      assignedWorker: allSelected
        ? prev.assignedWorker.filter((id) => !ids.includes(id))
        : [...new Set([...prev.assignedWorker, ...ids])],
    }));
  };

  const clearSelection = () =>
    setFormData((prev) => ({ ...prev, assignedWorker: [] }));

  /* ---------- Create task ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.assignedWorker.length === 0) {
      setFormError("Select at least one worker to assign this task.");
      return;
    }

    // Location on hai to map se jagah chuni honi chahiye
    if (addLocation && !hasCoordinates(formData.siteLocation)) {
      setFormError("Pick the site on the map, or turn off the site location.");
      return;
    }

    // Location off ho to siteLocation bhejte hi nahi
    const taskWithoutLocation = { ...formData };
    delete taskWithoutLocation.siteLocation;
    const payload = addLocation ? formData : taskWithoutLocation;

    setFormError("");
    setIsSubmitting(true);
    try {
      await handleCreateTask(payload);
      closeCreateModal();
    } catch (error) {
      console.error("Create task error:", error);
      setFormError("Could not create the task. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Task details: workers ---------- */
  const getWorkers = (task) => {
    const list = Array.isArray(task.assignedWorker)
      ? task.assignedWorker
      : task.assignedWorker
        ? [task.assignedWorker]
        : [];

    return list.map((w) =>
      typeof w === "object"
        ? w
        : allUsers.find((u) => getId(u) === w) || { name: "Unknown" }
    );
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const selectedStatus = STATUS[selectedTask?.status] || STATUS.pending;
  const selectedLoc = selectedTask?.siteLocation;
  const hasCoords = hasCoordinates(selectedLoc);

  return (
    <>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* ================= HEADER ================= */}
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="text-sm text-slate-500">{today}</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Field operations
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                Create tasks, assign workers and track work at each site.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="inline-flex h-10 w-full md:w-auto items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17]"
            >
              <Plus className="h-4 w-4" />
              Create task
            </button>
          </header>

          {/* ================= STATS ================= */}
          <section
            aria-label="Task summary"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
          >
            <StatCard
              label="Total tasks"
              value={counts.all}
              hint={`${counts.completed} completed`}
              icon={ListTodo}
              tone="slate"
            />
            <StatCard
              label="Pending"
              value={counts.pending}
              hint={percentOfTotal(counts.pending)}
              icon={Clock3}
              tone="amber"
            />
            <StatCard
              label="In progress"
              value={counts["in-progress"]}
              hint={percentOfTotal(counts["in-progress"])}
              icon={PlayCircle}
              tone="sky"
            />
            <StatCard
              label="Completed"
              value={counts.completed}
              hint={percentOfTotal(counts.completed)}
              icon={CheckCircle2}
              tone="emerald"
            />
          </section>

          {/* ================= TASK LIST ================= */}
          <section aria-label="Tasks">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">All tasks</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {visibleTasks.length} of {counts.all} task
                  {counts.all !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Search by title or site"
                    aria-label="Search tasks"
                    className={`${inputClass} pl-9`}
                  />
                </div>

                <div
                  role="tablist"
                  aria-label="Filter by status"
                  className="flex overflow-x-auto rounded-lg border border-slate-800 bg-[#0f1624] p-1"
                >
                  {FILTERS.map((f) => {
                    const active = statusFilter === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setStatusFilter(f.key)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {f.label}
                        <span
                          className={`rounded px-1.5 text-[10px] ${
                            active ? "bg-slate-700 text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {counts[f.key]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {allTasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="No tasks yet"
                text="Create your first field task to assign workers to a site and start tracking their check-ins."
                actionLabel="Create first task"
                onAction={() => setIsCreateTaskModalOpen(true)}
              />
            ) : visibleTasks.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching tasks"
                text="Try a different search term or choose another status filter."
                actionLabel="Clear filters"
                onAction={() => {
                  setTaskSearch("");
                  setStatusFilter("all");
                }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleTasks.map((taskItem) => (
                  <ManagerTaskCard
                    key={taskItem._id || taskItem.id}
                    task={taskItem}
                    onViewDetails={setSelectedTask}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ================= CREATE TASK MODAL ================= */}
      <Modal
        isOpen={isCreateTaskModalOpen}
        onClose={closeCreateModal}
        title="Create task"
        subtitle="Describe the work, choose who does it and where."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ---- Task information ---- */}
          <Panel>
            <SectionTitle
              icon={FileText}
              title="Task information"
              subtitle="What needs to be done"
            />

            <div className="mb-3">
              <label htmlFor="task-title" className={labelClass}>
                Task title
              </label>
              <input
                id="task-title"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Inspect generator at Site B"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="task-desc" className={labelClass}>
                Description <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                id="task-desc"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Add instructions, safety notes or what proof is needed."
                className={`${inputClass} h-auto resize-none py-2.5`}
              />
            </div>
          </Panel>

          {/* ---- Assignment ---- */}
          <Panel>
            <SectionTitle
              icon={UserCheck}
              title="Assignment"
              subtitle="Pick the workers and set a deadline"
            />

            <div className="mb-4">
              <label htmlFor="task-due" className={labelClass}>
                Due date and time
              </label>
              <input
                id="task-due"
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, dueDate: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div className="mb-1.5 flex items-center justify-between">
              <span className={`${labelClass} mb-0`}>Field workers</span>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400">
                  {formData.assignedWorker.length} selected
                </span>
                {formData.assignedWorker.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[11px] text-slate-400 transition hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                placeholder="Search by name or role"
                aria-label="Search workers"
                className={`${inputClass} pl-9`}
              />
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-800">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[#111827]">
                    <tr className="text-left text-[11px] text-slate-400">
                      <th className="w-10 px-3 py-2">
                        <input
                          type="checkbox"
                          aria-label="Select all workers"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 cursor-pointer accent-sky-600"
                        />
                      </th>
                      <th className="px-3 py-2 font-medium">Worker</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-8 text-center text-xs text-slate-500"
                        >
                          No workers match your search.
                        </td>
                      </tr>
                    )}

                    {filteredUsers.map((user) => (
                      <WorkerRow
                        key={getId(user)}
                        user={user}
                        checked={selectedSet.has(getId(user))}
                        onToggle={toggleWorker}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>

          {/* ---- Site location (optional) ---- */}
          <Panel>
            <SectionTitle
              icon={MapPin}
              title="Site location and geofence"
              subtitle={
                addLocation
                  ? "Workers can only check in inside this area"
                  : "No location will be saved for this task"
              }
              className={addLocation ? "mb-4" : ""}
              action={
                <Toggle
                  checked={addLocation}
                  onChange={setAddLocation}
                  label="Add a site location"
                />
              }
            />

            {addLocation && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="site-name" className={labelClass}>
                    Site or venue name
                  </label>
                  <input
                    id="site-name"
                    type="text"
                    required
                    value={formData.siteLocation.name}
                    onChange={(e) => updateLocation("name", e.target.value)}
                    placeholder="e.g. Zaitoon Ashraf IT Park"
                    className={inputClass}
                  />
                </div>

                <LocationPicker
                  siteLocation={formData.siteLocation}
                  setFormData={setFormData}
                />

                <div>
                  <label htmlFor="site-radius" className={labelClass}>
                    Allowed check-in radius
                  </label>
                  <select
                    id="site-radius"
                    value={formData.siteLocation.radiusInMeters}
                    onChange={(e) =>
                      updateLocation("radiusInMeters", Number(e.target.value))
                    }
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value={50}>50 m, very small area</option>
                    <option value={100}>100 m, single building</option>
                    <option value={250}>250 m, small campus or ground</option>
                    <option value={500}>500 m, recommended for large sites</option>
                    <option value={1000}>1 km, wide area</option>
                  </select>
                </div>
              </div>
            )}
          </Panel>

          {/* ---- Error + actions ---- */}
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={isSubmitting}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create task
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= TASK DETAILS MODAL ================= */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title="Task details"
        subtitle={`Task ID: ${selectedTask?._id || "N/A"}`}
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {selectedTask.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${selectedStatus.badge}`}
                >
                  {selectedStatus.label}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {selectedTask.description || "No description provided for this task."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoBox title="Assigned workers">
                {getWorkers(selectedTask).length === 0 ? (
                  <p className="text-sm font-medium text-slate-200">Unassigned</p>
                ) : (
                  <div className="mt-1 max-h-32 space-y-2 overflow-y-auto">
                    {getWorkers(selectedTask).map((w, i) => (
                      <div key={getId(w) || i} className="flex items-center gap-2">
                        <Avatar user={w} size="w-6 h-6" />
                        <span className="truncate text-sm text-slate-200">
                          {w.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </InfoBox>

              <InfoBox title="Due date">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-200">
                    {formatDateTime(selectedTask.dueDate)}
                  </p>
                </div>
              </InfoBox>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#0b1220] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-400" />
                  <span className="text-sm font-medium text-slate-200">
                    Site location
                  </span>
                </div>

                {hasCoords && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedLoc.latitude},${selectedLoc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 transition hover:text-sky-300"
                  >
                    Open in Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <p className="text-sm text-slate-300">
                {hasCoords
                  ? selectedLoc?.name || "Site location"
                  : "No site location was set for this task."}
              </p>

              {hasCoords && (
              <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-800 pt-3">
                <div>
                  <dt className="text-[11px] text-slate-500">Latitude</dt>
                  <dd className="mt-0.5 text-xs text-slate-300">
                    {selectedLoc?.latitude || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">Longitude</dt>
                  <dd className="mt-0.5 text-xs text-slate-300">
                    {selectedLoc?.longitude || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">Check-in radius</dt>
                  <dd className="mt-0.5 text-xs text-slate-300">
                    {selectedLoc?.radiusInMeters || 100} m
                  </dd>
                </div>
              </dl>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small reusable components                                            */
/* ------------------------------------------------------------------ */

function Avatar({ user, size = "w-8 h-8" }) {
  const [failed, setFailed] = useState(false);
  // Change the field name here if your backend uses a different one
  const pic = user.profilePic || user.avatar || user.image || user.photo;

  if (pic && !failed) {
    return (
      <img
        src={pic}
        alt={user.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-full border border-slate-700 object-cover`}
      />
    );
  }

  const initials = (user.name || "?")
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-[11px] font-semibold text-sky-300`}
    >
      {initials}
    </div>
  );
}

// memo: only the row that changes re-renders, so long lists stay smooth
const WorkerRow = memo(function WorkerRow({ user, checked, onToggle }) {
  const id = getId(user);
  const disabled = isManager(user);

  return (
    <tr
      onClick={() => !disabled && onToggle(id)}
      className={`border-t border-slate-800 transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : checked
            ? "cursor-pointer bg-sky-500/10"
            : "cursor-pointer hover:bg-slate-800/50"
      }`}
    >
      <td className="w-10 px-3 py-2">
        <input
          type="checkbox"
          aria-label={`Select ${user.name}`}
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 cursor-pointer accent-sky-600 disabled:cursor-not-allowed"
        />
      </td>

      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-slate-200">{user.name}</p>
            {user.email && (
              <p className="truncate text-[11px] text-slate-500">{user.email}</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-3 py-2 capitalize text-slate-400">
        {user.role || "Worker"}
        {disabled && (
          <span className="block text-[10px] normal-case text-slate-500">
            Managers can't be assigned
          </span>
        )}
      </td>
    </tr>
  );
});

const TONES = {
  slate: { value: "text-white", icon: "text-slate-300", bg: "bg-slate-800" },
  amber: { value: "text-amber-400", icon: "text-amber-400", bg: "bg-amber-500/10" },
  sky: { value: "text-sky-400", icon: "text-sky-400", bg: "bg-sky-500/10" },
  emerald: {
    value: "text-emerald-400",
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
};

function StatCard({ label, value, hint, icon: Icon, tone = "slate" }) {
  const t = TONES[tone];
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.bg}`}
        >
          <Icon className={`h-4 w-4 ${t.icon}`} />
        </div>
      </div>
      <p className={`mt-3 text-3xl font-semibold tabular-nums ${t.value}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0e1522] p-4">
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, action, className = "mb-4" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
        <Icon className="h-4 w-4 text-sky-400" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

// On/off switch
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
        checked ? "bg-sky-600" : "bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function InfoBox({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b1220] p-3">
      <p className="mb-1.5 text-xs text-slate-500">{title}</p>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, actionLabel, onAction }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-[#111827]/60 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
        {text}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-sky-600 px-4 text-xs font-medium text-white transition hover:bg-sky-500"
      >
        {actionLabel.toLowerCase().includes("create") && (
          <Plus className="h-3.5 w-3.5" />
        )}
        {actionLabel}
      </button>
    </div>
  );
}

export default Home;