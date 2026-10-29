import {
  updateProfileByAdmin,
  updateRequestStatus,
  banUser,
} from "../api/admin.api.js";
import toast from "react-hot-toast";
import { useContext } from "react";
import { context } from "../context/context.jsx";

const useAdmin = () => {
  const { setIsLoading } = useContext(context);

  const updateUserProfileByAdmin = async (
    userId,
    name,
    email,
    phone,
    hourlyRate,
    role,
    password
  ) => {
    try {
      setIsLoading(true);
      const response = await updateProfileByAdmin(
        userId,
        name,
        email,
        phone,
        hourlyRate,
        role,
        password
      );
      toast.success("User profile updated successfully");
      return response;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update user profile"
      );
      console.error("Error updating user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateManagerRequestStatus = async (requestId, status) => {
    try {
      setIsLoading(true);
      const response = await updateRequestStatus(requestId, status);
      toast.success("Request status updated successfully");
      return response;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update request status"
      );
      console.error("Error updating request status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      setIsLoading(true);
      const response = await banUser(userId);
      toast.success("User banned successfully");
      return response;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to ban user"
      );
      console.error("Error banning user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfileByAdmin,
    updateManagerRequestStatus,
    handleBanUser,
  };
};

export default useAdmin;