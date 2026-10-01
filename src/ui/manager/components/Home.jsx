import React, {
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
import LocationPicker from './LocationPicker.jsx';
import {
  FileText,
  UserCheck,
  MapPin,
  Compass,
  Plus,
  X,
  Target,
  CheckCircle2,
  Clock3,
  ListTodo,
} from "lucide-react";

// Empty form (reset ke liye bhi yehi use hoga)
const emptyForm = {
  title: "",
  description: "",
  assignedWorker: [], // IDs ka array
  dueDate: "",
  siteLocation: {
    name: "",
    latitude: "",
    longitude: "",
    radiusInMeters: 100,
  },
};

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-[#0b1220] border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors";

const labelClass = "block text-xs font-medium text-slate-400 mb-1.5";

function Home() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [workerSearch, setWorkerSearch] = useState("");

  const {
    allUsers = [],
    allTasks = [],
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
  } = useContext(context);

  const { handleCreateTask } = useTasks();

  // ---------- Statistics ----------
  const totalTasks = allTasks.length;
  const pendingTasks = allTasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = allTasks.filter((t) => t.status === "in-progress").length;
  const completedTasks = allTasks.filter((t) => t.status === "completed").length;

  // ---------- Form helpers ----------
  const resetForm = () => {
    setFormData(emptyForm);
    setWorkerSearch("");
  };

  const closeCreateModal = () => {
    resetForm();
    setIsCreateTaskModalOpen(false);
  };

  const updateLocation = (field, value) => {
    setFormData({
      ...formData,
      siteLocation: { ...formData.siteLocation, [field]: value },
    });
  };

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          siteLocation: {
            ...prev.siteLocation,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));
      },
      () => alert("Unable to get your current location.")
    );
  };

  // ---------- Worker selection ----------

  // typing smooth rahe, isliye search ko "deferred" kiya hai
  const deferredSearch = useDeferredValue(workerSearch);

  const filteredUsers = useMemo(() => {
    const text = deferredSearch.toLowerCase();
    return allUsers.filter((u) =>
      `${u.name} ${u.role || ""}`.toLowerCase().includes(text)
    );
  }, [allUsers, deferredSearch]);

  // Set se "selected hai ya nahi" check karna tez hota hai
  const selectedSet = useMemo(
    () => new Set(formData.assignedWorker),
    [formData.assignedWorker]
  );

  // ek worker ko check / uncheck (sirf wahi row dobara render hogi)
  const toggleWorker = useCallback((id) => {
    setFormData((prev) => {
      const set = new Set(prev.assignedWorker);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...prev, assignedWorker: [...set] };
    });
  }, []);

  // sirf wo users jo select ho sakte hain (managers nahi)
  const selectableUsers = filteredUsers.filter((u) => !isManager(u));

  const allSelected =
    selectableUsers.length > 0 &&
    selectableUsers.every((u) => selectedSet.has(getId(u)));

  // "Select all" checkbox (sirf filtered list ke liye)
  const toggleSelectAll = () => {
    const ids = selectableUsers.map(getId);
    const newList = allSelected
      ? formData.assignedWorker.filter((id) => !ids.includes(id))
      : [...new Set([...formData.assignedWorker, ...ids])];
    setFormData({ ...formData, assignedWorker: newList });
  };

  const clearSelection = () => setFormData({ ...formData, assignedWorker: [] });

  // ---------- Create task ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.assignedWorker.length === 0) {
      alert("Please select at least one worker.");
      return;
    }

    try {
      await handleCreateTask(formData);
      closeCreateModal();
    } catch (error) {
      console.error("Create task error:", error);
    }
  };

  // ---------- Task details: workers ki list ----------
  const getWorkers = (task) => {
    const list = Array.isArray(task.assignedWorker)
      ? task.assignedWorker
      : task.assignedWorker
        ? [task.assignedWorker]
        : [];

    // agar sirf ID aayi hai to allUsers mein se dhoondo
    return list.map((w) =>
      typeof w === "object"
        ? w
        : allUsers.find((u) => getId(u) === w) || { name: "Unknown" }
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 p-4 sm:p-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Manager Dashboard</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">
              Field Operations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage field tasks, workers and site locations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="w-full md:w-auto h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Tasks" value={totalTasks} icon={ListTodo}
            valueColor="text-white" iconColor="text-slate-300" iconBg="bg-slate-800" />
          <StatCard label="Pending" value={pendingTasks} icon={Clock3}
            valueColor="text-amber-400" iconColor="text-amber-400" iconBg="bg-amber-500/10" />
          <StatCard label="In Progress" value={inProgressTasks} icon={Clock3}
            valueColor="text-blue-400" iconColor="text-blue-400" iconBg="bg-blue-500/10" />
          <StatCard label="Completed" value={completedTasks} icon={CheckCircle2}
            valueColor="text-emerald-400" iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
        </div>

        {/* ================= TASK LIST ================= */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">All Tasks</h2>
          <p className="text-xs text-slate-500 mt-1">
            {totalTasks} task{totalTasks !== 1 ? "s" : ""} available
          </p>
        </div>

        {allTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allTasks.map((taskItem) => (
              <ManagerTaskCard
                key={taskItem._id || taskItem.id}
                task={taskItem}
                onViewDetails={setSelectedTask}
              />
            ))}
          </div>
        ) : (
          <div className="min-h-[300px] bg-[#111827] border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <ListTodo className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              No tasks available
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5">
              You haven't created any field tasks yet. Create your first task to
              start managing field operations.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="mt-4 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Task
            </button>
          </div>
        )}
      </div>

      {/* ================= CREATE TASK MODAL ================= */}
      <Modal
        isOpen={isCreateTaskModalOpen}
        onClose={closeCreateModal}
        title="Create Task"
        subtitle="Create a field assignment and define its work location."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ---- Task Information ---- */}
          <div>
            <SectionTitle icon={FileText} title="Task Information"
              subtitle="Basic details about the assignment" blue />

            <div className="mb-3">
              <label className={labelClass}>Task Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add instructions or additional notes..."
                className={`${inputClass} h-auto py-2.5 resize-none`}
              />
            </div>
          </div>

          {/* ---- Assignment ---- */}
          <div className="border-t border-slate-800 pt-5">
            <SectionTitle icon={UserCheck} title="Assignment"
              subtitle="Choose workers and deadline" />

            {/* Due date */}
            <div className="mb-4">
              <label className={labelClass}>Due Date</label>
              <input
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Workers table */}
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${labelClass} mb-0`}>Field Workers</label>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-blue-400 font-medium">
                  {formData.assignedWorker.length} selected
                </span>
                {formData.assignedWorker.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <input
              type="text"
              value={workerSearch}
              onChange={(e) => setWorkerSearch(e.target.value)}
              placeholder="Search worker by name or role..."
              className={`${inputClass} mb-2`}
            />

            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#111827] z-10">
                    <tr className="text-left text-[11px] text-slate-500">
                      <th className="w-10 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-2 font-medium">Worker</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-xs text-slate-500">
                          No workers found
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
          </div>

          {/* ---- Site Location ---- */}
          {/* ---- Site Location Section ---- */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Site Location & Geofence</h3>
              <p className="text-xs text-slate-400">Google Maps se location dhoond kar paste karein</p>
            </div>

            {/* Location Name */}
            <div>
              <label className={labelClass}>Site / Venue Name</label>
              <input
                type="text"
                required
                value={formData.siteLocation.name}
                onChange={(e) => updateLocation("name", e.target.value)}
                placeholder="e.g. Zaitoon Ashraf IT Park"
                className={inputClass}
              />
            </div>

            {/* Maps Link App Integration */}
            <LocationPicker
              siteLocation={formData.siteLocation}
              setFormData={setFormData}
            />

            {/* Dynamic Radius Selector */}
            <div>
              <label className={labelClass}>Allowed Check-in Radius</label>
              <select
                value={formData.siteLocation.radiusInMeters}
                onChange={(e) => updateLocation("radiusInMeters", Number(e.target.value))}
                className={`${inputClass} cursor-pointer`}
              >
                <option value={50}>50m (Very Small Area)</option>
                <option value={100}>100m (Strict Building Spot)</option>
                <option value={250}>250m (Small Area / Ground)</option>
                <option value={500}>500m (Half KM Zone - Recommended)</option>
                <option value={1000}>1000m (1 KM Zone)</option>
              </select>
            </div>
          </div>


          {/* ---- Buttons ---- */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={closeCreateModal}
              className="flex-1 h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= TASK DETAILS MODAL ================= */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
        subtitle={`Task ID: ${selectedTask?._id || "N/A"}`}
      >
        {selectedTask && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {selectedTask.title}
                </h3>
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold uppercase">
                  {selectedTask.status || "pending"}
                </span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mt-2">
                {selectedTask.description || "No description provided for this task."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  Assigned Workers
                </p>
                {getWorkers(selectedTask).length === 0 ? (
                  <p className="text-sm font-medium text-slate-200">Unassigned</p>
                ) : (
                  <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                    {getWorkers(selectedTask).map((w, i) => (
                      <div key={getId(w) || i} className="flex items-center gap-2">
                        <Avatar user={w} size="w-6 h-6" />
                        <span className="text-sm text-slate-200">{w.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  Due Date
                </p>
                <p className="text-sm font-medium text-slate-200">
                  {selectedTask.dueDate
                    ? new Date(selectedTask.dueDate).toLocaleString()
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0b1220] border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-200">
                  Site Location
                </span>
              </div>

              <p className="text-sm text-slate-300">
                {selectedTask.siteLocation?.name || "Location not specified"}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <p className="text-[10px] text-slate-500">Latitude</p>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedTask.siteLocation?.latitude || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Longitude</p>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedTask.siteLocation?.longitude || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Radius</p>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedTask.siteLocation?.radiusInMeters || 100}m
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="w-full h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

// ---------- Chhote reusable components (code repeat na ho isliye) ----------

// user ki ID nikalne ka helper
const getId = (user) => user._id || user.id;

// Manager ko task assign nahi ho sakta
const isManager = (user) => user.role?.toLowerCase() === "manager";

// Profile picture. Agar picture nahi ya load fail ho jaye to naam ke initials dikhte hain.
// NOTE: apne backend ke hisaab se field name yahan badal lein (profilePic / avatar / image / photo)
function Avatar({ user, size = "w-8 h-8" }) {
  const [failed, setFailed] = useState(false);
  const pic = user.profilePic || user.avatar || user.image || user.photo;

  if (pic && !failed) {
    return (
      <img
        src={pic}
        alt={user.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`${size} rounded-full object-cover shrink-0 border border-slate-700`}
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
      className={`${size} rounded-full bg-blue-500/15 text-blue-300 text-[11px] font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

// Table ki ek row. memo ki wajah se sirf badalne wali row dobara render hoti hai (lag nahi aata)
const WorkerRow = memo(function WorkerRow({ user, checked, onToggle }) {
  const id = getId(user);
  const disabled = isManager(user);

  return (
    <tr
      onClick={() => !disabled && onToggle(id)}
      className={`border-t border-slate-800 ${disabled
          ? "opacity-50 cursor-not-allowed"
          : checked
            ? "bg-blue-500/10 cursor-pointer"
            : "hover:bg-slate-800/50 cursor-pointer"
        }`}
    >
      <td className="w-10 px-3 py-2">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
        />
      </td>

      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="text-slate-200 truncate">{user.name}</p>
            {user.email && (
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-3 py-2 text-slate-400 capitalize">
        {user.role || "Worker"}
        {disabled && (
          <span className="block text-[10px] text-slate-500 normal-case">
            Can't be assigned
          </span>
        )}
      </td>
    </tr>
  );
});

function StatCard({ label, value, icon: Icon, valueColor, iconColor, iconBg }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`text-2xl font-semibold mt-1 ${valueColor}`}>{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, blue, noMargin }) {
  return (
    <div className={`flex items-center gap-2 ${noMargin ? "" : "mb-3"}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${blue ? "bg-blue-500/10" : "bg-slate-800"
          }`}
      >
        <Icon className={`w-3.5 h-3.5 ${blue ? "text-blue-400" : "text-slate-300"}`} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-200">{title}</h3>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default Home;