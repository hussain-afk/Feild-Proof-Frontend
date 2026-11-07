import axios from "axios";
import { API_URL } from "./config.js";

const api = axios.create({
    baseURL: `${API_URL}/api/chat`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const getMessages = async (otherUserId) => {
    try {
        const response = await api.get(`/${otherUserId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching chat:", error);
        throw error;
    }
}

export const sendMessage = async (toUserId, text) => {
    const response = await api.post("/send", { toUserId, text });
    return response.data;
};