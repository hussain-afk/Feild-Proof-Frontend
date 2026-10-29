import {
  inviteWorker,
  acceptInvite,
  rejectInvite,
} from "../api/invitation.api.js";
import toast from "react-hot-toast";
import { useContext } from "react";
import { context } from "../context/context.jsx";

const useInvitation = () => {
  const { syncUser, setMyInvitations, setIsLoading } = useContext(context);

  const handleInviteWorker = async (workerId) => {
    try {
      setIsLoading(true);
      const response = await inviteWorker(workerId);
      toast.success(response.message || "Invitation sent successfully");
      return response;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error sending invitation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      setIsLoading(true);
      const response = await acceptInvite(inviteId);
      toast.success(response.message || "Invitation accepted successfully");

      if (syncUser) {
        await syncUser();
      }

      if (setMyInvitations) {
        setMyInvitations((list) =>
          (list || []).filter((i) => i._id !== inviteId)
        );
      }

      return response;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error accepting invitation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      setIsLoading(true);
      const response = await rejectInvite(inviteId);
      toast.success(response.message || "Invitation rejected successfully");

      if (setMyInvitations) {
        setMyInvitations((list) =>
          (list || []).filter((i) => i._id !== inviteId)
        );
      }

      return response;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error rejecting invitation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { handleInviteWorker, handleAcceptInvite, handleRejectInvite };
};

export default useInvitation;