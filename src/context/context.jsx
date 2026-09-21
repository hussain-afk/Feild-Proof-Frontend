import { createContext, useEffect, useState } from "react";
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

  // 2. Real-Time Socket Notifications & State Synchronization
  useEffect(() => {
    if (user?._id || user?.id) {
      const userId = user._id || user.id;

      socket.connect();
      socket.emit("join_room", userId);

      const handleNewTaskAssigned = (data) => {
        // Toast Alert Alert Trigger
        toast.success(`🔔 Alert: ${data.message || "New task assigned"}`);

        // Task Array Updates (Duplicate Check ke sath)
        if (data?.task) {
          setAllTasks((prev) => {
            const exists = prev.some((t) => (t._id || t.id) === (data.task._id || data.task.id));
            if (exists) return prev;
            return [data.task, ...prev];
          });

          setMyTasks((prev) => {
            const exists = prev.some((t) => (t._id || t.id) === (data.task._id || data.task.id));
            if (exists) return prev;
            return [data.task, ...prev];
          });
        }

        // Notification Array Update (Real-time Sync in Modal)
        if (data?.notification) {
          setNotifications((prev) => {
            const exists = prev.some((n) => (n._id || n.id) === (data.notification._id || data.notification.id));
            if (exists) return prev;
            return [data.notification, ...prev];
          });
        }
      };

      socket.on("new_task_assigned", handleNewTaskAssigned);

      return () => {
        socket.off("new_task_assigned", handleNewTaskAssigned);
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
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default ContextProvider;