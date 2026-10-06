import axios from "axios";
import { API_URL } from "./config.js";

const api = axios.create({
    baseURL: `${API_URL}/api/tasks/`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const createTask = async (taskData) => {
    const response = await api.post("/create", taskData);
    return response.data;
}

export const getMyTasks = async () => {
    const response = await api.get("/my-tasks");
    return response.data;
}

export const getAllTasks = async () => {
    const response = await api.get("/all");
    return response.data;
}

export const deleteTask = async (taskId) => {
    const response = await api.delete(`/del-task/${taskId}`);
    return response.data;
}