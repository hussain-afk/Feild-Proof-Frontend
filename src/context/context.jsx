import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { MailWarning } from "lucide-react";

import { getCurrentUser, getAllUsers } from "../api/auth.api.js";
import { getAllTasks, getMyTasks } from "../api/task.api.js";
import { getNotifications } from "../api/notification.api.js";
import { getVerificationStatusAPI } from "../api/verification.api.js";
import { getAdminInfos } from "../api/admin.api.js";
import { socket } from "../services/socket.js";

import Modal from "../ui/Modal.jsx";

// eslint-disable-next-line react-refresh/only-export-components
export const context = createContext();

// Helpers
const getId = (item) => item?._id || item?.id;

// Add item at the top only if it is not already in the list
const addIfNew = (list, item) =>
  list.some((x) => getId(x) === getId(item)) ? list : [item, ...list];

// How often we are allowed to do a full refresh (milliseconds)
const MIN_REFRESH_GAP = 30 * 1000; // when user comes back to the tab
const FALLBACK_POLL = 60 * 1000; // only used if the socket is disconnected

const ContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [adminInfos, setAdminInfos] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState([]);

  // Only controls the "verify your email" warning modal
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isFetchingRef = useRef(false); // stops two refreshes running together
  const lastFetchRef = useRef(0); // time of the last full fetch
  const verifyModalShownRef = useRef(false); // warning modal is shown only ONE time

  // =========================
  // ONE PLACE TO FETCH DATA FOR EACH ROLE
  // (used by first load, tab focus, and socket reconnect)
  // NOTE: this function must NOT open any modal
  // =========================
  const fetchRoleData = useCallback(async (role) => {
    if (role === "manager") {
      // Promise.all runs the 3 requests together instead of one by one
      const [users, tasks, verifications] = await Promise.all([
        getAllUsers(),
        getAllTasks(),
        getVerificationStatusAPI(),
      ]);
      setAllUsers(users || []);
      setAllTasks(tasks || []);
      setVerificationStatus(verifications || []);
    }

    if (role === "worker") {
      const [tasks, list] = await Promise.all([
        getMyTasks(),
        getNotifications(),
      ]);
      setMyTasks(tasks || []);
      setNotifications(list || []);
    }

    if (role === "admin") {
      const infos = await getAdminInfos();
      const allUsersList = await getAllUsers();
      setAllUsers(allUsersList || []);
      setAdminInfos(infos || []);
    }

    lastFetchRef.current = Date.now();
  }, []);

  const refresh = useCallback(async () => {
    if (!user || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      await fetchRoleData(user.role);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [user, fetchRoleData]);

  // Use these right after your own create/delete API call succeeds,
  // so your screen updates instantly without waiting for the socket
  const addTask = useCallback((task) => {
    if (task && getId(task)) setAllTasks((old) => addIfNew(old, task));
  }, []);

  const removeTask = useCallback((taskId) => {
    const remove = (old) => old.filter((t) => getId(t) !== taskId);
    setAllTasks(remove);
    setMyTasks(remove);
  }, []);

  // =========================
  // LOAD DATA WHEN APP STARTS
  // =========================
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (!currentUser) return;

        await fetchRoleData(currentUser.role);

        // Show the verification warning only ONE time (not on every reload of data)
        if (currentUser.isVerified === false && !verifyModalShownRef.current) {
          verifyModalShownRef.current = true;
          setIsVerifyModalOpen(true);
        }

        // Send the user to their own dashboard if they are on "/"
        if (window.location.pathname === "/") {
          const home = { manager: "/manager", admin: "/admin", worker: "/worker" };
          if (home[currentUser.role]) navigate(home[currentUser.role]);
        }
      } catch (error) {
        console.error("Data loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate, fetchRoleData]);

  // =========================
  // SYNC WHEN USER RETURNS TO THE TAB
  // (replaces the 3 second polling)
  // =========================
  useEffect(() => {
    if (!user) return;

    const syncIfStale = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetchRef.current < MIN_REFRESH_GAP) return;
      refresh();
    };

    document.addEventListener("visibilitychange", syncIfStale);
    window.addEventListener("focus", syncIfStale);

    // Safety net: poll slowly, but ONLY when the socket is down and the tab is open
    const fallback = setInterval(() => {
      if (!socket.connected && document.visibilityState === "visible") {
        refresh();
      }
    }, FALLBACK_POLL);

    return () => {
      document.removeEventListener("visibilitychange", syncIfStale);
      window.removeEventListener("focus", syncIfStale);
      clearInterval(fallback);
    };
  }, [user, refresh]);

  // =========================
  // SOCKET.IO (real-time updates)
  // =========================
  useEffect(() => {
    if (!user) return;

    const userId = user._id || user.id;
    if (!userId) return;

    // Rooms are lost when the socket reconnects, so join on every "connect"
    const handleConnect = () => {
      socket.emit("join_room", userId);
      // We may have missed events while offline, so sync once (skip if just fetched)
      if (Date.now() - lastFetchRef.current > 5000) refresh();
    };

    // ---- New task ----
    const handleNewTask = (data = {}) => {
      const newTask = data.task || data.data;

      if (newTask) {
        setAllTasks((old) => addIfNew(old, newTask));
        setMyTasks((old) => addIfNew(old, newTask));
      }

      if (data.notification) {
        setNotifications((old) => addIfNew(old, data.notification));
      }

      toast.success(data.message || "New task assigned!");
    };

    // If an event arrives without usable data, just reload (debounced)
    let softTimer;
    const softRefresh = () => {
      clearTimeout(softTimer);
      softTimer = setTimeout(refresh, 400);
    };

    // ---- Task created (manager/admin lists) ----
    const handleTaskCreated = (data = {}) => {
      const newTask = data.task || data.data;
      if (newTask && getId(newTask)) {
        setAllTasks((old) => addIfNew(old, newTask));
      } else {
        softRefresh();
      }
    };

    // ---- Task updated ----
    const handleTaskUpdate = (data = {}) => {
      const updated = data.task || data.data || data;
      const taskId = getId(updated);
      if (!taskId) return softRefresh();

      const merge = (old) =>
        old.map((task) => (getId(task) === taskId ? { ...task, ...updated } : task));

      setAllTasks(merge);
      setMyTasks(merge);
    };

    // ---- Task deleted ----
    const handleTaskDelete = (data = {}) => {
      const taskId = data.taskId || data.id || getId(data.task);
      if (!taskId) return softRefresh();

      const remove = (old) => old.filter((task) => getId(task) !== taskId);
      setAllTasks(remove);
      setMyTasks(remove);
    };

    // ---- New notification (without a new task) ----
    const handleNotification = (data = {}) => {
      const notification = data.notification || data;
      if (getId(notification)) {
        setNotifications((old) => addIfNew(old, notification));
      }
    };

    // ---- Targeted refetch: reload ONLY the one thing that changed ----
    let timer;
    const debounce = (fn) => () => {
      clearTimeout(timer);
      timer = setTimeout(fn, 500); // many events in a row become 1 request
    };

    const reloadVerifications = debounce(async () => {
      try {
        setVerificationStatus((await getVerificationStatusAPI()) || []);
      } catch (e) {
        console.error(e);
      }
    });

    const reloadAdminInfos = debounce(async () => {
      try {
        setAdminInfos((await getAdminInfos()) || []);
      } catch (e) {
        console.error(e);
      }
    });

    // ---- Connect and listen ----
    socket.on("connect", handleConnect);
    socket.connect();
    if (socket.connected) handleConnect();

    // Dev only: prints every socket event in the browser console (for debugging)
    const logEvent = (event, ...args) => console.log("[socket]", event, args);
    if (import.meta.env?.DEV) socket.onAny(logEvent);

    socket.on("new_task_assigned", handleNewTask);
    socket.on("new_notification", handleNotification);

    const updateEvents = [
      "task_updated",
      "task_status_updated",
      "task_updated_by_worker",
    ];
    const deleteEvents = ["task_deleted", "task_removed"];

    socket.on("task_created", handleTaskCreated);
    updateEvents.forEach((e) => socket.on(e, handleTaskUpdate));
    deleteEvents.forEach((e) => socket.on(e, handleTaskDelete));

    // Manager: a worker checked in/out or proof changed
    if (user.role === "manager") {
      socket.on("verification_updated", reloadVerifications);
    }
    // Admin: a new activity log row was saved
    if (user.role === "admin") {
      socket.on("admin_info_updated", reloadAdminInfos);
    }

    // ---- Cleanup ----
    return () => {
      clearTimeout(timer);
      clearTimeout(softTimer);
      socket.offAny(logEvent);
      socket.off("task_created", handleTaskCreated);
      socket.off("connect", handleConnect);
      socket.off("new_task_assigned", handleNewTask);
      socket.off("new_notification", handleNotification);
      updateEvents.forEach((e) => socket.off(e, handleTaskUpdate));
      deleteEvents.forEach((e) => socket.off(e, handleTaskDelete));
      socket.off("verification_updated", reloadVerifications);
      socket.off("admin_info_updated", reloadAdminInfos);
      socket.disconnect();
    };
  }, [user, refresh]);

  // =========================
  // CONTEXT
  // =========================
  return (
    <>
      <context.Provider
        value={{
          isCreateTaskModalOpen,
          setIsCreateTaskModalOpen,

          paymentModalOpen,
          setPaymentModalOpen,

          user,
          setUser,

          allUsers,
          setAllUsers,

          allTasks,
          setAllTasks,

          myTasks,
          setMyTasks,

          notifications,
          setNotifications,

          verificationStatus,
          setVerificationStatus,

          isLoading,
          setIsLoading,

          adminInfos,
          setAdminInfos,

          // Handy for a "Refresh" button
          refresh,
          addTask,
          removeTask,
          fetchRoleData
        }}
      >
        {children}
      </context.Provider>

      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify your email"
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10">
            <MailWarning className="h-7 w-7 text-sky-400" />
          </div>

          {/* Message */}
          <h2 className="text-lg font-semibold text-white">
            Email verification required
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
            Please verify your email address to unlock all features of your account.
            Go to your profile to verify.
          </p>

          {/* Hint box */}
          <div className="mt-5 w-full rounded-xl border border-slate-800 bg-[#0b1220] px-4 py-3 text-left">
            <p className="text-xs font-medium text-slate-300">
              Can't find the email?
            </p>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={() => setIsVerifyModalOpen(false)}
            className="mt-5 h-10 w-full rounded-lg bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500"
          >
            Got it
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ContextProvider;