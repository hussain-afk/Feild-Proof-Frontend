import axios from "axios";
import { API_URL } from "./config.js";

const api = axios.create({
    baseURL:  `${API_URL}/api/notifications/`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const getNotifications = async () => {
    try {
        const response = await api.get("/my-notifications");
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/del-notification/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
}