import React, { useState, useContext } from 'react';
import Modal from '../../Modal';
import { context } from '../../../context/context.jsx';
import useTasks from '../../../hooks/useTasks.jsx';
import ManagerTaskCard from './TaskCard.jsx';
import {
  FileText,
  UserCheck,
  Calendar,
  MapPin,
  Compass,
  PlusCircle,
  X,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function Home() {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // Selected Task Details state
  
  const { allUsers = [], allTasks = [] } = useContext(context);
  const { handleCreateTask } = useTasks();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedWorker: '',
    dueDate: '',
    siteLocation: {
      name: '',
      latitude: '',
      longitude: '',
      radiusInMeters: 100,
    },
  });

  console.log(allTasks); // Debugging: Log all tasks to verify data
  // Automatic Live GPS Coordinates Handler
  const handleGetLiveLocation = () => {
    if (navigator.geolocation) {
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
          console.error("GPS error:", error);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await handleCreateTask(formData);
    console.log('Task created successfully:', response);
    
    // Reset Form & Close Modal
    setFormData({
      title: '',
      description: '',
      assignedWorker: '',
      dueDate: '',
      siteLocation: { name: '', latitude: '', longitude: '', radiusInMeters: 100 },
    });
    setIsCreateTaskModalOpen(false);
  };

  const handleStatusChange = (taskId, newStatus) => {
    console.log(`Task ${taskId} status changed to: ${newStatus}`);
    // Yahan status update API call karein
  };

  // View Details Modal Handler
  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  return (
    <>
      <div className="p-6 bg-[#0b0f19] min-h-screen text-slate-100">
        
        {/* Top Header & Create Task Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Field Operations Tasks</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage tasks, assignments, and geo-fenced boundaries</p>
          </div>

          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Task
          </button>
        </div>

        {/* Cards Grid Container */}
        {allTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTasks.map((taskItem) => (
              <ManagerTaskCard
                key={taskItem._id || taskItem.id}
                task={taskItem}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 bg-[#111827]/50 border border-slate-800 rounded-2xl text-center">
            <p className="text-slate-400 text-sm mb-3">No field tasks found.</p>
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-3.5 py-2 rounded-lg border border-slate-700 transition-all"
            >
              + Create First Task
            </button>
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        title="Create New Task"
        subtitle="Assign field operations with location boundaries"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">

          {/* Task Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Task Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. CCTV Security Installation Site 4"
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Notes
            </label>
            <textarea
              rows="2.5"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide specific instructions or access details for field worker..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all resize-none shadow-inner"
            />
          </div>

          {/* Worker Selection & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                Assign Field Worker
              </label>
              <select
                required
                value={formData.assignedWorker}
                onChange={(e) => setFormData({ ...formData, assignedWorker: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none transition-all cursor-pointer shadow-inner"
              >
                <option value="" className="bg-slate-900 text-slate-400">Select Worker</option>
                {allUsers.map((user) => (
                  <option key={user._id || user.id} value={user._id || user.id} className="bg-slate-900">
                    {user.name} ({user.role || 'Worker'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Completion Due Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Site Geo-Fence Boundaries Box */}
          <div className="p-3.5 bg-slate-900/60 border border-slate-800/90 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Site Location & Geo-Fence
              </span>

              <button
                type="button"
                onClick={handleGetLiveLocation}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-800/90 hover:bg-slate-700 text-blue-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all shadow-sm"
              >
                <Compass className="w-3 h-3 text-blue-400" />
                Get GPS Coordinates
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Site / Venue Name
              </label>
              <input
                type="text"
                required
                value={formData.siteLocation.name}
                onChange={(e) => setFormData({
                  ...formData,
                  siteLocation: { ...formData.siteLocation, name: e.target.value }
                })}
                placeholder="e.g. Warehouse Depot Site 4"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.siteLocation.latitude}
                  onChange={(e) => setFormData({
                    ...formData,
                    siteLocation: { ...formData.siteLocation, latitude: e.target.value }
                  })}
                  placeholder="24.8607"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.siteLocation.longitude}
                  onChange={(e) => setFormData({
                    ...formData,
                    siteLocation: { ...formData.siteLocation, longitude: e.target.value }
                  })}
                  placeholder="67.0011"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                  <span>Radius (m)</span>
                  <Target className="w-2.5 h-2.5 text-blue-400" />
                </label>
                <input
                  type="number"
                  required
                  value={formData.siteLocation.radiusInMeters}
                  onChange={(e) => setFormData({
                    ...formData,
                    siteLocation: { ...formData.siteLocation, radiusInMeters: e.target.value }
                  })}
                  placeholder="100"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateTaskModalOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW TASK DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title="Task Overview Specs"
        subtitle={`Task ID: ${selectedTask?._id || 'N/A'}`}
      >
        {selectedTask && (
          <div className="space-y-4 pt-1">
            <div>
              <h4 className="text-base font-bold text-white mb-1">{selectedTask.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedTask.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Worker Assigned</span>
                <span className="font-semibold text-slate-200">{selectedTask.assignedWorker?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Status</span>
                <span className="font-semibold text-blue-400 uppercase text-[11px]">{selectedTask.status}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
              <span className="text-blue-400 font-semibold block mb-1">Site Location</span>
              <p className="text-slate-200 font-medium">{selectedTask.siteLocation?.name || 'N/A'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Coordinates: {selectedTask.siteLocation?.latitude}, {selectedTask.siteLocation?.longitude} (Radius: {selectedTask.siteLocation?.radiusInMeters}m)
              </p>
            </div>

            <button
              onClick={() => setSelectedTask(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-medium transition-all"
            >
              Close Overview
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

export default Home;