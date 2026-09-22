import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, getAllUsers } from "../api/auth.api.js";
import { getAllTasks, getMyTasks } from "../api/task.api.js";
import { getNotifications } from "../api/notification.api.js";
import { socket } from "../services/socket.js";
import { toast } from "react-hot-toast";

export const context = createContext();

const ContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTaskId = (task) => task?._id || task?.id;

  const upsertTask = useCallback((task) => {
    if (!task) return;
    const taskId = getTaskId(task);
    if (!taskId) return;

    const updateTasks = (previousTasks) => {
      const taskIndex = previousTasks.findIndex((item) => getTaskId(item) === taskId);
      if (taskIndex === -1) return [task, ...previousTasks];

      return previousTasks.map((item, index) =>
        index === taskIndex ? { ...item, ...task } : item
      );
    };

    setAllTasks(updateTasks);
    setMyTasks(updateTasks);
  }, []);

  const removeTask = useCallback((taskId) => {
    if (!taskId) return;
    setAllTasks((previousTasks) => previousTasks.filter((task) => getTaskId(task) !== taskId));
    setMyTasks((previousTasks) => previousTasks.filter((task) => getTaskId(task) !== taskId));
  }, []);

  const updateTask = useCallback((taskId, changes) => {
    if (!taskId) return;
    const updateTasks = (previousTasks) => previousTasks.map((task) =>
      getTaskId(task) === taskId ? { ...task, ...changes } : task
    );

    setAllTasks(updateTasks);
    setMyTasks(updateTasks);
  }, []);

  // 1. App Ka Initial Data Load Logic
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Pehle authenticated current user check karein
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          // Manager Access: Saare users aur tasks load karein
          if (currentUser.role === "manager") {
            const usersData = await getAllUsers();
            const tasksData = await getAllTasks();
            setAllUsers(usersData || []);
            setAllTasks(tasksData || []);
            if (window.location.pathname === "/") navigate("/manager");
          }

          // Worker Access: Specific tasks aur notifications load karein
          if (currentUser.role === "worker") {
            const workerTasks = await getMyTasks();
            const workerNotifications = await getNotifications();
            setMyTasks(workerTasks || []);
            setNotifications(workerNotifications || []);
            if (window.location.pathname === "/") navigate("/worker");
          }
        }
      } catch (error) {
        console.error("Data load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Keep both open dashboards fresh even when the backend does not emit a socket event.
  useEffect(() => {
    if (!user) return undefined;

    const syncTasks = async () => {
      try {
        if (user.role === "manager") {
          setAllTasks((await getAllTasks()) || []);
        } else if (user.role === "worker") {
          setMyTasks((await getMyTasks()) || []);
        }
      } catch (error) {
        console.error("Realtime task sync error:", error);
      }
    };

    const intervalId = window.setInterval(syncTasks, 3000);
    return () => window.clearInterval(intervalId);
  }, [user]);

  // 2. Real-Time Socket Notifications & State Synchronization
  useEffect(() => {
    if (user?._id || user?.id) {
      const userId = user._id || user.id;

      socket.connect();
      socket.emit("join_room", userId);

      const handleNewTaskAssigned = (data = {}) => {
        const task = data.task || data.data;
        if (task) upsertTask(task);
        if (data.notification) {
          setNotifications((previousNotifications) => {
            const notificationId = data.notification._id || data.notification.id;
            if (previousNotifications.some((item) => (item._id || item.id) === notificationId)) {
              return previousNotifications;
            }
            return [data.notification, ...previousNotifications];
          });
        }
        toast.success(data.message || "New task assigned");
      };

      const handleTaskUpdated = (data = {}) => {
        const task = data.task || data.data || data;
        if (task && getTaskId(task)) upsertTask(task);
      };

      const handleTaskDeleted = (data = {}) => {
        removeTask(data.taskId || data.id || getTaskId(data.task));
      };

      socket.on("new_task_assigned", handleNewTaskAssigned);
      ["task_created", "task_updated", "task_status_updated", "task_updated_by_worker"].forEach((eventName) => {
        socket.on(eventName, handleTaskUpdated);
      });
      ["task_deleted", "task_removed"].forEach((eventName) => {
        socket.on(eventName, handleTaskDeleted);
      });

      return () => {
        socket.off("new_task_assigned", handleNewTaskAssigned);
        ["task_created", "task_updated", "task_status_updated", "task_updated_by_worker"].forEach((eventName) => {
          socket.off(eventName, handleTaskUpdated);
        });
        ["task_deleted", "task_removed"].forEach((eventName) => {
          socket.off(eventName, handleTaskDeleted);
        });
        socket.disconnect();
      };
    }
  }, [removeTask, upsertTask, user]);

  return (
    <context.Provider
      value={{
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
        upsertTask,
        removeTask,
        updateTask,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default ContextProvider;