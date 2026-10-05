import axios from 'axios';

const api = axios.create({
  baseURL: 'https://feild-proof-backend.onrender.com/api/admin', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

export const getAdminInfos = async () => {
    try {
        const response = await api.get('/admin-info');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin infos:', error);
        throw error;
    }
}

export const updateProfileByAdmin = async (userId, name, email, phone, hourlyRate, role) => {
    try {
        const response = await api.put(`/update-user/${userId}`, {
            name,
            email,
            phone,
            hourlyRate,
            role
        });
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}