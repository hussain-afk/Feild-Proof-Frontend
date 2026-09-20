import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, getAllUsers } from "../api/auth.api.js";
import { getAllTasks } from "../api/task.api.js";

export const context = createContext();

const ContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  // Important:
  // Website start hone par loading true hogi
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);

        // Saari API calls ek saath
        const [currentUser, users, tasks] = await Promise.all([
          getCurrentUser(),
          getAllUsers(),
          getAllTasks(),
        ]);

        // User set karo
        setUser(currentUser);

        // Users set karo
        setAllUsers(users);

        // Tasks set karo
        setAllTasks(tasks);

        // Role ke according redirect
        if (currentUser.role === "worker") {
          navigate("/worker");
        }

        if (currentUser.role === "manager") {
          navigate("/manager");
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        // Jab saara data load ho jaye
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [navigate]);

  return (
    <context.Provider
      value={{
        user,
        setUser,

        allUsers,
        setAllUsers,

        allTasks,
        setAllTasks,

        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default ContextProvider;
