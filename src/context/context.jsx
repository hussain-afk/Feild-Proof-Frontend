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

import {
  getAdminInfos,
  getManagerRequests,
  getAllPlans,
} from "../api/admin.api.js";

import {
  getWorkerInvitations,
  getManagerInvitations,
} from "../api/invitation.api.js";

import { getMySubscription } from "../api/billing.api.js";
import { socket } from "../services/socket.js";
import Modal from "../ui/Modal.jsx";

// eslint-disable-next-line react-refresh/only-export-components
export const context = createContext();

const getId = (item) => item?._id || item?.id;

const pendingOnly = (list) =>
  (Array.isArray(list) ? list : []).filter(
    (r) => String(r?.status || "pending").toLowerCase() === "pending"
  );

const addIfNew = (list, item) =>
  list.some((x) => getId(x) === getId(item)) ? list : [item, ...list];

const sameUser = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const HOME = {
  manager: "/manager",
  admin: "/admin",
  worker: "/worker",
};

const REFRESH_GAP = 30 * 1000;
const POLL_MS = 60 * 1000;

// API result helper
const ok = (result) =>
  result?.status === "fulfilled" ? result.value : null;

const ContextProvider = ({ children }) => {
  const navigate = useNavigate();

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

  const [mySubscription, setMySubscription] = useState(null);
  const [allPlans, setAllPlans] = useState([]);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = user?._id || user?.id;
  const role = user?.role;

  const busy = useRef(false);
  const lastFetch = useRef(0);
  const verifyShown = useRef(false);
  const roleRef = useRef(null);
  const prevUserId = useRef(null);
  const navRef = useRef(navigate);
  const refreshRef = useRef(null);
  const syncRef = useRef(null);

  useEffect(() => {
    navRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    roleRef.current = role || null;
  }, [role]);

  // ----- reviewed tasks -----
  const fetchReviewedTasks = useCallback(async () => {
    const [a, r] = await Promise.allSettled([
      getMyApprovedTasks(),
      getMyRejectedTasks(),
    ]);

    if (a.status === "fulfilled") {
      setMyApprovedTasks(a.value || []);
    }

    if (r.status === "fulfilled") {
      setMyRejectedTasks(r.value || []);
    }
  }, []);

  // ----- role data -----
  const fetchRoleData = useCallback(
    async (userRole, options = {}) => {
      if (!userRole) return;

      if (options.showLoader) {
        setIsLoading(true);
      }

      try {
        // MANAGER
        if (userRole === "manager") {
          const res = await Promise.allSettled([
            getAllTasks(),
            getVerificationStatusAPI(),
            getMyWorkers(),
            getAvailableWorkers(),
            getManagerInvitations(),
            getMySubscription(),
            getAllPlans(),
            getNotifications(),
          ]);

          setAllTasks(ok(res[0]) || []);
          setVerificationStatus(ok(res[1]) || []);
          setMyWorkers(ok(res[2]) || []);
          setAvailableWorkers(ok(res[3]) || []);
          setManagerInvitations(ok(res[4]) || []);

          // IMPORTANT:
          // Failed subscription API must not overwrite
          // an existing Socket.IO subscription with null.
          const subscriptionResult = ok(res[5]);

          if (subscriptionResult) {
            setMySubscription(subscriptionResult);
          } else {
            console.warn(
              "Subscription API failed or returned empty data. Keeping existing subscription."
            );
          }

          setAllPlans(ok(res[6]) || []);
          setNotifications(ok(res[7]) || []);

          await fetchReviewedTasks();
        }

        // WORKER
        if (userRole === "worker") {
          const res = await Promise.allSettled([
            getMyTasks(),
            getNotifications(),
            getWorkerInvitations(),
          ]);

          setMyTasks(ok(res[0]) || []);
          setNotifications(ok(res[1]) || []);
          setMyInvitations(ok(res[2]) || []);

          await fetchReviewedTasks();
        }

        // ADMIN
        if (userRole === "admin") {
          const res = await Promise.allSettled([
            getAdminInfos(),
            getAllUsers(),
            getManagerRequests(),
          ]);

          setAdminInfos(ok(res[0]) || []);
          setAllUsers(ok(res[1]) || []);
          setManagerRequests(pendingOnly(ok(res[2])));
        }

        lastFetch.current = Date.now();
      } catch (err) {
        console.error("fetchRoleData:", err);
      } finally {
        if (options.showLoader) {
          setIsLoading(false);
        }
      }
    },
    [fetchReviewedTasks]
  );

  // ----- sync user -----
  const syncUser = useCallback(
    async (partial) => {
      try {
        const fresh = partial ? null : await getCurrentUser();

        if (!partial && !fresh) return;

        setUser((prev) => {
          const next = partial ? { ...prev, ...partial } : fresh;
          return sameUser(prev, next) ? prev : next;
        });

        const newRole = (partial || fresh)?.role;

        if (newRole && newRole !== roleRef.current) {
          roleRef.current = newRole;
          await fetchRoleData(newRole);
        }
      } catch (err) {
        console.error("syncUser:", err);
      }
    },
    [fetchRoleData]
  );

  // ----- refresh -----
  const refresh = useCallback(async (options = {}) => {
    if (!roleRef.current || busy.current) return;

    if (!options.force && Date.now() - lastFetch.current < REFRESH_GAP) return;

    busy.current = true;
    setIsRefreshing(true);

    try {
      await Promise.all([
        fetchRoleData(roleRef.current),
        syncUser(),
      ]);
    } catch (err) {
      console.error("refresh:", err);
    } finally {
      busy.current = false;
      setIsRefreshing(false);
    }
  }, [fetchRoleData, syncUser]);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    syncRef.current = syncUser;
  }, [syncUser]);

  // ----- task helpers -----
  const addTask = useCallback((task) => {
    if (task && getId(task)) {
      setAllTasks((old) => addIfNew(old, task));
    }
  }, []);

  const removeTask = useCallback((taskId) => {
    const drop = (old) => old.filter((t) => getId(t) !== taskId);

    setAllTasks(drop);
    setMyTasks(drop);
  }, []);

  // ----- first load -----
  useEffect(() => {
    let stop = false;

    (async () => {
      try {
        setIsLoading(true);

        const current = await getCurrentUser();

        if (stop) return;

        setUser(current);

        if (!current) return;

        if (current.isBanned) {
          toast.error(
            "Your account has been banned. Please contact support."
          );

          navRef.current("/banned");
          return;
        }

        await fetchRoleData(current.role);

        if (stop) return;

        if (current.isVerified === false && !verifyShown.current) {
          verifyShown.current = true;
          setIsVerifyModalOpen(true);
        }

        if (
          window.location.pathname === "/auth" &&
          HOME[current.role]
        ) {
          navRef.current(HOME[current.role]);
        }
      } catch (err) {
        console.error("loadData:", err);
      } finally {
        if (!stop) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      stop = true;
    };
  }, [fetchRoleData]);

  // ----- logout clear -----
  useEffect(() => {
    if (prevUserId.current && !userId) {
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
      setMySubscription(null);
      setAllPlans([]);
    }

    prevUserId.current = userId || null;
  }, [userId]);

  // ----- tab focus + fallback polling -----
  useEffect(() => {
    if (!userId) return;

    const onFocus = () => {
      if (document.visibilityState === "visible") {
        refreshRef.current?.();
      }
    };

    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    const timer = setInterval(() => {
      if (
        !socket.connected &&
        document.visibilityState === "visible"
      ) {
        refreshRef.current?.();
      }
    }, POLL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
      clearInterval(timer);
    };
  }, [userId]);

  // ----- socket connect -----
  useEffect(() => {
    if (!userId) return;

    const onConnect = () => {
      console.log("Socket connected:", socket.id);

      socket.emit("join_room", userId);

      if (Date.now() - lastFetch.current > REFRESH_GAP) {
        refreshRef.current?.();
      }
    };

    const onConnectError = (error) => {
      console.error("Socket connection error:", error.message);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    socket.connect();

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [userId]);

  // ----- socket events -----
  useEffect(() => {
    if (!userId) return;

    let softTimer;

    const softRefresh = () => {
      clearTimeout(softTimer);

      softTimer = setTimeout(() => {
        refreshRef.current?.();
      }, 400);
    };

    const onNewTask = (data = {}) => {
      const task = data.task || data.data;

      if (task && getId(task)) {
        setAllTasks((old) => addIfNew(old, task));
        setMyTasks((old) => addIfNew(old, task));
      }

      if (data.notification) {
        setNotifications((old) =>
          addIfNew(old, data.notification)
        );
      }

      toast.success(data.message || "New task assigned!");
    };

    const onTaskCreated = (data = {}) => {
      const task = data.task || data.data;

      if (task && getId(task)) {
        setAllTasks((old) => addIfNew(old, task));
      } else {
        softRefresh();
      }
    };

    const onTaskUpdate = (data = {}) => {
      const updated = data.task || data.data || data;
      const id = getId(updated);

      if (!id) return softRefresh();

      const merge = (old) =>
        old.map((t) =>
          getId(t) === id ? { ...t, ...updated } : t
        );

      setAllTasks(merge);
      setMyTasks(merge);
    };

    const onTaskDelete = (data = {}) => {
      const id = data.taskId || data.id || getId(data.task);

      if (!id) return softRefresh();

      const drop = (old) =>
        old.filter((t) => getId(t) !== id);

      setAllTasks(drop);
      setMyTasks(drop);
    };

    const onNotification = (data = {}) => {
      const n = data.notification || data;

      if (getId(n)) {
        setNotifications((old) => addIfNew(old, n));
      }
    };

    const onUserUpdated = (data = {}) => {
      if (data.user?.isBanned) {
        setUser(data.user);
        navRef.current("/banned");
        return;
      }

      syncRef.current?.(data.user);
    };

    // Debounce helper
    const debounced = (fn) => {
      let t;

      const run = () => {
        clearTimeout(t);
        t = setTimeout(fn, 500);
      };

      run.cancel = () => clearTimeout(t);

      return run;
    };

    const reloadVerifications = debounced(async () => {
      try {
        setVerificationStatus(
          (await getVerificationStatusAPI()) || []
        );
      } catch (e) {
        console.error(e);
      }
    });

    const reloadWorkers = debounced(async () => {
      try {
        setMyWorkers((await getMyWorkers()) || []);
      } catch (e) {
        console.error(e);
      }
    });

    const reloadAvailable = debounced(async () => {
      try {
        setAvailableWorkers(
          (await getAvailableWorkers()) || []
        );
      } catch (e) {
        console.error(e);
      }
    });

    const reloadWorkerInvites = debounced(async () => {
      try {
        setMyInvitations(
          (await getWorkerInvitations()) || []
        );
      } catch (e) {
        console.error(e);
      }
    });

    const reloadManagerInvites = debounced(async () => {
      try {
        setManagerInvitations(
          (await getManagerInvitations()) || []
        );
      } catch (e) {
        console.error(e);
      }
    });

    const reloadAdmin = debounced(async () => {
      try {
        const [infos, requests] = await Promise.all([
          getAdminInfos(),
          getManagerRequests(),
        ]);

        setAdminInfos(infos || []);
        setManagerRequests(pendingOnly(requests));
      } catch (e) {
        console.error(e);
      }
    });

    // ----- REALTIME SUBSCRIPTION UPDATE -----
    const handleSubscriptionUpdate = (data) => {
      console.log("REALTIME SUBSCRIPTION EVENT:", data);

      if (!data) return;

      setMySubscription(data);
    };

    const updates = [
      "task_updated",
      "task_status_updated",
      "task_updated_by_worker",
    ];

    const deletes = [
      "task_deleted",
      "task_removed",
    ];

    socket.on("new_task_assigned", onNewTask);
    socket.on("new_notification", onNotification);
    socket.on("user_updated", onUserUpdated);
    socket.on("task_created", onTaskCreated);

    updates.forEach((e) => socket.on(e, onTaskUpdate));
    deletes.forEach((e) => socket.on(e, onTaskDelete));

    if (role === "manager") {
      socket.on("verification_updated", reloadVerifications);
      socket.on("my_workers_updated", reloadWorkers);
      socket.on("available_workers_updated", reloadAvailable);
      socket.on("manager_invites_updated", reloadManagerInvites);
      socket.on("invite_updated", reloadManagerInvites);

      socket.on("subscription", handleSubscriptionUpdate);
    }

    if (role === "worker") {
      socket.on("invite_received", reloadWorkerInvites);
      socket.on("invite_updated", reloadWorkerInvites);
    }

    if (role === "admin") {
      socket.on("admin_info_updated", reloadAdmin);
      socket.on("manager_requests_updated", reloadAdmin);
    }

    return () => {
      clearTimeout(softTimer);

      reloadVerifications.cancel();
      reloadWorkers.cancel();
      reloadAvailable.cancel();
      reloadWorkerInvites.cancel();
      reloadManagerInvites.cancel();
      reloadAdmin.cancel();

      socket.off("new_task_assigned", onNewTask);
      socket.off("new_notification", onNotification);
      socket.off("user_updated", onUserUpdated);
      socket.off("task_created", onTaskCreated);

      updates.forEach((e) =>
        socket.off(e, onTaskUpdate)
      );

      deletes.forEach((e) =>
        socket.off(e, onTaskDelete)
      );

      socket.off("verification_updated", reloadVerifications);
      socket.off("my_workers_updated", reloadWorkers);
      socket.off("available_workers_updated", reloadAvailable);
      socket.off("manager_invites_updated", reloadManagerInvites);
      socket.off("invite_updated", reloadManagerInvites);

      socket.off("invite_received", reloadWorkerInvites);

      socket.off("admin_info_updated", reloadAdmin);
      socket.off("manager_requests_updated", reloadAdmin);

      socket.off("subscription", handleSubscriptionUpdate);
    };
  }, [userId, role]);

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

          isRefreshing,
          setIsRefreshing,

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

          mySubscription,
          setMySubscription,

          allPlans,
          setAllPlans,

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
        isOpen={isVerifyModalOpen && user?.isVerified !== true}
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
