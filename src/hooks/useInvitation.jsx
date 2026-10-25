import { inviteWorker, acceptInvite, rejectInvite } from "../api/invitation.api.js";
import toast from "react-hot-toast";
import { useContext } from "react";
import { context } from "../context/context.jsx";

const useInvitation = () => {
  const { syncUser, setMyInvitations } =
    useContext(context);

  const handleInviteWorker = async (workerId) => {
    try {
      const response = await inviteWorker(workerId);
      toast.success(response.message || "Invitation sent successfully");
      return response;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error sending invitation"
      );
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      const response = await acceptInvite(inviteId);
      toast.success(response.message || "Invitation accepted successfully");

      // Sidebar unlock: user.managerId update
      if (syncUser) {
        await syncUser();
      }

      // List se hatao (optional)
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
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
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
    }
  };

  return { handleInviteWorker, handleAcceptInvite, handleRejectInvite };
};

export default useInvitation;