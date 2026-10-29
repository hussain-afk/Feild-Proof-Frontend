import { createTask, deleteTask } from "../api/task.api.js";
import { useContext } from "react";
import { context } from "../context/context.jsx";
import toast from "react-hot-toast";

const useTasks = () => {
  const { setIsCreateTaskModalOpen, setIsLoading } = useContext(context);

  const handleCreateTask = async (taskData) => {
    try {
      setIsLoading(true);
      const response = await createTask(taskData);
      setIsCreateTaskModalOpen(false);
      toast.success("Task created successfully");
      return response;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create task"
      );
      console.error("Error creating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setIsLoading(true);
      const response = await deleteTask(taskId);
      toast.success("Task deleted successfully");
      return response;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete task"
      );
      console.error("Error deleting task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCreateTask,
    handleDeleteTask,
  };
};

export default useTasks;