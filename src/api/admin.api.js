import axios from 'axios';
import { API_URL } from './config.js';

const api = axios.create({
  baseURL: `${API_URL}/api/admin`,
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
        throw error.response?.data || error;
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
        throw error.response?.data || error;
    }
}