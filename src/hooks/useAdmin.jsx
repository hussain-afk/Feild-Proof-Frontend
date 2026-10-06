import { updateProfileByAdmin, deleteUserByAdmin } from '../api/admin.api.js'
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

  const handleDeleteUserByAdmin = async (userId) => {
    try {
      const response = await deleteUserByAdmin(userId);
      toast.success('User deleted successfully');
      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
      console.error('Error deleting user:', error);
    }
  }

  return { updateUserProfileByAdmin, handleDeleteUserByAdmin };

}

export default useAdmin
