import { updateProfileByAdmin, updateRequestStatus, banUser } from '../api/admin.api.js'
import toast from 'react-hot-toast'

const useAdmin = () => {
  const updateUserProfileByAdmin = async (userId, name, email, phone, hourlyRate, role, password) => {
    try {
      const response = await updateProfileByAdmin(userId, name, email, phone, hourlyRate, role, password);
      // Refresh the role data after updating the profile
      toast.success('User profile updated successfully');
      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update user profile');
      console.error('Error updating user profile:', error);
    }
  };
  const updateManagerRequestStatus = async (requestId, status) => {
    try {
      const response = await updateRequestStatus(requestId, status);
      toast.success('Request status updated successfully');
      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update request status');
      console.error('Error updating request status:', error);
    }
  }
  const handleBanUser = async (userId) => {
    try {
      const response = await banUser(userId);
      toast.success('User banned successfully');
      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to ban user');
      console.error('Error banning user:', error);
    }
  }

  return { updateUserProfileByAdmin, updateManagerRequestStatus, handleBanUser };

}

export default useAdmin
