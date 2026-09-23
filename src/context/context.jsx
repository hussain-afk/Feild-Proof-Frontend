import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, getAllUsers } from "../api/auth.api.js";
import { getAllTasks, getMyTasks } from "../api/task.api.js";
import { getNotifications } from "../api/notification.api.js";
import { getVerificationStatusAPI } from "../api/verification.api.js";
import { socket } from "../services/socket.js";
import { toast } from "react-hot-toast";

export const context = createContext();

const ContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // App Main States
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial App Data Loading (Jab Page Load Ho)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          // MANAGER DATA LOAD
          if (currentUser.role === "manager") {
            const usersData = await getAllUsers();
            const tasksData = await getAllTasks();
            const verificationsData = await getVerificationStatusAPI();

            setAllUsers(usersData || []);
            setAllTasks(tasksData || []);
            setVerificationStatus(verificationsData || []);

            if (window.location.pathname === "/") navigate("/manager");
          }

          // WORKER DATA LOAD
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

  // 2. Real-Time Backup Sync (3 Seconds Auto-Refresh)
  useEffect(() => {
    if (!user) return;

    const syncTasks = async () => {
      try {
        if (user.role === "manager") {
          const freshTasks = await getAllTasks();
          const freshVerifications = await getVerificationStatusAPI();
          setAllTasks(freshTasks || []);
          setVerificationStatus(freshVerifications || []);
        } else if (user.role === "worker") {
          const freshMyTasks = await getMyTasks();
          setMyTasks(freshMyTasks || []);
        }
      } catch (error) {
        console.error("Auto Sync Error:", error);
      }
    };

    const intervalId = setInterval(syncTasks, 3000);
    return () => clearInterval(intervalId);
  }, [user]);

  // 3. Socket.io Real-Time Connection & Live Listener
  useEffect(() => {
    if (user?._id || user?.id) {
      const userId = user._id || user.id;

      socket.connect();
      socket.emit("join_room", userId);

      // A. Naya Task Assign Hone Par Event
      const handleNewTaskAssigned = (data = {}) => {
        const newTask = data.task || data.data;

        if (newTask) {
          const updateTaskArray = (prevTasks) => {
            const exists = prevTasks.some(
              (t) => (t._id || t.id) === (newTask._id || newTask.id)
            );
            if (exists) {
              return prevTasks.map((t) =>
                (t._id || t.id) === (newTask._id || newTask.id) ? newTask : t
              );
            }
            return [newTask, ...prevTasks];
          };

          setAllTasks(updateTaskArray);
          setMyTasks(updateTaskArray);
        }

        if (data.notification) {
          setNotifications((prevNotifs) => [data.notification, ...prevNotifs]);
        }

        toast.success(data.message || "New task assigned!");
      };

      // B. Jab koi Task Check-In / Check-Out ya Update ho
      const handleTaskUpdated = (data = {}) => {
        const updatedTask = data.task || data.data || data;
        const targetId = updatedTask?._id || updatedTask?.id;

        if (targetId) {
          const updateTaskArray = (prevTasks) =>
            prevTasks.map((t) =>
              (t._id || t.id) === targetId ? { ...t, ...updatedTask } : t
            );

          setAllTasks(updateTaskArray);
          setMyTasks(updateTaskArray);
        }
      };

      // C. Jab Task Delete ho
      const handleTaskDeleted = (data = {}) => {
        const targetId = data.taskId || data.id || data.task?._id || data.task?.id;

        if (targetId) {
          const filterTaskArray = (prevTasks) =>
            prevTasks.filter((t) => (t._id || t.id) !== targetId);

          setAllTasks(filterTaskArray);
          setMyTasks(filterTaskArray);
        }
      };

      // Event Handlers Register Karein
      socket.on("new_task_assigned", handleNewTaskAssigned);

      ["task_created", "task_updated", "task_status_updated", "task_updated_by_worker"].forEach((event) => {
        socket.on(event, handleTaskUpdated);
      });

      ["task_deleted", "task_removed"].forEach((event) => {
        socket.on(event, handleTaskDeleted);
      });

      // Cleanup on Unmount
      return () => {
        socket.off("new_task_assigned", handleNewTaskAssigned);
        ["task_created", "task_updated", "task_status_updated", "task_updated_by_worker"].forEach((event) => {
          socket.off(event, handleTaskUpdated);
        });
        ["task_deleted", "task_removed"].forEach((event) => {
          socket.off(event, handleTaskDeleted);
        });
        socket.disconnect();
      };
    }
  }, [user]);

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
        verificationStatus,
        setVerificationStatus,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default ContextProvider;