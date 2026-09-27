import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { getCurrentUser, getAllUsers } from "../api/auth.api.js";
import { getAllTasks, getMyTasks } from "../api/task.api.js";
import { getNotifications } from "../api/notification.api.js";
import { getVerificationStatusAPI } from "../api/verification.api.js";
import { socket } from "../services/socket.js";

export const context = createContext();

const ContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================

  const [user, setUser] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [verificationStatus, setVerificationStatus] = useState([]);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);


  // =========================
  // LOAD DATA WHEN APP STARTS
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get logged-in user
        const currentUser = await getCurrentUser();

        setUser(currentUser);

        // If user is not logged in
        if (!currentUser) {
          setIsLoading(false);
          return;
        }


        // =========================
        // MANAGER DATA
        // =========================

        if (currentUser.role === "manager") {
          const users = await getAllUsers();
          const tasks = await getAllTasks();
          const verifications = await getVerificationStatusAPI();

          setAllUsers(users || []);
          setAllTasks(tasks || []);
          setVerificationStatus(verifications || []);

          // If manager is on home page
          if (window.location.pathname === "/") {
            navigate("/manager");
          }
        }


        // =========================
        // WORKER DATA
        // =========================

        if (currentUser.role === "worker") {
          const tasks = await getMyTasks();
          const notifications = await getNotifications();

          setMyTasks(tasks || []);
          setNotifications(notifications || []);

          // If worker is on home page
          if (window.location.pathname === "/") {
            navigate("/worker");
          }
        }

      } catch (error) {
        console.error("Data loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

  }, [navigate]);


  // =========================
  // AUTO REFRESH EVERY 3 SEC
  // =========================

  useEffect(() => {
    if (!user) return;

    const refreshData = async () => {
      try {

        // Manager refresh
        if (user.role === "manager") {
          const tasks = await getAllTasks();
          const verifications = await getVerificationStatusAPI();
          const users = await getAllUsers();

          setAllUsers(users || []);
          setAllTasks(tasks || []);
          setVerificationStatus(verifications || []);
        }


        // Worker refresh
        if (user.role === "worker") {
          const tasks = await getMyTasks();

          setMyTasks(tasks || []);
        }

      } catch (error) {
        console.error("Auto refresh error:", error);
      }
    };


    const interval = setInterval(refreshData, 3000);

    return () => {
      clearInterval(interval);
    };

  }, [user]);


  // =========================
  // SOCKET.IO
  // =========================

  useEffect(() => {
    if (!user) return;

    const userId = user._id || user.id;

    if (!userId) return;


    // Connect socket
    socket.connect();

    // Join user's room
    socket.emit("join_room", userId);


    // =========================
    // NEW TASK
    // =========================

    const handleNewTask = (data = {}) => {

      const newTask = data.task || data.data;

      if (newTask) {

        setAllTasks((oldTasks) => {

          const alreadyExists = oldTasks.some(
            (task) =>
              (task._id || task.id) ===
              (newTask._id || newTask.id)
          );

          if (alreadyExists) {
            return oldTasks;
          }

          return [newTask, ...oldTasks];
        });


        setMyTasks((oldTasks) => {

          const alreadyExists = oldTasks.some(
            (task) =>
              (task._id || task.id) ===
              (newTask._id || newTask.id)
          );

          if (alreadyExists) {
            return oldTasks;
          }

          return [newTask, ...oldTasks];
        });
      }


      // Add notification
      if (data.notification) {
        setNotifications((oldNotifications) => [
          data.notification,
          ...oldNotifications,
        ]);
      }


      toast.success(
        data.message || "New task assigned!"
      );
    };


    // =========================
    // TASK UPDATED
    // =========================

    const handleTaskUpdate = (data = {}) => {

      const updatedTask =
        data.task ||
        data.data ||
        data;

      const taskId =
        updatedTask?._id ||
        updatedTask?.id;

      if (!taskId) return;


      // Update manager tasks
      setAllTasks((oldTasks) =>
        oldTasks.map((task) => {

          const id = task._id || task.id;

          if (id === taskId) {
            return {
              ...task,
              ...updatedTask,
            };
          }

          return task;
        })
      );


      // Update worker tasks
      setMyTasks((oldTasks) =>
        oldTasks.map((task) => {

          const id = task._id || task.id;

          if (id === taskId) {
            return {
              ...task,
              ...updatedTask,
            };
          }

          return task;
        })
      );
    };


    // =========================
    // TASK DELETED
    // =========================

    const handleTaskDelete = (data = {}) => {

      const taskId =
        data.taskId ||
        data.id ||
        data.task?._id ||
        data.task?.id;

      if (!taskId) return;


      // Remove from manager tasks
      setAllTasks((oldTasks) =>
        oldTasks.filter(
          (task) =>
            (task._id || task.id) !== taskId
        )
      );


      // Remove from worker tasks
      setMyTasks((oldTasks) =>
        oldTasks.filter(
          (task) =>
            (task._id || task.id) !== taskId
        )
      );
    };


    // =========================
    // SOCKET EVENTS
    // =========================

    socket.on(
      "new_task_assigned",
      handleNewTask
    );


    const updateEvents = [
      "task_created",
      "task_updated",
      "task_status_updated",
      "task_updated_by_worker",
    ];

    updateEvents.forEach((event) => {
      socket.on(event, handleTaskUpdate);
    });


    const deleteEvents = [
      "task_deleted",
      "task_removed",
    ];

    deleteEvents.forEach((event) => {
      socket.on(event, handleTaskDelete);
    });


    // =========================
    // CLEANUP
    // =========================

    return () => {

      socket.off(
        "new_task_assigned",
        handleNewTask
      );


      updateEvents.forEach((event) => {
        socket.off(
          event,
          handleTaskUpdate
        );
      });


      deleteEvents.forEach((event) => {
        socket.off(
          event,
          handleTaskDelete
        );
      });


      socket.disconnect();
    };

  }, [user]);


  // =========================
  // CONTEXT
  // =========================

  return (
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
      }}
    >
      {children}
    </context.Provider>
  );
};

export default ContextProvider;