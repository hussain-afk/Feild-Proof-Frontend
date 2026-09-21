import axios from "axios";

const api = axios.create({
    baseURL: "https://feild-proof-backend.onrender.com/api/notifications/",
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