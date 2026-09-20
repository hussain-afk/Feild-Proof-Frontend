import React, { useContext, useState } from "react";
import Modal from "../../Modal";
import { context } from "../../../context/context.jsx";
import useTasks from "../../../hooks/useTasks.jsx";
import ManagerTaskCard from "./TaskCard.jsx";

import {
  FileText,
  UserCheck,
  Calendar,
  MapPin,
  Compass,
  Plus,
  X,
  Target,
  CheckCircle2,
  Clock3,
  ListTodo,
} from "lucide-react";

function Home() {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { allUsers = [], allTasks = [] } = useContext(context);
  const { handleCreateTask } = useTasks();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedWorker: "",
    dueDate: "",
    siteLocation: {
      name: "",
      latitude: "",
      longitude: "",
      radiusInMeters: 100,
    },
  });

  // --------------------------------
  // Task Statistics
  // --------------------------------

  const totalTasks = allTasks.length;

  const completedTasks = allTasks.filter(
    (task) => task.status === "completed"
  ).length;

  const inProgressTasks = allTasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const pendingTasks = allTasks.filter(
    (task) => task.status === "pending"
  ).length;

  // --------------------------------
  // Reset Form
  // --------------------------------

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assignedWorker: "",
      dueDate: "",
      siteLocation: {
        name: "",
        latitude: "",
        longitude: "",
        radiusInMeters: 100,
      },
    });
  };

  // --------------------------------
  // Get GPS Location
  // --------------------------------

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
      (error) => {
        console.error("GPS Error:", error);
        alert("Unable to get your current location.");
      }
    );
  };

  // --------------------------------
  // Create Task
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await handleCreateTask(formData);

      resetForm();
      setIsCreateTaskModalOpen(false);
    } catch (error) {
      console.error("Create task error:", error);
    }
  };

  // --------------------------------
  // View Details
  // --------------------------------

  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  // --------------------------------
  // Input Class
  // --------------------------------

  const inputClass =
    "w-full h-10 px-3 rounded-lg bg-[#0b1220] border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors";

  const labelClass =
    "block text-xs font-medium text-slate-400 mb-1.5";

  return (
    <>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 p-4 sm:p-6">

        {/* =========================================
            PAGE HEADER
        ========================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <p className="text-xs text-slate-500 mb-1">
              Manager Dashboard
            </p>

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

        {/* =========================================
            STATISTICS
        ========================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

          {/* Total */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-slate-500">
                  Total Tasks
                </p>

                <p className="text-2xl font-semibold text-white mt-1">
                  {totalTasks}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                <ListTodo className="w-4 h-4 text-slate-300" />
              </div>

            </div>
          </div>

          {/* Pending */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-slate-500">
                  Pending
                </p>

                <p className="text-2xl font-semibold text-amber-400 mt-1">
                  {pendingTasks}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock3 className="w-4 h-4 text-amber-400" />
              </div>

            </div>
          </div>

          {/* In Progress */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-slate-500">
                  In Progress
                </p>

                <p className="text-2xl font-semibold text-blue-400 mt-1">
                  {inProgressTasks}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock3 className="w-4 h-4 text-blue-400" />
              </div>

            </div>
          </div>

          {/* Completed */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-slate-500">
                  Completed
                </p>

                <p className="text-2xl font-semibold text-emerald-400 mt-1">
                  {completedTasks}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

            </div>
          </div>
        </div>

        {/* =========================================
            TASK SECTION HEADER
        ========================================= */}

        <div className="flex items-center justify-between mb-4">

          <div>
            <h2 className="text-base font-semibold text-white">
              All Tasks
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {totalTasks} task{totalTasks !== 1 ? "s" : ""} available
            </p>
          </div>

        </div>

        {/* =========================================
            TASK GRID
        ========================================= */}

        {allTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {allTasks.map((taskItem) => (
              <ManagerTaskCard
                key={taskItem._id || taskItem.id}
                task={taskItem}
                onViewDetails={handleViewDetails}
              />
            ))}

          </div>
        ) : (

          /* Empty State */

          <div className="min-h-[300px] bg-[#111827] border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center px-6">

            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <ListTodo className="w-5 h-5 text-slate-400" />
            </div>

            <h3 className="text-sm font-semibold text-slate-200">
              No tasks available
            </h3>

            <p className="text-xs text-slate-500 max-w-sm mt-1.5">
              You haven't created any field tasks yet. Create your first
              task to start managing field operations.
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

      {/* =====================================================
          CREATE TASK MODAL
      ===================================================== */}

      <Modal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        title="Create Task"
        subtitle="Create a field assignment and define its work location."
      >

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Task Information */}

          <div>
            <div className="flex items-center gap-2 mb-3">

              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200">
                  Task Information
                </h3>

                <p className="text-[11px] text-slate-500">
                  Basic details about the assignment
                </p>
              </div>

            </div>

            {/* Title */}

            <div className="mb-3">
              <label className={labelClass}>
                Task Title
              </label>

              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                placeholder="Enter task title"
                className={inputClass}
              />
            </div>

            {/* Description */}

            <div>
              <label className={labelClass}>
                Description
              </label>

              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Add instructions or additional notes..."
                className={`${inputClass} h-auto py-2.5 resize-none`}
              />
            </div>
          </div>

          {/* Assignment */}

          <div className="border-t border-slate-800 pt-5">

            <div className="flex items-center gap-2 mb-3">

              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5 text-slate-300" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200">
                  Assignment
                </h3>

                <p className="text-[11px] text-slate-500">
                  Choose a worker and deadline
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Worker */}

              <div>
                <label className={labelClass}>
                  Field Worker
                </label>

                <select
                  required
                  value={formData.assignedWorker}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedWorker: e.target.value,
                    })
                  }
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">
                    Select worker
                  </option>

                  {allUsers.map((user) => (
                    <option
                      key={user._id || user.id}
                      value={user._id || user.id}
                    >
                      {user.name} ({user.role || "Worker"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}

              <div>
                <label className={labelClass}>
                  Due Date
                </label>

                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

            </div>
          </div>

          {/* Location */}

          <div className="border-t border-slate-800 pt-5">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

              <div className="flex items-center gap-2">

                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-200">
                    Site Location
                  </h3>

                  <p className="text-[11px] text-slate-500">
                    Define the task's geo-fenced area
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleGetLiveLocation}
                className="h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Get Current Location
              </button>

            </div>

            {/* Location Name */}

            <div className="mb-3">

              <label className={labelClass}>
                Site / Venue Name
              </label>

              <input
                type="text"
                required
                value={formData.siteLocation.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    siteLocation: {
                      ...formData.siteLocation,
                      name: e.target.value,
                    },
                  })
                }
                placeholder="e.g. Warehouse Depot"
                className={inputClass}
              />

            </div>

            {/* Coordinates */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Latitude */}

              <div>
                <label className={labelClass}>
                  Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  required
                  value={formData.siteLocation.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      siteLocation: {
                        ...formData.siteLocation,
                        latitude: e.target.value,
                      },
                    })
                  }
                  placeholder="24.8607"
                  className={inputClass}
                />
              </div>

              {/* Longitude */}

              <div>
                <label className={labelClass}>
                  Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  required
                  value={formData.siteLocation.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      siteLocation: {
                        ...formData.siteLocation,
                        longitude: e.target.value,
                      },
                    })
                  }
                  placeholder="67.0011"
                  className={inputClass}
                />
              </div>

              {/* Radius */}

              <div>
                <label className={labelClass}>
                  Radius (meters)
                </label>

                <div className="relative">

                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />

                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.siteLocation.radiusInMeters}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siteLocation: {
                          ...formData.siteLocation,
                          radiusInMeters: e.target.value,
                        },
                      })
                    }
                    className={`${inputClass} pl-9`}
                  />

                </div>
              </div>

            </div>

            {/* GPS Status */}

            {formData.siteLocation.latitude &&
              formData.siteLocation.longitude && (

                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">

                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />

                  <span className="text-[11px] text-emerald-400">
                    GPS coordinates added successfully
                  </span>

                </div>
              )}

          </div>

          {/* Buttons */}

          <div className="flex gap-2 pt-2">

            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsCreateTaskModalOpen(false);
              }}
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

      {/* =====================================================
          TASK DETAILS MODAL
      ===================================================== */}

      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
        subtitle={`Task ID: ${selectedTask?._id || "N/A"}`}
      >

        {selectedTask && (

          <div className="space-y-5">

            {/* Title */}

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
                {selectedTask.description ||
                  "No description provided for this task."}
              </p>

            </div>

            {/* Details */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800">

                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  Assigned Worker
                </p>

                <p className="text-sm font-medium text-slate-200">
                  {selectedTask.assignedWorker?.name ||
                    "Unassigned"}
                </p>

              </div>

              <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800">

                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  Due Date
                </p>

                <p className="text-sm font-medium text-slate-200">
                  {selectedTask.dueDate
                    ? new Date(
                        selectedTask.dueDate
                      ).toLocaleString()
                    : "Not specified"}
                </p>

              </div>

            </div>

            {/* Location */}

            <div className="p-4 rounded-lg bg-[#0b1220] border border-slate-800">

              <div className="flex items-center gap-2 mb-3">

                <MapPin className="w-4 h-4 text-blue-400" />

                <span className="text-sm font-medium text-slate-200">
                  Site Location
                </span>

              </div>

              <p className="text-sm text-slate-300">
                {selectedTask.siteLocation?.name ||
                  "Location not specified"}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-3">

                <div>
                  <p className="text-[10px] text-slate-500">
                    Latitude
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {selectedTask.siteLocation?.latitude || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500">
                    Longitude
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {selectedTask.siteLocation?.longitude || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500">
                    Radius
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {selectedTask.siteLocation?.radiusInMeters || 100}m
                  </p>
                </div>

              </div>

            </div>

            {/* Close */}

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

export default Home;