import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { MailWarning } from "lucide-react";

import {
  getCurrentUser,
  getAllUsers,
  getMyWorkers,
  getAvailableWorkers,
} from "../api/auth.api.js";
import { getAllTasks, getMyTasks } from "../api/task.api.js";
import { getNotifications } from "../api/notification.api.js";
import {
  getVerificationStatusAPI,
  getMyApprovedTasks,
  getMyRejectedTasks,
} from "../api/verification.api.js";
import { getAdminInfos, getManagerRequests } from "../api/admin.api.js";
import {
  getWorkerInvitations,
  getManagerInvitations,
} from "../api/invitation.api.js";
import { socket } from "../services/socket.js";

import Modal from "../ui/Modal.jsx";

// eslint-disable-next-line react-refresh/only-export-components
export const context = createContext();

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const getId = (item) => item?._id || item?.id;

const getPendingManagerRequests = (requests) =>
  (Array.isArray(requests) ? requests : []).filter(
    (request) =>
      String(request?.status || "pending").toLowerCase() === "pending"
  );

const addIfNew = (list, item) =>
  list.some((x) => getId(x) === getId(item)) ? list : [item, ...list];

const isSameUser = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const HOME = { manager: "/manager", admin: "/admin", worker: "/worker" };

const MIN_REFRESH_GAP = 30 * 1000;
const FALLBACK_POLL = 60 * 1000;

/* ------------------------------------------------------------------ */
/* Provider                                                             */
/* ------------------------------------------------------------------ */

const ContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [adminInfos, setAdminInfos] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState([]);
  const [managerRequests, setManagerRequests] = useState([]);
  const [myWorkers, setMyWorkers] = useState([]);
  const [myApprovedTasks, setMyApprovedTasks] = useState([]);
  const [myRejectedTasks, setMyRejectedTasks] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [myInvitations, setMyInvitations] = useState([]);
  const [managerInvitations, setManagerInvitations] = useState([]);

  // console.log(availableWorkers," availableWorkers");
  // console.log(managerInvitations," managerInvitations");
  // console.log(myInvitations," myInvitations");

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?._id || user?.id;
  const role = user?.role;

  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const verifyModalShownRef = useRef(false);
  const roleRef = useRef(null);
  const prevUserIdRef = useRef(null);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    roleRef.current = role || null;
  }, [role]);

  // =========================
  // APPROVED + REJECTED TASKS
  // =========================
  const fetchReviewedTasks = useCallback(async () => {
    const [approved, rejected] = await Promise.allSettled([
      getMyApprovedTasks(),
      getMyRejectedTasks(),
    ]);

    if (approved.status === "fulfilled") {
      setMyApprovedTasks(approved.value || []);
    } else {
      console.error("Could not load approved tasks:", approved.reason);
    }

    if (rejected.status === "fulfilled") {
      setMyRejectedTasks(rejected.value || []);
    } else {
      console.error("Could not load rejected tasks:", rejected.reason);
    }
  }, []);

  // =========================
  // ROLE DATA
  // =========================
  const fetchRoleData = useCallback(
    async (userRole) => {
      if (!userRole) return;

      if (userRole === "manager") {
        const [tasks, verifications, workers, freeWorkers, invites] =
          await Promise.all([
            getAllTasks(),
            getVerificationStatusAPI(),
            getMyWorkers(),
            getAvailableWorkers(),
            getManagerInvitations(),
          ]);
        setAllTasks(tasks || []);
        setVerificationStatus(verifications || []);
        setMyWorkers(workers || []);
        setAvailableWorkers(freeWorkers || []);
        setManagerInvitations(invites || []);
        await fetchReviewedTasks();
      }

      if (userRole === "worker") {
        const [tasks, list, invites] = await Promise.all([
          getMyTasks(),
          getNotifications(),
          getWorkerInvitations(),
        ]);
        setMyTasks(tasks || []);
        setNotifications(list || []);
        setMyInvitations(invites || []);
        await fetchReviewedTasks();
      }

      if (userRole === "admin") {
        const [infos, users, requests] = await Promise.all([
          getAdminInfos(),
          getAllUsers(),
          getManagerRequests(),
        ]);
        setAdminInfos(infos || []);
        setAllUsers(users || []);
        setManagerRequests(getPendingManagerRequests(requests));
      }

      lastFetchRef.current = Date.now();
    },
    [fetchReviewedTasks]
  );

  // =========================
  // SYNC USER
  // =========================
  const syncUser = useCallback(
    async (partial) => {
      try {
        const fresh = partial ? null : await getCurrentUser();
        if (!partial && !fresh) return;

        setUser((prev) => {
          const next = partial ? { ...prev, ...partial } : fresh;
          return isSameUser(prev, next) ? prev : next;
        });

        const newRole = (partial || fresh)?.role;
        if (newRole && newRole !== roleRef.current) {
          roleRef.current = newRole;
          await fetchRoleData(newRole);
        }
      } catch (error) {
        console.error("User sync error:", error);
      }
    },
    [fetchRoleData]
  );

  const refresh = useCallback(async () => {
    if (!role || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      await Promise.all([fetchRoleData(role), syncUser()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [role, fetchRoleData, syncUser]);

  const addTask = useCallback((task) => {
    if (task && getId(task)) setAllTasks((old) => addIfNew(old, task));
  }, []);

  const removeTask = useCallback((taskId) => {
    const remove = (old) => old.filter((t) => getId(t) !== taskId);
    setAllTasks(remove);
    setMyTasks(remove);
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);

        const currentUser = await getCurrentUser();
        if (cancelled) return;

        setUser(currentUser);

        if (!currentUser) return;

        if (currentUser.isBanned) {
          toast.error("Your account has been banned. Please contact support.");
          navigateRef.current("/banned");
          return;
        }

        await fetchRoleData(currentUser.role);
        if (cancelled) return;

        if (
          currentUser.isVerified === false &&
          !verifyModalShownRef.current
        ) {
          verifyModalShownRef.current = true;
          setIsVerifyModalOpen(true);
        }

        if (window.location.pathname === "/auth" && HOME[currentUser.role]) {
          navigateRef.current(HOME[currentUser.role]);
        }
      } catch (error) {
        console.error("Data loading error:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [fetchRoleData]);

  // =========================
  // LOGOUT CLEANUP
  // =========================
  useEffect(() => {
    if (prevUserIdRef.current && !userId) {
      setAllUsers([]);
      setAllTasks([]);
      setMyTasks([]);
      setAdminInfos([]);
      setNotifications([]);
      setVerificationStatus([]);
      setManagerRequests([]);
      setMyWorkers([]);
      setMyApprovedTasks([]);
      setMyRejectedTasks([]);
      setAvailableWorkers([]);
      setMyInvitations([]);
      setManagerInvitations([]);
    }
    prevUserIdRef.current = userId || null;
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.isVerified) setIsVerifyModalOpen(false);
  }, [user?.isVerified]);

  // =========================
  // TAB FOCUS / FALLBACK
  // =========================
  useEffect(() => {
    if (!userId) return;

    const syncIfStale = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetchRef.current < MIN_REFRESH_GAP) return;
      refresh();
    };

    document.addEventListener("visibilitychange", syncIfStale);
    window.addEventListener("focus", syncIfStale);

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
  }, [userId, refresh]);

  // =========================
  // SOCKET.IO
  // =========================
  useEffect(() => {
    if (!userId) return;

    const handleConnect = () => {
      socket.emit("join_room", userId);
      if (Date.now() - lastFetchRef.current > 5000) refresh();
    };

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

    let softTimer;
    const softRefresh = () => {
      clearTimeout(softTimer);
      softTimer = setTimeout(refresh, 400);
    };

    const handleTaskCreated = (data = {}) => {
      const newTask = data.task || data.data;
      if (newTask && getId(newTask)) {
        setAllTasks((old) => addIfNew(old, newTask));
      } else {
        softRefresh();
      }
    };

    const handleTaskUpdate = (data = {}) => {
      const updated = data.task || data.data || data;
      const taskId = getId(updated);
      if (!taskId) return softRefresh();

      const merge = (old) =>
        old.map((task) =>
          getId(task) === taskId ? { ...task, ...updated } : task
        );

      setAllTasks(merge);
      setMyTasks(merge);
    };

    const handleTaskDelete = (data = {}) => {
      const taskId = data.taskId || data.id || getId(data.task);
      if (!taskId) return softRefresh();

      const remove = (old) => old.filter((task) => getId(task) !== taskId);
      setAllTasks(remove);
      setMyTasks(remove);
    };

    const handleNotification = (data = {}) => {
      const notification = data.notification || data;
      if (getId(notification)) {
        setNotifications((old) => addIfNew(old, notification));
      }
    };

    const handleUserUpdated = (data = {}) => {
      if (data.user?.isBanned) {
        setUser(data.user);
        navigateRef.current("/banned");
        return;
      }
      syncUser(data.user);
    };

    const debounce = (fn) => {
      let t;
      const run = () => {
        clearTimeout(t);
        t = setTimeout(fn, 500);
      };
      run.cancel = () => clearTimeout(t);
      return run;
    };

    const reloadVerifications = debounce(async () => {
      try {
        setVerificationStatus((await getVerificationStatusAPI()) || []);
      } catch (e) {
        console.error(e);
      }
    });

    const reloadMyWorkers = debounce(async () => {
      try {
        setMyWorkers((await getMyWorkers()) || []);
      } catch (e) {
        console.error(e);
      }
    });

    const reloadAvailableWorkers = debounce(async () => {
      try {
        setAvailableWorkers((await getAvailableWorkers()) || []);
      } catch (e) {
        console.error(e);
      }
    });

    const reloadWorkerInvitations = debounce(async () => {
      try {
        setMyInvitations((await getWorkerInvitations()) || []);
      } catch (e) {
        console.error(e);
      }
    });

    const reloadManagerInvitations = debounce(async () => {
      try {
        setManagerInvitations((await getManagerInvitations()) || []);
      } catch (e) {
        console.error(e);
      }
    });

    const reloadAdminData = debounce(async () => {
      try {
        const [infos, requests] = await Promise.all([
          getAdminInfos(),
          getManagerRequests(),
        ]);
        setAdminInfos(infos || []);
        setManagerRequests(getPendingManagerRequests(requests));
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("connect", handleConnect);
    socket.connect();
    if (socket.connected) handleConnect();

    const logEvent = (event, ...args) => console.log("[socket]", event, args);
    if (import.meta.env?.DEV) socket.onAny(logEvent);

    socket.on("new_task_assigned", handleNewTask);
    socket.on("new_notification", handleNotification);
    socket.on("user_updated", handleUserUpdated);

    const updateEvents = [
      "task_updated",
      "task_status_updated",
      "task_updated_by_worker",
    ];
    const deleteEvents = ["task_deleted", "task_removed"];

    socket.on("task_created", handleTaskCreated);
    updateEvents.forEach((e) => socket.on(e, handleTaskUpdate));
    deleteEvents.forEach((e) => socket.on(e, handleTaskDelete));

    if (role === "manager") {
      socket.on("verification_updated", reloadVerifications);
      socket.on("my_workers_updated", reloadMyWorkers);
      socket.on("available_workers_updated", reloadAvailableWorkers);
      socket.on("manager_invites_updated", reloadManagerInvitations);
      socket.on("invite_updated", reloadManagerInvitations);
    }

    if (role === "worker") {
      socket.on("invite_received", reloadWorkerInvitations);
      socket.on("invite_updated", reloadWorkerInvitations);
    }

    if (role === "admin") {
      socket.on("admin_info_updated", reloadAdminData);
      socket.on("manager_requests_updated", reloadAdminData);
    }

    return () => {
      reloadVerifications.cancel();
      reloadMyWorkers.cancel();
      reloadAvailableWorkers.cancel();
      reloadWorkerInvitations.cancel();
      reloadManagerInvitations.cancel();
      reloadAdminData.cancel();
      clearTimeout(softTimer);

      if (import.meta.env?.DEV) socket.offAny(logEvent);

      socket.off("connect", handleConnect);
      socket.off("new_task_assigned", handleNewTask);
      socket.off("new_notification", handleNotification);
      socket.off("user_updated", handleUserUpdated);
      socket.off("task_created", handleTaskCreated);
      updateEvents.forEach((e) => socket.off(e, handleTaskUpdate));
      deleteEvents.forEach((e) => socket.off(e, handleTaskDelete));
      socket.off("verification_updated", reloadVerifications);
      socket.off("my_workers_updated", reloadMyWorkers);
      socket.off("available_workers_updated", reloadAvailableWorkers);
      socket.off("manager_invites_updated", reloadManagerInvitations);
      socket.off("invite_updated", reloadManagerInvitations);
      socket.off("invite_received", reloadWorkerInvitations);
      socket.off("invite_updated", reloadWorkerInvitations);
      socket.off("admin_info_updated", reloadAdminData);
      socket.off("manager_requests_updated", reloadAdminData);

      socket.disconnect();
    };
  }, [userId, role, refresh, syncUser]);

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

          managerRequests,
          setManagerRequests,

          myWorkers,
          setMyWorkers,

          myApprovedTasks,
          setMyApprovedTasks,

          myRejectedTasks,
          setMyRejectedTasks,

          availableWorkers,
          setAvailableWorkers,

          myInvitations,
          setMyInvitations,

          managerInvitations,
          setManagerInvitations,

          refresh,
          syncUser,
          addTask,
          removeTask,
          fetchRoleData,
          fetchReviewedTasks,
        }}
      >
        {children}
      </context.Provider>

      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify your email"
        subtitle="Confirm your email to unlock all features."
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10">
            <MailWarning className="h-7 w-7 text-sky-400" />
          </div>

          <h2 className="text-lg font-semibold text-white">
            Email verification required
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
            Please verify your email address to unlock all features of your
            account. Go to your profile to verify.
          </p>

          <div className="mt-5 w-full rounded-xl border border-slate-800 bg-[#0b1220] px-4 py-3 text-left">
            <p className="text-xs font-medium text-slate-300">
              Can&apos;t find the email?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check spam/junk, or resend the code from your profile.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsVerifyModalOpen(false)}
            className="mt-5 h-11 w-full rounded-xl bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500"
          >
            Got it
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ContextProvider;