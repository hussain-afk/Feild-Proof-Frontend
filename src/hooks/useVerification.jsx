import {
  verifyCheckInAPI,
  verifyCheckOutAPI,
  delVerification,
  ApproveVerification,
  RejectVerification,
} from "../api/verification.api.js";
import { toast } from "react-hot-toast";
import { useContext } from "react";
import { context } from "../context/context.jsx";

const useVerification = () => {
  const { setIsLoading } = useContext(context);

  const verifyCheckIn = async (taskId, latitude, longitude, imageFile) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("taskId", taskId);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("image", imageFile);

      const result = await verifyCheckInAPI(formData);
      return result;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      toast.error(err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCheckOut = async (taskId, latitude, longitude, imageFile) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("taskId", taskId);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("image", imageFile);
      const result = await verifyCheckOutAPI(formData);
      return result;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVerification = async (verificationId) => {
    try {
      setIsLoading(true);
      const result = await delVerification(verificationId);
      return result;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onApprove = async (verificationId) => {
    try {
      setIsLoading(true);
      const result = await ApproveVerification(verificationId);
      toast.success("Verification approved successfully!");
      return result;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onReject = async (verificationId, reason) => {
    try {
      setIsLoading(true);
      const result = await RejectVerification(verificationId, reason);
      toast.success("Verification rejected successfully!");
      return result;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verifyCheckIn,
    verifyCheckOut,
    deleteVerification,
    onApprove,
    onReject,
  };
};

export default useVerification;