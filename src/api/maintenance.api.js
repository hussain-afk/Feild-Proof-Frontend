import axios from 'axios';
import { API_URL } from './config.js';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const getMaintenanceStatus = async () => {
  try {
    const response = await api.get('/api/system/maintenance/status');
    return response.data;
  } catch (error) {
    console.error('Get Maintenance Status API error:', error.response?.data || error);
    throw error;
  }
};

export const setMaintenance = async (data) => {
    try {
        const response = await api.put('/api/system/admin/maintenance', data);
        return response.data;
    } catch (error) {
        console.error('Set Maintenance API error:', error.response?.data || error);
        throw error;
    }
}