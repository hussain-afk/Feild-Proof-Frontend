import { updateProfileByAdmin  } from '../api/admin.api.js'
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

  return { updateUserProfileByAdmin };

}

export default useAdmin
